/**
 * Every "today" or "N days ago" on screen should be computed from the real
 * clock, not baked in as a string — otherwise the demo looks stale on any
 * day it isn't run on. Seed helpers build dates relative to now; format
 * helpers turn a stored Date back into the short display strings the
 * screens use.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysAgo(n: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - n * DAY_MS);
}

export function weeksAgo(n: number, from: Date = new Date()): Date {
  return daysAgo(n * 7, from);
}

export function withTime(base: Date, hh: number, mm: number): Date {
  const d = new Date(base);
  d.setHours(hh, mm, 0, 0);
  return d;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Wednesday · 18 March" */
export function formatWeekdayDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()].replace(/^\w/, (c) => c.toUpperCase())}`
    .replace("Jan", "January").replace("Feb", "February").replace("Mar", "March").replace("Apr", "April")
    .replace("Jun", "June").replace("Jul", "July").replace("Aug", "August").replace("Sep", "September")
    .replace("Oct", "October").replace("Nov", "November").replace("Dec", "December");
}

/** "25 Mar" */
export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "10:30" */
export function formatClock(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "today", "2d ago", "3w ago" — the caseload/schedule vocabulary. */
export function formatRelative(d: Date, from: Date = new Date()): string {
  const diffDays = Math.round((from.getTime() - d.getTime()) / DAY_MS);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  const weeks = Math.round(diffDays / 7);
  return `${weeks}w ago`;
}

export function greetingTimeOfDay(from: Date = new Date()): "morning" | "afternoon" | "evening" {
  const h = from.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** "Today", "Yesterday", or "18 July 2026" — the chat date-divider vocabulary. */
export function formatDayDivider(d: Date, from: Date = new Date()): string {
  if (isSameDay(d, from)) return "Today";
  if (isSameDay(d, daysAgo(1, from))) return "Yesterday";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "10:30" today, "Thu" this week, "25 Mar" further out — the caseload/schedule "next" column. */
export function formatUpcoming(d: Date, from: Date = new Date()): string {
  if (isSameDay(d, from)) return formatClock(d);
  const diffDays = Math.round((d.getTime() - from.getTime()) / DAY_MS);
  if (diffDays > 0 && diffDays < 7) return WEEKDAYS[d.getDay()].slice(0, 3);
  return formatShortDate(d);
}
