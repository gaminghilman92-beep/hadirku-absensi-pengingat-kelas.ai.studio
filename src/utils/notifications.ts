import {SubjectSchedule} from '../types';

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getMinutesUntilStart(
  startTime: string,
  now = new Date()
): number {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return timeStringToMinutes(startTime) - nowMinutes;
}

export function isCurrentlyInSession(
  startTime: string,
  endTime: string,
  now = new Date()
): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    nowMinutes >= timeStringToMinutes(startTime) &&
    nowMinutes <= timeStringToMinutes(endTime)
  );
}

export function formatMinutesLabel(minutes: number): string {
  if (minutes <= 0) return 'Sedang dimulai';
  if (minutes < 60) return `${minutes} menit lagi`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam lagi` : `${h} jam ${m} mnt lagi`;
}

export function getNotificationPermissionState():
  | NotificationPermission
  | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function playReminderChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5 gentle academic chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(
        0.12,
        ctx.currentTime + idx * 0.14 + 0.03
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + idx * 0.14 + 0.35
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.38);
    });
  } catch {
    // Ignore audio context block before user gesture
  }
}

export async function dispatchBrowserReminderNotification(
  schedule: SubjectSchedule,
  minutesRemaining: number
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const title = `Pengingat Pelajaran: ${schedule.subject}`;
  const body =
    minutesRemaining <= 0
      ? `Kelas ${schedule.className} (${schedule.startTime}) segera dimulai di ${schedule.room}. Jangan lupa absen!`
      : `Mulai dalam ${minutesRemaining} menit (${schedule.startTime}) · ${schedule.room} · ${schedule.teacher}`;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `hadirku-reminder-${schedule.id}`,
        });
        return true;
      }
    }
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: `hadirku-reminder-${schedule.id}`,
    });
    return true;
  } catch {
    return false;
  }
}
