/* HUD — HP bar, XP bar, floor indicator, minimap */
class HUD {
  constructor(scene) {
    this.scene = scene;
    const W = scene.scale.width;

    // ── HP bar ────────────────────────────────────────────
    const barW = Math.min(200, W * 0.45);
    this._hpBg  = scene.add.rectangle(14 + barW / 2, 18, barW, 14, 0x440000, 0.8)
      .setScrollFactor(0).setDepth(C.DEPTH_UI);
    this._hpFill = scene.add.rectangle(14 + barW / 2, 18, barW, 14, 0xdd2222, 0.9)
      .setScrollFactor(0).setDepth(C.DEPTH_UI + 1);
    this._hpTxt = scene.add.text(14 + barW / 2, 18, 'HP', {
      fontSize: '10px', fill: '#fff',
    }).setScrollFactor(0).setDepth(C.DEPTH_UI + 2).setOrigin(0.5);

    // ── XP bar ────────────────────────────────────────────
    this._xpBg  = scene.add.rectangle(14 + barW / 2, 36, barW, 7, 0x222255, 0.8)
      .setScrollFactor(0).setDepth(C.DEPTH_UI);
    this._xpFill = scene.add.rectangle(14 + barW / 2, 36, 0, 7, 0x4466ff, 0.9)
      .setScrollFactor(0).setDepth(C.DEPTH_UI + 1).setOrigin(0, 0.5);
    this._xpFill.setX(14);
    this._xpBarW = barW;

    // ── Floor + level indicator ───────────────────────────
    this._floorTxt = scene.add.text(W - 12, 12, 'Floor 1', {
      fontSize: '13px', fill: '#fff', stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(C.DEPTH_UI).setOrigin(1, 0);

    this._levelTxt = scene.add.text(W - 12, 30, 'Lv 1', {
      fontSize: '11px', fill: '#aad', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(C.DEPTH_UI).setOrigin(1, 0);

    // ── Minimap ───────────────────────────────────────────
    this._mapCam = null; // created after dungeon is ready

    // Listen to events
    scene.events.on('player_hp_changed',    this._onHp,    this);
    scene.events.on('player_xp_changed',    this._onXp,    this);
    scene.events.on('player_level_up',      this._onLevel, this);
    scene.events.on('floor_changed',        this._onFloor, this);
  }

  initMinimap(dungeon) {
    // Draw minimap as a tiny render texture
    const mW = dungeon.width  * 2;
    const mH = dungeon.height * 2;
    const mx = this.scene.scale.width  - mW - 8;
    const my = this.scene.scale.height - mH - 160; // above controls

    this._miniRT = this.scene.add.renderTexture(mx, my, mW, mH)
      .setScrollFactor(0).setDepth(C.DEPTH_UI).setAlpha(0.7);

    const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const t = dungeon.tiles[y][x];
        if (t === C.TILE_FLOOR)  { gfx.fillStyle(0x888888); gfx.fillRect(x*2, y*2, 2, 2); }
        if (t === C.TILE_WALL)   { gfx.fillStyle(0x334455); gfx.fillRect(x*2, y*2, 2, 2); }
      }
    }
    this._miniRT.draw(gfx, 0, 0);
    gfx.destroy();

    // Player dot on minimap (updated in tick)
    this._miniDot = this.scene.add.circle(mx, my, 3, 0x00ff88)
      .setScrollFactor(0).setDepth(C.DEPTH_UI + 1);
    this._minimapOrigin = { x: mx, y: my };
    this._minimapScale  = 2;
  }

  updateMinimap(player, dungeon) {
    if (!this._miniDot) return;
    const tx = player.x / C.TILE_SIZE;
    const ty = player.y / C.TILE_SIZE;
    this._miniDot.setPosition(
      this._minimapOrigin.x + tx * this._minimapScale,
      this._minimapOrigin.y + ty * this._minimapScale
    );
  }

  _onHp(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp);
    this._hpFill.setScale(pct, 1);
    this._hpFill.setX(14 + (this._hpBg.width * pct) / 2);
    this._hpTxt.setText(`${Math.max(0, Math.ceil(hp))} / ${maxHp}`);
    this._hpFill.setFillStyle(pct > 0.5 ? 0xdd2222 : pct > 0.25 ? 0xff8800 : 0xff2200);
  }

  _onXp(xp, needed) {
    const pct = Math.min(1, xp / needed);
    this._xpFill.setSize(this._xpBarW * pct, 7);
  }

  _onLevel(level) {
    this._levelTxt.setText(`Lv ${level}`);
    // Flash text
    this.scene.tweens.add({
      targets: this._levelTxt, scaleX: 1.4, scaleY: 1.4,
      yoyo: true, duration: 200,
    });
  }

  _onFloor(floor) {
    this._floorTxt.setText(`Floor ${floor}`);
  }

  destroy() {
    this.scene.events.off('player_hp_changed', this._onHp,    this);
    this.scene.events.off('player_xp_changed', this._onXp,    this);
    this.scene.events.off('player_level_up',   this._onLevel, this);
    this.scene.events.off('floor_changed',      this._onFloor, this);
    if (this._miniRT)  this._miniRT.destroy();
    if (this._miniDot) this._miniDot.destroy();
    this._hpBg.destroy();  this._hpFill.destroy(); this._hpTxt.destroy();
    this._xpBg.destroy();  this._xpFill.destroy();
    this._floorTxt.destroy(); this._levelTxt.destroy();
  }
}
