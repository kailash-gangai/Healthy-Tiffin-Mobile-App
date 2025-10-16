// ---- helpers (put near top of HomeScreen.tsx) ----

// US DST: second Sunday in March to first Sunday in November
export function isUSEasternDST(dUTC: Date) {
  const year = dUTC.getUTCFullYear();

  // second Sunday in March at 02:00 local
  const march = new Date(Date.UTC(year, 2, 1, 7, 0, 0)); // 02:00 local = 07:00 UTC (EST -5h)
  const marchDay = march.getUTCDay();
  const offsetToSun = (7 - marchDay) % 7;
  const firstSunMarch = new Date(march.getTime() + offsetToSun * 86400000);
  const secondSunMarch = new Date(firstSunMarch.getTime() + 7 * 86400000);
  const dstStartUTC = new Date(
    Date.UTC(year, 2, secondSunMarch.getUTCDate(), 7, 0, 0),
  ); // 02:00 local

  // first Sunday in November at 02:00 local
  const nov = new Date(Date.UTC(year, 10, 1, 6, 0, 0)); // 02:00 local = 06:00 UTC (EDT -4h)
  const novDay = nov.getUTCDay();
  const offsetToSunNov = (7 - novDay) % 7;
  const firstSunNov = new Date(nov.getTime() + offsetToSunNov * 86400000);
  const dstEndUTC = new Date(
    Date.UTC(year, 10, firstSunNov.getUTCDate(), 6, 0, 0),
  ); // 02:00 local

  return dUTC >= dstStartUTC && dUTC < dstEndUTC;
}

// Convert device time to US Eastern local Date (handles DST)
export function toUSEasternDate(deviceNow: Date) {
  const utcMs = deviceNow.getTime() + deviceNow.getTimezoneOffset() * 60000;
  const nowUTC = new Date(utcMs);
  const easternOffsetMin = isUSEasternDST(nowUTC) ? -240 : -300; // EDT/EST
  return new Date(utcMs + easternOffsetMin * 60000);
}

// Build a US Eastern Date for today at cutoff time like "6:00 AM"
export function buildEasternCutoff(usNow: Date, cutoffVal: string) {
  const [timePart, meridianRaw] = cutoffVal.split(' ');
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const mer = (meridianRaw || '').toLowerCase();
  if (mer === 'pm' && h !== 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;

  const cutoff = new Date(usNow.getTime());
  cutoff.setHours(h, m, 0, 0);
  return cutoff;
}

// Map lowerDay -> 0..6 to compare only *today* in US
export const US_DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
