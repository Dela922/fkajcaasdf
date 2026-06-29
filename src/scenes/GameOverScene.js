/* Game-over / run summary screen */
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.floor  = data.floor  || 1;
    this.level  = data.level  || 1;
    this.kills  = data.kills  || 0;
    this.items  = data.items  || [];
    this.win    = data.win    || false;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Save best floor
    const prev = parseInt(localStorage.getItem('dcBestFloor') || '0', 10);
    if (this.floor > prev) localStorage.setItem('dcBestFloor', String(this.floor));

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0212, 0x0a0212, 0x1a0a2a, 0x1a0a2a, 1);
    bg.fillRect(0, 0, W, H);

    const title = this.win ? '🏆 YOU ESCAPED!' : '💀 YOU DIED';
    const tColor = this.win ? '#ffdd44' : '#ff4444';

    this.add.text(W / 2, H * 0.18, title, {
      fontSize: '32px', fill: tColor, stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats panel
    const stats = [
      `Floor reached:  ${this.floor}`,
      `Level:          ${this.level}`,
      `Enemies killed: ${this.kills}`,
      `Items collected: ${this.items.length}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(W / 2, H * 0.35 + i * 26, s, {
        fontSize: '15px', fill: '#aabbdd',
      }).setOrigin(0.5);
    });

    // Items listed
    if (this.items.length) {
      this.add.text(W / 2, H * 0.58, 'Items: ' + this.items.join(', '), {
        fontSize: '11px', fill: '#667799', wordWrap: { width: W - 40 }, align: 'center',
      }).setOrigin(0.5);
    }

    // Play again
    this._btn(W / 2, H * 0.72, 'PLAY AGAIN', 0x224488, () => {
      this.scene.start('Game', { floor: 1 });
    });
    this._btn(W / 2, H * 0.84, 'MAIN MENU', 0x222233, () => {
      this.scene.start('Menu');
    });
  }

  _btn(x, y, label, color, cb) {
    const bg = this.add.rectangle(x, y, 200, 46, color, 0.9)
      .setStrokeStyle(2, 0x5566aa).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, { fontSize: '17px', fill: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5);
    bg.on('pointerdown', () => { bg.setScale(0.96); txt.setScale(0.96); });
    bg.on('pointerup',   () => { bg.setScale(1); txt.setScale(1); cb(); });
  }
}
