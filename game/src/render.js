// Ember Pact renderer: turns the duel state into DOM. One job per function;
// main.js owns the state, this file only paints it.
import { SUITS } from './cards.js';

const $ = (id) => document.getElementById(id);

export function cardElement(card, { playable = true, onClick = null, onHover = null } = {}) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card ${suit.css}`;
  el.dataset.cardId = String(card.id);
  el.innerHTML =
    `<div class="card-top"><span class="cost-gem">${card.cost}</span>` +
    `<span class="suit-glyph ${suit.css}">${suit.glyph}</span>` +
    `<span class="card-name">${card.name}</span></div>` +
    `<div class="card-power ${suit.css}">${card.power}</div>` +
    `<div class="card-power-label">${suit.name.toUpperCase()} · ${powerLabel(card)}</div>` +
    `<div class="card-text">${card.text}</div>`;
  if (!playable) el.classList.add('unaffordable');
  if (onClick) el.addEventListener('click', () => onClick(card, el));
  if (onHover) {
    el.addEventListener('mouseenter', () => onHover(card));
    el.addEventListener('mouseleave', () => onHover(null));
  }
  return el;
}

function powerLabel(card) {
  const e = card.effect;
  if (e.deal && !e.shield && !e.heal) return 'DAMAGE';
  if (e.shield && !e.deal) return 'SHIELD';
  if (e.heal && !e.deal) return 'HEAL';
  return 'POWER';
}

export function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card card-back';
  return el;
}

function renderMage(prefix, mage) {
  $(`${prefix}-life`).textContent = String(mage.life);
  $(`${prefix}-life-bar`).style.width = `${(mage.life / mage.maxLife) * 100}%`;
  const badge = $(`${prefix}-shield`);
  badge.hidden = mage.shield <= 0;
  badge.textContent = `■ ${mage.shield}`;
}

export function renderMana(player) {
  const row = $('mana-row');
  row.innerHTML = '';
  for (let i = 0; i < player.maxMana; i++) {
    const gem = document.createElement('span');
    gem.className = 'mana-gem' + (i < player.mana ? '' : ' spent');
    row.appendChild(gem);
  }
  const text = document.createElement('span');
  text.className = 'mana-text';
  text.textContent = `${player.mana} / ${player.maxMana} mana`;
  row.appendChild(text);
}

export function renderHands(state, callbacks) {
  const rivalHand = $('rival-hand');
  rivalHand.innerHTML = '';
  state.rival.hand.forEach(() => rivalHand.appendChild(cardBackElement()));

  const playerHand = $('player-hand');
  playerHand.innerHTML = '';
  state.player.hand.forEach((card, index) => {
    const el = cardElement(card, {
      playable: state.phase === 'player' && card.cost <= state.player.mana,
      onClick: (c, node) => callbacks.onPlayCard(c, node),
      onHover: callbacks.onHoverCard,
    });
    el.style.animationDelay = `${index * 0.06}s`;
    playerHand.appendChild(el);
  });
}

export function renderLog(state) {
  const log = $('log');
  log.innerHTML = '';
  state.log.slice(-4).forEach((entry) => {
    const div = document.createElement('div');
    div.className = entry.cls || '';
    div.textContent = entry.text;
    log.appendChild(div);
  });
}

export function renderLastPlay(card) {
  const box = $('last-play-card');
  if (!card) { box.className = 'mini-card empty'; box.textContent = '—'; return; }
  const suit = SUITS[card.suit];
  box.className = `mini-card ${suit.css}`;
  box.textContent = `${suit.glyph} ${card.name} · ${card.text}`;
}

export function renderStatus(state) {
  $('duel-status').textContent = `Duel ${state.duel} · Turn ${state.turn}`;
  $('tally').textContent = `Wins ${state.stats.wins} · Losses ${state.stats.losses}`;
  $('deck-count').textContent = String(state.player.deck.length);
  $('discard-count').textContent = String(state.player.discard.length);
  $('end-turn-btn').disabled = state.phase !== 'player';
  $('phase-note').textContent =
    state.phase === 'player' ? 'Your turn — play a card' :
    state.phase === 'ai' ? 'Vex is thinking…' : '';
}

export function renderDetail(card) {
  const bar = $('card-detail');
  if (!card) {
    bar.textContent = 'Hover a card to read it. Click a card to play it. Keys 1–7 play, Space ends the turn.';
    return;
  }
  const suit = SUITS[card.suit];
  bar.innerHTML = `<b>${suit.glyph} ${card.name}</b> — ${card.text} (cost ${card.cost} mana)`;
}

export function renderAll(state, callbacks) {
  renderMage('player', state.player);
  renderMage('rival', state.rival);
  renderMana(state.player);
  renderHands(state, callbacks);
  renderLog(state);
  renderStatus(state);
}

// A floating -3 / +4 / shield number over a mage portrait.
export function floatNumber(targetId, text, kind) {
  const target = $(targetId);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const appRect = $('app').getBoundingClientRect();
  const num = document.createElement('div');
  num.className = `float-num ${kind}`;
  num.textContent = text;
  num.style.left = `${rect.left - appRect.left + rect.width / 2 - 20}px`;
  num.style.top = `${rect.top - appRect.top}px`;
  $('app').appendChild(num);
  setTimeout(() => num.remove(), 1050);
}

export function shakeElement(id) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}
