import React, {useMemo, useState} from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Clock,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
  DAY_NAMES_ID,
  SCHOOL_NAME,
  SCHOOL_TERM,
} from '../data/seedData';
import {ReminderSettings, SubjectSchedule, UserAccount} from '../types';
import {
  getNotificationPermissionState,
  timeStringToMinutes,
} from '../utils/notifications';

interface ScheduleReminderViewProps {
  user: UserAccount;
  schedules: SubjectSchedule[];
  reminderSettings: ReminderSettings;
  onUpdateSchedules: (next: SubjectSchedule[]) => void;
  onUpdateSettings: (next: ReminderSettings) => void;
  onRequestNotificationPermission: () => Promise<void>;
  onTestReminder: (schedule: SubjectSchedule) => void;
  onQuickAttend: (schedule: SubjectSchedule) => void;
  onChangeClass: (className: string) => void;
}

const WEEK_DAYS = [1, 2, 3, 4, 5, 6];
const LEAD_TIME_OPTIONS: Array<5 | 10 | 15 | 30> = [5, 10, 15, 30];

export const ScheduleReminderView: React.FC<ScheduleReminderViewProps> = ({
  user,
  schedules,
  reminderSettings,
  onUpdateSchedules,
  onUpdateSettings,
  onRequestNotificationPermission,
  onTestReminder,
  onQuickAttend,
  onChangeClass,
}) => {
  const todayDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(
    todayDay >= 1 && todayDay <= 6 ? todayDay : 1
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Form State
  const [subject, setSubject] = useState(AVAILABLE_SUBJECTS[0]);
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState(`Ruang ${user.className}`);
  const [startTime, setStartTime] = useState('07:45');
  const [endTime, setEndTime] = useState('09:05');
  const [formError, setFormError] = useState('');

  const permissionState = getNotificationPermissionState();

  const daySchedules = useMemo(() => {
    return schedules
      .filter(
        (s) => s.className === user.className && s.dayOfWeek === selectedDay
      )
      .sort(
        (a, b) =>
          timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
      );
  }, [schedules, user.className, selectedDay]);

  const handleToggleItemReminder = (id: string) => {
    const next = schedules.map((s) =>
      s.id === id ? {...s, reminderEnabled: !s.reminderEnabled} : s
    );
    onUpdateSchedules(next);
  };

  const handleDeleteSchedule = (id: string) => {
    onUpdateSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim() || !teacher.trim() || !room.trim()) {
      setFormError('Mata pelajaran, nama guru, dan ruang kelas wajib diisi.');
      return;
    }

    if (timeStringToMinutes(endTime) <= timeStringToMinutes(startTime)) {
      setFormError('Jam selesai harus lebih akhir daripada jam mulai.');
      return;
    }

    const newItem: SubjectSchedule = {
      id: `sch-${Date.now()}`,
      className: user.className,
      subject: subject.trim(),
      teacher: teacher.trim(),
      room: room.trim(),
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      reminderEnabled: true,
    };

    onUpdateSchedules([...schedules, newItem]);
    setTeacher('');
    setShowAddModal(false);
  };

  const sampleScheduleForTest: SubjectSchedule = daySchedules[0] || {
    id: 'sch-test',
    className: user.className,
    subject: 'Matematika',
    teacher: 'Baiq. Rukyatul H, S.Pd',
    room: `Ruang ${user.className}`,
    dayOfWeek: selectedDay,
    startTime: '07:45',
    endTime: '09:05',
    reminderEnabled: true,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Jadwal Pelajaran &amp; Pengingat
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {SCHOOL_NAME} · {SCHOOL_TERM} · Kelas {user.className}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Pilih kelas jadwal"
            value={user.className}
            onChange={(e) => onChangeClass(e.target.value)}
            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
          >
            {AVAILABLE_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Reminder Engine Settings Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Pengaturan Notifikasi Pengingat
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Status izin browser:{' '}
                <span className="font-semibold text-slate-900">
                  {permissionState === 'granted'
                    ? 'Diizinkan (Aktif)'
                    : permissionState === 'denied'
                      ? 'Diblokir Browser (Menggunakan Pengingat Dalam Aplikasi)'
                      : permissionState === 'unsupported'
                        ? 'Menggunakan Pengingat Dalam Aplikasi'
                        : 'Belum Diizinkan'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {permissionState !== 'granted' && permissionState !== 'unsupported' && (
              <button
                type="button"
                onClick={onRequestNotificationPermission}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-teal-700 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span>Izinkan Notifikasi</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onTestReminder(sampleScheduleForTest)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BellRing className="h-4 w-4 text-amber-600" />
              <span>Uji Notifikasi Sekarang</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Waktu Pengingat Sebelum Kelas Mulai
            </p>
            <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-slate-100 p-1">
              {LEAD_TIME_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({...reminderSettings, leadMinutes: mins})
                  }
                  className={`min-h-[38px] rounded-lg px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                    reminderSettings.leadMinutes === mins
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mins} mnt
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...reminderSettings,
                  soundEnabled: !reminderSettings.soundEnabled,
                })
              }
              className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                {reminderSettings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-teal-700" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
                <span>Suara Bel Pengingat</span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  reminderSettings.soundEnabled
                    ? 'text-teal-700'
                    : 'text-slate-500'
                }`}
              >
                {reminderSettings.soundEnabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Day Tabs + Schedule List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = todayDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {DAY_NAMES_ID[day]}
                {isToday ? ' · Hari Ini' : ''}
              </button>
            );
          })}
        </div>

        {daySchedules.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada mata pelajaran di hari {DAY_NAMES_ID[selectedDay]}.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Jadwal {DAY_NAMES_ID[selectedDay]}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {daySchedules.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-800 tabular-nums">
                    <span>{item.startTime}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {item.endTime}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {item.subject}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {item.teacher} · {item.room} · Kelas {item.className}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-28 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItemReminder(item.id)}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      item.reminderEnabled
                        ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.reminderEnabled ? (
                      <>
                        <Bell className="h-3.5 w-3.5" />
                        <span>Pengingat Aktif</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3.5 w-3.5" />
                        <span>Nonaktif</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickAttend(item)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-teal-600 hover:text-teal-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Absen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    aria-label={`Hapus jadwal ${item.subject}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Tambah Jadwal · {DAY_NAMES_ID[selectedDay]}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  list="subject-suggestions"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                />
                <datalist id="subject-suggestions">
                  {AVAILABLE_SUBJECTS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Guru Pengampu
                </label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Contoh: Ibu Siti Rahmawati, S.Pd."
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ruang / Lab
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Contoh: Ruang 201"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-rose-700">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
