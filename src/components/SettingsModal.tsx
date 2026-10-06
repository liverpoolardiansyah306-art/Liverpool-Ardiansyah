import React, { useState, useRef } from 'react';
import { X, Settings, School, User, BookOpen, Upload, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import { LibraryProfile } from '../types/library';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LibraryProfile;
  onSaveProfile: (profile: LibraryProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [libraryName, setLibraryName] = useState(profile.libraryName || profile.motto || 'GUDANG ILMU');
  const [schoolName, setSchoolName] = useState(profile.schoolName || 'SDN 5 RAMBUTAN');
  const [officerName, setOfficerName] = useState(profile.officerName || 'Ibu Ratna S.Pust');
  const [logoUrl, setLogoUrl] = useState<string>(profile.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      libraryName: libraryName.trim() || 'GUDANG ILMU',
      motto: libraryName.trim() || 'GUDANG ILMU',
      schoolName: schoolName.trim() || 'SDN 5 RAMBUTAN',
      officerName: officerName.trim() || 'Ibu Ratna S.Pust',
      logoUrl: logoUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[390px] rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1A508B] to-[#189AB4] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                PENGATURAN PERPUSTAKAAN
              </h3>
              <p className="text-[11px] font-bold text-sky-100 tracking-wider uppercase">
                PROFIL PERPUSTAKAAN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-3.5 overflow-y-auto">
          {/* NAMA PERPUSTAKAAN */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>NAMA PERPUSTAKAAN</span>
            </label>
            <input
              type="text"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              placeholder="Contoh: GUDANG ILMU"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              required
            />
          </div>

          {/* NAMA SEKOLAH */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-teal-600" />
              <span>NAMA SEKOLAH</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Contoh: SDN 5 RAMBUTAN"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              required
            />
          </div>

          {/* NAMA PETUGAS PERPUSTAKAAN */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>NAMA PETUGAS PERPUSTAKAAN</span>
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="Contoh: Ibu Ratna S.Pust"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* LOGO (BISA DIUPLOAD OLEH KITA) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>LOGO (BISA DIUPLOAD OLEH KITA)</span>
            </label>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
              {/* Logo Preview box */}
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                    <span className="text-[8px] font-semibold text-slate-400 leading-tight mt-0.5">
                      Logo Asli
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-teal-300 text-teal-700 hover:bg-teal-50 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoUrl ? 'Ganti Logo' : 'Upload Logo Baru'}</span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="w-full py-1 text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus & Gunakan Logo Bawaan</span>
                  </button>
                )}
                {!logoUrl && (
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, atau WebP (Maks. 2MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0E8388] text-white text-xs font-extrabold hover:bg-[#0c6b6f] active:scale-98 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
