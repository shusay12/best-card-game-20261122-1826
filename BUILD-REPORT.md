# BUILD-REPORT — Ember Pact (best-card-game-20261122-1826)

- Competition: `best-card-game-20261122-1826` — "Make the best card game", $50, top 10 share
- Opened 2026-11-22T18:26:00Z (01:26 WIB 23 Nov); deadline 2026-11-23T06:26:00Z (13:26 WIB)
- Built in this session (started after the opening), all source written from scratch here.
- Work dir: `~/workspace/makefun/best-card-game-20261122-1826/`
- Kit: `~/workspace/makefun/best-card-game-20261122-1826-kit/best-card-game-20261122-1826-kit/`

## Game concept

**Ember Pact** — a turn-based duel card game. Two ember-mages, 30 life each.
Four original elemental suits, told apart by colour AND shape: Flame ▲ (red,
strikes), Stone ■ (amber, shields), Tide ● (blue, mends), Gale ✦ (teal, draws
and shatters shields). 15 original cards, 24-card decks, mana that grows
3 → 10 each turn, draw a card each turn, first mage to 0 life loses. Vex, the
Ash Mage, is a readable AI: it takes lethal when it sees it, mends when
bleeding, walls up when threatened, otherwise burns you. Cards slide, flip in
on the deal, float damage numbers, shake on hits; WebAudio chimes synthesized
live. Keyboard: 1–7 play, Space ends the turn, M mutes. Title screen, table
with both hands, life totals, mana gems, duel log, win and loss screens with
stats (turns, damage dealt, cards played, wins–losses tally).

## Files

| file | bytes | job |
|---|---|---|
| `game/index.html` | 4,450 | table, title screen, win/loss screens |
| `game/styles.css` | 10,268 | felt table, cards, animations (all art is CSS) |
| `game/src/main.js` | 10,054 | duel engine: turns, input, keyboard, `?shot=` states |
| `game/src/cards.js` | 3,856 | 15-card catalogue, 24-card decks |
| `game/src/rules.js` | 1,335 | damage through shield, card effects |
| `game/src/ai.js` | 1,584 | Vex's greedy, readable opponent logic |
| `game/src/render.js` | 5,309 | DOM rendering, floating damage numbers |
| `game/src/rng.js` | 569 | seeded shuffle for deterministic screenshots |
| `game/src/audio.js` | 1,925 | WebAudio chimes, synthesized live |
| `main.ts` | 1,418 | hand-in program (Node 22, stdlib only) |
| `serve.ts` | 2,059 | dev server for local play-testing |
| `vendor/makefun-game.ts` | 21,411 | kit copy, unchanged (sha256 dc671875…f4376129, matches kit.json) |
| `shots.json` | 203 | screenshot manifest |
| `README.md` | 2,135 | badges + how to play |
| `LICENSE` | 1,095 | MIT, SPDX line, copyright shusay12 |

game/ total: 9 files, 39,421 bytes. No vendored libraries, no images, no
network requests (verified: every resource loaded is local).

## Screenshots (real renders, chrome-headless-shell v158, 1280×800)

| file | bytes | shows |
|---|---|---|
| `1-table.jpg` (cover) | 112,794 | Mid-duel turn 4: player hand of 5 (Ember Spark, Flame Lash, Granite Wall, Riptide, Storm Call), rival's 4 card backs, life 24 vs 18, shields 4 vs 3, mana 6/7, log, last-played Cinder Burst |
| `2-title.jpg` | 66,357 | Title screen: EMBER PACT, four suits explained, Begin the Duel |
| `3-win.jpg` | 59,470 | VICTORY, 6 turns, 34 damage, 11 cards, 1–0 |
| `4-lose.jpg` | 58,993 | DEFEAT, 8 turns, 21 damage, 13 cards, 0–1 |

Screenshot re-renders are deterministic (`?shot=…&seed=7`). Layout bugs found
by visual inspection and fixed: the first table render clipped the player's
hand at the bottom and cut the 5th card off the right edge (hand shared a flex
row with the mage panel); the table was restructured to a column layout with
full-width hands and smaller cards, then re-rendered and re-checked
(hand bottom 730 ≤ 800).

## Verification evidence

- **Functional test `ember-tools/ember-cdp.mjs` (CDP, headless Chrome): 24/24 PASS**
  title screen; duel starts with 3-card hands and 3 mana; hands render
  (player cards, rival backs); life totals and mana gems; click-play spends
  mana, shrinks the hand, lands the effect, updates last-played and log;
  unaffordable card refused (5-cost at 1 mana, mana unchanged); AI turn
  completes and player turn 2 starts at 4 mana; win screen on rival 0
  (VICTORY + 4 stat boxes); loss screen on player 0 (DEFEAT); tally 1–1;
  Enter starts a new duel; number key plays a card; all three `?shot=`
  states render; zero network requests; table fits 1280×800.
