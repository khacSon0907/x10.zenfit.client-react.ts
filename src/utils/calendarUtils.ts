/**
 * ============================================================================
 * CALENDAR & DATE UTILITIES
 * Hỗ trợ tính toán lịch tuần (Thứ 2 -> Chủ Nhật), lịch tháng, và format ngày giờ
 * Chuẩn ISO-8601, không dùng thư viện ngoài nặng nề.
 * ============================================================================
 */

// Format Date sang YYYY-MM-DD theo giờ địa phương (local time)
export function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse string YYYY-MM-DD sang Date an toàn
export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format dd/mm/yyyy
export function formatDisplayDate(dateInput: Date | string): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseIsoDate(dateInput) : dateInput;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

// Format giờ HH:mm từ HH:mm:ss hoặc HH:mm
export function formatDisplayTime(timeStr?: string | null): string {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

// Format hiển thị khoảng thời gian từ startTime đến endTime (ví dụ: 08:00 - 09:30)
export function formatTimeRange(startTime?: string | null, endTime?: string | null): string {
  if (!startTime) return '--:--';
  const startFmt = formatDisplayTime(startTime);
  if (!endTime) return startFmt;

  // endTime có thể là LocalDateTime (2026-11-03T09:30:00) hoặc LocalTime (09:30:00)
  const timeOnly = endTime.includes('T') ? endTime.split('T')[1] : endTime;
  const endFmt = formatDisplayTime(timeOnly);
  return `${startFmt} - ${endFmt}`;
}

// Tính ngày Thứ Hai (Monday) của tuần chứa currentDate (ISO: Thứ Hai = ngày 1)
export function getMondayOfWeek(currentDate: Date): Date {
  const d = new Date(currentDate);
  const day = d.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

// Lấy khoảng ngày bắt đầu (Thứ 2) và kết thúc (Chủ Nhật) của tuần
export function getWeekRange(currentDate: Date): { startDate: string; endDate: string } {
  const monday = getMondayOfWeek(currentDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    startDate: formatIsoDate(monday),
    endDate: formatIsoDate(sunday),
  };
}

// Lấy danh sách 7 ngày trong tuần từ Thứ Hai đến Chủ Nhật
export interface WeekDayInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayOfWeekName: string; // Thứ 2, Thứ 3, ..., Chủ Nhật
  shortDayName: string; // T2, T3, ..., CN
  dayOfMonth: number;
  isToday: boolean;
  isPast: boolean;
}

const VIETNAMESE_DAY_NAMES = [
  'Chủ Nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

const VIETNAMESE_SHORT_DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function getWeekDays(currentDate: Date): WeekDayInfo[] {
  const monday = getMondayOfWeek(currentDate);
  const todayStr = formatIsoDate(new Date());

  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatIsoDate(d);
    const dayOfWeek = d.getDay();

    days.push({
      date: d,
      dateStr,
      dayOfWeekName: VIETNAMESE_DAY_NAMES[dayOfWeek],
      shortDayName: VIETNAMESE_SHORT_DAY_NAMES[dayOfWeek],
      dayOfMonth: d.getDate(),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    });
  }
  return days;
}

// Lấy khoảng ngày của tháng (Ngày 1 -> Ngày cuối tháng)
export function getMonthInterval(currentDate: Date): { startDate: string; endDate: string } {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    startDate: formatIsoDate(firstDay),
    endDate: formatIsoDate(lastDay),
  };
}

// Lấy lưới các ô ngày trong tháng (bao gồm cả các ngày đệm từ tháng trước và tháng sau)
export interface MonthDayCell {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthDaysGrid(currentDate: Date): MonthDayCell[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = formatIsoDate(new Date());

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Thứ của ngày 1 trong tháng (0 = CN, 1 = T2, ...). Cần đổi sang ISO (T2 = 0, CN = 6)
  const firstDayOfWeekIso = (firstDayOfMonth.getDay() + 6) % 7;

  const cells: MonthDayCell[] = [];

  // 1. Ngày đệm của tháng trước
  for (let i = firstDayOfWeekIso - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({
      date: d,
      dateStr: formatIsoDate(d),
      dayOfMonth: d.getDate(),
      isCurrentMonth: false,
      isToday: formatIsoDate(d) === todayStr,
    });
  }

  // 2. Toàn bộ ngày trong tháng này
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, month, day);
    cells.push({
      date: d,
      dateStr: formatIsoDate(d),
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: formatIsoDate(d) === todayStr,
    });
  }

  // 3. Ngày đệm của tháng sau để hoàn thiện bảng 35 hoặc 42 ô
  const totalCellsNeeded = cells.length <= 35 ? 35 : 42;
  let nextMonthDay = 1;
  while (cells.length < totalCellsNeeded) {
    const d = new Date(year, month + 1, nextMonthDay++);
    cells.push({
      date: d,
      dateStr: formatIsoDate(d),
      dayOfMonth: d.getDate(),
      isCurrentMonth: false,
      isToday: formatIsoDate(d) === todayStr,
    });
  }

  return cells;
}

import type { CalendarViewType } from '../types/session.types';

// Format hiển thị tiêu đề khoảng ngày
export function formatPeriodHeaderTitle(view: CalendarViewType, activeDate: Date): string {
  if (view === 'TABLE') {
    return 'Danh sách toàn bộ buổi tập';
  }
  if (view === 'DAY') {
    const dayOfWeek = activeDate.getDay();
    const dayName = VIETNAMESE_DAY_NAMES[dayOfWeek];
    return `${dayName}, ${formatDisplayDate(activeDate)}`;
  }
  if (view === 'WEEK') {
    const { startDate, endDate } = getWeekRange(activeDate);
    const startD = parseIsoDate(startDate);
    const endD = parseIsoDate(endDate);

    const startStr = `${String(startD.getDate()).padStart(2, '0')}/${String(startD.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${String(endD.getDate()).padStart(2, '0')}/${String(endD.getMonth() + 1).padStart(2, '0')}/${endD.getFullYear()}`;
    return `Tuần: ${startStr} - ${endStr}`;
  }
  // MONTH
  const month = activeDate.getMonth() + 1;
  const year = activeDate.getFullYear();
  return `Tháng ${month}, ${year}`;
}

// Kiểm tra thời điểm (dateStr: YYYY-MM-DD, timeStr: HH:mm) có thuộc về quá khứ so với thời điểm hiện tại không
export function isPastDateTime(dateStr: string, timeStr?: string | null): boolean {
  if (!dateStr) return false;
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const [hours, minutes] = timeStr ? timeStr.split(':').map(Number) : [23, 59];
    const targetDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
    return targetDate.getTime() <= Date.now();
  } catch {
    return false;
  }
}
