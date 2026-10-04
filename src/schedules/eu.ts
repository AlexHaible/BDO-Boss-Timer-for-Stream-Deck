import type { RegionSchedule } from "./types";

/**
 * EU world boss schedule, written in Central European time (CET/CEST).
 *
 * Keep this in sync with https://garmoth.com/boss-timer (region: EU). Pearl Abyss changes the schedule from
 * time to time; when it does, only this table needs to be updated.
 */
export const eu: RegionSchedule = {
  name: "EU",
  timeZone: "Europe/Berlin",
  source: "garmoth.com/boss-timer (EU), checked against the site on 2026-10-04",
  week: {
    monday: {
      "00:15": ["uturi", "kutum"],
      "02:00": ["sangoon", "karanda"],
      "12:00": ["sangoon", "nouver"],
      "14:00": ["garmoth"],
      "16:00": ["uturi", "kutum"],
      "19:00": ["goldenPigKing", "nouver"],
      "22:15": ["bulgasal", "kzarka"],
      "23:15": ["garmoth"],
    },
    tuesday: {
      "00:15": ["sangoon", "karanda"],
      "12:00": ["bulgasal", "kutum"],
      "14:00": ["garmoth"],
      "16:00": ["goldenPigKing", "nouver"],
      "19:00": ["uturi", "kzarka"],
      "22:15": ["quint", "muraka"],
      "23:15": ["garmoth"],
    },
    wednesday: {
      "00:15": ["goldenPigKing", "kzarka"],
      "12:00": ["sangoon", "karanda"],
      "14:00": ["garmoth"],
      "16:00": ["bulgasal", "offin"],
      "19:00": ["vell"],
      "22:15": ["uturi", "nouver"],
      "23:15": ["garmoth"],
    },
    thursday: {
      "00:15": ["uturi", "nouver"],
      "02:00": ["goldenPigKing", "kzarka"],
      "14:00": ["garmoth"],
      "16:00": ["sangoon", "karanda"],
      "19:00": ["bulgasal", "kutum"],
      "22:15": ["quint", "muraka"],
      "23:15": ["garmoth"],
    },
    friday: {
      "00:15": ["goldenPigKing", "karanda"],
      "02:00": ["bulgasal", "nouver"],
      "12:00": ["uturi", "kutum"],
      "14:00": ["garmoth"],
      "16:00": ["bulgasal", "kzarka"],
      "19:00": ["sangoon", "offin"],
      "22:15": ["goldenPigKing", "kutum"],
      "23:15": ["garmoth"],
    },
    saturday: {
      "00:15": ["bulgasal", "kzarka"],
      "02:00": ["uturi", "offin"],
      "12:00": ["goldenPigKing", "nouver"],
      "14:00": ["garmoth"],
      "19:00": ["sangoon", "karanda"],
    },
    sunday: {
      "00:15": ["bulgasal", "nouver"],
      "02:00": ["goldenPigKing", "kutum"],
      "12:00": ["uturi", "kzarka"],
      "14:00": ["garmoth"],
      "16:00": ["vell"],
      "19:15": ["garmoth"],
      "22:15": ["sangoon", "karanda"],
      "23:15": ["garmoth"],
    },
  },
};
