import React from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  UserCheck,
  RotateCcw,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  BookmarkCheck,
  QrCode,
} from 'lucide-react';
import { BorrowRecord, LibraryProfile } from '../types/library';

// Generated asset paths
const libraryHeaderImg = '/src/assets/images/library_gudang_ilmu_1791265018671.jpg';
const openBookImg = '/src/assets/images/open_book_nature_1791260885121.jpg';

interface HomeDashboardProps {
  profile: LibraryProfile;
  loans: BorrowRecord[];
  totalMembersCount: number;
  onOpenScanQr: () => void;
  onOpenManualLoan: () => void;
  onOpenDirectory: (filter?: 'semua' | 'aktif' | 'terlambat') => void;
  onOpenMembers: () => void;
  onOpenGuide: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  loans,
  totalMembersCount,
  onOpenScanQr,
  onOpenManualLoan,
  onOpenDirectory,
  onOpenMembers,
  onOpenGuide,
}) => {
  // Compute active & overdue counts
  const activeLoans = loans.filter((l) => l.status === 'aktif');
  const overdueLoans = loans.filter((l) => l.status === 'terlambat');
  const activeAndOverdueCount = activeLoans.length + overdueLoans.length;

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-6 space-y-3.5 select-none overflow-y-auto">
      {/* 1. Header Illustration & School Profile Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#7ec8e3] to-[#cbe7f5] shadow-xs border border-sky-100">
        {/* Library Building Header Background */}
        <div className="w-full h-36 relative overflow-hidden bg-sky-200">
          <img
            src={libraryHeaderImg}
            alt="Perpustakaan SDN 5 Rambutan"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Graceful fallback container if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle overlay gradient to blend with card */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        </div>

        {/* Floating School Identity Card */}
        <div className="p-3 pt-0 relative -mt-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-md border border-sky-100/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Colorful Tree & Open Book Logo OR Uploaded Custom Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-emerald-100 shadow-xs flex items-center justify-center p-1 relative shrink-0 overflow-hidden">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo Perpustakaan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Tree leaves clusters */}
                    <circle cx="50" cy="30" r="14" fill="#10B981" />
                    <circle cx="34" cy="38" r="12" fill="#F59E0B" />
                    <circle cx="66" cy="38" r="12" fill="#3B82F6" />
                    <circle cx="50" cy="46" r="13" fill="#059669" />
                    <circle cx="28" cy="48" r="10" fill="#EA580C" />
                    <circle cx="72" cy="48" r="10" fill="#0E8388" />
                    {/* Tree trunk / open book base */}
                    <path
                      d="M50 48 V 74 M50 74 C 42 70 32 72 26 77 V 64 C 32 60 42 60 50 64 C 58 60 68 60 74 64 V 77 C 68 72 58 70 50 74 Z"
                      fill="#F97316"
                      stroke="#C2410C"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M50 64 L 50 78"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* Title & Officer details */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8388] block">
                  {profile.libraryName || profile.motto || 'GUDANG ILMU'}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-[#1A365D] tracking-tight leading-tight truncate">
                  {profile.schoolName || 'SDN 5 RAMBUTAN'}
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                  Petugas: {profile.officerName || 'Ibu Ratna S.Pust'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Date & Time Pill Bar */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-xs border border-sky-100 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1A508B]" />
          <span className="font-semibold text-slate-800">
            Selasa, 6 Oktober 2026
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-slate-700">
          <Clock className="w-4 h-4 text-[#1A508B]" />
          <span>11:19</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 3. Section Title: Dashboard Anggota & Sirkulasi */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0E8388]">
            <UserCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-black tracking-wider text-[#1A365D] uppercase">
            DASHBOARD ANGGOTA & SIRKULASI
          </h3>
        </div>

        <button
          onClick={() => onOpenDirectory('semua')}
          className="text-[11px] font-bold text-[#0E8388] hover:text-[#0b666a] flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          <span>Direktori Lengkap</span>
          <ChevronRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Main Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Left Card: Emerald Green Anggota */}
        <button
          onClick={onOpenMembers}
          className="w-full text-left bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          {/* Subtle background circles for depth */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-6 -top-6 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

          <div>
            <div className="flex items-center gap-1.5 opacity-90 mb-1">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase">
                ANGGOTA
              </span>
            </div>

            <div className="mt-2 text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums">
              {totalMembersCount}
            </div>
          </div>

          <div className="mt-3 text-[11px] font-medium text-emerald-100 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>Terverifikasi</span>
          </div>
        </button>

        {/* Right Side Stack: Peminjaman Aktif & Batas Jatuh Tempo */}
        <div className="flex flex-col gap-2.5 justify-between">
          {/* Card 1: Peminjaman Aktif */}
          <button
            onClick={() => onOpenDirectory('aktif')}
            className="w-full text-left bg-white rounded-2xl p-3 shadow-xs border border-sky-100 hover:border-teal-300 hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E8388] shrink-0">
                <RotateCcw className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Peminjaman Aktif
                </span>
                <div className="text-sm font-extrabold text-[#1A365D] mt-0.5 truncate">
                  {activeAndOverdueCount} Orang
                </div>
              </div>
            </div>
          </button>

          {/* Card 2: Batas Jatuh Tempo */}
          <button
            onClick={() => onOpenDirectory('terlambat')}
            className="w-full text-left bg-white rounded-2xl p-3 shadow-xs border border-sky-100 hover:border-red-300 hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Batas Jatuh Tempo
                </span>
                <div className="text-sm font-extrabold text-rose-600 mt-0.5 truncate">
                  {overdueLoans.length} Terlambat
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 5. DUA MENU CATAT PEMINJAMAN: CATAT 1 (SCAN QR CODE) & CATAT 2 (METODE MANUAL) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* CATAT 1: METODE SCAN QR CODE */}
        <button
          type="button"
          onClick={onOpenScanQr}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0E8388] via-[#189AB4] to-[#1A508B] text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex flex-col justify-between text-left border border-teal-300/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-2xs">
              <QrCode className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-teal-100 font-mono">
              SCAN
            </span>
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-200">
              Catat 1
            </div>
            <div className="text-sm font-black text-white leading-tight mt-0.5">
              Scan QR Code
            </div>
            <p className="text-[10px] text-teal-100/90 mt-0.5 leading-snug">
              Pindai kartu anggota
            </p>
          </div>
        </button>

        {/* CATAT 2: METODE MANUAL */}
        <button
          type="button"
          onClick={onOpenManualLoan}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FBC02D] via-[#FBBF24] to-[#F59E0B] text-slate-900 shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex flex-col justify-between text-left border border-amber-300/70 group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900/15 flex items-center justify-center shadow-2xs">
              <PlusCircle className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800 font-mono">
              FORM
            </span>
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-900">
              Catat 2
            </div>
            <div className="text-sm font-black text-slate-900 leading-tight mt-0.5">
              Metode Manual
            </div>
            <p className="text-[10px] text-slate-800/80 mt-0.5 leading-snug">
              Ketik form peminjaman
            </p>
          </div>
        </button>
      </div>

      {/* 6. Bottom Banner Illustration: Open Book with Leaves */}
      <div className="rounded-2xl overflow-hidden relative shadow-xs border border-sky-100 bg-[#E0F2FE]">
        <div className="w-full h-24 relative overflow-hidden bg-gradient-to-r from-teal-100 to-sky-100">
          <img
            src={openBookImg}
            alt="Pencatatan Buku Perpustakaan"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        </div>

        {/* 7. Bottom Digital Circulation Bar */}
        <div className="p-3 bg-white/95 backdrop-blur-md flex items-center justify-between text-xs border-t border-sky-100/70">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
            <span className="text-sky-400 font-bold">||</span>
            <BookmarkCheck className="w-3.5 h-3.5 text-[#0E8388]" />
            <span className="truncate">Sistem Sirkulasi & Pencatatan Digital</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 font-bold text-[#1A508B] hover:text-sky-700 hover:underline text-[11px] cursor-pointer shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#189AB4]" />
            <span>Panduan</span>
            <ChevronRight className="w-3 h-3 text-[#189AB4]" />
          </button>
        </div>
      </div>
    </div>
  );
};
