import { describe, expect, it } from "vitest";

import { BOSS_IDS, type BossId, isBossId } from "../src/bosses";
import { REGIONS, type RegionSchedule } from "../src/schedules";
import { formatCountdown, upcomingSpawns, wallClock, zonedTimeToUtc } from "../src/timer";

const all = new Set(BOSS_IDS);

describe("zonedTimeToUtc", () => {
  it("converts summer and winter wall-clock times", () => {
    expect(new Date(zonedTimeToUtc(2026, 7, 1, 14, 0, "Europe/Berlin")).toISOString()).toBe("2026-07-01T12:00:00.000Z");
    expect(new Date(zonedTimeToUtc(2026, 1, 1, 14, 0, "Europe/Berlin")).toISOString()).toBe("2026-01-01T13:00:00.000Z");
    expect(new Date(zonedTimeToUtc(2026, 7, 1, 21, 15, "America/Los_Angeles")).toISOString()).toBe(
      "2026-07-02T04:15:00.000Z",
    );
  });

  it("handles the days DST changes on", () => {
    // Europe leaves summer time on 2026-10-25 at 03:00 CEST.
    expect(new Date(zonedTimeToUtc(2026, 10, 25, 0, 15, "Europe/Berlin")).toISOString()).toBe("2026-10-24T22:15:00.000Z");
    expect(new Date(zonedTimeToUtc(2026, 10, 25, 14, 0, "Europe/Berlin")).toISOString()).toBe("2026-10-25T13:00:00.000Z");
    // The US starts summer time on 2026-03-08 at 02:00 PST.
    expect(new Date(zonedTimeToUtc(2026, 3, 8, 0, 0, "America/Los_Angeles")).toISOString()).toBe("2026-03-08T08:00:00.000Z");
    expect(new Date(zonedTimeToUtc(2026, 3, 8, 12, 0, "America/Los_Angeles")).toISOString()).toBe("2026-03-08T19:00:00.000Z");
  });

  it("round-trips through wallClock", () => {
    const at = zonedTimeToUtc(2026, 12, 31, 23, 15, "Europe/Berlin");
    expect(wallClock(at, "Europe/Berlin")).toMatchObject({ year: 2026, month: 12, day: 31, hour: 23, minute: 15 });
  });
});

describe("upcomingSpawns", () => {
  const region: RegionSchedule = {
    name: "Test",
    timeZone: "Europe/Berlin",
    source: "test",
    week: {
      // 2026-10-05 is a Monday.
      monday: { "12:00": ["kzarka", "nouver"], "23:15": ["garmoth"] },
      tuesday: { "00:15": ["kutum", "karanda"] },
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
      sunday: { "14:00": ["vell"] },
    },
  };
  const monday1100 = Date.parse("2026-10-05T09:00:00Z"); // 11:00 CEST

  it("returns the next spawns in order", () => {
    const spawns = upcomingSpawns(region, all, monday1100, 3);
    expect(spawns.map((s) => new Date(s.time).toISOString())).toEqual([
      "2026-10-05T10:00:00.000Z",
      "2026-10-05T21:15:00.000Z",
      "2026-10-05T22:15:00.000Z",
    ]);
    expect(spawns[0].bosses).toEqual(["kzarka", "nouver"]);
  });

  it("only returns slots with a wanted boss, and reports which bosses are wanted", () => {
    const spawns = upcomingSpawns(region, new Set<BossId>(["nouver", "vell"]), monday1100, 5);
    expect(spawns).toHaveLength(3); // Monday 12:00, Sunday 14:00, next Monday 12:00
    expect(spawns[0].wanted).toEqual(["nouver"]);
    expect(spawns[0].bosses).toEqual(["kzarka", "nouver"]);
    expect(new Date(spawns[1].time).toISOString()).toBe("2026-10-11T12:00:00.000Z");
  });

  it("finds a weekly boss up to a week ahead", () => {
    const sunday1401 = Date.parse("2026-10-11T12:01:00Z");
    const [next] = upcomingSpawns(region, new Set<BossId>(["vell"]), sunday1401, 1);
    expect(new Date(next.time).toISOString()).toBe("2026-10-18T12:00:00.000Z");
  });

  it("keeps a spawn inside the grace window, including across midnight", () => {
    const justAfterMidnightSpawn = Date.parse("2026-10-05T22:16:00Z"); // Tuesday 00:16 CEST
    const [withGrace] = upcomingSpawns(region, all, justAfterMidnightSpawn, 1, 2 * 60 * 1000);
    expect(new Date(withGrace.time).toISOString()).toBe("2026-10-05T22:15:00.000Z");

    const [withoutGrace] = upcomingSpawns(region, all, justAfterMidnightSpawn, 1);
    expect(new Date(withoutGrace.time).toISOString()).toBe("2026-10-11T12:00:00.000Z");
  });

  it("returns nothing when no boss is wanted", () => {
    expect(upcomingSpawns(region, new Set(), monday1100, 5)).toEqual([]);
  });
});

describe("formatCountdown", () => {
  it.each([
    [0, "NOW"],
    [999, "00:01"],
    [59_000, "00:59"],
    [14 * 60_000 + 9_000, "14:09"],
    [60 * 60_000, "1h 00m"],
    [3 * 3_600_000 + 5 * 60_000, "3h 05m"],
    [2 * 86_400_000 + 4 * 3_600_000, "2d 4h"],
  ])("%i ms -> %s", (ms, expected) => {
    expect(formatCountdown(ms)).toBe(expected);
  });
});

describe("region schedules", () => {
  for (const [id, region] of Object.entries(REGIONS)) {
    it(`${id} is well-formed`, () => {
      expect(() => new Intl.DateTimeFormat("en", { timeZone: region.timeZone })).not.toThrow();
      for (const [day, slots] of Object.entries(region.week)) {
        for (const [time, bosses] of Object.entries(slots)) {
          expect(time, `${id} ${day}`).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
          expect(bosses?.length, `${id} ${day} ${time}`).toBeGreaterThan(0);
          for (const boss of bosses ?? []) {
            expect(isBossId(boss), `${id} ${day} ${time}: ${boss}`).toBe(true);
          }
        }
      }
    });
  }
});
