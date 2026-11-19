# Neon Palm — GTA VI Trophy Guide & Tracker

![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/mohamad824/gta6-trophy-guide-01-v1/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/mohamad824/gta6-trophy-guide-01-v1/reward.svg)

Competition: [Build the best GTA 6 trophy guide — $250, 50 paid places](https://make.fun/bounty/gta6-trophy-guide-01)

An unofficial fan guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5. No Rockstar logo, artwork, box art or game screenshots anywhere — every visual is made for this guide.

## What it does

- **Tracker** — all 55 trophies with official names, descriptions and grades, a checklist saved in the browser, counted filter chips (Story, Missable, Collectibles, Activities, Side, Crime, Money, Watch, Unconfirmed, Disagree), grade filter, search, and an "unearned only" switch.
- **Cited guides** — every guide step ends with an inline source citation `[n]`; 133/133 steps cited, 55/55 guides cite a source. The audit strip above the cover is computed from the data, not typed in.
- **The disputed trophy first** — the cover opens on *Positive Mental Attitude* (meditation), the one possibly missable trophy, with a "Sources disagree — both versions shown" box (15 vs 18 meditations; whether the Chapter 1 balcony counts), a 6/18 counter, and the safe play: do it in Chapter 1 and keep a manual Chapter 1 save.
- **Roadmap to platinum** — 7 stages from Chapter 1 to 100% + platinum, with earned counts and time estimates, a "Next up" planner, and the agreed 100% thresholds. Platinum: ~200 h (PowerPyx) / 300+ h (Push Square), difficulty 4/10, 1 playthrough, 0 online, no mission replay.
- **Missables & Watch** — "possibly missable" shown as disputed (1 vs 2), watch items with their chapter windows and safe plays, cleared items, and a full trophy × source matrix.
- **Sources** — 12 numbered sources, all read 20 Nov 2026, each with read depth and a "cited by x/55" count, plus a green/amber trust system per trophy (46 green · 9 amber).
- **Spoilers & save** — a spoiler setting that hides unearned story trophies ("Hidden trophy — hidden until earned", grade and stage still visible) with a per-trophy Reveal, and JSON export / import with a confirmation toast.
- **Honest unknowns** — five trophies (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) are labelled "trigger not known / unconfirmed" with no invented method. The 500-action figure for Actions Speak Louder is labelled single-source, and the 45/45/10 checklist weights are labelled single-source (GTABase only).

## Run it

Open `app/index.html` in a browser (or serve `app/` over HTTP). Everything is offline: no network calls, system fonts only, no build step.

## Build

`node main.ts` copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` there.
