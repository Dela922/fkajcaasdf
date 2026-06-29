/* Main menu scene */
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, W, H);

    // Animated floor tiles in background
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const tile = this.add.rectangle(x, y, C.TILE_SIZE, C.TILE_SIZE, 0x2a2a3a, 0.3);
      this.tweens.add({
        targets: tile, alpha: { from: 0.1, to: 0.4 },
        yoyo: true, repeat: -1, duration: 1500 + Math.random() * 1000,
      });
    }

    // Title
    this.add.text(W / 2, H * 0.22, 'DUNGEON\nCRAWLER', {
      fontSize: Math.min(52, W * 0.13) + 'px',
      fill: '#eeeeff',
      stroke: '#334499',
      strokeThickness: 6,
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.42, 'Roguelike', {
      fontSize: '18px', fill: '#8899dd', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Best run stats (if any)
    const best = localStorage.getItem('dcBestFloor');
    if (best) {
      this.add.text(W / 2, H * 0.50, `Best run: Floor ${best}`, {
        fontSize: '14px', fill: '#556688',
      }).setOrigin(0.5);
    }

    // Play button
    this._makeButton(W / 2, H * 0.63, 180, 52, 'PLAY', 0x334499, () => {
      this.scene.start('Game', { floor: 1 });
    });

    // How-to
    this.add.text(W / 2, H * 0.80,
      '🕹️  D-pad to move\n⚔️  Auto-attacks nearest enemy\nDSH / WRL / SHD = Skills\n❙❙ = Pause',
      { fontSize: '12px', fill: '#667799', align: 'center' }
    ).setOrigin(0.5);
  }

  _makeButton(x, y, w, h, label, color, cb) {
    const bg = this.add.rectangle(x, y, w, h, color, 0.85)
      .setStrokeStyle(2, 0x8899ff, 0.8)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '20px', fill: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover',  () => bg.setFillStyle(color + 0x222222, 1));
    bg.on('pointerout',   () => bg.setFillStyle(color, 0.85));
    bg.on('pointerdown',  () => { bg.setScale(0.95); txt.setScale(0.95); });
    bg.on('pointerup',    () => { bg.setScale(1); txt.setScale(1); cb(); });
    return { bg, txt };
  }
}
