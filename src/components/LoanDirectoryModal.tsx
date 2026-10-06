import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Calendar,
  BookOpen,
  Filter,
} from 'lucide-react';
import { BorrowRecord, LoanStatus } from '../types/library';

interface LoanDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: BorrowRecord[];
  initialFilter?: 'semua' | 'aktif' | 'terlambat';
  onReturnBook: (loanId: string) => void;
  onExtendLoan: (loanId: string) => void;
  onDeleteLoan: (loanId: string) => void;
  onAddNewLoan: () => void;
}

export const LoanDirectoryModal: React.FC<LoanDirectoryModalProps> = ({
  isOpen,
  onClose,
  loans,
  initialFilter = 'semua',
  onReturnBook,
  onExtendLoan,
  onDeleteLoan,
  onAddNewLoan,
}) => {
  const [activeTab, setActiveTab] = useState<'semua' | LoanStatus>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    // Tab filter
    if (activeTab !== 'semua' && loan.status !== activeTab) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = loan.borrowerName.toLowerCase().includes(q);
      const matchBook = (loan.bookTitle || '').toLowerCase().includes(q);
      const matchCode = (loan.bookCode || '').toLowerCase().includes(q);
      const matchGrade = loan.grade.toLowerCase().includes(q);
      return matchName || matchBook || matchCode || matchGrade;
    }
    return true;
  });

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'terlambat':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
            Terlambat
          </span>
        );
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            Aktif
          </span>
        );
      case 'kembali':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8FAFC] w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1A508B] to-[#189AB4] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide">
                Direktori Lengkap Peminjaman
              </h3>
              <p className="text-[11px] text-sky-100">
                Total {loans.length} riwayat sirkulasi tercatat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 bg-white border-b border-slate-100 space-y-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama peminjam / judul buku..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {(
              [
                { id: 'semua', label: 'Semua' },
                { id: 'aktif', label: 'Aktif' },
                { id: 'terlambat', label: 'Terlambat' },
                { id: 'kembali', label: 'Kembali' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#1A508B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loan Records List */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Filter className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Tidak ada data peminjaman ditemukan
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Silakan ganti kata kunci pencarian atau tambah peminjaman baru.
              </p>
              <button
                onClick={onAddNewLoan}
                className="mt-3 text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 inline-block hover:bg-teal-100"
              >
                + Catat Peminjaman Baru
              </button>
            </div>
          ) : (
            filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100/80 hover:border-teal-200 transition-all flex flex-col gap-2"
              >
                {/* Header: Borrower & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1A365D]">
                      {loan.borrowerName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
                      <span className="font-semibold text-slate-700">{loan.grade}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{loan.memberId}</span>
                    </div>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>

                {/* Book Details */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/60 flex items-start gap-2.5">
                  {loan.bookPhotoUrl ? (
                    <img
                      src={loan.bookPhotoUrl}
                      alt="Foto Buku"
                      className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">
                      {loan.bookTitle || 'Buku Perpustakaan'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                      <span>Kode: {loan.bookCode}</span>
                      <span>·</span>
                      <span className="text-teal-700 font-sans font-bold">
                        {loan.bookCount ? `${loan.bookCount} Buku` : '1 Buku'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates & Actions */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Pinjam: {loan.borrowDate}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        loan.status === 'terlambat'
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      Tempo: {loan.dueDate}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    {loan.status !== 'kembali' && (
                      <>
                        <button
                          onClick={() => onExtendLoan(loan.id)}
                          className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[10px] transition-colors"
                          title="Perpanjang 7 hari"
                        >
                          +7 Hari
                        </button>
                        <button
                          onClick={() => onReturnBook(loan.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold text-[10px] flex items-center gap-1 transition-all"
                          title="Kembalikan Buku"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Kembali</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDeleteLoan(loan.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus rekaman"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer sticky CTA */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Ditampilkan: {filteredLoans.length} data
          </span>
          <button
            onClick={onAddNewLoan}
            className="px-3.5 py-2 rounded-xl bg-[#FBC02D] hover:bg-[#FBBF24] text-slate-900 font-extrabold text-xs shadow-xs transition-all cursor-pointer"
          >
            + Registrasi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
