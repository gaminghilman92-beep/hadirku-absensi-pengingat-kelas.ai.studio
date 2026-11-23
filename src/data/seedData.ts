import {
  AttendanceRecord,
  AttendanceStatus,
  MotivationQuote,
  SubjectSchedule,
  UserAccount,
} from '../types';

export const SCHOOL_NAME = 'SMP Negeri 3 Selong';
export const SCHOOL_TERM = 'Semester Ganjil TP. 2026/2027';
export const DEVELOPER_NAME = 'Hilman Fahri';

export const AVAILABLE_CLASSES: string[] = [
  'VII A',
  'VII B',
  'VII C',
  'VII D',
  'VII E',
  'VII F',
  'VIII A',
  'VIII B',
  'VIII C',
  'VIII D',
  'VIII E',
  'VIII F',
  'IX A',
  'IX B',
  'IX C',
  'IX D',
  'IX E',
  'IX F',
];

export const SUBJECTS_BY_CODE: Record<string, string> = {
  A: 'PAIBP',
  B: 'Bahasa Indonesia',
  C: 'Pendidikan Pancasila',
  D: 'IPA',
  E: 'IPS',
  F: 'Bahasa Inggris',
  G: 'Matematika',
  H: 'Penjasorkes',
  I: 'Seni Budaya',
  J: 'Informatika KKA',
  K: 'MULOK Bahasa Sasak',
  L: 'BP/BK',
  M: 'Kokurikuler',
};

export const AVAILABLE_SUBJECTS: string[] = Object.values(SUBJECTS_BY_CODE);

export const TEACHERS_BY_ID: Record<number, string> = {
  1: 'Kepala Sekolah',
  2: 'Baiq. Rukyatul H, S.Pd',
  3: 'Suratmin, S.Pd',
  4: 'Siti Raihan Mariani, S.Pd',
  5: 'H. Rifaid, S.Pd',
  6: 'Anhar',
  7: 'Ahmad Masfu, S.E',
  8: 'Muksin, S.Pd',
  9: 'Laily Yusro, S. Ag',
  10: 'Andi Rahman, S.Pd',
  11: 'Fitriah, S.Pd',
  12: 'Suparwan, S.Pd',
  13: 'Ropikoh, S.Pd',
  14: 'Hamdiyatul Jannah, S.Pd',
  15: 'Sosi Elga Mailany, S.Pd',
  16: 'Helmi, M.Pd',
  17: 'Zahroyani, S.Pd',
  18: 'Ernawati, M.Pd',
  19: 'Hafni Lusiana, S.Pd',
  20: 'Ratu Yuliana, S.Pd',
  21: 'Hittotussunan, S.Pd',
  22: 'Fathul Yani, S.Pd',
  23: 'Ameliana Dastumi, S.Pd',
  24: 'Diana Saufia Athari, S.Pd',
  25: 'Eva Sheptida, S.Pd',
  26: 'M. Syukron Gazali, S.Pd',
  27: 'Bq. Ayudiah Stiari U, S.Pd',
  28: 'Halimatussakdiah, S.Pd',
  29: 'Endang Hardianti, S.Pd',
  30: 'Muhsonah, S.Pd',
  31: 'Hifziati, S.Pd',
  32: 'Ria Khasiaturrahmi, S.Pd',
  33: 'Iznillah, S.Pd',
  34: 'Andi Kurniawan, S.Pd',
  35: 'Abdulloh, S.Pd.I',
  36: 'Lalu Ikhlas Qolbuaji Z, S.Pd',
  37: 'Riska Pratiwi, S.Pd',
  38: 'Ilma Pipit J, S.Pd',
  39: 'Abdul Halim Rohman, S.Pd',
  40: 'M. Izzu, S.Psi',
  41: 'Ainur Rusdi, S.Pd',
  42: 'Ripaini, S.Pd',
  43: 'Istianah, S.Ap',
};

export const DAY_NAMES_ID: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  0: 'Minggu',
};

interface PeriodRow {
  day: number;
  period: string;
  startTime: string;
  endTime: string;
  breakGroup: number; // Periods with different breakGroup are never merged across break
  cells: string[]; // 18 entries matching AVAILABLE_CLASSES
}

