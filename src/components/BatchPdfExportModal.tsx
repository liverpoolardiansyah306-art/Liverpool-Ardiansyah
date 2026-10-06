import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Member, LibraryProfile } from '../types/library';
import { renderMemberCardCanvas } from '../utils/cardCanvasRenderer';

interface BatchPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  profile: LibraryProfile;
}

export const BatchPdfExportModal: React.FC<BatchPdfExportModalProps> = ({
  isOpen,
  onClose,
  members,
  profile,
}) => {
  const [selectedRole, setSelectedRole] = useState<'Semua' | 'Siswa' | 'Guru' | 'Staf'>('Semua');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });

  if (!isOpen) return null;

  const filteredMembers = members.filter((m) => {
    if (selectedRole === 'Semua') return true;
    return m.role === selectedRole;
  });

  const cardsPerPage = 9; // 3 x 3 grid on A4
  const totalPages = Math.ceil(filteredMembers.length / cardsPerPage);

  // Generate & Download multi-page A4 PDF
  const handleGeneratePdf = async () => {
    if (filteredMembers.length === 0) return;

    try {
      setIsGenerating(true);
      const total = filteredMembers.length;
      setProgress({ current: 0, total, percent: 0 });

      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Card physical dimensions
      const cardWidth = 53.98; // mm (5.398 cm)
      const cardHeight = 85.6; // mm (8.56 cm)

      // Grid spacing for 3x3 layout
      const marginLeft = 15;
      const marginTop = 12;
      const gapX = 8.5;
      const gapY = 5.2;

      for (let i = 0; i < total; i++) {
        const member = filteredMembers[i];
        const pageIndex = Math.floor(i / cardsPerPage);
        const cardIndexOnPage = i % cardsPerPage;

        // If not first card and starting a new page
        if (i > 0 && cardIndexOnPage === 0) {
          pdf.addPage('a4', 'portrait');
        }

        const col = cardIndexOnPage % 3;
        const row = Math.floor(cardIndexOnPage / 3);

        const x = marginLeft + col * (cardWidth + gapX);
        const y = marginTop + row * (cardHeight + gapY);

        // Render card canvas with QR code & school branding
        const canvas = await renderMemberCardCanvas(member, profile);
        const cardImgData = canvas.toDataURL('image/png');

        // Draw card image onto PDF
        pdf.addImage(cardImgData, 'PNG', x, y, cardWidth, cardHeight, undefined, 'FAST');

        // Draw subtle cutting guideline around card
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, cardWidth, cardHeight);

        // Update progress state
        const currentCount = i + 1;
        const percent = Math.round((currentCount / total) * 100);
        setProgress({ current: currentCount, total, percent });
      }

      // Add page numbers at footer
      const numPages = pdf.getNumberOfPages();
      for (let p = 1; p <= numPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `${profile.schoolName || 'Perpustakaan'} — Lembar Kartu Anggota A4 (Halaman ${p} dari ${numPages})`,
          105,
          292,
          { align: 'center' }
        );
      }

      // Save PDF
      const sanitizedSchool = (profile.schoolName || 'Perpustakaan').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Kartu_Anggota_Semua_${sanitizedSchool}_A4.pdf`);
    } catch (err) {
      console.error('Error saat membuat PDF:', err);
      alert('Gagal membuat file PDF. Silakan coba kembali.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Browser Print for A4
  const handleDirectPrintA4 = async () => {
    await handleGeneratePdf();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white text-slate-800 w-full max-w-[420px] rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1A508B] to-[#189AB4] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide">
                Download Semua Kartu (PDF A4)
              </h3>
              <p className="text-[11px] text-sky-100">
                Format Lembar Kertas A4 Siap Cetak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white cursor-pointer transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Summary Card */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sky-800 uppercase block">
                  Total Anggota Terdaftar
                </span>
                <span className="text-sm font-black text-[#1A508B]">
                  {filteredMembers.length} Orang ({totalPages} Halaman A4)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-white text-sky-900 border border-sky-200 px-2 py-1 rounded-lg">
                9 Kartu / Hal
              </span>
            </div>
          </div>

          {/* Role Filter Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Pilih Data yang Akan Dicetak</span>
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              {(['Semua', 'Siswa', 'Guru', 'Staf'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedRole === r
                      ? 'bg-white text-[#1A508B] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Specifications Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Spesifikasi File PDF A4:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-0.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ukuran Kertas: <strong>A4 (210×297 mm)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ukuran Kartu: <strong>5,398 × 8,56 cm</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Susunan: <strong>Grid 3 × 3 Kartu</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Garis Potong: <strong>Presisi rapi</strong></span>
              </div>
            </div>
          </div>

          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Membuat file PDF...</span>
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  {progress.current} / {progress.total} kartu ({progress.percent}%)
                </span>
              </div>
              <div className="w-full bg-emerald-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-700 text-center">
                Menyusun layout kartu beresolusi tinggi untuk kertas A4...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating || filteredMembers.length === 0}
              className={`flex-2 py-2.5 px-3 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all ${
                isGenerating || filteredMembers.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#189AB4] to-[#0E8388] hover:from-[#158299] hover:to-[#0a666a] text-white active:scale-98 cursor-pointer'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating
                  ? `Memproses (${progress.percent}%)...`
                  : `Download PDF A4 (${filteredMembers.length} Kartu)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
