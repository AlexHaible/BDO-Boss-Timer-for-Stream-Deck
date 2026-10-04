import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { BOSS_IDS } from "../src/bosses";
import { REGIONS } from "../src/schedules";

const html = readFileSync(new URL("../com.sauravisus.bdobosstracker.sdPlugin/ui/next-boss.html", import.meta.url), "utf8");

/** Option values inside the element that stores `setting`. */
function optionValues(setting: string): string[] {
  const element = html.match(new RegExp(`<sdpi-[\\w-]+[^>]*setting="${setting}"[^>]*>([\\s\\S]*?)</sdpi-`));
  return [...(element?.[1] ?? "").matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
}

describe("property inspector", () => {
  it("offers exactly the bosses the plugin knows", () => {
    expect(optionValues("bosses")).toEqual(BOSS_IDS);
  });

  it("offers exactly the regions the plugin has schedules for", () => {
    expect(optionValues("region")).toEqual(Object.keys(REGIONS));
  });
});
