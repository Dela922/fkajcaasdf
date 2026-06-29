/* Level-up perk selection — launched on top of paused Game */
class LevelUpScene extends Phaser.Scene {
  constructor() { super('LevelUp'); }

  init(data) {
    this.player = data.player;
    this.floor  = data.floor;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const perks = randomPerks(3);

    // Backdrop
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78);

    // Glowing border
    const border = this.add.rectangle(W / 2, H / 2, W - 20, H - 20, 0x000000, 0)
      .setStrokeStyle(2, 0x4466ff, 0.8);
    this.tweens.add({ targets: border, alpha: { from: 0.5, to: 1 }, yoyo: true, repeat: -1, duration: 800 });

    this.add.text(W / 2, 40, `LEVEL UP! — Level ${this.player.level}`, {
      fontSize: '22px', fill: '#ffdd44', stroke: '#000', strokeThickness: 4, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(W / 2, 68, 'Choose a perk:', {
      fontSize: '14px', fill: '#aabbcc',
    }).setOrigin(0.5);

    // Perk cards
    const cardH = Math.min(130, (H - 140) / 3);
    perks.forEach((perk, i) => {
      const cy = 110 + i * (cardH + 12) + cardH / 2;
      this._perkCard(W / 2, cy, W - 40, cardH, perk);
    });
  }

  _perkCard(x, y, w, h, perk) {
    const bg = this.add.rectangle(x, y, w, h, 0x112244, 0.92)
      .setStrokeStyle(2, 0x3355aa, 0.8).setInteractive({ useHandCursor: true });

    this.add.text(x - w / 2 + 14, y - h / 2 + 12, perk.icon, { fontSize: '22px' });
    this.add.text(x - w / 2 + 46, y - h / 2 + 12, perk.label, {
      fontSize: '16px', fill: '#eeeeff', fontStyle: 'bold',
    });
    this.add.text(x - w / 2 + 46, y - h / 2 + 34, perk.desc, {
      fontSize: '12px', fill: '#8899bb', wordWrap: { width: w - 60 },
    });

    bg.on('pointerover',  () => bg.setFillStyle(0x223366, 0.95));
    bg.on('pointerout',   () => bg.setFillStyle(0x112244, 0.92));
    bg.on('pointerdown',  () => bg.setScale(0.97));
    bg.on('pointerup',    () => {
      perk.apply(this.player);
      this.scene.stop('LevelUp');
      this.scene.resume('Game');
    });
  }
}
