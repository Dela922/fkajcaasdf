/* Pause overlay — launched on top of Game scene */
class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Dim overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65);

    this.add.text(W / 2, H * 0.28, 'PAUSED', {
      fontSize: '36px', fill: '#eeeeff', stroke: '#223377', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Resume
    this._btn(W / 2, H * 0.45, 'RESUME', 0x224488, () => {
      this.scene.stop('Pause');
      this.scene.resume('Game');
    });

    // Back to menu
    this._btn(W / 2, H * 0.58, 'QUIT TO MENU', 0x442222, () => {
      this.scene.stop('Pause');
      this.scene.stop('Game');
      this.scene.start('Menu');
    });

    // Tips displayed while paused
    const tips = [
      'Auto-attacks the nearest enemy in range.',
      'DSH: Dash to dodge damage.',
      'WRL: Whirlwind hits ALL enemies around you.',
      'SHD: Shield blocks all damage for 2 seconds.',
      'Clear all enemies in a room to find loot.',
      'Chests contain powerful items.',
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    this.add.text(W / 2, H * 0.74, `💡 ${tip}`, {
      fontSize: '12px', fill: '#8899bb', wordWrap: { width: W - 40 }, align: 'center',
    }).setOrigin(0.5);
  }

  _btn(x, y, label, color, cb) {
    const bg = this.add.rectangle(x, y, 200, 48, color, 0.9)
      .setStrokeStyle(2, 0x99aaff, 0.6).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, { fontSize: '16px', fill: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5);
    bg.on('pointerdown', () => { bg.setScale(0.95); txt.setScale(0.95); });
    bg.on('pointerup',   () => { bg.setScale(1); txt.setScale(1); cb(); });
  }
}
