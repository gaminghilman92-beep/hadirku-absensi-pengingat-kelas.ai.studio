import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  BellRing,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  History,
  Home,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {AttendanceFormView} from './components/AttendanceFormView';
import {DashboardView} from './components/DashboardView';
import {HistoryView} from './components/HistoryView';
import {LoginView} from './components/LoginView';
import {MotivationApkView} from './components/MotivationApkView';
import {OfflineIndicator} from './components/OfflineIndicator';
import {PWAInstallButton} from './components/PWAInstallButton';
import {ScheduleReminderView} from './components/ScheduleReminderView';
import {TeacherPortalView} from './components/TeacherPortalView';
import {DEVELOPER_NAME, SCHOOL_NAME} from './data/seedData';
import {
  ActiveReminderAlert,
  AppTab,
  AttendanceRecord,
  ReminderSettings,
  SubjectSchedule,
  UserAccount,
} from './types';
import {
  dispatchBrowserReminderNotification,
  getMinutesUntilStart,
  getTodayDateKey,
  playReminderChime,
  requestNotificationPermission,
} from './utils/notifications';
import {
  getAttendanceRecords,
  getCurrentUser,
  getFiredRemindersToday,
  getReminderSettings,
  getSchedules,
  markReminderFiredToday,
  saveAttendanceRecords,
  saveReminderSettings,
  saveSchedules,
  setCurrentSession,
  updateUserProfile,
} from './utils/storage';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const existing = getCurrentUser();
    return existing?.role === 'Guru' ? AppTab.PORTAL_GURU : AppTab.BERANDA;
  });
  const [schedules, setSchedules] = useState<SubjectSchedule[]>(() =>
    getSchedules()
  );
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    getAttendanceRecords()
  );
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(
    () => getReminderSettings()
  );
  const [preselectedSchedule, setPreselectedSchedule] =
    useState<SubjectSchedule | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [activeAlert, setActiveAlert] = useState<ActiveReminderAlert | null>(
    null
  );

  const settingsRef = useRef(reminderSettings);
  settingsRef.current = reminderSettings;

  const navItems = useMemo(() => {
    const base = [
      {id: AppTab.BERANDA, label: 'Beranda', shortLabel: 'Beranda', icon: Home},
      {
        id: AppTab.ABSENSI,
        label: 'Absensi',
        shortLabel: 'Absen',
        icon: ClipboardCheck,
      },
      {
        id: AppTab.JADWAL,
        label: 'Jadwal',
        shortLabel: 'Jadwal',
        icon: CalendarClock,
      },
      {id: AppTab.RIWAYAT, label: 'Riwayat', shortLabel: 'Riwayat', icon: History},
    ];

    if (user?.role === 'Guru') {
      return [
        {
          id: AppTab.PORTAL_GURU,
          label: 'Portal Guru',
          shortLabel: 'Guru',
          icon: ShieldCheck,
        },
        ...base.slice(1),
        {
          id: AppTab.MOTIVASI,
          label: 'Motivasi',
          shortLabel: 'Motivasi',
          icon: Sparkles,
        },
      ];
    }

    return [
      ...base,
      {
        id: AppTab.MOTIVASI,
        label: 'Motivasi',
        shortLabel: 'Motivasi',
        icon: Sparkles,
      },
    ];
  }, [user?.role]);

  // Live clock & automated subject schedule reminder ticker (adapts for Siswa & Guru)
  useEffect(() => {
    const checkReminders = (currentNow: Date) => {
      if (!user) return;
      const dayOfWeek = currentNow.getDay();
      if (dayOfWeek === 0) return;

      const todayKey = getTodayDateKey(currentNow);
      const firedIds = getFiredRemindersToday(todayKey);
      const {leadMinutes, soundEnabled, browserEnabled} = settingsRef.current;

      const todayTargetSchedules = schedules.filter((s) => {
        if (s.dayOfWeek !== dayOfWeek || !s.reminderEnabled) return false;
        if (user.role === 'Guru') {
          const firstNameToken = user.name.trim().toLowerCase().split(',')[0];
          const matchesName =
            firstNameToken.length > 3 &&
            s.teacher.toLowerCase().includes(firstNameToken);
          const matchesMapelClass =
            (user.teachingSubjects || []).includes(s.subject) &&
            (user.teachingClasses || [user.className]).includes(s.className);
          return matchesName || matchesMapelClass;
        }
        return s.className === user.className;
      });

      for (const sch of todayTargetSchedules) {
        if (firedIds.includes(sch.id)) continue;
        const minsLeft = getMinutesUntilStart(sch.startTime, currentNow);
        if (minsLeft >= 0 && minsLeft <= leadMinutes) {
          markReminderFiredToday(todayKey, sch.id);
          if (soundEnabled) {
            playReminderChime();
          }
          if (browserEnabled) {
            void dispatchBrowserReminderNotification(sch, minsLeft);
          }
          setActiveAlert({
            id: `alert-${sch.id}-${Date.now()}`,
            schedule: sch,
            minutesRemaining: minsLeft,
            triggeredAt: currentNow.toISOString(),
          });
          break;
        }
      }
    };

    const intervalId = window.setInterval(() => {
      const current = new Date();
      setNow(current);
      checkReminders(current);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [user, schedules]);

  const handleUpdateSchedules = (next: SubjectSchedule[]) => {
    setSchedules(next);
    saveSchedules(next);
  };

  const handleUpdateSettings = (next: ReminderSettings) => {
    setReminderSettings(next);
    saveReminderSettings(next);
  };

  const handleSubmitRecord = (record: AttendanceRecord) => {
    const next = [record, ...records];
    setRecords(next);
    saveAttendanceRecords(next);
  };

  const handleVerifyStudentRecord = (recordId: string, teacherName: string) => {
    const next = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            verifiedByTeacher: teacherName,
            verifiedAt: new Date().toISOString(),
          }
        : r
    );
    setRecords(next);
    saveAttendanceRecords(next);
  };

  const handleUpdateGoal = (newGoal: string) => {
    if (!user) return;
    const updated = {...user, dailyGoal: newGoal};
    setUser(updated);
    updateUserProfile(updated);
  };

  const handleChangeClass = (newClassName: string) => {
    if (!user) return;
    const updated = {...user, className: newClassName};
    setUser(updated);
    updateUserProfile(updated);
  };

  const handleUpdateTeacherProfile = (updated: UserAccount) => {
    setUser(updated);
    updateUserProfile(updated);
  };

  const handleStartAttendance = (schedule?: SubjectSchedule) => {
    setPreselectedSchedule(schedule || null);
    setActiveTab(AppTab.ABSENSI);
    setActiveAlert(null);
  };

  const handleRequestNotificationPermission = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      handleUpdateSettings({...reminderSettings, browserEnabled: true});
    }
  };

  const handleTestReminder = (schedule: SubjectSchedule) => {
    if (reminderSettings.soundEnabled) {
      playReminderChime();
    }
    if (reminderSettings.browserEnabled) {
      void dispatchBrowserReminderNotification(
        schedule,
        reminderSettings.leadMinutes
      );
    }
    setActiveAlert({
      id: `test-${Date.now()}`,
      schedule,
      minutesRemaining: reminderSettings.leadMinutes,
      triggeredAt: new Date().toISOString(),
      isTest: true,
    });
  };

  const handleLogout = () => {
    setCurrentSession(null);
    setUser(null);
    setActiveAlert(null);
    setActiveTab(AppTab.BERANDA);
  };

  if (!user) {
    return (
      <>
        <LoginView
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setActiveTab(
              loggedInUser.role === 'Guru'
                ? AppTab.PORTAL_GURU
                : AppTab.BERANDA
            );
          }}
        />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      {/* Desktop Top Bar Contract: [Brand] - [5 Nav Links] - [1 Primary Action] */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                user.role === 'Guru' ? AppTab.PORTAL_GURU : AppTab.BERANDA
              )
            }
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <BookOpenCheck className="h-4 w-4" />
            </span>
            <span>HadirKu</span>
          </button>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[11px] h-0.5 bg-teal-700" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Live Schedule Reminder Toast Notification */}
      {activeAlert && (
        <div
          role="alert"
          className="fixed top-16 left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl border border-amber-300 bg-white p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  {activeAlert.isTest
                    ? 'Simulasi Pengingat Pelajaran'
                    : user.role === 'Guru'
                      ? 'Pengingat Jadwal Mengajar Guru'
                      : 'Pengingat Jadwal Akan Dimulai'}
                </p>
                <p className="mt-0.5 font-display text-base font-bold text-slate-900">
                  {activeAlert.schedule.subject} · Kelas{' '}
                  {activeAlert.schedule.className} ·{' '}
                  <span className="font-mono tabular-nums">
                    {activeAlert.schedule.startTime}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {activeAlert.minutesRemaining <= 0
                    ? 'Pelajaran segera dimulai'
                    : `Dimulai dalam ${activeAlert.minutesRemaining} menit`}{' '}
                  · {activeAlert.schedule.room} · {activeAlert.schedule.teacher}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Tutup pengingat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Nanti
            </button>
            <button
              type="button"
              onClick={() => handleStartAttendance(activeAlert.schedule)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Absen Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === AppTab.PORTAL_GURU && user.role === 'Guru' && (
          <TeacherPortalView
            user={user}
            schedules={schedules}
            records={records}
            onUpdateTeacherProfile={handleUpdateTeacherProfile}
            onVerifyStudentRecord={handleVerifyStudentRecord}
            onStartAttendance={handleStartAttendance}
          />
        )}

        {activeTab === AppTab.BERANDA && (
          <DashboardView
            user={user}
            schedules={schedules}
            records={records}
            now={now}
            onStartAttendance={handleStartAttendance}
            onNavigate={setActiveTab}
            onChangeClass={handleChangeClass}
          />
        )}

        {activeTab === AppTab.ABSENSI && (
          <AttendanceFormView
            user={user}
            schedules={schedules}
            preselectedSchedule={preselectedSchedule}
            onSubmitRecord={handleSubmitRecord}
            onGoToHistory={() => setActiveTab(AppTab.RIWAYAT)}
          />
        )}

        {activeTab === AppTab.JADWAL && (
          <ScheduleReminderView
            user={user}
            schedules={schedules}
            reminderSettings={reminderSettings}
            onUpdateSchedules={handleUpdateSchedules}
            onUpdateSettings={handleUpdateSettings}
            onRequestNotificationPermission={
              handleRequestNotificationPermission
            }
            onTestReminder={handleTestReminder}
            onQuickAttend={handleStartAttendance}
            onChangeClass={handleChangeClass}
          />
        )}

        {activeTab === AppTab.RIWAYAT && (
          <HistoryView user={user} records={records} />
        )}

        {activeTab === AppTab.MOTIVASI && (
          <MotivationApkView
            user={user}
            records={records}
            onUpdateGoal={handleUpdateGoal}
          />
        )}
      </main>

      {/* Quiet Desktop Footer with Developer Credit & PWA Install Trigger */}
      <footer className="hidden md:block border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <p className="text-xs text-slate-500">
            HadirKu · {SCHOOL_NAME} · Developer:{' '}
            <span className="font-semibold text-slate-700">
              {DEVELOPER_NAME}
            </span>
          </p>
          <PWAInstallButton
            variant="subtle"
            onShowApkGuide={() => setActiveTab(AppTab.MOTIVASI)}
          />
        </div>
      </footer>

      {/* Mobile Developer Credit Strip above Bottom Nav */}
      <div className="md:hidden pb-4 pt-2 text-center text-[11px] text-slate-500">
        {SCHOOL_NAME} · Developer:{' '}
        <span className="font-semibold text-slate-700">{DEVELOPER_NAME}</span>
      </div>

      {/* Mobile Fixed Bottom Thumb-Zone Navigation Bar */}
      <nav
        aria-label="Navigasi seluler"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe md:hidden"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive ? 'text-teal-700' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
