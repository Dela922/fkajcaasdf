/* Item definitions — add new items here, they will appear in chests */
const ITEMS = [
  // ── Weapons ──────────────────────────────────────────────
  {
    id: 'rusty_sword',
    label: 'Rusty Sword',
    type: 'weapon',
    desc: '+8 attack damage',
    tint: 0xaaaaaa,
    apply(player) { player.stats.damage += 8; },
  },
  {
    id: 'magic_staff',
    label: 'Magic Staff',
    type: 'weapon',
    desc: '+14 dmg, +20 range',
    tint: 0x8844ff,
    apply(player) { player.stats.damage += 14; player.stats.attackRange += 20; },
  },
  {
    id: 'quick_dagger',
    label: 'Quick Dagger',
    type: 'weapon',
    desc: '+5 dmg, -20% attack cooldown',
    tint: 0x44ffdd,
    apply(player) { player.stats.damage += 5; player.stats.attackCd *= 0.8; },
  },
  {
    id: 'war_axe',
    label: 'War Axe',
    type: 'weapon',
    desc: '+20 dmg, -10% speed',
    tint: 0xff6600,
    apply(player) { player.stats.damage += 20; player.stats.speed *= 0.9; },
  },
  // ── Armor ────────────────────────────────────────────────
  {
    id: 'leather_armor',
    label: 'Leather Armor',
    type: 'armor',
    desc: '+25 max HP',
    tint: 0xaa6633,
    apply(player) { player.stats.maxHp += 25; player.hp = Math.min(player.hp + 25, player.stats.maxHp); },
  },
  {
    id: 'chain_mail',
    label: 'Chain Mail',
    type: 'armor',
    desc: '+50 max HP, -10% speed',
    tint: 0x888899,
    apply(player) { player.stats.maxHp += 50; player.hp = Math.min(player.hp + 50, player.stats.maxHp); player.stats.speed *= 0.9; },
  },
  {
    id: 'magic_robe',
    label: 'Magic Robe',
    type: 'armor',
    desc: '+20 max HP, +10 range',
    tint: 0xcc44cc,
    apply(player) { player.stats.maxHp += 20; player.hp = Math.min(player.hp + 20, player.stats.maxHp); player.stats.attackRange += 10; },
  },
  // ── Relics ───────────────────────────────────────────────
  {
    id: 'vampire_ring',
    label: 'Vampire Ring',
    type: 'relic',
    desc: 'Heal 10% of damage dealt',
    tint: 0xff2244,
    apply(player) { player.lifeSteal += 0.10; },
  },
  {
    id: 'speed_boots',
    label: 'Speed Boots',
    type: 'relic',
    desc: '+25% movement speed',
    tint: 0xffff00,
    apply(player) { player.stats.speed *= 1.25; },
  },
  {
    id: 'berserker_gem',
    label: 'Berserker Gem',
    type: 'relic',
    desc: '+40% dmg when HP < 50%',
    tint: 0xff4400,
    apply(player) { player.hasBerserker = true; },
  },
  {
    id: 'lucky_coin',
    label: 'Lucky Coin',
    type: 'relic',
    desc: '20% chance to dodge hits',
    tint: 0xffdd00,
    apply(player) { player.dodgeChance += 0.20; },
  },
];

function randomItem() {
  return ITEMS[Math.floor(Math.random() * ITEMS.length)];
}
