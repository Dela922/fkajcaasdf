# CLAUDE.md — Session Context for Dungeon Crawler Roguelike

Read this file at the start of every new session before touching any code.

---

## Project summary

A mobile-first browser roguelike built with **Phaser 3.60** (loaded from CDN).
No build step. Open `index.html` in a local HTTP server and play.

**Active branch:** `claude/mobile-browser-game-lw2hnt`
**Repo:** `dela922/fkajcaasdf`

---

## Tech choices (already decided — do not re-ask)

| Decision | Choice |
|---|---|
| Framework | Phaser 3.60 via CDN |
| Movement controls | Virtual D-pad (bottom-left) + skill buttons (bottom-right) |
| Map type | Procedural tile-based dungeon rooms |
| Combat | Auto-attack nearest enemy + 3 activatable skills |
| Progression | Items from chests + perk picks on level-up |
| Sprites | Placeholder generated shapes; user replaces via sprites_guide.txt |

---

## File map

```
index.html                  ← entry point, loads all scripts in order
src/
  constants.js              ← all magic numbers / tile IDs (edit here to rebalance)
  main.js                   ← Phaser config + scene list
  config/
    enemies.js              ← enemy templates + getEnemyPool(floor)
    items.js                ← item definitions + randomItem()
    perks.js                ← perk pool + randomPerks(count)
    skills.js               ← skill definitions (dash / whirlwind / shield)
  systems/
    DungeonGenerator.js     ← DungeonGenerator.generate(floor) → {tiles, rooms}
  entities/
    Player.js               ← Player extends Phaser.Physics.Arcade.Sprite
    Enemy.js                ← Enemy extends Phaser.Physics.Arcade.Sprite
  ui/
    HUD.js                  ← HP bar, XP bar, floor text, minimap
    Controls.js             ← D-pad, skill buttons, pause button
  scenes/
    BootScene.js            ← creates all placeholder textures → starts Menu
    MenuScene.js            ← main menu + best-run display
    GameScene.js            ← main game loop, dungeon, spawning, events
    PauseScene.js           ← pause overlay (launched on top of Game)
    LevelUpScene.js         ← perk selection (launched on top of paused Game)
    GameOverScene.js        ← death summary + restart
assets/
  sprites/                  ← place custom PNG sprites here (see sprites_guide.txt)
sprites_guide.txt           ← exact spec for every sprite the user needs to draw
README.md                   ← full player + developer manual
```

---

## Key event bus (scene.events)

| Event | Payload | Fired by |
|---|---|---|
| `player_hp_changed` | (hp, maxHp) | Player.takeDamage / heal |
| `player_xp_changed` | (xp, needed) | Player.gainXp |
| `player_level_up` | (level) | Player._levelUp |
| `player_dead` | — | Player._die |
| `enemy_killed` | (enemy, player) | Enemy._die |
| `skill_used` | (id, maxCd) | Player.useSkill |
| `skill_cooldown_tick` | (id, remaining, maxCd) | Player.update |
| `floor_changed` | (floor) | GameScene.create |
| `item_picked` | (item) | Player.pickupItem |
| `player_stats_changed` | (stats) | Player.pickupItem |

---

## How to add content

### New enemy type
1. Add entry to `src/config/enemies.js` (copy an existing template).
2. Add its key to `getEnemyPool()` for the floors where it should appear.
3. Add placeholder drawing or sprite loading in `BootScene._makeEnemies()`.

### New item
1. Add object to the `ITEMS` array in `src/config/items.js`.
2. The `apply(player)` function mutates `player.stats` or flags directly.
3. No scene changes needed — `randomItem()` picks from the full array.

### New perk
1. Add object to `PERKS` in `src/config/perks.js`.
2. `randomPerks(3)` shuffles and picks automatically.

### New skill
1. Add to `SKILLS` in `src/config/skills.js`.
2. Add a button in `Controls.js` `skillLayout` array.
3. Add cooldown tracking in `Player.js` `skillCooldowns` / `skillMaxCds`.

### New floor
Floors are infinite — `DungeonGenerator.generate(floor)` scales automatically.
Enemy stats scale in `GameScene._scaleTemplate()`:
  hp × (1 + (floor-1) × 0.4), damage × (1 + (floor-1) × 0.25).

### Replace placeholder sprites
See `sprites_guide.txt` for exact dimensions and what each sprite must show.

---

## Running locally

```bash
# Any static file server works:
npx serve .          # Node
python3 -m http.server 8080
php -S localhost:8080
```
Open `http://localhost:8080` in Chrome / Safari on phone or desktop.

**Phaser note:** `node_modules/phaser/dist/phaser.min.js` is the local copy (installed via `npm install phaser@3.60.0`).
For production / external hosting, swap index.html line to the CDN URL commented above it.

---

## Known limitations / future work

- No sound / music yet (Phaser WebAudio is ready to use)
- No projectile enemies yet (archer could throw arrows)
- Minimap does not show enemies — only player dot + room layout
- No persistent meta-progression between runs (localStorage only tracks best floor)
- No shop room implemented yet (room type exists in constant but spawns nothing)
