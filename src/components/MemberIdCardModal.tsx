import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Member, LibraryProfile } from '../types/library';

interface MemberIdCardModalProps {
  member: Member | null;
  profile: LibraryProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMemberPhoto?: (memberId: string, photoUrl: string) => void;
}

export const MemberIdCardModal: React.FC<MemberIdCardModalProps> = ({
  member,
  profile,
  isOpen,
  onClose,
  onUpdateMemberPhoto,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (member) {
      setPhotoUrl(member.photoUrl || '');
      // Generate QR Code for this member ID
      const qrPayload = JSON.stringify({
        id: member.memberCode,
        nama: member.name,
        sekolah: profile.schoolName,
      });

      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [member, profile.schoolName]);

  if (!isOpen || !member) return null;

  // Handle uploading photo for the card
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const newPhoto = evt.target.result as string;
          setPhotoUrl(newPhoto);
          if (onUpdateMemberPhoto) {
            onUpdateMemberPhoto(member.id, newPhoto);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (onUpdateMemberPhoto) {
      onUpdateMemberPhoto(member.id, '');
    }
  };

  // High-Resolution PNG Download (300 DPI ready for printing)
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      // Generate HD image with 3x scale factor
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      const sanitizedName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_Anggota_${sanitizedName}_${member.memberCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Gagal mengunduh kartu:', err);
      alert('Terjadi kendala saat mengunduh kartu. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Card Handler
  const handlePrintCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cetak Kartu Anggota - ${member.name}</title>
              <style>
                @page {
                  size: 5.398cm 8.56cm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f8fafc;
                }
                img {
                  width: 5.398cm;
                  height: 8.56cm;
                  object-fit: contain;
                }
                @media print {
                  body {
                    background-color: transparent;
                  }
                  img {
                    width: 5.398cm;
                    height: 8.56cm;
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 text-white w-full max-w-[420px] rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                Kartu Anggota Perpustakaan
              </h3>
              <p className="text-[10px] text-slate-400">
                Ukuran Standar ID-1: 5,398 cm × 8,56 cm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Card Preview */}
        <div className="p-4 flex flex-col items-center justify-center overflow-y-auto bg-slate-950/60">
          {/* ======================================================= */}
          {/* THE PHYSICAL ID CARD ELEMENT (Exact 5.398cm x 8.56cm)   */}
          {/* Aspect ratio: 53.98 / 85.6 ≈ 0.6306 (W: 320px, H: 507px) */}
          {/* ======================================================= */}
          <div
            ref={cardRef}
            id="library-member-id-card"
            style={{
              width: '320px',
              height: '507px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            className="relative rounded-2xl overflow-hidden bg-[#121212] text-white shadow-2xl select-none shrink-0 border border-slate-800"
          >
            {/* Dark Low-Poly Faceted Geometric Background Triangles */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 507"
              preserveAspectRatio="none"
            >
              <polygon points="0,0 180,0 120,160 0,110" fill="#1C1C1C" />
              <polygon points="180,0 260,0 260,180 120,160" fill="#181818" />
              <polygon points="0,110 120,160 80,310 0,270" fill="#161616" />
              <polygon points="120,160 260,180 200,340 80,310" fill="#202020" />
              <polygon points="0,270 80,310 130,420 0,400" fill="#191919" />
              <polygon points="80,310 200,340 180,450 130,420" fill="#151515" />
              <polygon points="200,340 260,180 260,390 180,450" fill="#1E1E1E" />
              <polygon points="0,400 130,420 80,507 0,507" fill="#171717" />
              <polygon points="130,420 260,390 260,507 80,507" fill="#131313" />
            </svg>

            {/* RIGHT VERTICAL CARAMEL BROWN STRIPE */}
            <div
              style={{
                width: '62px',
                right: '18px',
                top: '20px',
                bottom: '20px',
                backgroundColor: '#9E6735',
              }}
              className="absolute rounded-md shadow-sm flex items-center justify-center overflow-hidden z-10"
            >
              {/* Vertical Text SDN5 RAMBUTAN */}
              <span
                style={{
                  writingMode: 'vertical-rl',
                  letterSpacing: '0.12em',
                }}
                className="text-white font-extrabold text-[22px] uppercase select-none tracking-widest text-center whitespace-nowrap"
              >
                {profile.schoolName || 'SDN5 RAMBUTAN'}
              </span>
            </div>

            {/* TOP-LEFT: FOTO 2 X 3 FRAME */}
            <div
              style={{
                top: '20px',
                left: '24px',
                width: '168px',
                height: '218px',
              }}
              className="absolute bg-white rounded-xs shadow-md overflow-hidden flex items-center justify-center z-10 border border-slate-300"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                  <span className="text-[#1A1A1A] font-black text-sm tracking-wider uppercase">
                    FOTO 2 X 3
                  </span>
                </div>
              )}
            </div>

            {/* MIDDLE-LEFT: NAME & MEMBER ID */}
            <div
              style={{
                top: '264px',
                left: '24px',
                width: '210px',
              }}
              className="absolute z-10 pr-2"
            >
              <h2 className="text-white font-black text-xl leading-[1.1] uppercase tracking-tight break-words">
                {member.name}
              </h2>
              <p className="text-white/90 font-medium text-xs tracking-wider mt-1.5 font-mono">
                {member.memberCode}
              </p>
            </div>

            {/* HORIZONTAL HAIRLINE DIVIDER */}
            <div
              style={{
                top: '344px',
                left: '24px',
                right: '24px',
              }}
              className="absolute h-[1px] bg-white/20 z-10"
            />

            {/* BOTTOM SECTION */}
            {/* BOTTOM-LEFT: LIBRARY TREE LOGO + IDENTITY */}
            <div
              style={{
                bottom: '22px',
                left: '24px',
                width: '170px',
              }}
              className="absolute z-10 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                {/* Colorful Tree & Open Book Logo OR Uploaded Logo from Settings */}
                <div className="w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
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
                      {/* Tree cluster */}
                      <circle cx="50" cy="28" r="14" fill="#22C55E" />
                      <circle cx="34" cy="38" r="12" fill="#16A34A" />
                      <circle cx="66" cy="38" r="12" fill="#15803D" />
                      <circle cx="50" cy="45" r="13" fill="#10B981" />
                      <circle cx="28" cy="48" r="10" fill="#84CC16" />
                      <circle cx="72" cy="48" r="10" fill="#4ADE80" />
                      {/* Open book pages */}
                      <path
                        d="M50 48 V 74 M50 74 C 42 70 32 72 26 77 V 64 C 32 60 42 60 50 64 C 58 60 68 60 74 64 V 77 C 68 72 58 70 50 74 Z"
                        fill="#0284C7"
                        stroke="#0369A1"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M26 64 C 32 60 42 60 50 64 V 78 C 42 74 32 74 26 77 Z"
                        fill="#84CC16"
                      />
                    </svg>
                  )}
                </div>

                {/* Library text lockup */}
                <div className="leading-tight">
                  <div className="text-[8px] font-black tracking-wider text-[#1E88E5] uppercase">
                    PERPUSTAKAAN
                  </div>
                  <div className="text-[10px] font-black tracking-tight text-[#0077B6] uppercase">
                    {profile.libraryName || 'GUDANG ILMU'}
                  </div>
                  <div className="text-[8px] font-black tracking-wider text-[#22C55E] uppercase">
                    {profile.schoolName || 'SDN5 RAMBUTAN'}
                  </div>
                </div>
              </div>

              {/* Bottom tag: KARTU ANGGOTA */}
              <div className="mt-4 text-[10px] font-extrabold text-white tracking-widest uppercase">
                KARTU ANGGOTA
              </div>
            </div>

            {/* BOTTOM-RIGHT: QR CODE & ID */}
            <div
              style={{
                bottom: '20px',
                right: '20px',
                width: '85px',
              }}
              className="absolute z-10 flex flex-col items-center"
            >
              {/* White rounded square holding the QR code */}
              <div className="w-[85px] h-[85px] bg-white rounded-xl p-1 shadow-md flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-[9px] text-black">QR Code</div>
                )}
              </div>
              <div className="text-[9px] font-mono font-medium text-white/90 mt-1.5 text-center truncate w-full">
                {member.memberCode}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2.5">
          {/* Photo Management Controls */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-teal-400" />
              <span>Foto Siswa (2x3):</span>
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-2 py-1 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-[11px] font-bold border border-rose-800/50 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Kembalikan ke placeholder FOTO 2 X 3"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Buttons: Download & Print */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Download HD Button */}
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Memproses...' : 'Download Kartu'}</span>
            </button>

            {/* Print Direct Button */}
            <button
              type="button"
              onClick={handlePrintCard}
              disabled={isDownloading}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs border border-slate-700 shadow-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Cetak Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
