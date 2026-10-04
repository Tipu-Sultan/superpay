const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

/** 12 Oct 2026 */
export function formatDate(input: string | Date): string {
  const d = new Date(input);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 4:32 PM */
export function formatTime(input: string | Date): string {
  const d = new Date(input);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatDateTime(input: string | Date): string {
  return `${formatDate(input)}, ${formatTime(input)}`;
}

/** Section / row label: Today, Yesterday, "Mon, 12 Oct" (adds the year for older years). */
export function dayLabel(input: string | Date, now: Date = new Date()): string {
  const d = new Date(input);
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / DAY_MS);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const base = `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** Stable key for grouping transactions by calendar day. */
export function dayKey(input: string | Date): string {
  const d = new Date(input);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function greetingFor(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

/** "in 5 days", "today", "2 days overdue" */
export function dueLabel(input: string | Date, now: Date = new Date()): string {
  const diff = Math.round((startOfDay(new Date(input)) - startOfDay(now)) / DAY_MS);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff > 1) return `Due in ${diff} days`;
  return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`;
}
