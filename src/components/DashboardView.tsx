import React, {useMemo, useState} from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  DAY_NAMES_ID,
  MOTIVATION_QUOTES,
  SCHOOL_NAME,
} from '../data/seedData';
import {
  AppTab,
  AttendanceRecord,
  AttendanceStatus,
  SubjectSchedule,
  UserAccount,
} from '../types';
import {
  formatMinutesLabel,
  getMinutesUntilStart,
  getTodayDateKey,
  isCurrentlyInSession,
  timeStringToMinutes,
} from '../utils/notifications';
import {computeAttendanceStreak} from '../utils/storage';

interface DashboardViewProps {
  user: UserAccount;
  schedules: SubjectSchedule[];
  records: AttendanceRecord[];
  now: Date;
  onStartAttendance: (schedule?: SubjectSchedule) => void;
  onNavigate: (tab: AppTab) => void;
  onChangeClass: (className: string) => void;
}

const AVATAR_IMG = '/src/assets/images/avatar_student_default_1795431079763.jpg';

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  schedules,
  records,
  now,
  onStartAttendance,
  onNavigate,
  onChangeClass,
}) => {
  const [quoteIdx, setQuoteIdx] = useState(() => now.getDate() % MOTIVATION_QUOTES.length);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const todayKey = getTodayDateKey(now);
  const currentDay = now.getDay();
  const displayDay = currentDay === 0 ? 1 : currentDay; // Show Senin checklist on Sunday preview with clear label

  const userRecords = useMemo(
    () => records.filter((r) => r.userId === user.id),
    [records, user.id]
  );

  const todayRecords = useMemo(
    () => userRecords.filter((r) => r.dateKey === todayKey),
    [userRecords, todayKey]
  );

  const classSchedulesToday = useMemo(() => {
    return schedules
      .filter((s) => s.className === user.className && s.dayOfWeek === displayDay)
      .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));
  }, [schedules, user.className, displayDay]);

  const upcomingSchedule = useMemo(() => {
    if (currentDay === 0) return classSchedulesToday[0] || null;
    const next = classSchedulesToday.find((s) => {
      const minsLeft = getMinutesUntilStart(s.startTime, now);
      return minsLeft > -25;
    });
    return next || null;
  }, [classSchedulesToday, currentDay, now]);

  const completedTodayCount = useMemo(() => {
    return classSchedulesToday.filter((s) =>
      todayRecords.some(
        (r) =>
          r.checked &&
          (r.scheduleId === s.id ||
            (r.subject === s.subject && r.className === s.className))
      )
    ).length;
  }, [classSchedulesToday, todayRecords]);

  const attendanceRate = useMemo(() => {
    if (userRecords.length === 0) return 100;
    const present = userRecords.filter(
      (r) =>
        r.status === AttendanceStatus.HADIR ||
        r.status === AttendanceStatus.TERLAMBAT
    ).length;
    return Math.round((present / userRecords.length) * 100);
  }, [userRecords]);

  const streakDays = useMemo(
    () => computeAttendanceStreak(records, user.id),
    [records, user.id]
  );

  const activeQuote = MOTIVATION_QUOTES[quoteIdx % MOTIVATION_QUOTES.length];

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, [now]);

  const formattedDate = useMemo(() => {
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [now]);

  const formattedClock = useMemo(() => {
    return now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [now]);

  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (attendanceRate / 100) * ringCircumference;

  return (
    <div className="space-y-8">
      {/* Top Greeting & Live Status Row */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {!avatarFailed ? (
                <img
                  src={AVATAR_IMG}
                  alt="Emblem siswa HadirKu"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-teal-700 font-display text-lg font-bold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {formattedDate} · {SCHOOL_NAME} · Kelas {user.className}
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
                {greeting}, {user.name.split(' ')[0]}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{user.dailyGoal}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="dash-class-switch" className="sr-only">
                Ganti kelas aktif
              </label>
              <select
                id="dash-class-switch"
                value={user.className}
                onChange={(e) => onChangeClass(e.target.value)}
                className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-left lg:text-right px-2">
              <p className="text-xs text-slate-500">Waktu Sekarang</p>
              <p className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                {formattedClock}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartAttendance(upcomingSchedule || undefined)}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Absen &amp; Centang Sekarang</span>
            </button>
          </div>
        </div>

        {/* 3-Column Metrics Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="#E2E8F0"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="#0F766E"
                  strokeWidth="6"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-slate-900 tabular-nums">
                {attendanceRate}%
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tingkat Kehadiran</p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                {userRecords.length} Sesi Tercatat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Rangkaian Disiplin</p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                {streakDays} Hari Berturut-turut
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Checklist {DAY_NAMES_ID[displayDay]}
              </p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                {completedTodayCount} / {classSchedulesToday.length} Pelajaran
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Today's Lesson Checklist */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Daftar Pelajaran {DAY_NAMES_ID[displayDay]}
              </h2>
              <p className="text-xs text-slate-500">
                {currentDay === 0
                  ? 'Hari Minggu libur · Menampilkan pratinjau jadwal Senin'
                  : `Kelas ${user.className} · Centang otomatis muncul setelah absensi dan bukti dikirim`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(AppTab.JADWAL)}
              className="min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Atur Jadwal
            </button>
          </div>

          {classSchedulesToday.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                Belum ada jadwal pelajaran untuk kelas {user.className} hari ini.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(AppTab.JADWAL)}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Tambah Jadwal Pelajaran
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {classSchedulesToday.map((item) => {
                const matchedRecord = todayRecords.find(
                  (r) =>
                    r.scheduleId === item.id ||
                    (r.subject === item.subject && r.className === item.className)
                );
                const isDone = Boolean(matchedRecord?.checked);
                const activeNow =
                  currentDay !== 0 &&
                  isCurrentlyInSession(item.startTime, item.endTime, now);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                          isDone
                            ? 'border-teal-600 bg-teal-700 text-white'
                            : activeNow
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                        aria-label={isDone ? 'Sudah dicentang hadir' : 'Belum absen'}
                      >
                        {isDone ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {item.subject}
                          </h3>
                          {activeNow && !isDone && (
                            <span className="text-xs font-semibold text-amber-700">
                              · Berlangsung Sekarang
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                          {item.startTime} – {item.endTime} · {item.room} · {item.teacher}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-12 sm:pl-0 shrink-0">
                      {isDone && matchedRecord ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="capitalize">{matchedRecord.status}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStartAttendance(item)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-teal-600 hover:text-teal-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Absen</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Upcoming Reminder & Daily Motivation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Next Class Reminder Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Bell className="h-4 w-4" />
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Pengingat Jadwal Berikutnya
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(AppTab.JADWAL)}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                Kelola
              </button>
            </div>

            {upcomingSchedule ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium text-slate-500">
                  {DAY_NAMES_ID[upcomingSchedule.dayOfWeek]} ·{' '}
                  <span className="font-mono tabular-nums">
                    {upcomingSchedule.startTime} – {upcomingSchedule.endTime}
                  </span>
                </p>
                <p className="mt-1 font-display text-xl font-bold text-slate-900">
                  {upcomingSchedule.subject}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {upcomingSchedule.room} · {upcomingSchedule.teacher}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-amber-700 tabular-nums">
                    {currentDay === 0
                      ? 'Jadwal Besok Pagi'
                      : formatMinutesLabel(
                          getMinutesUntilStart(upcomingSchedule.startTime, now)
                        )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartAttendance(upcomingSchedule)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Siapkan Absen</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">
                  Seluruh jadwal pelajaran hari ini telah selesai. Istirahat yang cukup dan siapkan materi besok!
                </p>
              </div>
            )}
          </section>

          {/* Daily Motivation Card */}
          <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-teal-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">Motivasi Hari Ini</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length)
                }
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Ganti</span>
              </button>
            </div>

            <blockquote className="mt-4 font-display text-lg font-semibold leading-snug text-white">
              “{activeQuote.quote}”
            </blockquote>
            <p className="mt-2 text-xs text-slate-300">
              {activeQuote.author} · {activeQuote.topic}
            </p>

            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-xs font-medium text-teal-300">Aksi Kecil Hari Ini</p>
              <p className="mt-1 text-sm text-slate-200">
                {activeQuote.actionTip}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(AppTab.MOTIVASI)}
              className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 cursor-pointer"
            >
              <span>Buka Halaman Motivasi &amp; Pencapaian</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
