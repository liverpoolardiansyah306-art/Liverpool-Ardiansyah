import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Search,
  Filter,
  BookmarkCheck,
} from 'lucide-react';
import { BorrowRecord, LoanStatus } from '../types/library';

interface LayananViewProps {
  loans: BorrowRecord[];
  onReturnBook: (loanId: string) => void;
  onExtendLoan: (loanId: string) => void;
  onAddNewLoanWithDate: (date: string) => void;
}

export const LayananView: React.FC<LayananViewProps> = ({
  loans,
  onReturnBook,
  onExtendLoan,
  onAddNewLoanWithDate,
}) => {
  // Default selected date to '2026-10-06' (matching initial data date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-06');
  const [activeFilter, setActiveFilter] = useState<'semua' | 'pinjam' | 'tempo' | 'kembali'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Format Indonesian date
  const formatIndonesianDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  // Day shift helper
  const handleShiftDay = (deltaDays: number) => {
    try {
      const parts = selectedDate.split('-');
      const dateObj = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      dateObj.setDate(dateObj.getDate() + deltaDays);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
    } catch {
      // fallback
    }
  };

  // Generate 7-day mini horizontal date scroller centered around selectedDate
  const getNearbyDates = () => {
    const list: Array<{ dateStr: string; dayName: string; dayNumber: number; isSelected: boolean }> = [];
    try {
      const parts = selectedDate.split('-');
      const centerObj = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );

      for (let offset = -3; offset <= 3; offset++) {
        const d = new Date(centerObj);
        d.setDate(d.getDate() + offset);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        list.push({
          dateStr,
          dayName,
          dayNumber: d.getDate(),
          isSelected: dateStr === selectedDate,
        });
      }
    } catch {
      // fallback
    }
    return list;
  };

  // Categorize loans related to the selected date
  const borrowedOnDate = loans.filter((l) => l.borrowDate === selectedDate);
  const dueOnDate = loans.filter((l) => l.dueDate === selectedDate && l.status !== 'kembali');
  const returnedOnDate = loans.filter((l) => l.returnDate === selectedDate);

  // All loans with any touchpoint on this date
  const allRelatedLoans = loans.filter((l) => {
    const matchBorrow = l.borrowDate === selectedDate;
    const matchDue = l.dueDate === selectedDate;
    const matchReturn = l.returnDate === selectedDate;
    return matchBorrow || matchDue || matchReturn;
  });

  // Filter based on tab
  const displayedLoans = (
    activeFilter === 'semua'
      ? allRelatedLoans
      : activeFilter === 'pinjam'
      ? borrowedOnDate
      : activeFilter === 'tempo'
      ? dueOnDate
      : returnedOnDate
  ).filter((loan) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loan.borrowerName.toLowerCase().includes(q) ||
      (loan.bookTitle && loan.bookTitle.toLowerCase().includes(q)) ||
      (loan.bookCode && loan.bookCode.toLowerCase().includes(q)) ||
      loan.grade.toLowerCase().includes(q)
    );
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
    <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#189AB4] via-[#0E8388] to-[#056676] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Layanan Kalender Peminjaman
            </h2>
            <p className="text-[11px] text-teal-100">
              Pilih tanggal untuk melihat jadwal sirkulasi buku
            </p>
          </div>
        </div>

        <button
          onClick={() => onAddNewLoanWithDate(selectedDate)}
          className="px-3 py-1.5 rounded-xl bg-white text-teal-800 font-extrabold text-xs shadow-xs hover:bg-teal-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-teal-700" />
          <span>Pinjam</span>
        </button>
      </div>

      {/* 2. Interactive Calendar Date Picker Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-sky-100 space-y-3">
        {/* Date Selector Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleShiftDay(-1)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-all cursor-pointer"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="relative text-center flex-1 mx-2">
            {/* Native calendar trigger */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              title="Klik untuk memilih tanggal kalender"
            />
            <div className="py-1 px-3 rounded-xl bg-sky-50 border border-sky-200 hover:border-teal-400 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <CalendarIcon className="w-3.5 h-3.5 text-[#189AB4]" />
              <span className="text-xs font-extrabold text-[#1A508B] tracking-tight">
                {formatIndonesianDate(selectedDate)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleShiftDay(1)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-all cursor-pointer"
            title="Hari Berikutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 7-Day Quick Touch Scroller */}
        <div className="grid grid-cols-7 gap-1 pt-0.5">
          {getNearbyDates().map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => setSelectedDate(item.dateStr)}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                item.isSelected
                  ? 'bg-[#0E8388] text-white shadow-xs scale-105 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider opacity-80">
                {item.dayName}
              </span>
              <span className="text-xs font-black font-mono mt-0.5">
                {item.dayNumber}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Summary Metric Badges for Selected Date */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter('pinjam')}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'pinjam'
              ? 'bg-teal-50 border-teal-300 shadow-xs'
              : 'bg-white border-slate-100'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 block truncate">
            Dipinjam
          </span>
          <span className="text-base font-black text-teal-700 font-mono">
            {borrowedOnDate.length}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Buku</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('tempo')}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'tempo'
              ? 'bg-rose-50 border-rose-300 shadow-xs'
              : 'bg-white border-slate-100'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 block truncate">
            Jatuh Tempo
          </span>
          <span className="text-base font-black text-rose-600 font-mono">
            {dueOnDate.length}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Buku</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('kembali')}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'kembali'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-100'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 block truncate">
            Kembali
          </span>
          <span className="text-base font-black text-emerald-700 font-mono">
            {returnedOnDate.length}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Buku</span>
        </button>
      </div>

      {/* 4. Search and Segmented Filter Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau buku di tanggal ini..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {(
            [
              { id: 'semua', label: `Semua (${allRelatedLoans.length})` },
              { id: 'pinjam', label: `Dipinjam (${borrowedOnDate.length})` },
              { id: 'tempo', label: `Jatuh Tempo (${dueOnDate.length})` },
              { id: 'kembali', label: `Kembali (${returnedOnDate.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#1A508B] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Loans List for Selected Date */}
      <div className="space-y-2.5 flex-1">
        {displayedLoans.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center space-y-2.5 border border-slate-100 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                Tidak ada data peminjaman di tanggal ini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tanggal: {formatIndonesianDate(selectedDate)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddNewLoanWithDate(selectedDate)}
              className="mt-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Catat Peminjaman pada Tanggal Ini</span>
            </button>
          </div>
        ) : (
          displayedLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-teal-200 transition-all flex flex-col gap-2"
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
                <div className="flex items-center gap-2 font-mono">
                  <span className={`${loan.borrowDate === selectedDate ? 'text-teal-700 font-bold' : ''}`}>
                    Pinjam: {loan.borrowDate}
                  </span>
                  <span>·</span>
                  <span
                    className={`${
                      loan.dueDate === selectedDate
                        ? 'text-rose-600 font-bold bg-rose-50 px-1 rounded'
                        : ''
                    }`}
                  >
                    Tempo: {loan.dueDate}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {loan.status !== 'kembali' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onExtendLoan(loan.id)}
                        className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[10px] transition-colors cursor-pointer"
                        title="Perpanjang 7 hari"
                      >
                        +7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => onReturnBook(loan.id)}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                        title="Kembalikan Buku"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Kembali</span>
                      </button>
                    </>
                  )}
                  {loan.status === 'kembali' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <BookmarkCheck className="w-3 h-3" />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
