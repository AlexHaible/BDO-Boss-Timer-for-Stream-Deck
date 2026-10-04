import { BOSSES, type BossId } from "./bosses";

const SIZE = 144;
const FONT = "Arial, Helvetica, sans-serif";
const ALERT_COLOR = "#ff8c00";
const SPAWNED_COLOR = "#4caf50";

export type KeyView = {
  /** Every boss in the spawn slot; bosses not in `wanted` are drawn dimmed. */
  bosses: readonly BossId[];
  wanted: readonly BossId[];
  /** Big line at the bottom of the key, e.g. the countdown. */
  headline: string;
  /** Optional small line under the headline, e.g. the local spawn time. */
  subline?: string;
  /** Whether the spawn is inside the user's alert window. */
  alert: boolean;
  /** Toggles every tick while alerting, so the key flashes. */
  flash: boolean;
  /** Whether the boss has already spawned (shown for a short while after the spawn time). */
  spawned: boolean;
  /** Shown in the top-left corner when the user is paging through later spawns, e.g. `+2`. */
  badge?: string;
};

/** Returns an icon for the boss as a `data:` URL, or `undefined` when there is none. */
export type IconLoader = (boss: BossId) => string | undefined;

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function initials(name: string): string {
  const words = name.split(/\s+/);
  return (words.length > 1 ? words.map((w) => w[0]).join("") : name.slice(0, 2)).toUpperCase().slice(0, 3);
}

function bossIcon(boss: BossId, x: number, y: number, size: number, dim: boolean, icons: IconLoader): string {
  const opacity = dim ? ` opacity="0.35"` : "";
  const href = icons(boss);
  if (href !== undefined) {
    return `<image href="${href}" x="${x}" y="${y}" width="${size}" height="${size}"${opacity}/>`;
  }

  const r = size / 2 - 3;
  const cx = x + size / 2;
  const cy = y + size / 2;
  return (
    `<g${opacity}>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${BOSSES[boss].color}" stroke="#d9c38c" stroke-width="2"/>` +
    text(cx, cy + r * 0.25, Math.round(r * 0.75), "#fff", initials(BOSSES[boss].name)) +
    `</g>`
  );
}

function text(x: number, y: number, size: number, color: string, value: string, bold = true): string {
  const weight = bold ? ` font-weight="bold"` : "";
  return (
    `<text x="${x}" y="${y}" font-family="${FONT}"${weight} font-size="${size}" fill="${color}" text-anchor="middle">` +
    `${escapeXml(value)}</text>`
  );
}

/** Shrinks the font size so `value` roughly fits in `width` pixels. */
function fitFont(value: string, width: number, max: number): number {
  return Math.max(9, Math.min(max, Math.floor(width / (value.length * 0.58))));
}

/** Renders the key as an SVG `data:` URL that can be passed to `setImage`. */
export function renderKey(view: KeyView, icons: IconLoader): string {
  const parts: string[] = [`<rect width="${SIZE}" height="${SIZE}" fill="${view.alert ? "#2a1600" : "#0d0d0d"}"/>`];

  const count = Math.max(1, view.bosses.length);
  const slot = (SIZE - 8) / count;
  const iconSize = Math.min(count === 1 ? 72 : 62, slot - 4);
  view.bosses.forEach((boss, i) => {
    const centre = 4 + slot * i + slot / 2;
    const dim = !view.wanted.includes(boss);
    parts.push(bossIcon(boss, centre - iconSize / 2, 6, iconSize, dim, icons));

    const name = count === 1 ? BOSSES[boss].name : BOSSES[boss].short;
    parts.push(text(centre, 94, fitFont(name, slot - 2, count === 1 ? 18 : 15), dim ? "#777" : "#e8d9a8", name));
  });

  const headlineColor = view.spawned ? SPAWNED_COLOR : view.alert && view.flash ? ALERT_COLOR : "#ffffff";
  const headlineY = view.subline === undefined ? 130 : 122;
  parts.push(text(SIZE / 2, headlineY, fitFont(view.headline, SIZE - 8, 30), headlineColor, view.headline));
  if (view.subline !== undefined) {
    parts.push(text(SIZE / 2, 140, 14, "#aaaaaa", view.subline, false));
  }

  if (view.badge !== undefined) {
    parts.push(`<rect x="0" y="0" width="34" height="22" rx="4" fill="#d9c38c"/>`);
    parts.push(text(17, 16, 15, "#000", view.badge));
  }

  if (view.alert && view.flash) {
    const inner = SIZE - 6;
    parts.push(
      `<rect x="3" y="3" width="${inner}" height="${inner}" rx="8" fill="none" stroke="${ALERT_COLOR}" stroke-width="6"/>`,
    );
  }

  return svgDataUrl(parts.join(""));
}

/** Renders a key with a short message, e.g. when no boss is selected. */
export function renderMessage(lines: string[]): string {
  const startY = SIZE / 2 - ((lines.length - 1) * 20) / 2 + 6;
  const body = lines
    .map((line, i) => text(SIZE / 2, startY + i * 20, fitFont(line, SIZE - 12, 17), "#e8d9a8", line))
    .join("");
  return svgDataUrl(`<rect width="${SIZE}" height="${SIZE}" fill="#0d0d0d"/>${body}`);
}

function svgDataUrl(content: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `${content}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
