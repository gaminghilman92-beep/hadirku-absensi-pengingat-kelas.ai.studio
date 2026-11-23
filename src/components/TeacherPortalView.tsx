import React, {useMemo, useState} from 'react';
import {
  BadgeCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
  DAY_NAMES_ID,
  SCHOOL_NAME,
  SCHOOL_TERM,
  TEACHERS_BY_ID,
} from '../data/seedData';
import {
  AttendanceRecord,
  SubjectSchedule,
  UserAccount,
} from '../types';
import {timeStringToMinutes} from '../utils/notifications';

interface TeacherPortalViewProps {
  user: UserAccount;
  schedules: SubjectSchedule[];
  records: AttendanceRecord[];
  onUpdateTeacherProfile: (updated: UserAccount) => void;
  onVerifyStudentRecord: (recordId: string, teacherName: string) => void;
  onStartAttendance: (schedule?: SubjectSchedule) => void;
}

const TEACHER_NAME_SUGGESTIONS = Object.values(TEACHERS_BY_ID).filter(
  (t) => t !== 'Kepala Sekolah'
);

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  user,
  schedules,
  records,
  onUpdateTeacherProfile,
  onVerifyStudentRecord,
  onStartAttendance,
}) => {
  const [name, setName] = useState(user.name);
  const [belajarEmail, setBelajarEmail] = useState(
    user.belajarEmail || user.email
  );
  const [gmailEmail, setGmailEmail] = useState(user.gmailEmail || '');
  const [gmailVerified, setGmailVerified] = useState(
    Boolean(user.gmailVerified)
  );
  const [sentOtp, setSentOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [nip, setNip] = useState(user.nip || user.nisn || '');
  const [teachingSubjects, setTeachingSubjects] = useState<string[]>(
    user.teachingSubjects && user.teachingSubjects.length > 0
      ? user.teachingSubjects
      : ['Bahasa Inggris']
  );
  const [teachingClasses, setTeachingClasses] = useState<string[]>(
    user.teachingClasses && user.teachingClasses.length > 0
      ? user.teachingClasses
      : [user.className]
  );
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 6 ? d : 1;
  });

  const handleToggleSubject = (subj: string) => {
    setTeachingSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleToggleClass = (cls: string) => {
    setTeachingClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleAutoDetectFromSchedule = () => {
    const normalized = name.trim().toLowerCase();
    const matched = schedules.filter((s) =>
      s.teacher.toLowerCase().includes(normalized.split(',')[0])
    );
    if (matched.length === 0) {
      setFormError(
        'Nama guru belum ditemukan di jadwal otomatis. Pilih manual mata pelajaran dan kelas di bawah.'
      );
      return;
    }
    setFormError('');
    const detectedSubjs = Array.from(new Set(matched.map((m) => m.subject)));
    const detectedClasses = Array.from(
      new Set(matched.map((m) => m.className))
    );
    setTeachingSubjects(detectedSubjs);
    setTeachingClasses(detectedClasses);
    setFormMsg(
      `Berhasil mendeteksi ${detectedSubjs.length} mapel dan ${detectedClasses.length} kelas dari jadwal ${SCHOOL_NAME}.`
    );
  };

  const handleSendOtp = () => {
    setFormError('');
    if (!/^[^\s@]+@gmail\.com$/.test(gmailEmail.trim().toLowerCase())) {
      setFormError('Alamat Gmail guru harus valid dan berakhiran @gmail.com.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 899999));
    setSentOtp(code);
    setOtpInput('');
    setGmailVerified(false);
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() === sentOtp && sentOtp) {
      setGmailVerified(true);
      setFormError('');
    } else {
      setFormError('Kode verifikasi 6 digit tidak cocok.');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormMsg('');

    if (!name.trim()) {
      setFormError('Nama lengkap guru wajib diisi.');
      return;
    }
    if (
      !/^[^\s@]+@([a-z0-9-]+\.)*belajar\.id$/.test(
        belajarEmail.trim().toLowerCase()
      )
    ) {
      setFormError('Email Belajar.id harus berakhiran @belajar.id.');
      return;
    }
    if (!/^[^\s@]+@gmail\.com$/.test(gmailEmail.trim().toLowerCase())) {
      setFormError('Email Gmail guru harus berakhiran @gmail.com.');
      return;
    }
    if (!gmailVerified) {
      setFormError('Selesaikan verifikasi Gmail guru terlebih dahulu.');
      return;
    }
    if (teachingSubjects.length === 0) {
      setFormError('Pilih minimal satu mata pelajaran yang Anda ampu.');
      return;
    }
    if (teachingClasses.length === 0) {
      setFormError('Pilih minimal satu kelas yang Anda ajar.');
      return;
    }

    const updated: UserAccount = {
      ...user,
      name: name.trim(),
      email: belajarEmail.trim().toLowerCase(),
      belajarEmail: belajarEmail.trim().toLowerCase(),
      gmailEmail: gmailEmail.trim().toLowerCase(),
      gmailVerified: true,
      nip: nip.trim() || '-',
      nisn: nip.trim() || '-',
      className: teachingClasses[0],
      teachingSubjects,
      teachingClasses,
      teacherFormCompleted: true,
    };

    onUpdateTeacherProfile(updated);
    setFormMsg('Formulir profil guru, mata pelajaran, dan verifikasi Gmail berhasil disimpan.');
  };

  // Teaching schedule matching teacher's name or (subject + class)
  const teacherSchedules = useMemo(() => {
    const firstNameToken = name.trim().toLowerCase().split(',')[0];
    return schedules
      .filter((s) => {
        if (s.dayOfWeek !== selectedDayFilter) return false;
        const matchesTeacherName =
          firstNameToken.length > 3 &&
          s.teacher.toLowerCase().includes(firstNameToken);
        const matchesMapelAndClass =
          teachingSubjects.includes(s.subject) &&
          teachingClasses.includes(s.className);
        return matchesTeacherName || matchesMapelAndClass;
      })
      .sort(
        (a, b) =>
          timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
      );
  }, [
    schedules,
    selectedDayFilter,
    name,
    teachingSubjects,
    teachingClasses,
  ]);

  // Student records relevant to the teacher's subjects and classes
  const relevantRecords = useMemo(() => {
    return records
      .filter(
        (r) =>
          teachingSubjects.includes(r.subject) &&
          teachingClasses.includes(r.className)
      )
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [records, teachingSubjects, teachingClasses]);

  const handleExportTeacherCsv = () => {
    const headers = [
      'Tanggal',
      'Nama',
      'Kelas',
      'Mata Pelajaran',
      'Status',
      'Centang',
      'Verifikasi Guru',
      'Catatan',
    ];
    const rows = relevantRecords.map((r) => [
      r.dateKey,
      `"${r.userName.replace(/"/g, '""')}"`,
      r.className,
      `"${r.subject.replace(/"/g, '""')}"`,
      r.status,
      r.checked ? 'Ya' : 'Tidak',
      r.verifiedByTeacher ? `"Terverifikasi (${r.verifiedByTeacher})"` : 'Menunggu',
      `"${r.note.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-guru-${name.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-700">
              <ShieldCheck className="h-4 w-4" />
              <span>Portal Khusus Guru Belajar.id</span>
              <span className="text-slate-300">·</span>
              <span>{SCHOOL_NAME}</span>
            </div>
            <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {user.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Belajar.id:{' '}
              <span className="font-mono font-medium text-slate-800">
                {user.belajarEmail || user.email}
              </span>{' '}
              · Gmail:{' '}
              <span className="font-mono font-medium text-slate-800">
                {user.gmailEmail || '-'}
              </span>{' '}
              {user.gmailVerified && (
                <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                  · Terverifikasi ✓
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onStartAttendance(teacherSchedules[0])}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Absen Mengajar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Teacher Profile & Mapel Form + Teaching Timetable */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Teacher Verification & Mapel Form */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Formulir Data &amp; Mapel Guru
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi mata pelajaran yang diampu, kelas ajar, serta verifikasi
                Gmail guru.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoDetectFromSchedule}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              <span>Cocokkan Jadwal</span>
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Guru
                </label>
                <input
                  type="text"
                  list="portal-teacher-list"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                />
                <datalist id="portal-teacher-list">
                  {TEACHER_NAME_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP / NUPTK
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Belajar.id Guru
              </label>
              <input
                type="email"
                value={belajarEmail}
                onChange={(e) => setBelajarEmail(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-teal-700" />
                  <span>Verifikasi Gmail Guru (@gmail.com)</span>
                </label>
                {gmailVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                    <BadgeCheck className="h-4 w-4" />
                    Terverifikasi
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={gmailEmail}
                  onChange={(e) => {
                    setGmailEmail(e.target.value);
                    setGmailVerified(false);
                    setSentOtp('');
                  }}
                  placeholder="namaguru@gmail.com"
                  className="flex-1 min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Kirim Kode
                </button>
              </div>
              {sentOtp && !gmailVerified && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-slate-600">
                    Kode verifikasi: <strong className="font-mono text-teal-800">{sentOtp}</strong>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Masukkan kode"
                      className="flex-1 min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 py-1 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="min-h-[38px] rounded-lg bg-teal-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer"
                    >
                      Verifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Teaching Subjects */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Guru Mata Pelajaran (Mapel yang Diampu)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SUBJECTS.map((subj) => {
                  const active = teachingSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleToggleSubject(subj)}
                      className={`flex min-h-[38px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium cursor-pointer ${
                        active
                          ? 'border-teal-700 bg-teal-50 text-teal-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="truncate">{subj}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teaching Classes */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Kelas yang Diajar ({teachingClasses.length} dipilih)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {AVAILABLE_CLASSES.map((cls) => {
                  const active = teachingClasses.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleToggleClass(cls)}
                      className={`min-h-[36px] rounded-lg border px-2 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                {formError}
              </p>
            )}
            {formMsg && (
              <p className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-xs font-medium text-teal-800">
                {formMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 cursor-pointer"
            >
              Simpan Formulir &amp; Profil Guru
            </button>
          </form>
        </section>

        {/* Right: Teacher's Teaching Timetable */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Jadwal Mengajar Guru
              </h2>
              <p className="text-xs text-slate-500">
                {SCHOOL_TERM} · Tersaring otomatis sesuai nama &amp; mapel Anda
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayFilter(day)}
                className={`min-h-[38px] rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDayFilter === day
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {DAY_NAMES_ID[day]}
              </button>
            ))}
          </div>

          {teacherSchedules.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">
                Tidak ada jadwal mengajar pada hari{' '}
                {DAY_NAMES_ID[selectedDayFilter]} untuk mapel/kelas yang dipilih.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {teacherSchedules.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-teal-700 tabular-nums">
                      {item.startTime} – {item.endTime} · Kelas {item.className}
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                      {item.subject}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.teacher} · {item.room}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartAttendance(item)}
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Catat Mengajar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Student Attendance Verification Section for Teacher's Mapel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pantau &amp; Verifikasi Absensi Kelas ({teachingSubjects.join(', ')})
              </h2>
              <p className="text-xs text-slate-500">
                Verifikasi bukti kehadiran siswa atau catatan mengajar pada kelas
                yang Anda ampu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportTeacherCsv}
            disabled={relevantRecords.length === 0}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Rekap Mapel (CSV)</span>
          </button>
        </div>

        {relevantRecords.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600">
            Belum ada catatan absensi pada mata pelajaran dan kelas yang Anda pilih.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {relevantRecords.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {rec.userName}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700">
                      Kelas {rec.className} · {rec.subject}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold capitalize text-teal-700">
                      {rec.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    {rec.dateKey} ·{' '}
                    {new Date(rec.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {rec.note}
                  </p>
                </div>

                <div className="shrink-0">
                  {rec.verifiedByTeacher ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                      <BadgeCheck className="h-4 w-4" />
                      <span>Diverifikasi Guru</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onVerifyStudentRecord(rec.id, user.name)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-teal-700 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Verifikasi Guru</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
