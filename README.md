# BDO Boss Timer for Stream Deck

A Stream Deck plugin that shows the next Black Desert Online world boss on a key, with a live countdown and an alert
before it spawns. Pick the bosses you care about, and the key skips every spawn that doesn't include one of them.

Built with the official [Stream Deck SDK](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/)
(`@elgato/streamdeck`, Node.js). Boss schedules follow [Garmoth's boss timer](https://garmoth.com/boss-timer).

## Features

- **Next spawn on the key**: boss icon(s), name(s) and a countdown (`3h 05m`, then `14:09` in the last hour).
- **Region**: EU or NA. Times are converted to your computer's time zone, and daylight saving time is handled.
- **Boss filter**: tick the bosses you want. Many slots spawn two bosses at once. If you only want one of them, the
  key still shows both, with the one you didn't pick dimmed.
- **Alert**: the key flashes orange from 1–60 minutes before the spawn (configurable, or off).
- **Display**: countdown, spawn time, or both.
- **Look ahead**: press the key to page through the next 5 spawns. It goes back to the next spawn after 10 seconds.

## Installing

Download `com.sauravisus.bdobosstracker.streamDeckPlugin` from the latest
[Build/Test workflow run](https://github.com/AlexHaible/BDO-Boss-Timer-for-Stream-Deck/actions/workflows/build-test-versions.yml)
(or build it yourself, see below) and double-click it. Then drag **BDO Boss Timer → Next World Boss** onto a key and
pick your region and bosses in the settings panel.

Requires Stream Deck 7.1 or later on Windows 10+ or macOS 12+.

## Development

Requirements: Node.js 20+ and the Stream Deck app. Run `npm install` once.

| Command              | What it does                                                                      |
|----------------------|-----------------------------------------------------------------------------------|
| `npm run build`      | Bundles `src/` into `com.sauravisus.bdobosstracker.sdPlugin/bin/plugin.js`.         |
| `npm run watch`      | Rebuilds on change and restarts the plugin in Stream Deck.                        |
| `npm test`           | Runs the unit tests (schedule maths, DST, settings).                              |
| `npm run type-check` | Type-checks the sources and tests.                                                |
| `npm run validate`   | Validates the plugin folder with the Stream Deck CLI.                             |
| `npm run pack`       | Builds and packages `dist/com.sauravisus.bdobosstracker.streamDeckPlugin`.        |

To load the development build into Stream Deck, link the plugin folder once:

```shell
npx streamdeck link com.sauravisus.bdobosstracker.sdPlugin
npm run watch
```

### Layout

```
com.sauravisus.bdobosstracker.sdPlugin/   The plugin as Stream Deck loads it
  manifest.json                            Plugin and action metadata
  ui/next-boss.html                        Settings panel (property inspector, sdpi-components)
  imgs/                                    Plugin, action and boss images
src/
  index.ts                                 Entry point: registers the action and connects
  actions/next-boss.ts                     The "Next World Boss" key
  schedules/eu.ts, na.ts                   Weekly boss tables per region
  bosses.ts                                Boss names and icons
  timer.ts                                 Finds upcoming spawns (time-zone aware)
  render.ts                                Draws the key image (SVG)
  settings.ts                              Settings defaults and parsing
test/                                      Vitest unit tests
```

### Updating the boss schedule

Pearl Abyss changes the schedule now and then. Each region's table is in `src/schedules/<region>.ts`. Times are written
exactly as Garmoth shows them for that server's own time zone (CET/CEST for EU, PST/PDT for NA), with day →
`"HH:mm"` → bosses:

```ts
monday: {
  "00:15": ["uturi", "kutum"],
  "14:00": ["garmoth"],
},
```

Boss ids are listed in `src/bosses.ts`. `npm test` checks every table for bad times or unknown bosses.

To add a region, add a table next to the existing ones, register it in `src/schedules/index.ts`, and add an
`<option>` to the region dropdown in `ui/next-boss.html`. To add a boss, add it to `src/bosses.ts` and to the boss
list in `ui/next-boss.html`. You can also drop a 90×90 transparent PNG in `imgs/bosses/`. Bosses without an icon get
a coloured badge with their initials.

## License

MIT, see [LICENSE](LICENSE).
