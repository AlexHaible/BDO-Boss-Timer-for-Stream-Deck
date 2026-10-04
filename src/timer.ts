import type { BossId } from "./bosses";
import { type RegionSchedule, WEEKDAYS } from "./schedules";

export type Spawn = {
  /** Spawn time as a Unix timestamp in milliseconds. */
  time: number;
  /** Every boss spawning in this slot. */
  bosses: BossId[];
  /** The bosses in this slot the user wants to be notified about. */
  wanted: BossId[];
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Wall-clock date and time of `instant` in `timeZone`. */
export function wallClock(instant: number, timeZone: string) {
  const parts: Record<string, number> = {};
  for (const { type, value } of formatterFor(timeZone).formatToParts(instant)) {
    if (type !== "literal") {
      parts[type] = Number(value);
    }
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Offset of `timeZone` from UTC at `instant`, in milliseconds (e.g. +2h for CEST). */
function offsetAt(instant: number, timeZone: string): number {
  const c = wallClock(instant, timeZone);
  const wallAsUtc = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
  return wallAsUtc - Math.floor(instant / 1000) * 1000;
}

/** Converts a wall-clock time in `timeZone` to a Unix timestamp. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  // The offset depends on the instant we're solving for; two passes settle it, including around DST changes.
  const first = wallAsUtc - offsetAt(wallAsUtc, timeZone);
  return wallAsUtc - offsetAt(first, timeZone);
}

/**
 * Lists upcoming spawns of `region`, starting with spawns that happened less than `graceMs` ago, filtered to slots
 * that contain at least one boss in `wanted`.
 */
export function upcomingSpawns(
  region: RegionSchedule,
  wanted: ReadonlySet<BossId>,
  now: number,
  count: number,
  graceMs = 0,
): Spawn[] {
  const today = wallClock(now, region.timeZone);
  const spawns: Spawn[] = [];

  // Start a day early so spawns inside the grace window around midnight are found, and look 8 days ahead so a
  // boss that spawns once a week is always found.
  for (let offset = -1; offset <= 8; offset++) {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    const day = region.week[WEEKDAYS[date.getUTCDay()]];

    for (const [time, bosses] of Object.entries(day)) {
      if (bosses === undefined) {
        continue;
      }
      const matches = bosses.filter((boss) => wanted.has(boss));
      if (matches.length === 0) {
        continue;
      }

      const [hour, minute] = time.split(":").map(Number);
      const at = zonedTimeToUtc(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        hour,
        minute,
        region.timeZone,
      );
      if (at > now - graceMs) {
        spawns.push({ time: at, bosses, wanted: matches });
      }
    }
  }

  return spawns.sort((a, b) => a.time - b.time).slice(0, count);
}

/** Formats the time until a spawn: `2d 4h`, `3h 05m`, `14:09` (mm:ss), or `NOW` once it has spawned. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) {
    return "NOW";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
