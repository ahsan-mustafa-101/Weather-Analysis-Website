/**
 * Formats forecast timestamps using the offset embedded in the ISO
 * string itself (e.g. "+05:00"), never the browser's local timezone.
 * Forecast timestamps represent local time AT THE LOCATION, so a
 * user in a different timezone than the city they searched for
 * should still see that city's local time, not their own.
 *
 * Date.prototype.getHours()/getMinutes() always convert to the
 * runtime's local timezone, which is wrong here — so we parse the
 * wall-clock hour/minute directly out of the string instead of
 * going through a Date object's local getters.
 */

interface IsoComponents {
  hour: number;
  minute: number;
  year: number;
  month: number; // 1-12
  day: number;
}

const ISO_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function parseIsoComponents(timestamp: string): IsoComponents | null {
  const match = timestamp.match(ISO_PATTERN);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}

/** e.g. "3:45 PM" — the location's own local time, not the browser's. */
export function formatLocationTime(timestamp: string): string {
  const c = parseIsoComponents(timestamp);
  if (!c) return "--:--";
  const period = c.hour >= 12 ? "PM" : "AM";
  const hour12 = c.hour % 12 === 0 ? 12 : c.hour % 12;
  const minute = String(c.minute).padStart(2, "0");
  return `${hour12}:${minute} ${period}`;
}

/** e.g. "3 PM" — compact form used on forecast strip cards. */
export function formatHourLabel(timestamp: string): string {
  const c = parseIsoComponents(timestamp);
  if (!c) return "--";
  const period = c.hour >= 12 ? "PM" : "AM";
  const hour12 = c.hour % 12 === 0 ? 12 : c.hour % 12;
  return `${hour12} ${period}`;
}

/** e.g. "Saturday, July 18" — the location's own local date. */
export function formatLocationDate(timestamp: string): string {
  const c = parseIsoComponents(timestamp);
  if (!c) return "";
  // Using Date.UTC so no timezone conversion happens; we already
  // extracted the correct wall-clock date components above.
  const d = new Date(Date.UTC(c.year, c.month - 1, c.day));
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * "Lahore, Punjab, Pakistan" — falls back to "Lahore, Pakistan" if
 * admin1 (region/state) is null, and just "Lahore" if country is
 * also null. Shared by the search dropdown and the hero so both
 * follow the exact same fallback rule.
 */
export function formatLocationLabel(
  name: string,
  admin1?: string | null,
  country?: string | null
): string {
  const parts = [name];

  // Don't repeat the region if it's the same as the city name.
  if (
    admin1 &&
    admin1.trim().toLowerCase() !== name.trim().toLowerCase()
  ) {
    parts.push(admin1);
  }

  if (country) {
    parts.push(country);
  }

  return parts.join(", ");
}

/** Rounds a decimal temperature to a whole number for display, e.g. 34.0 -> "34°". */
export function formatTemp(value: number): string {
  return `${Math.round(value)}°`;
}