/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { NewLoanModal } from './components/NewLoanModal';
import { ScanQrLoanModal } from './components/ScanQrLoanModal';
import { LoanDirectoryModal } from './components/LoanDirectoryModal';
import { MembersView } from './components/MembersView';
import { LayananView } from './components/LayananView';
import { PlaceholderView } from './components/PlaceholderView';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import {
  BorrowRecord,
  Member,
  LibraryProfile,
  TabType,
} from './types/library';
import {
  initialProfile,
  initialLoans,
  initialMembers,
} from './data/initialData';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Profile state
  const [profile, setProfile] = useState<LibraryProfile>(() => {
    try {
      const saved = localStorage.getItem('perpus_profile');
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  // 2. Loans state
  const [loans, setLoans] = useState<BorrowRecord[]>(() => {
    try {
      const saved = localStorage.getItem('perpus_loans');
      return saved ? JSON.parse(saved) : initialLoans;
    } catch {
      return initialLoans;
    }
  });

  // 3. Members state
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('perpus_members');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  // 4. Navigation & Modals state
  const [currentTab, setCurrentTab] = useState<TabType>('beranda');
  const [isNewLoanOpen, setIsNewLoanOpen] = useState<boolean>(false);
  const [isScanQrOpen, setIsScanQrOpen] = useState<boolean>(false);
  const [newLoanInitialDate, setNewLoanInitialDate] = useState<string | undefined>(undefined);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [directoryFilter, setDirectoryFilter] = useState<
    'semua' | 'aktif' | 'terlambat'
  >('semua');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('perpus_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('perpus_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('perpus_members', JSON.stringify(members));
  }, [members]);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handlers for loans
  const handleSaveLoan = (newLoan: BorrowRecord) => {
    setLoans((prev) => [newLoan, ...prev]);
    showToast(`Peminjaman untuk "${newLoan.borrowerName}" berhasil dicatat!`);
  };

  const handleReturnBook = (loanId: string) => {
    setLoans((prev) =>
      prev.map((item) =>
        item.id === loanId
          ? {
              ...item,
              status: 'kembali' as const,
              returnDate: '2026-10-06',
            }
          : item
      )
    );
    showToast('Buku telah berhasil ditandai kembali.');
  };

  const handleExtendLoan = (loanId: string) => {
    setLoans((prev) =>
      prev.map((item) => {
        if (item.id === loanId) {
          // Add 7 days to due date
          const currentDue = new Date(item.dueDate);
          currentDue.setDate(currentDue.getDate() + 7);
          const newDueStr = currentDue.toISOString().split('T')[0];
          return {
            ...item,
            dueDate: newDueStr,
            status: 'aktif' as const,
          };
        }
        return item;
      })
    );
    showToast('Masa peminjaman diperpanjang 7 hari.');
  };

  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm('Yakin ingin menghapus catatan peminjaman ini?')) {
      setLoans((prev) => prev.filter((item) => item.id !== loanId));
      showToast('Catatan peminjaman telah dihapus.');
    }
  };

  // Handlers for members
  const handleAddMember = (newMember: Member) => {
    setMembers((prev) => [newMember, ...prev]);
    showToast(`Anggota baru "${newMember.name}" berhasil ditambahkan.`);
  };

  const handleAddMembersBatch = (newMemberList: Member[]) => {
    setMembers((prev) => [...newMemberList, ...prev]);
    showToast(`${newMemberList.length} data anggota berhasil diimpor dari Excel.`);
  };

  const handleUpdateMemberPhoto = (memberId: string, photoUrl: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, photoUrl } : m))
    );
  };

  // Directory opener with filter
  const handleOpenDirectoryWithFilter = (
    filter: 'semua' | 'aktif' | 'terlambat' = 'semua'
  ) => {
    setDirectoryFilter(filter);
    setIsDirectoryOpen(true);
  };

  return (
    <AndroidFrame>
      {/* Top Header */}
      <Header
        systemName={profile.systemName}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router based on Tab */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {currentTab === 'beranda' && (
          <HomeDashboard
            profile={profile}
            loans={loans}
            totalMembersCount={members.length}
            onOpenScanQr={() => setIsScanQrOpen(true)}
            onOpenManualLoan={() => setIsNewLoanOpen(true)}
            onOpenDirectory={handleOpenDirectoryWithFilter}
            onOpenMembers={() => setCurrentTab('anggota')}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentTab === 'anggota' && (
          <MembersView
            members={members}
            profile={profile}
            onAddMember={handleAddMember}
            onAddMembersBatch={handleAddMembersBatch}
            onUpdateMemberPhoto={handleUpdateMemberPhoto}
            onBackToHome={() => setCurrentTab('beranda')}
          />
        )}

        {currentTab === 'layanan' && (
          <LayananView
            loans={loans}
            onReturnBook={handleReturnBook}
            onExtendLoan={handleExtendLoan}
            onAddNewLoanWithDate={(date) => {
              setNewLoanInitialDate(date);
              setIsNewLoanOpen(true);
            }}
          />
        )}

        {(currentTab === 'statistik' || currentTab === 'laporan') && (
          <PlaceholderView tab={currentTab} />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-4 right-4 z-40 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-700/60 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Modals & Bottom Sheets */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => {
          setIsNewLoanOpen(false);
          setNewLoanInitialDate(undefined);
        }}
        members={members}
        initialBorrowDate={newLoanInitialDate}
        onSaveLoan={handleSaveLoan}
      />

      <ScanQrLoanModal
        isOpen={isScanQrOpen}
        onClose={() => setIsScanQrOpen(false)}
        members={members}
        onSaveLoan={handleSaveLoan}
      />

      <LoanDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        loans={loans}
        initialFilter={directoryFilter}
        onReturnBook={handleReturnBook}
        onExtendLoan={handleExtendLoan}
        onDeleteLoan={handleDeleteLoan}
        onAddNewLoan={() => {
          setIsDirectoryOpen(false);
          setIsNewLoanOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </AndroidFrame>
  );
}
