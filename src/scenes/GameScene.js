/* Main game scene — dungeon, player, enemies, items, floor transitions */
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.floor        = data.floor  || 1;
    this._playerData  = data.player || null; // carry-over from previous floor
  }

  // ── create ─────────────────────────────────────────────────
  create() {
    this.kills = this._playerData ? (this._playerData._kills || 0) : 0;

    // Generate dungeon
    this.dungeon = DungeonGenerator.generate(this.floor);
    this._buildTilemap();

    // Physics world bounds
    this.physics.world.setBounds(
      0, 0,
      this.dungeon.width  * C.TILE_SIZE,
      this.dungeon.height * C.TILE_SIZE
    );

    // Groups
    this.enemies  = this.physics.add.group({ classType: Enemy,  runChildUpdate: false });
    this.chests   = this.physics.add.staticGroup();
    this.stairs   = null;

    // Spawn contents per room
    this.dungeon.rooms.forEach(room => this._spawnRoom(room));

    // Spawn player
    const startRoom = this.dungeon.rooms[0];
    const px = (startRoom.cx) * C.TILE_SIZE;
    const py = (startRoom.cy) * C.TILE_SIZE;
    this.player = new Player(this, px, py);
    if (this._playerData) this._restorePlayer(this._playerData);

    // Colliders
    this.physics.add.collider(this.player, this._wallLayer);
    this.physics.add.collider(this.enemies, this._wallLayer);
    this.physics.add.collider(this.enemies, this.enemies);

    // Chest overlap
    this.physics.add.overlap(this.player, this.chests, this._onChestOverlap, null, this);

    // Stairs overlap
    this.physics.add.overlap(this.player, this._stairSprites || [], this._onStairsOverlap, null, this);

    // Camera
    this.cameras.main.setBounds(
      0, 0,
      this.dungeon.width  * C.TILE_SIZE,
      this.dungeon.height * C.TILE_SIZE
    );
    this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
    this.cameras.main.setZoom(this._calcZoom());

    // HUD + Controls
    this.hud      = new HUD(this);
    this.controls = new Controls(this, this.player);
    this.hud.initMinimap(this.dungeon);

    // Emit initial values
    this.events.emit('player_hp_changed', this.player.hp, this.player.stats.maxHp);
    this.events.emit('player_xp_changed', this.player.xp, C.XP_TABLE[this.player.level] || 9999);
    this.events.emit('floor_changed', this.floor);

    // Event listeners
    this.events.on('enemy_killed', this._onEnemyKilled, this);
    this.events.on('player_dead',  this._onPlayerDead,  this);

    // Resume from pause/levelup
    this.events.on('resume', () => {
      // re-sync controls in case stats changed
    });
  }

  // ── update ─────────────────────────────────────────────────
  update(time, delta) {
    if (!this.player || !this.player.active) return;
    this.player.update(time, delta, this.enemies);
    this.enemies.getChildren().forEach(e => {
      if (e.active) e.update(time, delta, this.player);
    });
    this.hud.updateMinimap(this.player, this.dungeon);
  }

  // ── Tilemap ─────────────────────────────────────────────────
  _buildTilemap() {
    const map = this.make.tilemap({
      data:       this.dungeon.tiles,
      tileWidth:  C.TILE_SIZE,
      tileHeight: C.TILE_SIZE,
    });

    // 'tileset' key created in BootScene; firstgid=0, tilewidth=32
    const tileset = map.addTilesetImage('tileset', 'tileset', C.TILE_SIZE, C.TILE_SIZE, 0, 0);
    const layer   = map.createLayer(0, tileset, 0, 0);
    layer.setDepth(C.DEPTH_MAP);

    // Walls and void block movement
    layer.setCollision([C.TILE_VOID, C.TILE_WALL]);

    this._wallLayer = layer;
    this._tilemap   = map;
  }

  // ── Room spawning ────────────────────────────────────────────
  _spawnRoom(room) {
    const ts = C.TILE_SIZE;
    switch (room.type) {
      case C.ROOM_NORMAL: {
        const pool   = getEnemyPool(this.floor);
        const count  = Phaser.Math.Between(2, 4 + this.floor);
        for (let i = 0; i < count; i++) {
          const key = pool[Math.floor(Math.random() * pool.length)];
          const tmpl = ENEMIES[key];
          const ex = Phaser.Math.Between(room.x + 1, room.x + room.w - 2) * ts + ts / 2;
          const ey = Phaser.Math.Between(room.y + 1, room.y + room.h - 2) * ts + ts / 2;
          // Scale enemy stats with floor
          const scaled = this._scaleTemplate(tmpl);
          const enemy = new Enemy(this, ex, ey, scaled);
          this.enemies.add(enemy, true);
        }
        break;
      }
      case C.ROOM_CHEST: {
        const cx = room.cx * ts;
        const cy = room.cy * ts;
        const chest = this.chests.create(cx, cy, 'chest_closed')
          .setDepth(C.DEPTH_ITEMS);
        chest.itemData = randomItem();
        chest._opened = false;
        break;
      }
      case C.ROOM_BOSS: {
        // Boss enemy
        const tmpl   = this._scaleTemplate(ENEMIES.boss);
        const boss   = new Enemy(this, room.cx * ts, room.cy * ts, tmpl);
        this.enemies.add(boss, true);
        boss._isBossRoom = true;

        // Stairs (hidden until boss dead)
        const stairX = (room.cx + 3) * ts;
        const stairY = room.cy * ts;
        const stairSprite = this.add.image(stairX, stairY, 'stairs')
          .setDepth(C.DEPTH_ITEMS).setAlpha(0.3).setName('stair_' + room.cx);

        // Enable physics on stairs as static
        this.physics.add.existing(stairSprite, true);
        stairSprite._active = false;

        this._stairSprites = this._stairSprites || [];
        this._stairSprites.push(stairSprite);
        this._bossStair = stairSprite;
        break;
      }
      // ROOM_START: nothing extra
    }
  }

  _scaleTemplate(tmpl) {
    const f = this.floor;
    return {
      ...tmpl,
      hp:     Math.round(tmpl.hp     * (1 + (f - 1) * 0.4)),
      damage: Math.round(tmpl.damage * (1 + (f - 1) * 0.25)),
    };
  }

  // ── Chest interaction ─────────────────────────────────────
  _onChestOverlap(player, chest) {
    if (chest._opened) return;
    chest._opened = true;
    chest.setTexture('chest_open');

    const item = chest.itemData;
    // Show floating item pickup
    const icon = this.add.image(chest.x, chest.y - 20, 'item_pickup')
      .setDepth(C.DEPTH_FX).setTint(item.tint || 0xffffff);
    this.tweens.add({
      targets: icon, y: icon.y - 30, alpha: 0, duration: 1200,
      onComplete: () => icon.destroy(),
    });

    player.pickupItem(item);
    this._showBanner(`Got: ${item.label}!\n${item.desc}`, 0xffcc00);
  }

  // ── Stairs / floor transition ─────────────────────────────
  _onStairsOverlap(player, stair) {
    if (!stair._active) return;
    stair._active = false; // prevent double-trigger

    this._showBanner('Next floor!', 0x44ffaa);
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => {
      this._nextFloor();
    });
  }

  _nextFloor() {
    const save = this._savePlayer();
    this.controls.destroy();
    this.hud.destroy();
    this.scene.start('Game', { floor: this.floor + 1, player: save });
  }

  // ── Enemy killed ─────────────────────────────────────────
  _onEnemyKilled(enemy, player) {
    this.kills++;
    if (player) player.gainXp(enemy.xpReward);

    // Check if boss room stairs should activate
    if (this._bossStair && !this._bossStair._active) {
      const bossAlive = this.enemies.getChildren().some(e => e.active);
      if (!bossAlive) {
        this._bossStair._active = true;
        this._bossStair.setAlpha(1);
        this.tweens.add({
          targets: this._bossStair, scaleX: 1.2, scaleY: 1.2,
          yoyo: true, repeat: 3, duration: 200,
        });
        this._showBanner('Boss defeated! Find the stairs!', 0x44ffaa);
      }
    }
  }

  // ── Player dead ───────────────────────────────────────────
  _onPlayerDead() {
    this.time.delayedCall(800, () => {
      this.controls.destroy();
      this.hud.destroy();
      this.scene.start('GameOver', {
        floor: this.floor,
        level: this.player.level,
        kills: this.kills,
        items: this.player.items,
        win:   false,
      });
    });
  }

  // ── Player serialization (floor-to-floor) ────────────────
  _savePlayer() {
    const p = this.player;
    return {
      stats:        { ...p.stats },
      hp:           p.hp,
      xp:           p.xp,
      level:        p.level,
      lifeSteal:    p.lifeSteal,
      critChance:   p.critChance,
      dodgeChance:  p.dodgeChance,
      regenRate:    p.regenRate,
      hasBerserker: p.hasBerserker,
      items:        [...p.items],
      skillMaxCds:  { ...p.skillMaxCds },
      _kills:       this.kills,
    };
  }

  _restorePlayer(data) {
    const p = this.player;
    Object.assign(p.stats, data.stats);
    p.hp          = data.hp;
    p.xp          = data.xp;
    p.level       = data.level;
    p.lifeSteal   = data.lifeSteal;
    p.critChance  = data.critChance;
    p.dodgeChance = data.dodgeChance;
    p.regenRate   = data.regenRate;
    p.hasBerserker = data.hasBerserker;
    p.items       = [...data.items];
    Object.assign(p.skillMaxCds, data.skillMaxCds);
  }

  // ── Helper: banner message ────────────────────────────────
  _showBanner(msg, color = 0xffffff) {
    const W = this.scale.width;
    const cam = this.cameras.main;
    const bg = this.add.rectangle(W / 2, 90, W - 20, 50, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(C.DEPTH_UI - 1);
    const txt = this.add.text(W / 2, 90, msg, {
      fontSize: '14px', fill: '#' + color.toString(16).padStart(6, '0'),
      align: 'center', wordWrap: { width: W - 30 },
    }).setScrollFactor(0).setDepth(C.DEPTH_UI).setOrigin(0.5);

    this.tweens.add({
      targets: [bg, txt], alpha: 0, delay: 2000, duration: 600,
      onComplete: () => { bg.destroy(); txt.destroy(); },
    });
  }

  // ── Responsive zoom ──────────────────────────────────────
  _calcZoom() {
    const viewH = this.scale.height;
    if (viewH < 600) return 1.2;
    if (viewH < 800) return 1.4;
    return 1.6;
  }
}