const RAW_TIMETABLE: PeriodRow[] = [
  // MONDAY (1)
  {
    day: 1,
    period: 'II',
    startTime: '08:25',
    endTime: '09:05',
    breakGroup: 1,
    cells: ['21B', '13D', '2G', '20C', '29M', '17M', '11G', '32I', '36H', '18D', '33G', '34J', '8G', '22M', '25M', '37M', '39J', '43C'],
  },
  {
    day: 1,
    period: 'III',
    startTime: '09:05',
    endTime: '09:45',
    breakGroup: 1,
    cells: ['21B', '13D', '2G', '20C', '29M', '17M', '11G', '32I', '36H', '18D', '33G', '34J', '8G', '22M', '25M', '37M', '39J', '43C'],
  },
  {
    day: 1,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 1,
    cells: ['2G', '42M', '30K', '3H', '13D', '32I', '22B', '34M', '19C', '20M', '37B', '18D', '31M', '17B', '12H', '8G', '23I', '5D'],
  },
  // Break 10:25 - 10:40
  {
    day: 1,
    period: 'V',
    startTime: '10:40',
    endTime: '11:20',
    breakGroup: 2,
    cells: ['2G', '42M', '30K', '3H', '13D', '32I', '22B', '34M', '19C', '20M', '37B', '18D', '31M', '17B', '12H', '8G', '23I', '5D'],
  },
  {
    day: 1,
    period: 'VI',
    startTime: '11:20',
    endTime: '12:00',
    breakGroup: 2,
    cells: ['23I', '35A', '20C', '38I', '2G', '25J', '19C', '22B', '11G', '37B', '34J', '33G', '18D', '39J', '43C', '5D', '8G', '17B'],
  },
  {
    day: 1,
    period: 'VII',
    startTime: '12:00',
    endTime: '12:40',
    breakGroup: 2,
    cells: ['23I', '35A', '20C', '38I', '2G', '25J', '19C', '22B', '11G', '37B', '34J', '33G', '18D', '39J', '43C', '5D', '8G', '17B'],
  },

  // TUESDAY (2)
  {
    day: 2,
    period: 'I',
    startTime: '07:45',
    endTime: '08:25',
    breakGroup: 1,
    cells: ['3H', '15F', '3H', '13D', '14E', '43C', '22B', '25J', '39M', '37B', '33G', '29E', '12H', '11G', '8G', '10E', '17B', '34F'],
  },
  {
    day: 2,
    period: 'II',
    startTime: '08:25',
    endTime: '09:05',
    breakGroup: 1,
    cells: ['3H', '15F', '3H', '13D', '14E', '43C', '22B', '25J', '39M', '37B', '33G', '29E', '12H', '11G', '8G', '10E', '17B', '34F'],
  },
  {
    day: 2,
    period: 'III',
    startTime: '09:05',
    endTime: '09:45',
    breakGroup: 1,
    cells: ['25J', '15F', '38I', '21B', '14E', '19D', '22B', '20D', '18D', '37B', '28F', '29E', '27F', '7E', '17B', '10E', '12H', '34F'],
  },
  {
    day: 2,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 1,
    cells: ['25J', '2G', '38I', '21B', '13D', '19D', '32I', '20D', '18D', '11G', '28F', '31K', '27F', '7E', '17B', '23I', '12H', '8G'],
  },
  // Break 10:25 - 10:40
  {
    day: 2,
    period: 'V',
    startTime: '10:40',
    endTime: '11:20',
    breakGroup: 2,
    cells: ['15F', '2G', '14E', '21B', '13D', '22B', '32I', '29E', '6F', '11G', '28F', '31K', '27F', '7E', '17B', '23I', '34F', '8G'],
  },
  {
    day: 2,
    period: 'VI',
    startTime: '11:20',
    endTime: '12:00',
    breakGroup: 2,
    cells: ['15F', '25J', '14E', '8M', '30K', '22B', '35A', '29E', '6F', '19C', '31K', '37B', '17B', '42K', '5D', '43C', '34F', '9A'],
  },
  {
    day: 2,
    period: 'VII',
    startTime: '12:00',
    endTime: '12:40',
    breakGroup: 2,
    cells: ['15F', '25J', '14E', '8M', '30K', '22B', '35A', '29E', '6F', '19C', '31K', '37B', '17B', '42K', '5D', '43C', '34F', '9A'],
  },

  // WEDNESDAY (3)
  {
    day: 3,
    period: 'I',
    startTime: '07:45',
    endTime: '08:25',
    breakGroup: 1,
    cells: ['30K', '14E', '21B', '27F', '2G', '33G', '3H', '11G', '37B', '28F', '29E', '12H', '39J', '5D', '34F', '42K', '10E', '17B'],
  },
  {
    day: 3,
    period: 'II',
    startTime: '08:25',
    endTime: '09:05',
    breakGroup: 1,
    cells: ['30K', '14E', '21B', '27F', '2G', '33G', '3H', '11G', '37B', '28F', '29E', '12H', '39J', '5D', '34F', '42K', '10E', '17B'],
  },
  {
    day: 3,
    period: 'III',
    startTime: '09:05',
    endTime: '09:45',
    breakGroup: 1,
    cells: ['13D', '14E', '21B', '27F', '25J', '3H', '6F', '22B', '32I', '28F', '29E', '19C', '7E', '12H', '34F', '39J', '10E', '17B'],
  },
  {
    day: 3,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 1,
    cells: ['13D', '20C', '35A', '2G', '25J', '3H', '6F', '22B', '32I', '18D', '9A', '19C', '7E', '12H', '23I', '39J', '5D', '8G'],
  },
  // Break 10:25 - 10:40
  {
    day: 3,
    period: 'V',
    startTime: '10:40',
    endTime: '11:20',
    breakGroup: 2,
    cells: ['21B', '20C', '35A', '2G', '27F', '14E', '6F', '22B', '29E', '18D', '9A', '37B', '7E', '17B', '23I', '34F', '5D', '8G'],
  },
  {
    day: 3,
    period: 'VI',
    startTime: '11:20',
    endTime: '12:00',
    breakGroup: 2,
    cells: ['21B', '23I', '24M', '35A', '27F', '14E', '20D', '31K', '29E', '11G', '18D', '37B', '9A', '17B', '42K', '34F', '8G', '5D'],
  },
  {
    day: 3,
    period: 'VII',
    startTime: '12:00',
    endTime: '12:40',
    breakGroup: 2,
    cells: ['21B', '23I', '24M', '35A', '27F', '14E', '20D', '31K', '29E', '11G', '18D', '37B', '9A', '17B', '42K', '34F', '8G', '5D'],
  },

  // THURSDAY (4)
  {
    day: 4,
    period: 'I',
    startTime: '07:45',
    endTime: '08:25',
    breakGroup: 1,
    cells: ['14E', '2G', '15F', '30K', '3H', '35A', '25J', '20D', '11G', '29E', '37B', '32M', '17B', '28F', '8G', '22B', '9A', '12H'],
  },
  {
    day: 4,
    period: 'II',
    startTime: '08:25',
    endTime: '09:05',
    breakGroup: 1,
    cells: ['14E', '2G', '15F', '30K', '3H', '35A', '25J', '20D', '11G', '29E', '37B', '32M', '17B', '28F', '8G', '22B', '9A', '12H'],
  },
  {
    day: 4,
    period: 'III',
    startTime: '09:05',
    endTime: '09:45',
    breakGroup: 1,
    cells: ['14E', '13D', '15F', '21B', '43C', '30K', '20D', '3H', '33J', '29E', '37B', '18D', '17B', '28F', '7E', '22B', '35M', '42K'],
  },
  {
    day: 4,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 1,
    cells: ['2G', '13D', '25J', '21B', '43C', '30K', '20D', '3H', '33J', '32I', '23M', '18D', '8G', '9A', '7E', '5D', '35M', '42K'],
  },
  // Break 10:25 - 10:40
  {
    day: 4,
    period: 'V',
    startTime: '10:40',
    endTime: '11:20',
    breakGroup: 2,
    cells: ['2G', '21B', '25J', '14E', '22B', '27F', '29E', '6F', '37B', '32I', '23M', '28F', '8G', '9A', '7E', '5D', '17B', '10E'],
  },
  {
    day: 4,
    period: 'VI',
    startTime: '11:20',
    endTime: '12:00',
    breakGroup: 2,
    cells: ['35A', '21B', '13D', '14E', '22B', '27F', '29E', '6F', '37B', '33J', '32I', '28F', '43C', '11G', '9A', '8G', '17B', '10E'],
  },
  {
    day: 4,
    period: 'VII',
    startTime: '12:00',
    endTime: '12:40',
    breakGroup: 2,
    cells: ['35A', '21B', '13D', '14E', '22B', '27F', '29E', '6F', '37B', '33J', '32I', '28F', '43C', '11G', '9A', '8G', '17B', '10E'],
  },

  // FRIDAY (5)
  {
    day: 5,
    period: 'II',
    startTime: '08:10',
    endTime: '08:50',
    breakGroup: 1,
    cells: ['21M', '3H', '13D', '25J', '35A', '22B', '30M', '11G', '31K', '9A', '19C', '32I', '18D', '23I', '17B', '12H', '5D', '2M'],
  },
  {
    day: 5,
    period: 'III',
    startTime: '08:50',
    endTime: '09:30',
    breakGroup: 1,
    cells: ['21M', '3H', '13D', '25J', '35A', '22B', '30M', '11G', '31K', '9A', '19C', '32I', '18D', '23I', '17B', '12H', '5D', '2M'],
  },
  // Break 09:30 - 09:45
  {
    day: 5,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 2,
    cells: ['20C', '21B', '2G', '13D', '38I', '33G', '31K', '19C', '35A', '36H', '18D', '9A', '42K', '5D', '39J', '22B', '43C', '23I'],
  },
  {
    day: 5,
    period: 'V',
    startTime: '10:25',
    endTime: '11:05',
    breakGroup: 2,
    cells: ['20C', '21B', '2G', '13D', '38I', '33G', '31K', '19C', '35A', '36H', '18D', '9A', '42K', '5D', '39J', '22B', '43C', '23I'],
  },

  // SATURDAY (6)
  {
    day: 6,
    period: 'III',
    startTime: '09:05',
    endTime: '09:45',
    breakGroup: 1,
    cells: ['13D', '30K', '21B', '2G', '22B', '19D', '11G', '35A', '18D', '31K', '12H', '33G', '23I', '43C', '5D', '9A', '42K', '39J'],
  },
  {
    day: 6,
    period: 'IV',
    startTime: '09:45',
    endTime: '10:25',
    breakGroup: 1,
    cells: ['13D', '30K', '21B', '2G', '22B', '19D', '11G', '35A', '18D', '31K', '12H', '33G', '23I', '43C', '5D', '9A', '42K', '39J'],
  },
  // Break 10:25 - 10:40
  {
    day: 6,
    period: 'V',
    startTime: '10:40',
    endTime: '11:20',
    breakGroup: 2,
    cells: ['36M', '33M', '18M', '19M', '28M', '15M', '9M', '13M', '14M', '27M', '11M', '38M', '5M', '10M', '26M', '40M', '41M', '24M'],
  },
  {
    day: 6,
    period: 'VI',
    startTime: '11:20',
    endTime: '12:00',
    breakGroup: 2,
    cells: ['36M', '33M', '18M', '19M', '28M', '15M', '9M', '13M', '14M', '27M', '11M', '38M', '5M', '10M', '26M', '40M', '41M', '24M'],
  },
];

