import React, {useMemo, useState} from 'react';
import {
  Award,
  Check,
  CheckCircle2,
  Flame,
  Smartphone,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  DEVELOPER_NAME,
  MOTIVATION_QUOTES,
  SCHOOL_NAME,
} from '../data/seedData';
import {AttendanceRecord, AttendanceStatus, UserAccount} from '../types';
import {computeAttendanceStreak} from '../utils/storage';
import {PWAInstallButton} from './PWAInstallButton';

interface MotivationApkViewProps {
  user: UserAccount;
  records: AttendanceRecord[];
  onUpdateGoal: (newGoal: string) => void;
}

const CAMPUS_BANNER_IMG =
  '/src/assets/images/motivation_sunrise_campus_1795431080613.jpg';

export const MotivationApkView: React.FC<MotivationApkViewProps> = ({
  user,
  records,
  onUpdateGoal,
}) => {
  const [goalInput, setGoalInput] = useState(user.dailyGoal);
  const [goalSaved, setGoalSaved] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const userRecords = useMemo(
    () => records.filter((r) => r.userId === user.id),
    [records, user.id]
  );

  const streakDays = useMemo(
    () => computeAttendanceStreak(records, user.id),
    [records, user.id]
  );

  const onTimeCount = useMemo(
    () =>
      userRecords.filter((r) => r.status === AttendanceStatus.HADIR).length,
    [userRecords]
  );

  const milestones = [
    {
      id: 'm1',
      title: 'Langkah Pertama',
      desc: 'Catat minimal 1 absensi pelajaran dengan centang dan bukti.',
      unlocked: userRecords.length >= 1,
    },
    {
      id: 'm2',
      title: 'Konsisten 3 Hari',
      desc: 'Pertahankan rangkaian kehadiran selama 3 hari sekolah.',
      unlocked: streakDays >= 3,
    },
    {
      id: 'm3',
      title: 'Tepat Waktu 5x',
      desc: 'Hadir tepat waktu sebanyak 5 sesi mata pelajaran.',
      unlocked: onTimeCount >= 5,
    },
    {
      id: 'm4',
      title: 'Teladan Disiplin',
      desc: 'Mencapai total 10 catatan absensi lengkap dengan bukti.',
      unlocked: userRecords.length >= 10,
    },
  ];

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    onUpdateGoal(goalInput.trim());
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2500);
  };

  const capacitorCmd =
    'npm install @capacitor/core @capacitor/cli @capacitor/android && npm run build && npx cap add android && npx cap sync && npx cap open android';

  const handleCopyCommand = () => {
    navigator.clipboard?.writeText(capacitorCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Inspiration Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white">
        {!bannerFailed ? (
          <img
            src={CAMPUS_BANNER_IMG}
            alt="Suasana pagi sekolah yang cerah dan asri"
            referrerPolicy="no-referrer"
            onError={() => setBannerFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/30" />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300">
            <Sparkles className="h-4 w-4" />
            <span>Ruang Motivasi &amp; Target Belajar</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight text-balance">
            Setiap kehadiranmu adalah investasi kecil yang membentuk masa depan
            besar.
          </h1>
          <p className="mt-3 text-sm text-slate-200 leading-relaxed">
            Tetapkan komitmen harianmu, kumpulkan pencapaian disiplin, dan
            jadikan belajar sebagai kebiasaan yang menyenangkan.
          </p>
        </div>
      </section>

      {/* Personal Goal & Milestones Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Daily Study Target Editor */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Target Harian Pribadi
              </h2>
              <p className="text-xs text-slate-500">
                Ditampilkan di halaman Beranda setiap hari
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGoal} className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Tulis komitmen belajarmu hari ini..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
            <div className="flex items-center justify-between gap-3">
              {goalSaved ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Target diperbarui
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Kelas {user.className}
                </span>
              )}
              <button
                type="submit"
                className="min-h-[42px] rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Simpan Target
              </button>
            </div>
          </form>
        </section>

        {/* Achievement Milestones */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Award className="h-5 w-5" />
              </div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Pencapaian Kedisiplinan
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 tabular-nums">
              <Flame className="h-4 w-4" />
              {streakDays} Hari Beruntun
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  m.unlocked
                    ? 'border-teal-200 bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    m.unlocked
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{m.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{m.desc}</p>
                  <p
                    className={`mt-1.5 text-[11px] font-semibold ${
                      m.unlocked ? 'text-teal-700' : 'text-slate-500'
                    }`}
                  >
                    {m.unlocked ? 'Tercapai' : 'Belum tercapai'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Curated Motivational Cards */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Kumpulan Kutipan &amp; Kebiasaan Baik
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Bacaan singkat sebelum memulai pelajaran agar semangat belajarmu tetap
          terjaga.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {MOTIVATION_QUOTES.map((q) => (
            <article
              key={q.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-5"
            >
              <div>
                <p className="text-xs font-semibold text-teal-700">{q.topic}</p>
                <blockquote className="mt-2 text-sm font-medium leading-relaxed text-slate-900">
                  “{q.quote}”
                </blockquote>
                <p className="mt-2 text-xs text-slate-500">— {q.author}</p>
              </div>
              <p className="mt-4 border-t border-slate-200/80 pt-3 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Tip: </span>
                {q.actionTip}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Android Installation & APK Guide */}
      <section
        id="panduan-apk"
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pasang di HP Android &amp; Pembuatan File APK
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                HadirKu sudah dikonfigurasi sebagai aplikasi PWA siap pasang
                (berjalan layar penuh tanpa bilah browser dan mendukung mode
                offline), serta dilengkapi konfigurasi Capacitor untuk dibungkus
                menjadi file instalasi <span className="font-mono">.apk</span>.
              </p>
            </div>
          </div>

          <PWAInstallButton variant="primary" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-bold text-slate-900">
              1. Paling Cepat: Pasang di HP Android (Tanpa File APK)
            </h3>
            <ol className="mt-2.5 space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                1. Buka link aplikasi ini di <strong>Google Chrome</strong> HP
                Android.
              </li>
              <li>
                2. Ketuk tombol <strong>Pasang Aplikasi</strong> atau buka menu{' '}
                <strong>⋮</strong> Chrome lalu pilih{' '}
                <strong>Tambahkan ke Layar Utama</strong>.
              </li>
              <li>
                3. Ikon HadirKu langsung muncul di layar HP dan berjalan layar
                penuh seperti aplikasi APK.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-bold text-slate-900">
              2. Buat File .APK Online (Tanpa Coding / Tanpa Laptop)
            </h3>
            <ol className="mt-2.5 space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                1. Publikasikan/Share aplikasi ini di AI Studio agar mendapat
                link web publik.
              </li>
              <li>
                2. Buka situs{' '}
                <span className="font-mono font-semibold text-teal-800">
                  pwabuilder.com
                </span>{' '}
                di browser lalu tempel link aplikasi Anda.
              </li>
              <li>
                3. Pilih <strong>Package for Stores → Android</strong> lalu
                unduh file <span className="font-mono">.apk</span> yang langsung
                jadi.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-bold text-slate-900">
              3. Build .APK Otomatis via GitHub atau Terminal Laptop
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Jika kode proyek diekspor ke GitHub, jalankan workflow{' '}
              <span className="font-mono">Build Android APK</span> di tab{' '}
              <strong>Actions</strong> untuk mengunduh{' '}
              <span className="font-mono">app-debug.apk</span> tanpa install
              Android Studio. Atau jalankan perintah berikut di terminal laptop:
            </p>
            <div className="mt-2.5 rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-100 overflow-x-auto">
              <code>{capacitorCmd}</code>
            </div>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="mt-2.5 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <span>
                {copiedCmd ? 'Perintah Disalin' : 'Salin Perintah Terminal'}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          {SCHOOL_NAME} · Dikembangkan oleh{' '}
          <span className="font-semibold text-slate-800">{DEVELOPER_NAME}</span>
        </div>
      </section>
    </div>
  );
};
