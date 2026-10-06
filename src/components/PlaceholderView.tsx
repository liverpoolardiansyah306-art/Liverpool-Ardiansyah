import React from 'react';
import {
  Sparkles,
  Layers,
  BarChart3,
  FileSpreadsheet,
  Plus,
  BookOpenCheck,
  TrendingUp,
  Download,
  Info,
} from 'lucide-react';
import { TabType } from '../types/library';

interface PlaceholderViewProps {
  tab: TabType;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ tab }) => {
  const getTabConfig = () => {
    switch (tab) {
      case 'layanan':
        return {
          title: 'Menu Layanan Perpustakaan',
          subtitle: 'Ruang fitur siap Anda isi sesuai kebutuhan sirkulasi & layanan.',
          icon: Layers,
          color: 'from-sky-500 to-teal-600',
          suggestions: [
            'Layanan Bebas Pustaka (Surat Keterangan)',
            'Usulan & Permintaan Pengadaan Buku Baru',
            'Reservasi / Booking Buku Favorit',
            'Katalog Online (OPAC Mini)',
          ],
        };
      case 'statistik':
        return {
          title: 'Menu Statistik & Grafik',
          subtitle: 'Ruang grafik dan visualisasi data yang siap Anda kembangkan.',
          icon: BarChart3,
          color: 'from-indigo-500 to-blue-600',
          suggestions: [
            'Grafik Tren Peminjaman Mingguan',
            'Peringkat Kelas Paling Rajin Membaca',
            'Top 10 Buku Paling Banyak Dipinjam',
            'Distribusi Kategori Buku Terfavorit',
          ],
        };
      case 'laporan':
        return {
          title: 'Menu Laporan & Rekapitulasi',
          subtitle: 'Ruang laporan sirkulasi siap cetak dan ekspor data.',
          icon: FileSpreadsheet,
          color: 'from-teal-600 to-emerald-700',
          suggestions: [
            'Rekapitulasi Peminjaman Bulanan (PDF / Excel)',
            'Laporan Buku Terlambat & Denda',
            'Daftar Buku Hilang / Rusak',
            'Cetak Bukti Transaksi Peminjaman',
          ],
        };
      default:
        return {
          title: 'Menu Fitur',
          subtitle: 'Ruang kustomisasi',
          icon: Sparkles,
          color: 'from-slate-600 to-slate-800',
          suggestions: [],
        };
    }
  };

  const config = getTabConfig();
  const Icon = config.icon;

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Header Banner */}
      <div
        className={`bg-gradient-to-r ${config.color} text-white rounded-2xl p-4 shadow-sm flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              {config.title}
            </h2>
            <p className="text-[11px] text-white/80">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Instructional Box explaining it was kept empty as requested */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-bold text-amber-950">
            Sesuai permintaan Anda:
          </p>
          <p className="mt-0.5 text-amber-800">
            Menu ini telah disiapkan kosong agar Anda dapat leluasa mengisinya
            sendiri dengan fitur-fitur yang diinginkan kapan pun dibutuhkan.
          </p>
        </div>
      </div>

      {/* Suggested features outline container */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Ide & Template Fitur Siap Pasang</span>
          </span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-500">
            Template
          </span>
        </div>

        <div className="space-y-2">
          {config.suggestions.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs text-slate-700 hover:bg-teal-50/40 hover:border-teal-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center font-mono">
                  {index + 1}
                </span>
                <span className="font-semibold text-slate-800">{item}</span>
              </div>
              <button
                onClick={() =>
                  alert(`Template fitur "${item}" siap dihubungkan ke kode program Anda.`)
                }
                className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Area Placeholder Canvas */}
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 bg-white/50">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Plus className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-700">
          Area Fitur Kustom Anda
        </p>
        <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto">
          Komponen siap menerima kode atau input form baru dari Anda.
        </p>
      </div>
    </div>
  );
};
