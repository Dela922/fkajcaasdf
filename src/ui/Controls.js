/* Mobile D-pad + skill buttons — drawn on top of the game camera */
class Controls {
  constructor(scene, player) {
    this.scene  = scene;
    this.player = player;

    const W = scene.scale.width;
    const H = scene.scale.height;
    const BTN = 52;     // button size
    const PAD = 14;     // pad between buttons
    const ALPHA = 0.45;

    this.container = scene.add.container(0, 0).setDepth(C.DEPTH_UI).setScrollFactor(0);

    // ── D-pad (bottom-left) ─────────────────────────────────
    const dpCx = 90, dpCy = H - 110;
    const dpData = [
      { label: '▲', dx:  0, dy: -1, offX: 0,         offY: -(BTN + PAD) },
      { label: '▼', dx:  0, dy:  1, offX: 0,         offY:  (BTN + PAD) },
      { label: '◀', dx: -1, dy:  0, offX: -(BTN + PAD), offY: 0 },
      { label: '▶', dx:  1, dy:  0, offX:  (BTN + PAD), offY: 0 },
    ];

    this._dirButtons = [];
    dpData.forEach(({ label, dx, dy, offX, offY }) => {
      const btn = this._makeButton(dpCx + offX, dpCy + offY, BTN, label, 0x334466, ALPHA);
      this.container.add(btn.items);

      btn.zone
        .on('pointerdown', () => this._setDir(dx, dy))
        .on('pointerup',   () => this._clearDir(dx, dy))
        .on('pointerout',  () => this._clearDir(dx, dy));

      this._dirButtons.push({ dx, dy, btn });
    });

    // Center of d-pad (stop button)
    const center = this._makeButton(dpCx, dpCy, BTN, '◼', 0x223355, ALPHA * 0.7);
    this.container.add(center.items);
    center.zone
      .on('pointerdown', () => { this.player.moveDir.x = 0; this.player.moveDir.y = 0; });

    // ── Skill buttons (bottom-right) ────────────────────────
    const skillLayout = [
      { id: 'shield',     label: 'SHD', x: W - 60,           y: H - 80 },
      { id: 'whirlwind',  label: 'WRL', x: W - 60 - BTN - PAD, y: H - 80 },
      { id: 'dash',       label: 'DSH', x: W - 60,           y: H - 80 - BTN - PAD },
    ];

    this._skillOverlays = {};
    skillLayout.forEach(({ id, label, x, y }) => {
      const color = SKILLS[id].color;
      const btn   = this._makeButton(x, y, BTN, label, color, ALPHA);
      this.container.add(btn.items);

      btn.zone.on('pointerdown', () => this.player.useSkill(id));

      // Cooldown overlay (a tinted rect that shrinks)
      const overlay = scene.add.rectangle(x, y, BTN, BTN, 0x000000, 0.6)
        .setScrollFactor(0).setDepth(C.DEPTH_UI + 1).setVisible(false);
      this.container.add(overlay);
      this._skillOverlays[id] = { overlay, baseH: BTN, y, btn };
    });

    // ── Pause button (top-right) ─────────────────────────────
    const pauseBtn = this._makeButton(W - 36, 36, 40, '❙❙', 0x333333, 0.7);
    this.container.add(pauseBtn.items);
    pauseBtn.zone.on('pointerdown', () => {
      scene.scene.pause('Game');
      scene.scene.launch('Pause');
    });

    // Listen to skill cooldown events
    scene.events.on('skill_cooldown_tick', this._onSkillTick, this);
    scene.events.on('skill_used',          this._onSkillUsed, this);
  }

  _setDir(dx, dy) {
    if (dx !== 0) this.player.moveDir.x = dx;
    if (dy !== 0) this.player.moveDir.y = dy;
  }

  _clearDir(dx, dy) {
    if (dx !== 0 && this.player.moveDir.x === dx) this.player.moveDir.x = 0;
    if (dy !== 0 && this.player.moveDir.y === dy) this.player.moveDir.y = 0;
  }

  _onSkillUsed(id, maxCd) {
    const s = this._skillOverlays[id];
    if (!s) return;
    s.overlay.setVisible(true).setSize(s.btn.bg.width, s.baseH);
  }

  _onSkillTick(id, remaining, maxCd) {
    const s = this._skillOverlays[id];
    if (!s) return;
    if (remaining <= 0) { s.overlay.setVisible(false); return; }
    const pct = remaining / maxCd;
    s.overlay.setSize(s.btn.bg.width, s.baseH * pct);
    // Anchor to bottom
    s.overlay.setY(s.y + (s.baseH / 2) - (s.baseH * pct / 2));
  }

  // Returns { bg, label, zone, items[] }
  _makeButton(x, y, size, label, color, alpha) {
    const bg  = this.scene.add.rectangle(x, y, size, size, color, alpha)
      .setScrollFactor(0).setDepth(C.DEPTH_UI)
      .setStrokeStyle(1.5, 0xffffff, 0.3);
    const txt = this.scene.add.text(x, y, label, {
      fontSize: '13px', fill: '#fff',
    }).setScrollFactor(0).setDepth(C.DEPTH_UI + 1).setOrigin(0.5);
    const zone = this.scene.add.zone(x, y, size, size)
      .setScrollFactor(0).setDepth(C.DEPTH_UI + 2)
      .setInteractive();

    return { bg, txt, zone, items: [bg, txt, zone] };
  }

  destroy() {
    this.scene.events.off('skill_cooldown_tick', this._onSkillTick, this);
    this.scene.events.off('skill_used',          this._onSkillUsed, this);
    this.container.destroy();
  }
}
