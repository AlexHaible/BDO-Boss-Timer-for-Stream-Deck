/**
 * Every boss that can appear in a region schedule.
 *
 * `icon` is the file name (without extension) in `imgs/bosses/`. Bosses without an icon are drawn as a
 * coloured badge with their initials instead.
 */
export const BOSSES = {
  kzarka: { name: "Kzarka", short: "Kzarka", icon: "kzarka", color: "#8e2c2c" },
  nouver: { name: "Nouver", short: "Nouver", icon: "nouver", color: "#b5832a" },
  kutum: { name: "Kutum", short: "Kutum", icon: "kutum", color: "#5b3d8f" },
  karanda: { name: "Karanda", short: "Karanda", icon: "karanda", color: "#2f6f9f" },
  offin: { name: "Offin", short: "Offin", icon: "offin", color: "#2e7d4f" },
  garmoth: { name: "Garmoth", short: "Garmoth", icon: "garmoth", color: "#a3441f" },
  vell: { name: "Vell", short: "Vell", icon: "vell", color: "#1f6d7a" },
  quint: { name: "Quint", short: "Quint", icon: "quint", color: "#6b6b6b" },
  muraka: { name: "Muraka", short: "Muraka", icon: "muraka", color: "#7a5a3a" },
  uturi: { name: "Uturi", short: "Uturi", icon: undefined, color: "#4a7a2a" },
  bulgasal: { name: "Bulgasal", short: "Bulgasal", icon: undefined, color: "#9a2f6a" },
  sangoon: { name: "Sangoon", short: "Sangoon", icon: undefined, color: "#3a4f9a" },
  goldenPigKing: { name: "Golden Pig King", short: "Pig King", icon: undefined, color: "#c9a227" },
} as const satisfies Record<string, Boss>;

export type Boss = {
  /** Full display name. */
  name: string;
  /** Name short enough to fit on half of a Stream Deck key. */
  short: string;
  /** File name (without extension) of the icon in `imgs/bosses/`. */
  icon: string | undefined;
  /** Fallback badge colour when there is no icon. */
  color: string;
};

export type BossId = keyof typeof BOSSES;

export const BOSS_IDS = Object.keys(BOSSES) as BossId[];

export function isBossId(value: unknown): value is BossId {
  return typeof value === "string" && Object.hasOwn(BOSSES, value);
}
