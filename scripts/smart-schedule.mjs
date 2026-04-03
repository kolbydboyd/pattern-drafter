// Pinterest smart-schedule — optimal posting times for sewing/crafts niche
// Data sources: RecurPost (2M+ posts), Sprout Social, SocialChamp — 2026 studies
// All times in America/New_York (ET)

export const TIMEZONE = 'America/New_York';

// Day-of-week → preferred posting times (HH:MM in ET)
// Sewing/crafts: strong evening + weekend engagement, Tue/Wed midday peaks
export const SMART_SLOTS = {
  0: ['20:00', '21:30'],           // Sunday  — peak evening leisure
  1: ['12:00', '20:00'],           // Monday  — lunch break + evening
  2: ['10:00', '14:00', '20:00'],  // Tuesday — best weekday overall
  3: ['11:00', '20:00'],           // Wednesday — late morning + evening
  4: ['10:00', '14:00'],           // Thursday — morning + afternoon
  5: ['15:00', '21:00'],           // Friday  — afternoon + evening wind-down
  6: ['20:00', '22:00'],           // Saturday — highest engagement window
};

/**
 * Given a date and an index (to spread multiple pins across slots),
 * returns a full Date object at the best posting time for that day.
 *
 * @param {Date|string} date  — the target date
 * @param {number} slotIndex  — which slot to pick (0-based, wraps)
 * @returns {Date} — date+time in ET converted to UTC for storage
 */
export function getSmartPostTime(date, slotIndex = 0) {
  const d = new Date(date);
  const day = d.getDay();
  const slots = SMART_SLOTS[day];
  const slot = slots[slotIndex % slots.length];
  const [hours, minutes] = slot.split(':').map(Number);

  // Build an ISO string in ET, then convert to UTC via the timezone
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  // Create a date string interpreted as ET
  const etDateStr = `${year}-${month}-${dayStr}T${timeStr}`;

  // Use Intl to get the UTC offset for ET on this date (handles DST)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(d);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  // offsetPart.value is like "GMT-4" or "GMT-5"
  const offsetMatch = offsetPart.value.match(/GMT([+-]\d+)/);
  const utcOffsetHours = offsetMatch ? parseInt(offsetMatch[1], 10) : -5;

  // Construct UTC date
  const utcDate = new Date(etDateStr + 'Z');
  utcDate.setHours(utcDate.getHours() - utcOffsetHours);

  return utcDate;
}

/**
 * Returns all cron-compatible UTC hours that cover the smart slots.
 * Used to configure Vercel cron schedule.
 */
export function getAllCronHoursUTC() {
  const hours = new Set();
  for (const slots of Object.values(SMART_SLOTS)) {
    for (const slot of slots) {
      const [h] = slot.split(':').map(Number);
      // Approximate: ET is UTC-4 (EDT) or UTC-5 (EST)
      // Cover both by adding both offsets
      hours.add((h + 4) % 24);
      hours.add((h + 5) % 24);
    }
  }
  return [...hours].sort((a, b) => a - b);
}
