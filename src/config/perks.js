/* Perk pool — 3 random perks are offered on each level-up */
const PERKS = [
  {
    id: 'vitality',
    label: 'Vitality',
    desc: '+25 max HP, restore 25 HP',
    icon: '❤️',
    apply(player) {
      player.stats.maxHp += 25;
      player.hp = Math.min(player.hp + 25, player.stats.maxHp);
    },
  },
  {
    id: 'power',
    label: 'Power',
    desc: '+8 attack damage',
    icon: '⚔️',
    apply(player) { player.stats.damage += 8; },
  },
  {
    id: 'agility',
    label: 'Agility',
    desc: '+20% movement speed',
    icon: '💨',
    apply(player) { player.stats.speed *= 1.20; },
  },
  {
    id: 'cooldown_mastery',
    label: 'Cooldown Mastery',
    desc: '-20% skill cooldowns',
    icon: '⏱️',
    apply(player) {
      player.skillCooldowns.dash    *= 0.80;
      player.skillCooldowns.whirlwind *= 0.80;
      player.skillCooldowns.shield  *= 0.80;
    },
  },
  {
    id: 'critical_strike',
    label: 'Critical Strike',
    desc: '+15% critical hit chance (2× damage)',
    icon: '🎯',
    apply(player) { player.critChance += 0.15; },
  },
  {
    id: 'regeneration',
    label: 'Regeneration',
    desc: 'Restore 1 HP every 2 seconds',
    icon: '🌿',
    apply(player) { player.regenRate += 1; },
  },
  {
    id: 'vampirism',
    label: 'Vampirism',
    desc: 'Attacks heal 8% of damage dealt',
    icon: '🧛',
    apply(player) { player.lifeSteal += 0.08; },
  },
  {
    id: 'wider_range',
    label: 'Long Reach',
    desc: '+30 attack range',
    icon: '🔭',
    apply(player) { player.stats.attackRange += 30; },
  },
  {
    id: 'attack_speed',
    label: 'Attack Speed',
    desc: '-20% attack cooldown',
    icon: '⚡',
    apply(player) { player.stats.attackCd *= 0.80; },
  },
  {
    id: 'dodge',
    label: 'Evasion',
    desc: '+12% dodge chance',
    icon: '🌀',
    apply(player) { player.dodgeChance += 0.12; },
  },
];

function randomPerks(count = 3) {
  const shuffled = [...PERKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
