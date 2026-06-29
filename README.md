# Dungeon Crawler Roguelike

A mobile-first browser roguelike with procedural dungeons, auto-combat, skill buttons, items, and perk-based progression. No installation required — open one HTML file through a local server.

---

## Quick start

```bash
# Serve with any static file server:
npx serve .
# or
python3 -m http.server 8080
# or
php -S localhost:8080
```

Open `http://localhost:8080` in Chrome or Safari on your phone or desktop.

> **Why a server?** Phaser blocks `file://` loads. Any local HTTP server fixes this instantly.

---

## How to play

### Goal
Descend through procedurally generated dungeon floors. Each floor ends with a boss. Defeat the boss to reveal the stairs to the next floor. Survive as long as possible — each run is different.

### Controls (mobile)

| Area | Control | Action |
|---|---|---|
| Bottom-left | ▲ ▼ ◀ ▶ | Move the player |
| Bottom-left | ◼ (centre) | Stop moving |
| Bottom-right | **DSH** | Dash (invincible burst) |
| Bottom-right | **WRL** | Whirlwind (AoE hit) |
| Bottom-right | **SHD** | Shield (2 s immunity) |
| Top-right | **❙❙** | Pause / resume |

### Controls (desktop)
Use on-screen buttons with mouse. Keyboard support can be added — see Developer Guide.

### Combat
Your character **auto-attacks** the nearest enemy within range every ~0.9 seconds. No aiming needed. Use skill buttons for burst damage, escaping, or protection.

### Skills

| Skill | Button | Effect | Cooldown |
|---|---|---|---|
| **Dash** | DSH | Sprint forward, invincible during dash | 4 s |
| **Whirlwind** | WRL | Hits ALL enemies nearby for 3× damage | 6 s |
| **Shield** | SHD | Blocks all damage for 2 seconds | 8 s |

Skill cooldown bars shrink on each button as cooldowns recover.

### Rooms

| Type | Description |
|---|---|
| Start | Spawn point. No enemies. |
| Normal | 2–6 enemies. Kill for XP. |
| Chest | Treasure chest with an item. Walk over it to open. |
| Boss | One powerful boss. Stairs appear only after boss dies. |

### Items (from chests)

| Category | Examples |
|---|---|
| **Weapons** | Rusty Sword (+8 dmg), Magic Staff (+14 dmg +range), Quick Dagger (+5 dmg –20% cooldown) |
| **Armor** | Leather Armor (+25 HP), Chain Mail (+50 HP –speed), Magic Robe (+20 HP +range) |
| **Relics** | Vampire Ring (10% lifesteal), Speed Boots (+25% speed), Berserker Gem (+40% dmg <50% HP) |

### Level-up perks
On each level-up the game pauses and shows **3 random perks** — pick one.

| Perk | Effect |
|---|---|
| Vitality | +25 max HP, restore 25 HP |
| Power | +8 attack damage |
| Agility | +20% movement speed |
| Cooldown Mastery | –20% all skill cooldowns |
| Critical Strike | +15% crit chance (2× damage) |
| Regeneration | Restore 1 HP every 2 seconds |
| Vampirism | Attacks heal 8% of damage dealt |
| Long Reach | +30 attack range |
| Attack Speed | –20% auto-attack cooldown |
| Evasion | +12% dodge chance |

### Enemies

| Enemy | HP | Speed | Notes |
|---|---|---|---|
| Slime | 30 | Slow | Weakest — floors 1+ |
| Bat | 20 | Very fast | Erratic movement — floors 1+ |
| Skeleton | 55 | Medium | Balanced melee — floors 2+ |
| Golem | 120 | Very slow | Hits hard — floors 3+ |
| Boss (Guardian) | 400+ | Medium | One per floor, scales each floor |

Enemy stats scale with floor: `HP × (1 + (floor − 1) × 0.4)`.

### HUD

| Element | Location | Shows |
|---|---|---|
| HP bar (red) | Top-left | Current / max health |
| XP bar (blue) | Below HP | Progress to next level |
| Floor / Level | Top-right | Current floor and player level |
| Minimap | Above skill buttons | Room layout + player dot (green) |
| Enemy HP bars | Above each enemy | Shrinks as the enemy takes damage |

---

## Developer Guide

### Project structure

