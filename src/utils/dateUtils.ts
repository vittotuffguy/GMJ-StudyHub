import { DayOfWeek, MasteryLevel } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayISO(): string {
  return toLocalISO(new Date());
}

export function offsetDateISO(days: number, baseDate: Date = new Date()): string {
  const copy = new Date(baseDate);
  copy.setDate(copy.getDate() + days);
  return toLocalISO(copy);
}

export function getCurrentSchoolDay(): { day: DayOfWeek; isWeekend: boolean; label: string } {
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const label = dayNames[jsDay];

  if (jsDay >= 1 && jsDay <= 5) {
    return {
      day: DAYS_OF_WEEK[jsDay - 1],
      isWeekend: false,
      label,
    };
  }
  return {
    day: 'Senin',
    isWeekend: true,
    label,
  };
}

export function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return '-';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function formatFullTodayIndonesian(): string {
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export type DueUrgency = 'overdue' | 'today' | 'soon' | 'normal' | 'done';

export function getDueStatus(
  dueDate: string,
  completed: boolean
): { label: string; urgency: DueUrgency; diffDays: number } {
  if (completed) {
    return { label: 'Selesai', urgency: 'done', diffDays: 0 };
  }

  const todayStr = getTodayISO();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [dy, dm, dd] = dueDate.split('-').map(Number);

  const todayMs = Date.UTC(ty, tm - 1, td);
  const dueMs = Date.UTC(dy, dm - 1, dd);
  const diffDays = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Terlambat ${Math.abs(diffDays)} hari`,
      urgency: 'overdue',
      diffDays,
    };
  }
  if (diffDays === 0) {
    return { label: 'Tenggat Hari Ini', urgency: 'today', diffDays: 0 };
  }
  if (diffDays === 1) {
    return { label: 'Besok (H-1)', urgency: 'soon', diffDays: 1 };
  }
  if (diffDays <= 3) {
    return { label: `${diffDays} hari lagi`, urgency: 'soon', diffDays };
  }
  return { label: `${diffDays} hari lagi`, urgency: 'normal', diffDays };
}

export function deriveMasteryLevel(score: number): MasteryLevel {
  if (score <= 0) return 'Belum Dipelajari';
  if (score < 60) return 'Perlu Review';
  if (score < 85) return 'Cukup Paham';
  return 'Sangat Paham';
}
