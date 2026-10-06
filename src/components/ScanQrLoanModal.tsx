import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Camera,
  Upload,
  BookOpen,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
  UserCheck,
  RefreshCw,
  Search,
  StopCircle,
  Smartphone,
  ImageIcon,
} from 'lucide-react';
import jsQR from 'jsqr';
import { BorrowRecord, Member } from '../types/library';
import { sampleBookTitles } from '../data/initialData';

interface ScanQrLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveLoan: (loan: BorrowRecord) => void;
}

export const ScanQrLoanModal: React.FC<ScanQrLoanModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveLoan,
}) => {
  // Step 1: Scan / Identify Member; Step 2: Book details
  const [step, setStep] = useState<'scan' | 'book'>('scan');

  // Scanned member state
  const [scannedMember, setScannedMember] = useState<{
    id: string;
    memberCode: string;
    name: string;
    grade: string;
  } | null>(null);

  // Book loan form state
  const [bookTitle, setBookTitle] = useState('');
  const [bookCode, setBookCode] = useState(
    `BK-${Math.floor(100 + Math.random() * 900)}`
  );
  const [category, setCategory] = useState('Sains & Alam');
  const [borrowDate, setBorrowDate] = useState('2026-10-06');
  const [dueDate, setDueDate] = useState('2026-10-13');
  const [notes, setNotes] = useState('');

  // Scanner states
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraPermissionNotice, setCameraPermissionNotice] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('scan');
      setScannedMember(null);
      setScanError(null);
      setCameraPermissionNotice(null);
      setBookTitle('');
      setBookCode(`BK-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  // Cleanly stop camera stream
  const stopCameraStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start scanning frame loop using pure JS
  const startScanningLoop = () => {
    const scanFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = video.videoWidth;
          offscreenCanvas.height = video.videoHeight;
          const ctx = offscreenCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (qrCode && qrCode.data) {
              handleQrCodeSuccess(qrCode.data);
              stopCameraStream();
              return;
            }
          }
        } catch {
          // continue loop
        }
      }
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Multi-tier camera stream helper
  const getCameraStream = async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('NOT_SUPPORTED');
    }

    const attempts = [
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false },
    ];

    let lastError: any = null;
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) return stream;
      } catch (err: any) {
        lastError = err;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw err;
        }
      }
    }
    throw lastError || new Error('CAMERA_FAILED');
  };

  // Start live webcam/camera stream
  const startCameraScanner = async () => {
    setCameraPermissionNotice(null);
    setScanError(null);

    try {
      const stream = await getCameraStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      setIsCameraActive(false);
      // If live WebRTC camera fails (e.g. iframe policy or permission denied),
      // we provide clear guidance and allow opening the native camera directly!
      setCameraPermissionNotice(
        'Kamera live video tidak diizinkan oleh browser/iframe. Silakan tekan tombol "Buka Kamera HP (Foto & Scan)" di bawah untuk langsung membuka kamera bawaan HP Anda.'
      );
      // Auto-trigger native camera picker as fallback
      nativeCameraInputRef.current?.click();
    }
  };

  // Process decoded QR text
  const handleQrCodeSuccess = (decodedText: string) => {
    try {
      let memberId = '';
      let memberName = '';
      let memberGrade = 'Kelas 4A';

      // Check if QR text is JSON formatted
      if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        const parsed = JSON.parse(decodedText);
        memberId = parsed.id || parsed.memberCode || '';
        memberName = parsed.nama || parsed.name || '';
        memberGrade = parsed.kelas || parsed.grade || 'Siswa';
      } else {
        memberId = decodedText.trim();
      }

      // Look up member in registered directory
      const found = members.find(
        (m) =>
          (memberId && m.memberCode.toLowerCase() === memberId.toLowerCase()) ||
          (memberName && m.name.toLowerCase() === memberName.toLowerCase())
      );

      if (found) {
        setScannedMember({
          id: found.id,
          memberCode: found.memberCode,
          name: found.name,
          grade: found.grade || found.role,
        });
      } else {
        setScannedMember({
          id: Date.now().toString(),
          memberCode: memberId || `ANG-${Math.floor(100 + Math.random() * 900)}`,
          name: memberName || 'Anggota Perpustakaan',
          grade: memberGrade,
        });
      }

      setStep('book');
      setScanError(null);
    } catch {
      setScanError('Format QR Code tidak dikenali.');
    }
  };

  // Handle photo from Camera Capture or Gallery with high-res scale-down optimization
  const handleProcessImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setCameraPermissionNotice(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Scale down huge smartphone camera photos (e.g. 12-48MP) to 1000px for instant fast scan
          const MAX_SIZE = 1000;
          let w = img.width;
          let h = img.height;
          if (w > MAX_SIZE || h > MAX_SIZE) {
            if (w > h) {
              h = Math.round((h * MAX_SIZE) / w);
              w = MAX_SIZE;
            } else {
              w = Math.round((w * MAX_SIZE) / h);
              h = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setScanError('Gagal memproses gambar pada perangkat ini.');
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);

          // Attempt QR decode with both light-on-dark and dark-on-light
          let code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });

          // Second attempt: if not found and was scaled down, try unscaled if reasonable
          if (!code && (img.width !== w || img.height !== h) && img.width <= 2000) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const rawImageData = ctx.getImageData(0, 0, img.width, img.height);
            code = jsQR(rawImageData.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
          }

          if (code && code.data) {
            handleQrCodeSuccess(code.data);
          } else {
            setScanError('QR Code tidak terdeteksi pada foto. Pastikan foto kartu anggota tegak, jelas, dan QR Code terlihat utuh.');
          }
        } catch {
          setScanError('Terjadi kesalahan saat membaca QR Code.');
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Quick simulation helper
  const handleSelectQuickMember = (m: Member) => {
    setScannedMember({
      id: m.id,
      memberCode: m.memberCode,
      name: m.name,
      grade: m.grade || m.role,
    });
    setStep('book');
  };

  // Submit loan handler
  const handleCompleteLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedMember) return;
    if (!bookTitle.trim()) {
      alert('Judul buku wajib diisi.');
      return;
    }

    const newRecord: BorrowRecord = {
      id: `PINJAM-${Date.now().toString().slice(-4)}`,
      borrowerName: scannedMember.name,
      memberId: scannedMember.memberCode,
      grade: scannedMember.grade,
      bookTitle: bookTitle.trim(),
      bookCode: bookCode.trim() || `BK-${Math.floor(100 + Math.random() * 900)}`,
      category,
      borrowDate,
      dueDate,
      status: 'aktif',
      notes: notes.trim() || 'Dipinjam melalui Catat 1: Scan QR Code',
    };

    onSaveLoan(newRecord);
    onClose();
  };

  const filteredQuickMembers = members.filter((m) => {
    if (!quickSearch.trim()) return true;
    const q = quickSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.memberCode.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#0E8388] via-[#189AB4] to-[#1A508B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                Catat 1: Scan QR Code
              </h3>
              <p className="text-[11px] text-teal-100">
                {step === 'scan'
                  ? 'Pindai QR Code Kartu Anggota Siswa'
                  : 'Lengkapi Data Buku yang Dipinjam'}
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

        {/* STEP 1: SCAN QR CODE */}
        {step === 'scan' && (
          <div className="p-4 space-y-3.5 overflow-y-auto">
            {scanError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{scanError}</span>
              </div>
            )}

            {cameraPermissionNotice && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span className="leading-snug">{cameraPermissionNotice}</span>
              </div>
            )}

            {/* Hidden Input 1: Native Android Camera Intent (100% Reliable, Bypasses Iframe Permissions) */}
            <input
              type="file"
              ref={nativeCameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleProcessImage}
              className="hidden"
            />

            {/* Hidden Input 2: Gallery File Input */}
            <input
              type="file"
              ref={galleryFileInputRef}
              accept="image/*"
              onChange={handleProcessImage}
              className="hidden"
            />

            {/* Camera Box */}
            <div className="w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 min-h-[220px] flex items-center justify-center relative">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-[220px] object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Visual target reticle */}
                  <div className="w-44 h-44 border-2 border-teal-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-300" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-300" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-300" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-300" />
                  </div>
                  <span className="mt-3 text-[11px] font-bold text-white bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    Arahkan ke QR Code Kartu
                  </span>
                </div>
              )}

              {!isCameraActive && (
                <div className="p-5 text-center space-y-2.5 text-white/90">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center mx-auto shadow-inner">
                    <Camera className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">
                      Pemindai QR Code Kartu
                    </p>
                    <p className="text-[11px] text-slate-300 max-w-[250px] mx-auto mt-0.5 leading-snug">
                      Gunakan kamera HP untuk memotret kartu atau nyalakan video live
                    </p>
                  </div>

                  {/* Primary Button: Open Camera via Native Android Intent */}
                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-sky-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4 stroke-[2.2]" />
                      <span>Buka Kamera HP (Foto & Scan Cepat)</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCameraScanner}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Nyalakan Video Live Stream</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls when camera active or options below */}
            {isCameraActive && (
              <button
                type="button"
                onClick={stopCameraStream}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Matikan Video Kamera</span>
              </button>
            )}

            {/* Gallery / Screenshot Option */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>Pilih Foto dari Galeri</span>
              </button>
            </div>

            {/* Quick Testing Simulator (Simulasi Pindai Kartu Anggota) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Cari / Pilih Siswa Langsung:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {members.length} Siswa
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Ketik nama atau ID anggota..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {filteredQuickMembers.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectQuickMember(m)}
                    className="w-full p-2 rounded-xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-teal-900">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {m.memberCode} · {m.grade || m.role}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-200 shadow-2xs">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEMBER IDENTIFIED -> FILL BOOK DETAILS */}
        {step === 'book' && scannedMember && (
          <form onSubmit={handleCompleteLoan} className="p-4 space-y-3.5 overflow-y-auto">
            {/* Scanned Member Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-200/70 text-emerald-900 font-mono">
                      {scannedMember.memberCode}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold">
                      Teridentifikasi
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">
                    {scannedMember.name}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {scannedMember.grade}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('scan')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                title="Pindai Ulang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Book Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Judul Buku yang Dipinjam *</span>
              </label>
              <input
                type="text"
                list="popular-books-scan"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Ketik atau pilih judul buku..."
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                required
                autoFocus
              />
              <datalist id="popular-books-scan">
                {sampleBookTitles.map((title, idx) => (
                  <option key={idx} value={title} />
                ))}
              </datalist>
            </div>

            {/* Book Code & Category */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Kode Buku
                </label>
                <input
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  placeholder="BK-042"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Sains & Alam">Sains & Alam</option>
                  <option value="Cerita Rakyat">Cerita Rakyat</option>
                  <option value="Ensiklopedia">Ensiklopedia</option>
                  <option value="Dongeng Anak">Dongeng Anak</option>
                  <option value="Pelajaran">Pelajaran</option>
                  <option value="Agama">Agama</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Dates: Borrow & Due */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Tanggal Pinjam</span>
                </label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rose-500" />
                  <span>Jatuh Tempo (7 Hari)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Catatan Peminjaman
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan kondisi buku..."
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Pindai Ulang
              </button>

              <button
                type="submit"
                className="flex-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#189AB4] hover:brightness-105 text-white font-extrabold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Peminjaman</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