function decodeCell(code: string): {teacher: string; subject: string} {
  const match = code.match(/^(\d+)([A-Z])$/);
  if (!match) {
    return {teacher: 'Guru Mata Pelajaran', subject: code};
  }
  const teacherId = Number(match[1]);
  const subjLetter = match[2];
  const teacher = TEACHERS_BY_ID[teacherId] || `Guru #${teacherId}`;
  const subject = SUBJECTS_BY_CODE[subjLetter] || subjLetter;
  return {teacher, subject};
}

function buildOfficialSchedules(): SubjectSchedule[] {
  const result: SubjectSchedule[] = [];

  for (let classIdx = 0; classIdx < AVAILABLE_CLASSES.length; classIdx++) {
    const className = AVAILABLE_CLASSES[classIdx];

    // Add Monday Flag Ceremony (07:45 - 08:25)
    result.push({
      id: `sch-ceremony-${className.replace(/\s+/g, '')}`,
      className,
      subject: 'Upacara Bendera',
      teacher: 'Kepala Sekolah & Pembina Upacara',
      room: `Lapangan Upacara (${className})`,
      dayOfWeek: 1,
      startTime: '07:45',
      endTime: '08:25',
      reminderEnabled: true,
    });

    // Add Saturday 7 Kebiasaan Anak Indonesia Hebat (07:45 - 09:05)
    result.push({
      id: `sch-kebiasaan-${className.replace(/\s+/g, '')}`,
      className,
      subject: '7 Kebiasaan Anak Indonesia Hebat',
      teacher: 'Wali Kelas & Tim Pembina',
      room: `Ruang Kelas ${className}`,
      dayOfWeek: 6,
      startTime: '07:45',
      endTime: '09:05',
      reminderEnabled: true,
    });

    // Merge consecutive identical periods within the same day & breakGroup
    const rowsByDay = new Map<number, PeriodRow[]>();
    for (const row of RAW_TIMETABLE) {
      const list = rowsByDay.get(row.day) || [];
      list.push(row);
      rowsByDay.set(row.day, list);
    }

    rowsByDay.forEach((rows, day) => {
      let i = 0;
      while (i < rows.length) {
        const startRow = rows[i];
        const cellCode = startRow.cells[classIdx];
        let endRow = startRow;
        let j = i + 1;
        while (
          j < rows.length &&
          rows[j].breakGroup === startRow.breakGroup &&
          rows[j].cells[classIdx] === cellCode
        ) {
          endRow = rows[j];
          j++;
        }

        const {teacher, subject} = decodeCell(cellCode);
        const jamLabel =
          startRow.period === endRow.period
            ? `Jam ${startRow.period}`
            : `Jam ${startRow.period}–${endRow.period}`;

        result.push({
          id: `sch-${day}-${classIdx}-${startRow.period}-${cellCode}`,
          className,
          subject,
          teacher,
          room: `Ruang ${className} · ${jamLabel}`,
          dayOfWeek: day,
          startTime: startRow.startTime,
          endTime: endRow.endTime,
          reminderEnabled: true,
        });

        i = j;
      }
    });
  }

  return result;
}

