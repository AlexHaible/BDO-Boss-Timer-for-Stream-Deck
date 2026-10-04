import { eu } from "./eu";
import { na } from "./na";
import type { RegionSchedule } from "./types";

/**
 * All regions the plugin has a schedule for. To add a region, create a table next to `eu.ts` / `na.ts`, register
 * it here, and add a matching `<option>` to the region dropdown in `ui/next-boss.html`.
 */
export const REGIONS = { eu, na } satisfies Record<string, RegionSchedule>;

export type RegionId = keyof typeof REGIONS;

export const DEFAULT_REGION: RegionId = "eu";

export function isRegionId(value: unknown): value is RegionId {
  return typeof value === "string" && Object.hasOwn(REGIONS, value);
}

export * from "./types";