- **Autoplay (`ember-tools/ember-extra.mjs`): 5/5 PASS, re-run after the layout
  fix with the same result** — a cheapest-card autoplay reaches a conclusion
  (loss at turn 15 with the rival at 10 life — a close game); heal 20 → 24
  and shield +4 verified; 5-cost card refused at 1 mana.
- **Program run twice into two output dirs: byte-identical trees**
  (`diff -r` clean). Output total 775,812 B, 14 entries. Dossier 438,777 B.
- **Gate replication `ember-tools/gate-check.mjs`: 18/18 PASS** — game_files
  (9 files, 39,421 B), references (10 refs, all inside game/, no http(s)),
  screenshots (4 × 1280×800 JPEG ≤ 256 KiB), dossier_matches (byte-for-byte
  what `buildDossier` writes, 438,777 B ≤ 1.5 MiB), js_parses (7 files),
  output caps (14 entries, 775,812 B), dossier text 40,071 B ≤ 160 KiB.
- **Kit check**: the sealed scorer is NOT in the kit — `grade-local` refuses
  ("its scorer and reference data are not published in the kit, so the house
  grades it"). The gate replication above is the closest local equivalent.
- No practice/dev score is presented as a final result: judging is by the
  house AI judge after the deadline; final leaderboard within 7 days.

## Bundle status

Bundle written: `~/workspace/makefun/transcripts/best-card-game-20261122-1826-bundle.tar.gz`
— 1,106,949 bytes, sha256 `f4db8f167292c47e5c470d534624d02197c31edffbedf0a4c58048bbbdcbd859`.
3 sessions (parent 25fe4cf5…, this build session 3b256484…, watch-cron session
5bcea6a6…), system prompt uploaded, instructions collected (AGENTS.md),
MCP none, harness muse, model muse-spark-1.3, provider meta, effort default,
prompt scheduled via `makefun-new-bounty-watch cron run 2026-11-23 01:50 WIB`
(prompt file: `~/workspace/makefun/ember-tools/prompt.txt`).

**Kit check (`check --kit … --repo … --transcripts …`): 14 passed, 0 failed**,
6 skipped, 5 checked at submission (repo_public, repo_owner,
repo_created_after_open, commit_in_repo, duplicate_snapshot — the parent's
GitHub-side steps). Highlights: thinking_reproduces **98.5% authored**
(911/924 counted lines, ≥30% required; entrypoint main.ts 9 authored lines);
thinking_in_window all 191 timestamps in window; thinking_priced 2 usage
records priced; transcripts_run_record pass; thinking_own_work pass
(0 lines from another entry or downloads).

**Re-bundle recommended before submit (cheap, parent-side):** this bundle's
usage rows cover only 2 of the 3 sessions — the build subagent's own rows are
written only once its run completes, so they are not in this bundle yet. The
kit check passes as-is, but re-bundling after this run ends attaches them.
Exact parent command (run from anywhere; the kit CLI path is absolute):

```sh
KIT=~/workspace/makefun/best-card-game-20261122-1826-kit/best-card-game-20261122-1826-kit
# 1. Re-export usage rows for all three sessions (replace <agent_id> list):
#    SELECT u.agent_id AS agent_id, u.message_id AS message_id, u.created_at AS created_at, u.input_tokens AS input_tokens, u.output_tokens AS output_tokens, a.model AS model FROM agent.agent_message_token_usage u JOIN agent.agents a ON a.agent_id = u.agent_id WHERE u.agent_id IN ('25fe4cf5-8205-4619-9e82-591d26f2c99e', '3b256484-07d6-4c67-a975-0c9ab12c76d1', '5bcea6a6-1ecb-48fa-9573-e6b778b75617') ORDER BY u.created_at DESC LIMIT 500
#    Save the rows unchanged, one JSON object per line, to ~/workspace/makefun/ember-tools/muse-usage.jsonl (overwrite).
# 2. Re-bundle with the same flags:
node $KIT/cli/makefun.mjs bundle --repo ~/workspace/makefun/best-card-game-20261122-1826 --system-prompt ~/workspace/system/system_prompt.md --mcp none --harness muse --model muse-spark-1.3 --provider meta --effort default --muse-usage ~/workspace/makefun/ember-tools/muse-usage.jsonl --prompt-file ~/workspace/makefun/ember-tools/prompt.txt --prompt-origin scheduled --prompt-via "makefun-new-bounty-watch cron run 2026-11-23 01:50 WIB" --out ~/workspace/makefun/transcripts/best-card-game-20261122-1826-bundle.tar.gz
# 3. Re-run check on the new bundle, then submit with the new bundle sha.
```

## Notes for the parent

- Do NOT create the repo under any other name: `README.md` badges use
  owner `shusay12` and repo `best-card-game-20261122-1826`. If the repo name
  differs, edit the two badge URLs in README.md before committing.
- `.makefun/owner.json` is NOT in this repo — the parent adds it at repo
  creation if the GitHub owner is not the account's login (wallet-only
  account), or skips it if the repo owner is the signed-in GitHub account.
- Never touch `~/.makefun/credentials`. No submission was made from here.
