import streamDeck, {
  action,
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { BOSSES, type BossId } from "../bosses";
import { type IconLoader, type KeyView, renderKey, renderMessage } from "../render";
import { REGIONS } from "../schedules";
import { type NextBossSettings, type ResolvedSettings, resolveSettings, withDefaults } from "../settings";
import { formatCountdown, upcomingSpawns } from "../timer";

/** How long a boss is shown as "SPAWNED" before the key moves on to the next spawn. */
const SPAWNED_GRACE_MS = 2 * 60 * 1000;

/** How many spawns the user can page through by pressing the key. */
const PAGES = 5;

/** How long the key keeps showing a later spawn after the user paged to it. */
const PAGE_TIMEOUT_MS = 10 * 1000;

type KeyState = {
  action: KeyAction<NextBossSettings>;
  settings: ResolvedSettings;
  page: number;
  pageResetAt: number;
  lastImage?: string;
};

const iconCache = new Map<BossId, string | undefined>();

/** Loads boss icons from `imgs/bosses/` (relative to `bin/plugin.js`) as data URLs. */
const loadIcon: IconLoader = (boss) => {
  if (!iconCache.has(boss)) {
    const file = BOSSES[boss].icon;
    let data: string | undefined;
    if (file !== undefined) {
      try {
        const path = fileURLToPath(new URL(`../imgs/bosses/${file}.png`, import.meta.url));
        data = `data:image/png;base64,${readFileSync(path).toString("base64")}`;
      } catch (e) {
        streamDeck.logger.warn(`Could not load icon for ${boss}`, e);
      }
    }
    iconCache.set(boss, data);
  }
  return iconCache.get(boss);
};

const weekdayTime = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
const timeOnly = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/** Spawn time in the user's own time zone; includes the weekday when it's more than a day away. */
function localTime(time: number, now: number): string {
  return (time - now < 24 * 60 * 60 * 1000 ? timeOnly : weekdayTime).format(time);
}

/**
 * Shows the next world boss spawn (for the bosses the user selected) with a live countdown. The key flashes when
 * the spawn is within the configured alert window. Pressing the key pages through the following spawns.
 */
@action({ UUID: "com.sauravisus.bdobosstracker.bosstimer" })
export class NextBoss extends SingletonAction<NextBossSettings> {
  readonly #keys = new Map<string, KeyState>();
  #timer: NodeJS.Timeout | undefined;

  override async onWillAppear(ev: WillAppearEvent<NextBossSettings>): Promise<void> {
    if (!ev.action.isKey()) {
      return;
    }

    // Persist defaults so the property inspector shows the same values the key is using.
    const defaults = withDefaults(ev.payload.settings);
    if (defaults !== undefined) {
      await ev.action.setSettings(defaults);
    }

    this.#keys.set(ev.action.id, {
      action: ev.action,
      settings: resolveSettings(defaults ?? ev.payload.settings),
      page: 0,
      pageResetAt: 0,
    });
    this.#startTimer();
    await this.#render(ev.action.id, Date.now());
  }

  override onWillDisappear(ev: WillDisappearEvent<NextBossSettings>): void {
    this.#keys.delete(ev.action.id);
    if (this.#keys.size === 0) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<NextBossSettings>): Promise<void> {
    const state = this.#keys.get(ev.action.id);
    if (state === undefined) {
      return;
    }
    state.settings = resolveSettings(ev.payload.settings);
    state.page = 0;
    await this.#render(ev.action.id, Date.now());
  }

  override async onKeyDown(ev: KeyDownEvent<NextBossSettings>): Promise<void> {
    const state = this.#keys.get(ev.action.id);
    if (state === undefined) {
      return;
    }
    const now = Date.now();
    state.page = (state.page + 1) % PAGES;
    state.pageResetAt = now + PAGE_TIMEOUT_MS;
    await this.#render(ev.action.id, now);
  }

  /** Ticks on every whole second so countdowns change in step with the clock. */
  #startTimer(): void {
    if (this.#timer !== undefined) {
      return;
    }
    const tick = () => {
      const now = Date.now();
      for (const id of this.#keys.keys()) {
        this.#render(id, now).catch((e) => streamDeck.logger.error("Failed to update key", e));
      }
      this.#timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    this.#timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  }

  async #render(id: string, now: number): Promise<void> {
    const state = this.#keys.get(id);
    if (state === undefined) {
      return;
    }
    if (state.page !== 0 && now >= state.pageResetAt) {
      state.page = 0;
    }

    const image = this.#image(state, now);
    if (image !== state.lastImage) {
      state.lastImage = image;
      await state.action.setImage(image);
    }
  }

  #image(state: KeyState, now: number): string {
    const { settings } = state;
    if (settings.bosses.size === 0) {
      return renderMessage(["Select", "bosses in", "settings"]);
    }

    const spawns = upcomingSpawns(REGIONS[settings.region], settings.bosses, now, PAGES, SPAWNED_GRACE_MS);
    if (spawns.length === 0) {
      return renderMessage(["No spawns", "scheduled"]);
    }

    const page = Math.min(state.page, spawns.length - 1);
    const spawn = spawns[page];
    const remaining = spawn.time - now;
    const spawned = remaining <= 0;
    const alert = !spawned && settings.alertMinutes > 0 && remaining <= settings.alertMinutes * 60 * 1000;
    const clock = localTime(spawn.time, now);

    const view: KeyView = {
      bosses: spawn.bosses,
      wanted: spawn.wanted,
      headline: spawned ? "SPAWNED" : settings.display === "time" ? clock : formatCountdown(remaining),
      subline: settings.display === "both" && !spawned ? clock : undefined,
      alert,
      flash: Math.floor(now / 1000) % 2 === 0,
      spawned,
      badge: page > 0 ? `+${page}` : undefined,
    };
    return renderKey(view, loadIcon);
  }
}
