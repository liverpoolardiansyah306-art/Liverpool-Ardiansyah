import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookPlus,
  User,
  BookOpen,
  Calendar,
  Check,
  AlertCircle,
  Search,
  Camera,
  Upload,
  Plus,
  Minus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { BorrowRecord, Member } from '../types/library';
import { sampleBookTitles } from '../data/initialData';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  initialBorrowDate?: string;
  onSaveLoan: (loan: BorrowRecord) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  members,
  initialBorrowDate,
  onSaveLoan,
}) => {
  // Form states
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSearchingMember, setIsSearchingMember] = useState(false);

  const [borrowerName, setBorrowerName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [grade, setGrade] = useState('Kelas 4A');
  const [bookTitle, setBookTitle] = useState(''); // Opsional
  const [bookPhotoUrl, setBookPhotoUrl] = useState<string>(''); // Wajib
  const [bookCount, setBookCount] = useState<number>(1); // Jumlah buku
  const [borrowDate, setBorrowDate] = useState(initialBorrowDate || '2026-10-06');
  const [dueDate, setDueDate] = useState('2026-10-13');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync date when initialBorrowDate changes
  useEffect(() => {
    if (initialBorrowDate) {
      setBorrowDate(initialBorrowDate);
      try {
        const d = new Date(initialBorrowDate);
        d.setDate(d.getDate() + 7);
        setDueDate(d.toISOString().split('T')[0]);
      } catch {
        // fallback
      }
    }
  }, [initialBorrowDate, isOpen]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setMemberSearchQuery('');
      setIsSearchingMember(false);
    }
  }, [isOpen]);

  // Filter members based on search box
  const filteredMembers = members.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q) ||
      (m.grade && m.grade.toLowerCase().includes(q))
    );
  });

  // Handle member selection from search results
  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setBorrowerName(m.name);
    setMemberId(m.memberCode);
    setGrade(m.grade || m.role);
    setMemberSearchQuery('');
    setIsSearchingMember(false);
    if (error) setError(null);
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setBorrowerName('');
    setMemberId('');
  };

  // Handle Photo Upload / Capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setBookPhotoUrl(evt.target.result as string);
          if (error) setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission with validations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: Borrower Name
    if (!borrowerName.trim()) {
      setError('Mohon pilih anggota atau masukkan nama peminjam.');
      return;
    }

    // 2. Validation: Foto Buku Wajib Diisi
    if (!bookPhotoUrl) {
      setError('Foto buku wajib diunggah/diambil sebelum menyimpan peminjaman.');
      return;
    }

    const finalTitle = bookTitle.trim() || `Buku Perpustakaan (${bookCount} eks)`;

    const newRecord: BorrowRecord = {
      id: `PINJAM-${Date.now().toString().slice(-4)}`,
      borrowerName: borrowerName.trim(),
      memberId: memberId || `ANG-${Math.floor(100 + Math.random() * 900)}`,
      grade: grade.trim() || 'Umum',
      bookTitle: finalTitle,
      bookCode: `BK-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Pelajaran',
      borrowDate,
      dueDate,
      bookPhotoUrl, // Foto Buku Wajib
      bookCount: Math.max(1, bookCount), // Jumlah Buku
      status: 'aktif',
      notes: bookTitle.trim() ? undefined : 'Judul tidak dicantumkan (identifikasi lewat foto buku)',
    };

    onSaveLoan(newRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#189AB4] to-[#0E8388] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <BookPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                Registrasi Peminjaman Baru
              </h3>
              <p className="text-[11px] text-teal-100">
                Pencatatan sirkulasi peminjaman buku
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. PILIH ANGGOTA DENGAN KOTAK PENCARIAN */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span>PILIH ANGGOTA</span>
              </span>
              <span className="text-[10px] text-teal-700 font-semibold normal-case">
                Cari untuk isi otomatis
              </span>
            </label>

            {/* Selected member pill preview */}
            {selectedMember ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedMember.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {selectedMember.memberCode} · {selectedMember.grade || selectedMember.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedMember}
                  className="p-1 rounded-lg hover:bg-emerald-100 text-slate-500 hover:text-slate-700 text-xs transition-colors cursor-pointer"
                  title="Ganti Anggota"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onFocus={() => setIsSearchingMember(true)}
                    onChange={(e) => {
                      setMemberSearchQuery(e.target.value);
                      setIsSearchingMember(true);
                    }}
                    placeholder="Ketik nama anggota atau no ID..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Search result dropdown list */}
                {isSearchingMember && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 text-xs">
                    {filteredMembers.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-xs">
                        Tidak ada anggota yang cocok
                      </div>
                    ) : (
                      filteredMembers.slice(0, 8).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectMember(m)}
                          className="w-full p-2.5 flex items-center justify-between text-left hover:bg-teal-50/70 transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {m.memberCode} · {m.grade || m.role}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                            Pilih
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2 & 3. NAMA PEMINJAM & KELAS / PERAN */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-teal-600" />
                <span>NAMA PEMINJAM *</span>
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => {
                  setBorrowerName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Nama lengkap peminjam"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                KELAS / PERAN
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Kelas 4A"
                className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* 4. JUDUL BUKU (OPSIONAL) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-500" />
                <span>JUDUL BUKU</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Opsional diisi)
              </span>
            </label>
            <input
              type="text"
              list="popular-books"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Judul buku (boleh dikosongkan)"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <datalist id="popular-books">
              {sampleBookTitles.map((title, idx) => (
                <option key={idx} value={title} />
              ))}
            </datalist>
          </div>

          {/* 5. FOTO BUKU (WAJIB DIISI) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                <span>FOTO BUKU *</span>
              </span>
              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Wajib Diisi
              </span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {bookPhotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-slate-900 shadow-xs flex items-center justify-center p-1">
                <img
                  src={bookPhotoUrl}
                  alt="Foto Buku yang Dipinjam"
                  className="w-full h-36 object-contain rounded-xl"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 p-1 rounded-xl backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 rounded-lg text-white hover:text-teal-300 transition-colors"
                    title="Ganti Foto"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookPhotoUrl('')}
                    className="p-1 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Foto Terpasang</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-rose-300 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50/70 rounded-2xl p-4 text-center cursor-pointer transition-colors space-y-1.5"
              >
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Ambil Foto Buku / Unggah Foto
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Gunakan kamera HP atau pilih gambar sampul buku
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 6 & 7. TANGGAL PINJAM & JUMLAH BUKU YANG DI PINJAM */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Tanggal Pinjam */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>TANGGAL PINJAM</span>
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => {
                  setBorrowDate(e.target.value);
                  try {
                    const d = new Date(e.target.value);
                    d.setDate(d.getDate() + 7);
                    setDueDate(d.toISOString().split('T')[0]);
                  } catch {
                    // fallback
                  }
                }}
                className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                required
              />
            </div>

            {/* Jumlah Buku yang Dipinjam */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                JUMLAH BUKU
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBookCount((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bookCount}
                  onChange={(e) =>
                    setBookCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-full text-xs text-center font-bold text-slate-800 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setBookCount((prev) => prev + 1)}
                  className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FBC02D] via-[#FBBF24] to-[#F59E0B] text-slate-900 font-extrabold text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Peminjaman</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