```
index.html                  ← Entry point. Script load order matters.
src/
  constants.js              ← All magic numbers / tile IDs.
  main.js                   ← Phaser config + scene list.
  config/
    enemies.js              ← Enemy templates + getEnemyPool(floor).
    items.js                ← Item list + randomItem().
    perks.js                ← Perk pool + randomPerks(n).
    skills.js               ← Skill execute() functions.
  systems/
    DungeonGenerator.js     ← Procedural map (scatter rooms + MST corridors).
  entities/
    Player.js               ← Player sprite, stats, auto-attack, skills.
    Enemy.js                ← Enemy sprite, AI, HP bar.
  ui/
    HUD.js                  ← HP/XP bars, minimap, floor text.
    Controls.js             ← D-pad + skill buttons + pause button.
  scenes/
    BootScene.js            ← Creates placeholder textures → Menu.
    MenuScene.js            ← Main menu.
    GameScene.js            ← Core game loop.
    PauseScene.js           ← Pause overlay.
    LevelUpScene.js         ← Perk selection.
    GameOverScene.js        ← Death summary + restart.
assets/
  sprites/                  ← Drop PNG sprites here.
sprites_guide.txt           ← Exact spec for every sprite.
CLAUDE.md                   ← AI session context (do not delete).
```

### Adding a new enemy

1. Add entry to `src/config/enemies.js` (copy an existing template).
2. Add its key to `getEnemyPool(floor)` for the floors you want.
3. Add placeholder drawing (or sprite load) in `BootScene._makeEnemies()`.

### Adding a new item

Add to the `ITEMS` array in `src/config/items.js`:
```js
{
  id: 'my_item', label: 'My Item', type: 'relic',
  desc: 'Does something cool', tint: 0xff8800,
  apply(player) { player.stats.damage += 10; },
},
```

### Adding a new perk

Add to `PERKS` in `src/config/perks.js`:
```js
{
  id: 'my_perk', label: 'My Perk', desc: 'Effect', icon: '🔥',
  apply(player) { /* mutate player */ },
},
```

### Adding sprites

See `sprites_guide.txt` for every key, expected canvas size, and what to draw.

**Short version:**
1. Save PNG to `assets/sprites/<key>.png`.
2. Add `this.load.image('<key>', 'assets/sprites/<key>.png');` in `BootScene.preload()` (create the method if it doesn't exist yet — it runs before `create()`).
3. Remove the matching `this._make*()` call from `BootScene.create()`.

For the tileset specifically: create a **96 × 32** PNG with three 32×32 tiles side-by-side (void, floor, wall) and load it as key `'tileset'`.

### Adding keyboard controls

In `GameScene.create()`:
```js
this._keys = this.input.keyboard.addKeys({
  up: Phaser.Input.Keyboard.KeyCodes.W,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
});
```
In `GameScene.update()`:
```js
this.player.moveDir.x = (this._keys.right.isDown ? 1 : 0) - (this._keys.left.isDown ? 1 : 0);
this.player.moveDir.y = (this._keys.down.isDown  ? 1 : 0) - (this._keys.up.isDown   ? 1 : 0);
```

### Rebalancing

All core numbers live in `src/constants.js`. Change them and reload.

| Constant | Default | Effect |
|---|---|---|
| `PLAYER_SPEED` | 130 | Pixels/sec |
| `PLAYER_HP` | 100 | Starting max HP |
| `PLAYER_DMG` | 10 | Auto-attack base damage |
| `PLAYER_ATTACK_RANGE` | 90 | Pixels to auto-attack |
| `PLAYER_ATTACK_CD` | 900 | ms between auto-attacks |
| `NUM_ROOMS` | 10 | Rooms per floor |
| `XP_TABLE` | [0,60,…] | Cumulative XP per level |

### Event bus

| Event | Fired by | Listened by |
|---|---|---|
| `player_hp_changed` | Player | HUD |
| `player_xp_changed` | Player | HUD |
| `player_level_up` | Player | HUD, LevelUpScene |
| `player_dead` | Player | GameScene |
| `enemy_killed` | Enemy | GameScene |
| `skill_used` | Player | Controls |
| `skill_cooldown_tick` | Player | Controls |
| `floor_changed` | GameScene | HUD |

### Pause system

Uses Phaser scene layering:
- `scene.pause('Game')` + `scene.launch('Pause')` — shows overlay, freezes game.
- `scene.stop('Pause')` + `scene.resume('Game')` — resumes.
- Same pattern for `LevelUp`. Works correctly at any moment.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank screen | Must use HTTP server, not `file://` |
| Game is tiny on desktop | Edit `_calcZoom()` in `GameScene.js` |
| Enemy walks through walls | Check `layer.setCollision([0,2])` and the physics collider in `create()` |
| Sprite not showing | Check `preload()` load call + remove matching `_make*()` + check browser console for 404 |
| Performance issues | Lower `NUM_ROOMS`, reduce enemy count in `_spawnRoom()` |

---

## Credits

Built with [Phaser 3](https://phaser.io/) (MIT licence).