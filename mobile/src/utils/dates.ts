import { DAY_WINDOW } from "@/config";

/** Strip time, returning a local-midnight Date. */
export function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Add (possibly negative) days to a date. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Build the window of days for the pager: DAY_WINDOW days before today through
 * DAY_WINDOW days after. Today sits at index DAY_WINDOW.
 */
export function buildDayWindow(today: Date): { days: Date[]; todayIndex: number } {
  const base = atMidnight(today);
  const days: Date[] = [];
  for (let i = -DAY_WINDOW; i <= DAY_WINDOW; i++) {
    days.push(addDays(base, i));
  }
  return { days, todayIndex: DAY_WINDOW };
}

const GREGORIAN_FMT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

/** "Monday, 29 June 2026" (best-effort; falls back to a plain string). */
export function formatGregorian(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-GB", GREGORIAN_FMT).format(d);
  } catch {
    return d.toDateString();
  }
}
