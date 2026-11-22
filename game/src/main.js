// Ember Pact — duel engine: state, turns, player input, the rival's turn,
// win/loss, keyboard, and the deterministic ?shot= states for screenshots.
import { buildDeck, CARD_DEFS, describeCard } from './cards.js';
import { applyCardEffect, isDead } from './rules.js';
import { planTurn } from './ai.js';
import { makeRng, shuffle } from './rng.js';
import { sfx, toggleMute, isMuted } from './audio.js';
import * as render from './render.js';

const $ = (id) => document.getElementById(id);
const MAX_LIFE = 30;
const HAND_LIMIT = 7;

const state = {
  screen: 'title', // title | table | win | lose
  duel: 1,
  turn: 1,
  phase: 'player', // player | ai | over
  player: null,
  rival: null,
  log: [],
  stats: { wins: 0, losses: 0, damageDealt: 0, cardsPlayed: 0 },
  lastPlayed: null,
};

function newMage() {
  return { life: MAX_LIFE, maxLife: MAX_LIFE, shield: 0, mana: 3, maxMana: 3, hand: [], deck: [], discard: [] };
}

function log(text, cls = '') {
  state.log.push({ text, cls });
  if (state.log.length > 30) state.log.shift();
}

function drawCards(mage, n) {
  for (let i = 0; i < n; i++) {
    if (mage.deck.length === 0) {
      if (mage.discard.length === 0) return;
      mage.deck = shuffle(mage.discard, Math.random);
      mage.discard = [];
    }
    mage.hand.push(mage.deck.pop());
    if (mage.hand.length > HAND_LIMIT) mage.discard.push(mage.hand.shift());
  }
}

function startDuel(seed) {
  const rng = seed === undefined ? Math.random : makeRng(seed);
  state.player = newMage();
  state.rival = newMage();
  state.player.deck = shuffle(buildDeck(), rng);
  state.rival.deck = shuffle(buildDeck(), rng);
  state.turn = 1;
  state.phase = 'player';
  state.log = [];
  state.lastPlayed = null;
  drawCards(state.player, 3);
  drawCards(state.rival, 3);
  state.player.mana = state.player.maxMana = 3;
  state.rival.mana = state.rival.maxMana = 3;
  state.screen = 'table';
  $('title-screen').hidden = true;
  $('end-screen').hidden = true;
  log('The pact is struck. Your turn — play a card.', 'log-good');
  sfx.deal();
  renderAll();
}

function renderAll() {
  render.renderAll(state, {
    onPlayCard: (card, node) => playCard(card, node),
    onHoverCard: (card) => render.renderDetail(card),
  });
  render.renderLastPlay(state.lastPlayed);
}

function describeEvents(who, card, events) {
  const bits = events.map((ev) => {
    if (ev.kind === 'damage') return `deals ${ev.amount} damage${ev.absorbed ? ` (${ev.absorbed} blocked)` : ''}`;
    if (ev.kind === 'shield') return `gains ${ev.amount} shield`;
    if (ev.kind === 'heal') return `restores ${ev.amount} life`;
    if (ev.kind === 'shatter') return `shatters ${ev.amount} shield`;
    return '';
  }).filter(Boolean).join(', ');
  return `${who} plays ${card.name} — ${bits}.`;
}

function showEvents(side, foe, events) {
  for (const ev of events) {
    if (ev.kind === 'damage') {
      render.floatNumber(foe === state.player ? 'player-portrait' : 'rival-portrait', `-${ev.toLife}`, 'dmg');
      render.shakeElement(foe === state.player ? 'player-portrait' : 'rival-portrait');
      sfx.hit();
    }
    if (ev.kind === 'heal') {
      render.floatNumber(side === state.player ? 'player-portrait' : 'rival-portrait', `+${ev.amount}`, 'heal');
      sfx.heal();
    }
    if (ev.kind === 'shield') {
      render.floatNumber(side === state.player ? 'player-portrait' : 'rival-portrait', `+${ev.amount} ■`, 'shield');
      sfx.shield();
    }
    if (ev.kind === 'shatter') sfx.hit();
  }
}

function playCard(card, node) {
  if (state.phase !== 'player' || state.screen !== 'table') return false;
  if (!state.player.hand.includes(card)) return false;
  if (card.cost > state.player.mana) {
    sfx.denied();
    log(`Not enough mana for ${card.name} (${card.cost} needed).`);
    renderAll();
    return false;
  }
  if (node) node.classList.add('playing');
  state.player.mana -= card.cost;
  state.player.hand.splice(state.player.hand.indexOf(card), 1);
  state.player.discard.push(card);
  state.stats.cardsPlayed++;
  const events = applyCardEffect(state.player, state.rival, card);
  state.stats.damageDealt += events.filter((e) => e.kind === 'damage').reduce((s, e) => s + e.toLife, 0);
  state.lastPlayed = card;
  log(describeEvents('You', card, events), 'log-you');
  sfx.play();
  setTimeout(() => showEvents(state.player, state.rival, events), 120);
  if (isDead(state.rival)) { setTimeout(() => endDuel(true), 450); renderAll(); return true; }
  setTimeout(renderAll, 480);
  renderAll();
  return true;
}

function endTurn() {
  if (state.phase !== 'player' || state.screen !== 'table') return false;
  state.phase = 'ai';
  log('You end your turn. Vex stirs…', 'log-you');
  renderAll();
  setTimeout(runRivalTurn, 650);
  return true;
}

