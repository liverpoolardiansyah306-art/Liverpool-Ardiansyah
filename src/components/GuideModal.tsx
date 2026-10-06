import React from 'react';
import { X, BookOpen, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#189AB4] to-[#0E8388] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide">
                Panduan Sirkulasi & Perpustakaan
              </h3>
              <p className="text-[11px] text-teal-100">
                Petunjuk praktis tata kelola peminjaman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#189AB4] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900">
                1. Registrasi Peminjaman Baru
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Klik tombol kuning <span className="font-bold text-amber-600">Registrasi Peminjaman Baru</span> di beranda. Pilih siswa terdaftar atau masukkan nama baru, kode buku, serta tanggal pinjam.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-100 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900">
                2. Masa Peminjaman Standar
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Batas standar peminjaman buku perpustakaan adalah 7 hari kalender. Peminjaman dapat diperpanjang 1 kali (+7 hari) melalui menu direktori sirkulasi.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900">
                3. Peringatan Jatuh Tempo & Keterlambatan
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sistem secara otomatis menghitung dan menandai buku yang melewati batas jatuh tempo dengan status <span className="text-rose-600 font-bold">Terlambat</span> berwarna merah.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900">
                4. Pengembalian Buku
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Buka Direktori Lengkap, klik tombol <span className="font-bold text-teal-700">Kembali</span> pada baris peminjaman. Status akan otomatis berubah menjadi Selesai.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0E8388] text-white text-xs font-bold hover:bg-[#0c6b6f] transition-all cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