export const DEFAULT_SCHEDULES: SubjectSchedule[] = buildOfficialSchedules();

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'user-demo-1',
    name: 'Raka Pratama',
    email: 'siswa@hadirku.id',
    password: '123456',
    nisn: '0084920145',
    className: 'VII A',
    role: 'Ketua Kelas',
    dailyGoal:
      'Hadir tepat waktu di seluruh sesi pelajaran dan mencatat rangkuman inti.',
    createdAt: '2026-07-15T07:00:00.000Z',
  },
  {
    id: 'user-demo-guru-1',
    name: 'Sosi Elga Mailany, S.Pd',
    email: 'sosielga@guru.smp.belajar.id',
    password: '123456',
    nisn: '199105142022212008',
    nip: '199105142022212008',
    className: 'VII B',
    role: 'Guru',
    belajarEmail: 'sosielga@guru.smp.belajar.id',
    gmailEmail: 'sosielga.guru@gmail.com',
    gmailVerified: true,
    teachingSubjects: ['Bahasa Inggris', 'Kokurikuler'],
    teachingClasses: ['VII A', 'VII B', 'VII C', 'VII F'],
    teacherFormCompleted: true,
    dailyGoal:
      'Membimbing kelas dengan semangat belajar aktif dan memantau kehadiran siswa.',
    createdAt: '2026-07-15T07:00:00.000Z',
  },
];

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: 'mot-1',
    quote:
      'Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia.',
    author: 'Nelson Mandela',
    topic: 'Tekad Belajar',
    actionTip: 'Siapkan buku catatan 5 menit sebelum guru masuk kelas.',
  },
  {
    id: 'mot-2',
    quote:
      'Disiplin adalah jembatan antara cita-cita dan pencapaian nyata di masa depan.',
    author: 'Jim Rohn',
    topic: 'Kedisiplinan',
    actionTip:
      'Lakukan absensi tepat waktu agar fokus belajarmu terjaga sejak menit pertama.',
  },
  {
    id: 'mot-3',
    quote:
      'Setiap orang menjadi guru, setiap rumah menjadi sekolah. Belajar tidak pernah mengenal batas ruang.',
    author: 'Ki Hajar Dewantara',
    topic: 'Semangat Pendidikan',
    actionTip:
      'Ajukan minimal satu pertanyaan bermakna di salah satu pelajaran hari ini.',
  },
  {
    id: 'mot-4',
    quote:
      'Bukan seberapa cepat kamu melangkah, melainkan seberapa konsisten kamu hadir setiap hari.',
    author: 'Pepatah Akademik',
    topic: 'Konsistensi',
    actionTip:
      'Pertahankan catatan kehadiran 100% minggu ini sebagai investasi kebiasaan baik.',
  },
  {
    id: 'mot-5',
    quote:
      'Ilmu yang dicatat dan diamalkan akan menjadi cahaya yang menuntunmu di masa sulit.',
    author: 'Imam Syafi’i',
    topic: 'Penguasaan Ilmu',
    actionTip:
      'Tinjau ulang 3 poin penting dari pelajaran terakhir sebelum tidur malam nanti.',
  },
  {
    id: 'mot-6',
    quote:
      'Keberhasilan hari esok dibangun oleh kesungguhanmu mendengarkan dan belajar hari ini.',
    author: 'B.J. Habibie',
    topic: 'Inspirasi Sains & Karya',
    actionTip: 'Matikan distraksi ponsel selama sesi pelajaran berlangsung.',
  },
];

