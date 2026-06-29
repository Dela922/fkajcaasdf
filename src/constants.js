/* Global game constants — tweak here to rebalance the whole game */
const C = {
  // Tiles
  TILE_SIZE:  32,
  TILE_VOID:  0,
  TILE_FLOOR: 1,
  TILE_WALL:  2,

  // Map / dungeon
  MAP_W:        80,
  MAP_H:        60,
  NUM_ROOMS:    10,
  ROOM_MIN_W:   8,
  ROOM_MAX_W:   14,
  ROOM_MIN_H:   6,
  ROOM_MAX_H:   10,

  // Player base stats
  PLAYER_SPEED:           130,
  PLAYER_HP:              100,
  PLAYER_DMG:             10,
  PLAYER_ATTACK_RANGE:    90,
  PLAYER_ATTACK_CD:       900,   // ms between auto-attacks

  // XP needed to reach each level (index = level, value = cumulative XP)
  XP_TABLE: [0, 60, 150, 280, 450, 680, 980, 1360, 1830, 2410],

  // Render depths
  DEPTH_MAP:        0,
  DEPTH_ITEMS:      2,
  DEPTH_SHADOW:     3,
  DEPTH_ENEMY:      5,
  DEPTH_PLAYER:     10,
  DEPTH_PROJECTILE: 8,
  DEPTH_FX:         15,
  DEPTH_UI:         100,

  // Skill IDs
  SKILL_DASH:       'dash',
  SKILL_WHIRLWIND:  'whirlwind',
  SKILL_SHIELD:     'shield',

  // Room types
  ROOM_START:  'start',
  ROOM_NORMAL: 'normal',
  ROOM_CHEST:  'chest',
  ROOM_BOSS:   'boss',
};
