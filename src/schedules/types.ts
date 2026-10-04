import type { BossId } from "../bosses";

export const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Day of the week; the index in {@link WEEKDAYS} matches `Date.prototype.getUTCDay()`. */
export type Weekday = (typeof WEEKDAYS)[number];

/** Spawn times (`"HH:mm"`, 24h, in the region's time zone) mapped to the bosses that spawn at that time. */
export type DaySchedule = Partial<Record<string, BossId[]>>;

export type RegionSchedule = {
  /** Display name of the region. */
  name: string;
  /**
   * IANA time zone the schedule times are written in. Using the server's own zone (instead of UTC) means the
   * schedule follows daylight saving time the same way the game does.
   */
  timeZone: string;
  /** Where the table was taken from, and when; for whoever updates it next. */
  source: string;
  week: Record<Weekday, DaySchedule>;
};
