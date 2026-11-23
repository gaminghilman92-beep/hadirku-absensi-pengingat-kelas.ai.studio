export enum AttendanceStatus {
  HADIR = 'hadir',
  TERLAMBAT = 'terlambat',
  IZIN = 'izin',
  SAKIT = 'sakit',
}

export enum AppTab {
  BERANDA = 'beranda',
  ABSENSI = 'absensi',
  JADWAL = 'jadwal',
  RIWAYAT = 'riwayat',
  MOTIVASI = 'motivasi',
  PORTAL_GURU = 'portal_guru',
}

export type UserRole = 'Siswa' | 'Ketua Kelas' | 'Guru';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  nisn: string;
  className: string;
  role: UserRole;
  dailyGoal: string;
  createdAt: string;
  // Special fields for Guru (Email Belajar.id & Gmail verification)
  belajarEmail?: string;
  gmailEmail?: string;
  gmailVerified?: boolean;
  nip?: string;
  teachingSubjects?: string[];
  teachingClasses?: string[];
  teacherFormCompleted?: boolean;
}

export interface SubjectSchedule {
  id: string;
  className: string;
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, ..., 6 = Sabtu, 0 = Minggu
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reminderEnabled: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  className: string;
  subject: string;
  scheduleId?: string;
  status: AttendanceStatus;
  checked: boolean;
  proofImage: string;
  proofFileName: string;
  note: string;
  timestamp: string;
  dateKey: string; // YYYY-MM-DD
  verifiedByTeacher?: string;
  verifiedAt?: string;
}

export interface MotivationQuote {
  id: string;
  quote: string;
  author: string;
  topic: string;
  actionTip: string;
}

export interface ReminderSettings {
  browserEnabled: boolean;
  soundEnabled: boolean;
  leadMinutes: 5 | 10 | 15 | 30;
}

export interface ActiveReminderAlert {
  id: string;
  schedule: SubjectSchedule;
  minutesRemaining: number;
  triggeredAt: string;
  isTest?: boolean;
}
