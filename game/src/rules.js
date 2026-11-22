// Shared combat rules: applying a card's effect and dealing damage through shield.
// Pure functions over the duel state; both the player and the AI use them.
export function damageThroughShield(target, amount) {
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  const toLife = amount - absorbed;
  target.life = Math.max(0, target.life - toLife);
  return { absorbed, toLife };
}

// Apply one card's effect. `side` is the mage playing it, `foe` the other mage.
// Returns a list of { kind, amount } events for the log and floating numbers.
export function applyCardEffect(side, foe, card) {
  const e = card.effect;
  const events = [];
  if (e.shatter) {
    const gone = Math.min(foe.shield, e.shatter);
    foe.shield -= gone;
    if (gone > 0) events.push({ kind: 'shatter', amount: gone });
  }
  if (e.deal) {
    const { absorbed, toLife } = damageThroughShield(foe, e.deal);
    events.push({ kind: 'damage', amount: e.deal, absorbed, toLife });
  }
  if (e.shield) {
    side.shield += e.shield;
    events.push({ kind: 'shield', amount: e.shield });
  }
  if (e.heal) {
    const healed = Math.min(e.heal, side.maxLife - side.life);
    side.life += healed;
    events.push({ kind: 'heal', amount: healed });
  }
  return events;
}

export function isDead(mage) { return mage.life <= 0; }
