export type TabType = 'beranda' | 'anggota' | 'layanan' | 'statistik' | 'laporan';

export type LoanStatus = 'aktif' | 'terlambat' | 'kembali';

export interface BorrowRecord {
  id: string;
  borrowerName: string;
  memberId: string;
  grade: string; // e.g. "Kelas 4B", "Kelas 5A"
  bookTitle?: string;
  bookCode?: string;
  category?: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  bookPhotoUrl?: string; // Foto Buku (Wajib diisi)
  bookCount?: number; // Jumlah buku yang dipinjam
  returnDate?: string;
  status: LoanStatus;
  notes?: string;
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  role: 'Siswa' | 'Guru' | 'Staf';
  grade?: string;
  status: 'Terverifikasi' | 'Menunggu';
  phone?: string;
  joinedDate: string;
  qrCodeUrl?: string;
  photoUrl?: string;
}

export interface LibraryProfile {
  libraryName: string;
  schoolName: string;
  officerName: string;
  systemName: string;
  logoUrl?: string;
  motto?: string;
}
