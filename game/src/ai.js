// Vex, the Ash Mage — a readable opponent. It scores every card it can afford,
// plays the best one, then re-scores: it takes lethal when it sees it, mends
// when it is bleeding, walls up when you threaten it, and otherwise burns you.
import { isDead } from './rules.js';

function scoreCard(me, foe, card) {
  const e = card.effect;
  let score = 0;
  if (e.deal) {
    const real = Math.min(e.deal, foe.life + foe.shield);
    score += real * 1.0;
    if (e.deal >= foe.life + foe.shield) score += 100; // lethal, take it
  }
  if (e.shatter) score += Math.min(e.shatter, foe.shield) * 0.7;
  if (e.shield) {
    const want = me.life < 12 ? 1.2 : 0.8;
    score += Math.min(e.shield, 10) * want;
  }
  if (e.heal) {
    const missing = me.maxLife - me.life;
    const urgent = me.life < 12 ? 1.4 : 0.9;
    score += Math.min(e.heal, missing) * urgent;
  }
  if (e.draw) score += e.draw * 1.6;
  return score;
}

// Plan the rival's turn: greedy best-score plays until mana runs out or
// nothing left is worth playing. Returns the card ids in play order.
export function planTurn(me, foe) {
  const plan = [];
  let mana = me.mana;
  const hand = me.hand.slice();
  while (true) {
    let best = null;
    let bestScore = 0;
    for (const card of hand) {
      if (card.cost > mana) continue;
      const s = scoreCard(me, foe, card);
      if (s > bestScore) { bestScore = s; best = card; }
    }
    if (!best || bestScore <= 0.5) break;
    plan.push(best.id);
    mana -= best.cost;
    hand.splice(hand.indexOf(best), 1);
    if (isDead(foe)) break;
  }
  return plan;
}
