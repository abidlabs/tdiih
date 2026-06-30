/**
 * Gregorian <-> Hijri conversion using the Kuwaiti (tabular Islamic) algorithm,
 * the same approximation Microsoft uses. It is pure JS, deterministic, and
 * needs no native modules — ideal for Expo Go.
 *
 * Note: the true Islamic calendar depends on moon sighting, so the displayed
 * date can differ from a local sighting by ±1 day. For "this day in history"
 * keyed to a month/day, that tolerance is fine.
 */

export interface HijriDate {
  year: number; // AH
  month: number; // 1-12
  day: number; // 1-30
}

export const HIJRI_MONTHS = [
  "Muḥarram",
  "Ṣafar",
  "Rabīʿ al-Awwal",
  "Rabīʿ al-Thānī",
  "Jumādā al-Awwal",
  "Jumādā al-Thānī",
  "Rajab",
  "Shaʿbān",
  "Ramaḍān",
  "Shawwāl",
  "Dhū al-Qaʿdah",
  "Dhū al-Ḥijjah",
] as const;

/** Convert a JS Date (in local time) to an approximate Hijri date. */
export function gregorianToHijri(date: Date): HijriDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let jd: number;
  if (
    year > 1582 ||
    (year === 1582 && month > 10) ||
    (year === 1582 && month === 10 && day > 14)
  ) {
    jd =
      Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
      Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
      Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
      day -
      32075;
  } else {
    jd =
      367 * year -
      Math.floor((7 * (year + 5001 + Math.floor((month - 9) / 7))) / 4) +
      Math.floor((275 * month) / 9) +
      day +
      1729777;
  }

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const monthH = Math.floor((24 * l) / 709);
  const dayH = l - Math.floor((709 * monthH) / 24);
  const yearH = 30 * n + j - 30;

  return { year: yearH, month: monthH, day: dayH };
}

/** Key used to look events up in the dataset, e.g. "17-9" = 17 Ramaḍān (day-month). */
export function hijriKey(h: HijriDate): string {
  return `${h.day}-${h.month}`;
}

/** "1 Rabīʿ al-Thānī 1447 AH" */
export function formatHijri(h: HijriDate): string {
  const name = HIJRI_MONTHS[h.month - 1] ?? "";
  return `${h.day} ${name} ${h.year} AH`;
}

/** Short month + day, e.g. "Rabīʿ al-Thānī 1". */
export function formatHijriShort(h: HijriDate): string {
  const name = HIJRI_MONTHS[h.month - 1] ?? "";
  return `${name} ${h.day}`;
}
