import { BOSS_IDS, type BossId, isBossId } from "./bosses";
import { DEFAULT_REGION, isRegionId, type RegionId } from "./schedules";

export type DisplayMode = "countdown" | "time" | "both";

/** Settings as stored by Stream Deck. Values come from the property inspector, so they are loosely typed. */
export type NextBossSettings = {
  region?: string;
  bosses?: string[];
  /** Minutes before a spawn to start flashing the key; `0` disables the alert. Stored as a string by sdpi-select. */
  alertMinutes?: string | number;
  display?: string;
};

/** {@link NextBossSettings} with defaults applied and values validated. */
export type ResolvedSettings = {
  region: RegionId;
  bosses: Set<BossId>;
  alertMinutes: number;
  display: DisplayMode;
};

export const DEFAULT_ALERT_MINUTES = 15;

/** Settings written for a freshly added key, so the property inspector shows the same values the key uses. */
export const DEFAULT_SETTINGS = {
  region: DEFAULT_REGION,
  bosses: [...BOSS_IDS],
  alertMinutes: String(DEFAULT_ALERT_MINUTES),
  display: "countdown",
} satisfies NextBossSettings;

export function resolveSettings(settings: NextBossSettings): ResolvedSettings {
  const alertMinutes = Number(settings.alertMinutes ?? DEFAULT_ALERT_MINUTES);
  const display = settings.display;
  return {
    region: isRegionId(settings.region) ? settings.region : DEFAULT_REGION,
    bosses: new Set(Array.isArray(settings.bosses) ? settings.bosses.filter(isBossId) : BOSS_IDS),
    alertMinutes: Number.isFinite(alertMinutes) && alertMinutes > 0 ? alertMinutes : 0,
    display: display === "time" || display === "both" ? display : "countdown",
  };
}

/** Fills in missing settings with defaults; returns `undefined` when nothing was missing. */
export function withDefaults(settings: NextBossSettings): NextBossSettings | undefined {
  const missing = (Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[]).filter(
    (key) => settings[key] === undefined,
  );
  if (missing.length === 0) {
    return undefined;
  }
  return { ...DEFAULT_SETTINGS, ...settings };
}
