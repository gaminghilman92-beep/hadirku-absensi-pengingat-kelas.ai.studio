import {
  DEFAULT_SCHEDULES,
  DEMO_USERS,
  INITIAL_SAMPLE_RECORDS,
} from '../data/seedData';
import {
  AttendanceRecord,
  AttendanceStatus,
  ReminderSettings,
  SubjectSchedule,
  UserAccount,
} from '../types';

const KEYS = {
  USERS: 'hadirku_users_v2',
  SESSION_USER_ID: 'hadirku_session_user_v2',
  SCHEDULES: 'hadirku_schedules_v2',
  RECORDS: 'hadirku_records_v2',
  REMINDER_SETTINGS: 'hadirku_reminder_settings_v2',
  FIRED_REMINDERS: 'hadirku_fired_reminders_v2',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getUsers(): UserAccount[] {
  const stored = safeParse<UserAccount[]>(localStorage.getItem(KEYS.USERS), []);
  if (stored.length === 0) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  const missingDemo = DEMO_USERS.filter(
    (demo) => !stored.some((u) => u.id === demo.id)
  );
  if (missingDemo.length > 0) {
    const merged = [...stored, ...missingDemo];
    localStorage.setItem(KEYS.USERS, JSON.stringify(merged));
    return merged;
  }
  return stored;
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): UserAccount | null {
  const userId = localStorage.getItem(KEYS.SESSION_USER_ID);
  if (!userId) return null;
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}

export function setCurrentSession(userId: string | null): void {
  if (userId) {
    localStorage.setItem(KEYS.SESSION_USER_ID, userId);
  } else {
    localStorage.removeItem(KEYS.SESSION_USER_ID);
  }
}

export function updateUserProfile(updated: UserAccount): void {
  const users = getUsers();
  const next = users.map((u) => (u.id === updated.id ? updated : u));
  saveUsers(next);
}

export function getSchedules(): SubjectSchedule[] {
  const stored = safeParse<SubjectSchedule[]>(
    localStorage.getItem(KEYS.SCHEDULES),
    []
  );
  if (stored.length === 0) {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(DEFAULT_SCHEDULES));
    return DEFAULT_SCHEDULES;
  }
  return stored;
}

export function saveSchedules(schedules: SubjectSchedule[]): void {
  localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
}

export function getAttendanceRecords(): AttendanceRecord[] {
  const stored = safeParse<AttendanceRecord[]>(
    localStorage.getItem(KEYS.RECORDS),
    []
  );
  if (stored.length === 0 && !localStorage.getItem(KEYS.RECORDS)) {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(INITIAL_SAMPLE_RECORDS));
    return INITIAL_SAMPLE_RECORDS;
  }
  return stored;
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export function getReminderSettings(): ReminderSettings {
  return safeParse<ReminderSettings>(
    localStorage.getItem(KEYS.REMINDER_SETTINGS),
    {
      browserEnabled: true,
      soundEnabled: true,
      leadMinutes: 15,
    }
  );
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
}

export function getFiredRemindersToday(dateKey: string): string[] {
  const data = safeParse<{dateKey: string; ids: string[]}>(
    localStorage.getItem(KEYS.FIRED_REMINDERS),
    {dateKey, ids: []}
  );
  if (data.dateKey !== dateKey) {
    return [];
  }
  return data.ids;
}

export function markReminderFiredToday(dateKey: string, scheduleId: string): void {
  const existing = getFiredRemindersToday(dateKey);
  if (!existing.includes(scheduleId)) {
    localStorage.setItem(
      KEYS.FIRED_REMINDERS,
      JSON.stringify({dateKey, ids: [...existing, scheduleId]})
    );
  }
}

export function computeAttendanceStreak(records: AttendanceRecord[], userId: string): number {
  const userDates = Array.from(
    new Set(
      records
        .filter(
          (r) =>
            r.userId === userId &&
            r.checked &&
            (r.status === AttendanceStatus.HADIR ||
              r.status === AttendanceStatus.TERLAMBAT)
        )
        .map((r) => r.dateKey)
    )
  ).sort((a, b) => (a > b ? -1 : 1));

  if (userDates.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < userDates.length - 1; i++) {
    const curr = new Date(userDates[i] + 'T00:00:00');
    const prev = new Date(userDates[i + 1] + 'T00:00:00');
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 2) {
      // Allows weekend gap cleanly when consecutive school days are recorded
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
