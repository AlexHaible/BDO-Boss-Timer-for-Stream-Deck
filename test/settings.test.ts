import { describe, expect, it } from "vitest";

import { BOSS_IDS } from "../src/bosses";
import { DEFAULT_SETTINGS, resolveSettings, withDefaults } from "../src/settings";

describe("resolveSettings", () => {
  it("uses defaults for empty settings", () => {
    const resolved = resolveSettings({});
    expect(resolved.region).toBe("eu");
    expect([...resolved.bosses]).toEqual(BOSS_IDS);
    expect(resolved.alertMinutes).toBe(15);
    expect(resolved.display).toBe("countdown");
  });

  it("parses values from the property inspector and drops unknown ones", () => {
    const resolved = resolveSettings({ region: "na", bosses: ["kzarka", "nope"], alertMinutes: "5", display: "both" });
    expect(resolved.region).toBe("na");
    expect([...resolved.bosses]).toEqual(["kzarka"]);
    expect(resolved.alertMinutes).toBe(5);
    expect(resolved.display).toBe("both");
  });

  it("treats an explicitly empty boss list as no bosses, and invalid values as defaults/off", () => {
    const resolved = resolveSettings({ region: "xx", bosses: [], alertMinutes: "abc", display: "?" });
    expect(resolved.region).toBe("eu");
    expect(resolved.bosses.size).toBe(0);
    expect(resolved.alertMinutes).toBe(0);
    expect(resolved.display).toBe("countdown");
  });
});

describe("withDefaults", () => {
  it("fills in missing settings without overwriting existing ones", () => {
    expect(withDefaults({ region: "na" })).toEqual({ ...DEFAULT_SETTINGS, region: "na" });
  });

  it("returns undefined when nothing is missing", () => {
    expect(withDefaults({ ...DEFAULT_SETTINGS })).toBeUndefined();
  });
});
