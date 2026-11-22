[![best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/shusay12/best-card-game-20261122-1826/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/shusay12/best-card-game-20261122-1826/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

# Ember Pact — a duel of ember-mages

An original browser card game for make.fun's **best-card-game-20261122-1826** bounty. Two ember-mages, 30 life each, four elemental suits — Flame ▲ strikes, Stone ■ shields, Tide ● mends, Gale ✦ draws and shatters shields. Mana grows every turn, every card is a decision, and Vex, the Ash Mage, reads your board and answers it.

## Play

Serve `game/` with any static server (`node serve.ts`, then open http://localhost:8080) and click **Begin the Duel**. Click a card to play it, **End Turn** (or Space) to pass, keys 1–7 play cards from your hand, M mutes. First mage to 0 life loses.

## Layout

- `game/` — the game as static files, no build step, no network request
  - `index.html` — table, title screen, win/loss screens
  - `styles.css` — felt table, cards, animations (all art is CSS)
  - `src/main.js` — duel engine: turns, input, keyboard, screenshot states
  - `src/cards.js` — the 15-card catalogue and 24-card decks
  - `src/rules.js` — damage through shield, card effects
  - `src/ai.js` — Vex's greedy, readable opponent logic
  - `src/render.js` — DOM rendering, floating damage numbers
  - `src/rng.js` — seeded shuffle for deterministic screenshots
  - `src/audio.js` — WebAudio chimes, synthesized live
- `screenshots/` — real renders of the game (table, title, win, loss)
- `main.ts` — the hand-in program (Node 22): copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
