// Ember Pact card catalogue: 15 original cards in four elemental suits.
// Suits are told apart by colour AND shape, never by text alone:
//   Flame ▲ red — strikes the rival.  Stone ■ amber — raises a shield.
//   Tide ● blue — mends life.         Gale ✦ teal — draws cards, shatters shields.
export const SUITS = {
  flame: { name: 'Flame', glyph: '▲', css: 'suit-flame' },
  stone: { name: 'Stone', glyph: '■', css: 'suit-stone' },
  tide: { name: 'Tide', glyph: '●', css: 'suit-tide' },
  gale: { name: 'Gale', glyph: '✦', css: 'suit-gale' },
};

// effect: { deal, shield, heal, draw, shatter } — all numbers are the card's power.
export const CARD_DEFS = [
  { key: 'ember-spark', name: 'Ember Spark', suit: 'flame', cost: 1, power: 3, effect: { deal: 3 }, text: 'Deal 3 damage to the rival.' },
  { key: 'flame-lash', name: 'Flame Lash', suit: 'flame', cost: 2, power: 5, effect: { deal: 5 }, text: 'Deal 5 damage to the rival.' },
  { key: 'cinder-burst', name: 'Cinder Burst', suit: 'flame', cost: 3, power: 6, effect: { deal: 6, draw: 1 }, text: 'Deal 6 damage. Draw a card.' },
  { key: 'inferno', name: 'Inferno', suit: 'flame', cost: 4, power: 9, effect: { deal: 9 }, text: 'Deal 9 damage to the rival.' },
  { key: 'ember-pact', name: 'Ember Pact', suit: 'flame', cost: 5, power: 12, effect: { deal: 12 }, text: 'Deal 12 damage. The pact is sealed.' },
  { key: 'stone-skin', name: 'Stone Skin', suit: 'stone', cost: 1, power: 4, effect: { shield: 4 }, text: 'Gain 4 shield.' },
  { key: 'aegis', name: 'Aegis', suit: 'stone', cost: 2, power: 6, effect: { shield: 6 }, text: 'Gain 6 shield.' },
  { key: 'granite-wall', name: 'Granite Wall', suit: 'stone', cost: 3, power: 9, effect: { shield: 9 }, text: 'Gain 9 shield.' },
  { key: 'quake', name: 'Quake', suit: 'stone', cost: 4, power: 5, effect: { deal: 5, shield: 5 }, text: 'Deal 5 damage. Gain 5 shield.' },
  { key: 'spring-water', name: 'Spring Water', suit: 'tide', cost: 1, power: 4, effect: { heal: 4 }, text: 'Restore 4 life.' },
  { key: 'tidepool', name: 'Tidepool', suit: 'tide', cost: 2, power: 6, effect: { heal: 6 }, text: 'Restore 6 life.' },
  { key: 'riptide', name: 'Riptide', suit: 'tide', cost: 2, power: 4, effect: { deal: 4, heal: 3 }, text: 'Deal 4 damage. Restore 3 life.' },
  { key: 'deep-well', name: 'Deep Well', suit: 'tide', cost: 3, power: 9, effect: { heal: 9 }, text: 'Restore 9 life.' },
  { key: 'gale-step', name: 'Gale Step', suit: 'gale', cost: 1, power: 2, effect: { draw: 2 }, text: 'Draw 2 cards.' },
  { key: 'wind-shear', name: 'Wind Shear', suit: 'gale', cost: 2, power: 3, effect: { deal: 3, shatter: 3 }, text: 'Deal 3 damage. Shatter 3 rival shield.' },
  { key: 'storm-call', name: 'Storm Call', suit: 'gale', cost: 4, power: 7, effect: { deal: 7, draw: 1 }, text: 'Deal 7 damage. Draw a card.' },
];

let nextCardId = 1;

// Build one 24-card deck: cheap cards in duplicate, heavy cards single.
export function buildDeck() {
  const cards = [];
  for (const def of CARD_DEFS) {
    const copies = def.cost <= 2 ? 2 : 1;
    for (let i = 0; i < copies; i++) {
      cards.push({ id: nextCardId++, ...def, effect: { ...def.effect } });
    }
  }
  cards.push({ id: nextCardId++, ...CARD_DEFS[0], effect: { ...CARD_DEFS[0].effect } });
  return cards; // 24 cards
}

export function defOf(card) {
  return CARD_DEFS.find((d) => d.key === card.key);
}

// One-line summary of what a card does, for the detail bar and the log.
export function describeCard(card) {
  const e = card.effect;
  const parts = [];
  if (e.deal) parts.push(`deal ${e.deal}`);
  if (e.shield) parts.push(`shield ${e.shield}`);
  if (e.heal) parts.push(`heal ${e.heal}`);
  if (e.draw) parts.push(`draw ${e.draw}`);
  if (e.shatter) parts.push(`shatter ${e.shatter}`);
  return `${card.name} (${card.cost} mana) — ${parts.join(', ')}.`;
}
