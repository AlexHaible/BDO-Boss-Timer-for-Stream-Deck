import type { RegionSchedule } from "./types";

/**
 * NA world boss schedule, written in US Pacific time (PST/PDT).
 *
 * Keep this in sync with https://garmoth.com/boss-timer (region: NA). Pearl Abyss changes the schedule from
 * time to time; when it does, only this table needs to be updated.
 */
export const na: RegionSchedule = {
  name: "NA",
  timeZone: "America/Los_Angeles",
  source: "garmoth.com/boss-timer (NA), October 2026",
  week: {
    monday: {
      "00:00": ["goldenPigKing", "kzarka"],
      "10:00": ["uturi", "nouver"],
      "12:00": ["garmoth"],
      "17:00": ["sangoon", "karanda"],
      "20:15": ["goldenPigKing", "kutum"],
      "21:15": ["garmoth"],
      "22:15": ["bulgasal", "offin"],
    },
    tuesday: {
      "00:00": ["sangoon", "nouver"],
      "10:00": ["goldenPigKing", "kutum"],
      "12:00": ["garmoth"],
      "17:00": ["bulgasal", "kzarka"],
      "20:15": ["sangoon", "nouver"],
      "21:15": ["garmoth"],
      "22:15": ["uturi", "karanda"],
    },
    wednesday: {
      "00:00": ["goldenPigKing", "kutum"],
      "10:00": ["bulgasal", "nouver"],
      "12:00": ["garmoth"],
      "17:00": ["vell"],
      "20:15": ["sangoon", "karanda"],
      "21:15": ["garmoth"],
      "22:15": ["uturi", "kzarka"],
    },
    thursday: {
      "00:00": ["bulgasal", "karanda"],
      "10:00": ["sangoon", "kzarka"],
      "12:00": ["garmoth"],
      "14:00": ["quint", "muraka"],
      "17:00": ["uturi", "offin"],
      "20:15": ["bulgasal", "kutum"],
      "21:15": ["garmoth"],
      "22:15": ["goldenPigKing", "nouver"],
    },
    friday: {
      "00:00": ["uturi", "kzarka"],
      "10:00": ["bulgasal", "karanda"],
      "12:00": ["garmoth"],
      "14:00": ["sangoon", "kutum"],
      "17:00": ["goldenPigKing", "nouver"],
      "20:15": ["uturi", "kzarka"],
      "21:15": ["garmoth"],
      "22:15": ["sangoon", "karanda"],
    },
    saturday: {
      "00:00": ["bulgasal", "nouver"],
      "10:00": ["uturi", "kzarka"],
      "12:00": ["garmoth"],
      "14:00": ["blackShadow"],
      "16:00": ["tributeWagon"],
      "17:00": ["quint", "muraka"],
      "22:15": ["goldenPigKing", "kutum"],
    },
    sunday: {
      "00:00": ["sangoon", "offin"],
      "10:00": ["goldenPigKing", "kutum"],
      "12:00": ["garmoth"],
      "14:00": ["vell"],
      "17:00": ["garmoth"],
      "20:15": ["uturi", "karanda"],
      "21:15": ["garmoth"],
      "22:15": ["bulgasal", "nouver"],
    },
  },
};
