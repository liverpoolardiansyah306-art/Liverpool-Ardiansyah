import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  X,
  Check,
  FileSpreadsheet,
  Upload,
  Download,
  QrCode,
  CheckSquare,
  Square,
  AlertCircle,
  FileCheck,
  FileText,
  Printer,
} from 'lucide-react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { Member, LibraryProfile } from '../types/library';
import { MemberIdCardModal } from './MemberIdCardModal';
import { BatchPdfExportModal } from './BatchPdfExportModal';

interface MembersViewProps {
  members: Member[];
  profile: LibraryProfile;
  onAddMember: (newMember: Member) => void;
  onAddMembersBatch?: (newMembers: Member[]) => void;
  onUpdateMemberPhoto?: (memberId: string, photoUrl: string) => void;
  onBackToHome?: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  profile,
  onAddMember,
  onAddMembersBatch,
  onUpdateMemberPhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Semua' | 'Siswa' | 'Guru' | 'Staf'>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchPdfOpen, setIsBatchPdfOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  // Method switcher: 'manual' | 'upload'
  const [addMethod, setAddMethod] = useState<'manual' | 'upload'>('manual');

  // Manual Form States
  const [manualName, setManualName] = useState('');
  const [autoGenerateId, setAutoGenerateId] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [manualGrade, setManualGrade] = useState('Kelas 4A');
  const [manualRole, setManualRole] = useState<'Siswa' | 'Guru' | 'Staf'>('Siswa');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Upload Excel States
  const [parsedExcelRows, setParsedExcelRows] = useState<
    Array<{ name: string; memberCode: string; grade: string; valid: boolean; reason?: string }>
  >([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute next suggested ID
  const getNextSuggestedId = () => {
    return `ANG-${String(members.length + 1).padStart(3, '0')}`;
  };

  // When opening modal or toggling auto-generate
  useEffect(() => {
    if (autoGenerateId) {
      setManualCode(getNextSuggestedId());
    }
  }, [autoGenerateId, members.length, isAddModalOpen]);

  // Generate QR Code dynamically whenever manualCode or manualName changes
  useEffect(() => {
    const codeToEncode = manualCode.trim() || 'ANG-PERPUS';
    const qrPayload = JSON.stringify({
      id: codeToEncode,
      nama: manualName.trim() || 'Anggota Perpustakaan',
      kelas: manualGrade,
    });

    QRCode.toDataURL(qrPayload, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Gagal generate QR Code:', err));
  }, [manualCode, manualName, manualGrade]);

  // Manual submit handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setManualError('Nama lengkap wajib diisi.');
      return;
    }
    const finalCode = manualCode.trim() || getNextSuggestedId();

    const newMem: Member = {
      id: Date.now().toString(),
      memberCode: finalCode,
      name: manualName.trim(),
      role: manualRole,
      grade: manualGrade.trim(),
      status: 'Terverifikasi',
      joinedDate: '2026-10-06',
      qrCodeUrl: qrCodeDataUrl,
    };

    onAddMember(newMem);
    resetManualForm();
    setIsAddModalOpen(false);
  };

  const resetManualForm = () => {
    setManualName('');
    setManualCode(getNextSuggestedId());
    setAutoGenerateId(true);
    setManualGrade('Kelas 4A');
    setManualRole('Siswa');
    setManualError(null);
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rawJson.length === 0) {
          setUploadError('File Excel kosong atau tidak memiliki baris data.');
          setParsedExcelRows([]);
          return;
        }

        // Map columns with flexible headers
        const parsed = rawJson.map((row, index) => {
          // Look for "Nama Lengkap" or "Nama"
          const name = (
            row['Nama Lengkap'] ||
            row['NAMA LENGKAP'] ||
            row['nama lengkap'] ||
            row['Nama'] ||
            row['NAMA'] ||
            row['nama'] ||
            ''
          ).toString().trim();

          // Look for "No Anggota" or "Nomor Anggota" or "ID Anggota"
          let memberCode = (
            row['No Anggota'] ||
            row['NO ANGGOTA'] ||
            row['no anggota'] ||
            row['Nomor Anggota'] ||
            row['NISN'] ||
            row['ID'] ||
            ''
          ).toString().trim();

          if (!memberCode) {
            memberCode = `ANG-${String(members.length + 1 + index).padStart(3, '0')}`;
          }

          // Look for "Kelas"
          const grade = (
            row['Kelas'] ||
            row['KELAS'] ||
            row['kelas'] ||
            row['Kelas / Rombel'] ||
            'Umum'
          ).toString().trim();

          const valid = name.length > 0;
          return {
            name,
            memberCode,
            grade,
            valid,
            reason: valid ? undefined : 'Nama tidak boleh kosong',
          };
        });

        setParsedExcelRows(parsed);
      } catch (err) {
        console.error(err);
        setUploadError('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      { 'Nama Lengkap': 'Ahmad Fauzi Ramadhan', 'No Anggota': 'ANG-057', 'Kelas': 'Kelas 4A' },
      { 'Nama Lengkap': 'Dewi Sartika Putri', 'No Anggota': 'ANG-058', 'Kelas': 'Kelas 5B' },
      { 'Nama Lengkap': 'Budi Prakoso Santoso', 'No Anggota': 'ANG-059', 'Kelas': 'Kelas 6A' },
      { 'Nama Lengkap': 'Citra Kirana Lestari', 'No Anggota': 'ANG-060', 'Kelas': 'Kelas 3B' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Anggota');
    XLSX.writeFile(wb, 'Format_Data_Anggota_Perpustakaan.xlsx');
  };

  // Submit batch from Excel
  const handleBatchImport = async () => {
    const validRows = parsedExcelRows.filter((r) => r.valid);
    if (validRows.length === 0) {
      setUploadError('Tidak ada baris data yang valid untuk diimpor.');
      return;
    }

    const newMembers: Member[] = [];
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      let qrUrl = '';
      try {
        qrUrl = await QRCode.toDataURL(
          JSON.stringify({ id: row.memberCode, nama: row.name, kelas: row.grade }),
          { width: 160, margin: 1 }
        );
      } catch {
        // Fallback
      }

      newMembers.push({
        id: (Date.now() + i).toString(),
        memberCode: row.memberCode,
        name: row.name,
        role: row.grade.toLowerCase().includes('guru') ? 'Guru' : 'Siswa',
        grade: row.grade,
        status: 'Terverifikasi',
        joinedDate: '2026-10-06',
        qrCodeUrl: qrUrl,
      });
    }

    if (onAddMembersBatch) {
      onAddMembersBatch(newMembers);
    } else {
      newMembers.forEach((m) => onAddMember(m));
    }

    // Reset upload state
    setParsedExcelRows([]);
    setExcelFileName('');
    setIsAddModalOpen(false);
  };

  // Filter members list
  const filteredMembers = members.filter((m) => {
    if (roleFilter !== 'Semua' && m.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        (m.grade && m.grade.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Data Anggota Perpustakaan
            </h2>
            <p className="text-[11px] text-emerald-100">
              Total {members.length} anggota resmi terverifikasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsBatchPdfOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-500/60 font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Download semua kartu dalam file PDF ukuran kertas A4"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>PDF A4</span>
          </button>

          <button
            onClick={() => {
              resetManualForm();
              setAddMethod('manual');
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow-xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Download All Cards A4 Action Card */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl p-3 shadow-sm border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-amber-300">
              Download Semua Kartu (PDF A4)
            </h4>
            <p className="text-[10px] text-slate-300 leading-tight">
              Format lembar kertas A4 siap cetak ({members.length} anggota)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBatchPdfOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh PDF</span>
        </button>
      </div>

      {/* Note for User customization */}
      <div className="p-3 bg-sky-50/80 border border-sky-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-sky-900">
        <Sparkles className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold text-sky-950">Info Anggota:</span> Klik nama
          anggota pada daftar untuk melihat Kartu Anggota dan QR Code otomatis.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota, no ID, atau kelas..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {(['Semua', 'Siswa', 'Guru', 'Staf'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid/List */}
      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMemberForCard(member)}
            className="bg-white rounded-xl p-3 shadow-xs border border-slate-100 flex items-center justify-between hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {member.name}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="font-mono text-slate-400">{member.memberCode}</span>
                  <span>·</span>
                  <span className="text-teal-700 font-semibold">{member.grade || member.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMemberForCard(member);
                }}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                title="Lihat, Unduh & Cetak Kartu Anggota"
              >
                <QrCode className="w-3 h-3 text-emerald-400" />
                <span>Kartu</span>
              </button>
              <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* ADD MEMBER MODAL (2 METODE: SECARA MANUAL & UPLOAD FILE)   */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide uppercase">
                    Tambah Anggota Baru
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Pilih metode penambahan anggota perpustakaan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2 Methods Segmented Control Switcher */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setAddMethod('manual')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addMethod === 'manual'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>1. Secara Manual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMethod('upload')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addMethod === 'upload'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>2. Upload File Excel</span>
                </button>
              </div>
            </div>

            {/* Body: Method 1 (Secara Manual) */}
            {addMethod === 'manual' && (
              <form onSubmit={handleManualSubmit} className="p-4 space-y-3.5 overflow-y-auto">
                {manualError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{manualError}</span>
                  </div>
                )}

                {/* NAMA LENGKAP */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    NAMA LENGKAP *
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => {
                      setManualName(e.target.value);
                      if (manualError) setManualError(null);
                    }}
                    placeholder="Contoh: Dania Safitri"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* NO ANGGOTA + TOMBOL CENTANG ISI OTOMATIS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      NO ANGGOTA *
                    </label>
                    {/* Tombol Centang Isi Otomatis */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoGenerateId;
                        setAutoGenerateId(next);
                        if (next) {
                          setManualCode(getNextSuggestedId());
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer select-none"
                    >
                      {autoGenerateId ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Isi Otomatis</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => {
                      setManualCode(e.target.value);
                      setAutoGenerateId(false);
                    }}
                    placeholder="Contoh: ANG-057"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {autoGenerateId
                      ? 'Nomor anggota digenerate otomatis secara berurutan'
                      : 'Mode input nomor kustom'}
                  </p>
                </div>

                {/* KELAS */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      KELAS *
                    </label>
                    <input
                      type="text"
                      value={manualGrade}
                      onChange={(e) => setManualGrade(e.target.value)}
                      placeholder="Kelas 4A"
                      className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      PERAN
                    </label>
                    <select
                      value={manualRole}
                      onChange={(e) =>
                        setManualRole(e.target.value as 'Siswa' | 'Guru' | 'Staf')
                      }
                      className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Siswa">Siswa</option>
                      <option value="Guru">Guru</option>
                      <option value="Staf">Staf</option>
                    </select>
                  </div>
                </div>

                {/* QR CODE ANGGOTA (DIBUATKAN OLEH APLIKASI) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>QR CODE ANGGOTA (DIBUATKAN OLEH APLIKASI)</span>
                  </label>

                  <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200/70 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-xs border border-emerald-200 flex items-center justify-center shrink-0">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="QR Code Anggota"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400">Loading...</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>QR Code Siap Digunakan</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Otomatis terhubung dengan ID{' '}
                        <span className="font-mono font-bold text-slate-700">
                          {manualCode || 'ANG-XXX'}
                        </span>
                        . Dapat dipindai saat peminjaman buku.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Anggota</span>
                  </button>
                </div>
              </form>
            )}

            {/* Body: Method 2 (Secara Upload File Excel) */}
            {addMethod === 'upload' && (
              <div className="p-4 space-y-3.5 overflow-y-auto">
                {/* Template Download Box */}
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-sky-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-sky-950">
                        Format Kolom Excel:
                      </h4>
                      <p className="text-[11px] font-mono font-semibold text-sky-800">
                        Nama Lengkap | No Anggota | Kelas
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-800 text-[10px] font-bold hover:bg-sky-100 flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                    title="Unduh Contoh Format File"
                  >
                    <Download className="w-3 h-3" />
                    <span>Contoh File</span>
                  </button>
                </div>

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-5 text-center cursor-pointer transition-colors space-y-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {excelFileName ? (
                        <span className="text-emerald-800 font-extrabold">
                          {excelFileName}
                        </span>
                      ) : (
                        'Klik untuk Pilih File Excel (.xlsx / .csv)'
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Sistem akan membaca kolom Nama Lengkap, No Anggota, dan Kelas
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Preview of Parsed Excel Data */}
                {parsedExcelRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Pratinjau Data ({parsedExcelRows.length} baris)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Siap Diimpor
                      </span>
                    </div>

                    <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 divide-y divide-slate-100 text-xs">
                      {parsedExcelRows.map((row, idx) => (
                        <div
                          key={idx}
                          className="p-2 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">
                              {row.name || (
                                <span className="text-rose-500 italic">Kosong</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {row.memberCode} · {row.grade}
                            </p>
                          </div>
                          {row.valid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold">
                              Error
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedExcelRows([]);
                      setExcelFileName('');
                      setIsAddModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchImport}
                    disabled={parsedExcelRows.length === 0}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      parsedExcelRows.length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Impor {parsedExcelRows.length} Anggota</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* KARTU ANGGOTA PERPUSTAKAAN (STANDAR 5,398 cm x 8,56 cm)    */}
      {/* ========================================================= */}
      <MemberIdCardModal
        member={selectedMemberForCard}
        profile={profile}
        isOpen={Boolean(selectedMemberForCard)}
        onClose={() => setSelectedMemberForCard(null)}
        onUpdateMemberPhoto={onUpdateMemberPhoto}
      />

      {/* ========================================================= */}
      {/* BATCH PDF EXPORT MODAL (A4 MULTI-PAGE LAYOUT)             */}
      {/* ========================================================= */}
      <BatchPdfExportModal
        isOpen={isBatchPdfOpen}
        onClose={() => setIsBatchPdfOpen(false)}
        members={members}
        profile={profile}
      />
    </div>
  );
};