function runRivalTurn() {
  const rival = state.rival;
  rival.maxMana = Math.min(10, rival.maxMana + 1);
  rival.mana = rival.maxMana;
  drawCards(rival, 1);
  sfx.draw();
  const plan = planTurn(rival, state.player);
  let i = 0;
  const step = () => {
    if (i >= plan.length) { startPlayerTurn(); return; }
    const card = rival.hand.find((c) => c.id === plan[i]);
    i++;
    if (!card) { step(); return; }
    rival.mana -= card.cost;
    rival.hand.splice(rival.hand.indexOf(card), 1);
    rival.discard.push(card);
    const events = applyCardEffect(rival, state.player, card);
    state.lastPlayed = card;
    log(describeEvents('Vex', card, events), 'log-rival');
    showEvents(rival, state.player, events);
    renderAll();
    if (isDead(state.player)) { setTimeout(() => endDuel(false), 500); return; }
    setTimeout(step, 700);
  };
  step();
}

function startPlayerTurn() {
  state.turn++;
  state.player.maxMana = Math.min(10, state.player.maxMana + 1);
  state.player.mana = state.player.maxMana;
  drawCards(state.player, 1);
  sfx.turn();
  state.phase = 'player';
  log(`Turn ${state.turn} — you draw a card. ${state.player.mana} mana.`, 'log-good');
  renderAll();
}

function endDuel(won) {
  state.phase = 'over';
  state.screen = won ? 'win' : 'lose';
  if (won) { state.stats.wins++; sfx.win(); } else { state.stats.losses++; sfx.lose(); }
  $('end-emblem').textContent = won ? '▲' : '●';
  $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('end-title').className = won ? 'win' : 'lose';
  $('end-text').textContent = won
    ? 'Vex’s embers gutter out. The pact is yours — the table is silent, and the fire answers to you.'
    : 'Your last ember fades. Vex gathers the ashes — but a pact once struck can always be struck again.';
  $('end-stats').innerHTML =
    statBox(state.turn, 'TURNS') +
    statBox(state.stats.damageDealt, 'DAMAGE DEALT') +
    statBox(state.stats.cardsPlayed, 'CARDS PLAYED') +
    statBox(`${state.stats.wins}–${state.stats.losses}`, 'WINS–LOSSES');
  $('end-screen').hidden = false;
  renderAll();
}

function statBox(num, label) {
  return `<div class="stat-box"><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div>`;
}

// ---------- deterministic screenshot states (?shot=start|table|win|lose&seed=N) ----------
function cardByKey(key) {
  const def = CARD_DEFS.find((d) => d.key === key);
  return { id: Math.floor(Math.random() * 1e9), ...def, effect: { ...def.effect } };
}

function applyShot(shot, seed) {
  if (shot === 'table') {
    startDuel(seed);
    state.turn = 4;
    state.player.life = 24; state.player.shield = 4;
    state.rival.life = 18; state.rival.shield = 3;
    state.player.maxMana = 7; state.player.mana = 6;
    state.rival.maxMana = 6; state.rival.mana = 0;
    state.player.hand = ['ember-spark', 'flame-lash', 'granite-wall', 'riptide', 'storm-call'].map(cardByKey);
    state.rival.hand = [cardByKey('ember-spark'), cardByKey('aegis'), cardByKey('gale-step'), cardByKey('flame-lash')];
    state.player.deck = buildDeck().slice(0, 15);
    state.lastPlayed = cardByKey('cinder-burst');
    state.log = [
      { text: 'Turn 3 — Vex plays Flame Lash — deals 5 damage.', cls: 'log-rival' },
      { text: 'You play Granite Wall — gains 9 shield.', cls: 'log-you' },
      { text: 'Turn 4 — you draw a card. 6 mana.', cls: 'log-good' },
    ];
    renderAll();
  } else if (shot === 'win') {
    startDuel(seed);
    state.turn = 6;
    state.stats.damageDealt = 34;
    state.stats.cardsPlayed = 11;
    state.rival.life = 0;
    endDuel(true);
  } else if (shot === 'lose') {
    startDuel(seed);
    state.turn = 8;
    state.stats.damageDealt = 21;
    state.stats.cardsPlayed = 13;
    state.player.life = 0;
    endDuel(false);
  }
  // 'start' (or none) leaves the title screen up.
}

// ---------- wiring ----------
function boot() {
  $('start-btn').addEventListener('click', () => startDuel());
  $('again-btn').addEventListener('click', () => { state.duel++; startDuel(); });
  $('end-turn-btn').addEventListener('click', endTurn);
  $('mute-btn').addEventListener('click', () => {
    const muted = toggleMute();
    $('mute-btn').classList.toggle('muted', muted);
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key >= '1' && ev.key <= '7') {
      const card = state.player && state.player.hand[Number(ev.key) - 1];
      if (card) playCard(card, null);
    } else if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      if (state.screen === 'title') startDuel();
      else if (state.screen === 'table') endTurn();
      else if (state.screen === 'win' || state.screen === 'lose') { state.duel++; startDuel(); }
    } else if (ev.key === 'm' || ev.key === 'M') {
      const muted = toggleMute();
      $('mute-btn').classList.toggle('muted', muted);
    }
  });
  state.player = newMage();
  state.rival = newMage();
  renderAll();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '7');
  if (shot) applyShot(shot, seed);
}

// Test / automation handle (also handy for headless play-testing).
window.__ember = {
  state,
  startDuel,
  playCard,
  endTurn,
  applyShot,
  isMuted,
};

boot();