function createSampleRecords(): AttendanceRecord[] {
  const now = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().slice(0, 10);
  };
  const makeIso = (offsetDays: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'att-seed-1',
      userId: 'user-demo-1',
      userName: 'Raka Pratama',
      className: 'VII A',
      subject: 'Bahasa Indonesia',
      status: AttendanceStatus.HADIR,
      checked: true,
      proofImage: '',
      proofFileName: 'catatan_bahasa_indonesia.jpg',
      note: 'Hadir tepat waktu bersama Bapak Hittotussunan, S.Pd.',
      timestamp: makeIso(2, 8, 22),
      dateKey: formatDate(2),
    },
    {
      id: 'att-seed-2',
      userId: 'user-demo-1',
      userName: 'Raka Pratama',
      className: 'VII A',
      subject: 'Matematika',
      status: AttendanceStatus.HADIR,
      checked: true,
      proofImage: '',
      proofFileName: 'latihan_matematika.jpg',
      note: 'Mengikuti pelajaran Matematika bersama Ibu Baiq. Rukyatul H, S.Pd.',
      timestamp: makeIso(2, 9, 43),
      dateKey: formatDate(2),
    },
    {
      id: 'att-seed-3',
      userId: 'user-demo-1',
      userName: 'Raka Pratama',
      className: 'VII A',
      subject: 'Penjasorkes',
      status: AttendanceStatus.TERLAMBAT,
      checked: true,
      proofImage: '',
      proofFileName: 'kehadiran_lapangan.jpg',
      note: 'Terlambat 5 menit saat berganti pakaian olahraga bersama Bapak Suratmin, S.Pd.',
      timestamp: makeIso(1, 7, 50),
      dateKey: formatDate(1),
    },
    {
      id: 'att-seed-4',
      userId: 'user-demo-1',
      userName: 'Raka Pratama',
      className: 'VII A',
      subject: 'Bahasa Inggris',
      status: AttendanceStatus.HADIR,
      checked: true,
      proofImage: '',
      proofFileName: 'catatan_bahasa_inggris.jpg',
      note: 'Hadir di pelajaran Ibu Sosi Elga Mailany, S.Pd.',
      timestamp: makeIso(1, 10, 38),
      dateKey: formatDate(1),
    },
  ];
}

export const INITIAL_SAMPLE_RECORDS: AttendanceRecord[] = createSampleRecords();
