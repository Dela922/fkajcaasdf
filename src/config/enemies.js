/* Enemy templates — add new types here */
const ENEMIES = {
  slime: {
    key:       'enemy_slime',
    label:     'Slime',
    hp:        30,
    damage:    6,
    speed:     60,
    xp:        10,
    range:     28,
    attackCD:  1200,
    tint:      0x66dd44,
  },
  skeleton: {
    key:       'enemy_skeleton',
    label:     'Skeleton',
    hp:        55,
    damage:    12,
    speed:     90,
    xp:        20,
    range:     30,
    attackCD:  1000,
    tint:      0xddddaa,
  },
  bat: {
    key:       'enemy_bat',
    label:     'Bat',
    hp:        20,
    damage:    8,
    speed:     140,
    xp:        15,
    range:     26,
    attackCD:  800,
    tint:      0x8844cc,
  },
  golem: {
    key:       'enemy_golem',
    label:     'Golem',
    hp:        120,
    damage:    18,
    speed:     50,
    xp:        40,
    range:     36,
    attackCD:  1500,
    tint:      0x777788,
  },
  boss: {
    key:       'enemy_boss',
    label:     'Floor Guardian',
    hp:        400,
    damage:    25,
    speed:     75,
    xp:        200,
    range:     40,
    attackCD:  900,
    tint:      0xff4422,
    isBoss:    true,
  },
};

// Which enemies can appear on each floor (floors start at 1)
function getEnemyPool(floor) {
  if (floor <= 1) return ['slime', 'bat'];
  if (floor <= 2) return ['slime', 'bat', 'skeleton'];
  if (floor <= 3) return ['skeleton', 'bat', 'golem'];
  return ['skeleton', 'golem', 'bat'];
}
