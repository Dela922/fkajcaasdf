/* BootScene — generates all placeholder textures, then launches Menu */
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._makeTileset();
    this._makePlayer();
    this._makeEnemies();
    this._makeItem();
    this._makeChest();
    this._makeStairs();
    this._makeUIIcons();
    this.scene.start('Menu');
  }

  // ── Tileset strip: void | floor | wall (each 32×32) ──────
  _makeTileset() {
    const S = C.TILE_SIZE;
    const g = this.make.graphics({ add: false });

    // Tile 0 – void (invisible / black)
    g.fillStyle(0x000000); g.fillRect(0, 0, S, S);

    // Tile 1 – floor
    g.fillStyle(0x2a2a3a); g.fillRect(S, 0, S, S);
    g.lineStyle(1, 0x333344, 0.4);
    g.strokeRect(S, 0, S, S);

    // Tile 2 – wall
    g.fillStyle(0x4a4a6a); g.fillRect(S * 2, 0, S, S);
    g.fillStyle(0x5a5a7a);
    g.fillRect(S * 2 + 4, 4, S - 8, S / 2 - 4);
    g.fillRect(S * 2 + 4, S / 2 + 2, S - 8, S / 2 - 6);

    g.generateTexture('tileset', S * 3, S);
    g.destroy();
  }

  // ── Player sprite 28×28 ──────────────────────────────────
  _makePlayer() {
    const g = this.make.graphics({ add: false });
    // Body
    g.fillStyle(0x22bb77); g.fillRoundedRect(2, 4, 24, 22, 4);
    // Head
    g.fillStyle(0x33cc88); g.fillCircle(14, 8, 9);
    // Eyes
    g.fillStyle(0x000000); g.fillCircle(10, 6, 2); g.fillCircle(18, 6, 2);
    g.fillStyle(0xffffff); g.fillCircle(11, 5, 1); g.fillCircle(19, 5, 1);
    // Outline
    g.lineStyle(1.5, 0x115533);
    g.strokeRoundedRect(2, 4, 24, 22, 4);
    g.generateTexture('player', 28, 28);
    g.destroy();
  }

  // ── Enemy sprites ────────────────────────────────────────
  _makeEnemies() {
    this._makeEnemy('enemy_slime',    0x44cc22, (g) => {
      g.fillStyle(0x44cc22); g.fillEllipse(14, 16, 24, 20);
      g.fillStyle(0x66ee44); g.fillEllipse(14, 14, 18, 14);
      g.fillStyle(0xffffff); g.fillCircle(9, 12, 3); g.fillCircle(19, 12, 3);
      g.fillStyle(0x000000); g.fillCircle(10, 12, 1.5); g.fillCircle(20, 12, 1.5);
    });
    this._makeEnemy('enemy_skeleton', 0xeeeecc, (g) => {
      g.fillStyle(0xeeeecc); g.fillRect(8, 2, 12, 10); // head
      g.fillRect(10, 12, 8, 12); // torso
      g.fillRect(6,  12, 4, 10); // left arm
      g.fillRect(18, 12, 4, 10); // right arm
      g.fillRect(9,  24, 4, 6);  // left leg
      g.fillRect(15, 24, 4, 6);  // right leg
      g.fillStyle(0x000000);
      g.fillRect(10, 5, 3, 3); g.fillRect(15, 5, 3, 3); // eyes
    });
    this._makeEnemy('enemy_bat', 0x8833bb, (g) => {
      g.fillStyle(0x8833bb);
      g.fillTriangle(0, 18, 14, 8, 6, 22);   // left wing
      g.fillTriangle(28, 18, 14, 8, 22, 22);  // right wing
      g.fillCircle(14, 15, 7);               // body
      g.fillStyle(0xff4488); g.fillCircle(11, 13, 2); g.fillCircle(17, 13, 2); // eyes
    });
    this._makeEnemy('enemy_golem', 0x667788, (g) => {
      g.fillStyle(0x667788); g.fillRect(4, 2, 20, 24);
      g.fillStyle(0x445566); g.fillRect(6, 4, 16, 8);   // head
      g.fillStyle(0x889900); g.fillCircle(14, 8, 4);    // gem eye
      g.fillStyle(0xaabb00); g.fillCircle(14, 8, 2);
      g.fillStyle(0x556677);
      g.fillRect(2, 4, 4, 12);  // left arm
      g.fillRect(22, 4, 4, 12); // right arm
    });
    this._makeEnemy('enemy_boss', 0xff3300, (g) => {
      // Large menacing figure
      g.fillStyle(0x991100); g.fillRect(4, 8, 28, 28);
      g.fillStyle(0xff3300); g.fillRect(8, 2, 20, 16);  // head
      g.fillStyle(0xffff00); g.fillCircle(13, 9, 3); g.fillCircle(23, 9, 3); // eyes
      g.fillStyle(0xff6600); g.fillCircle(13, 9, 1.5); g.fillCircle(23, 9, 1.5);
      // Horns
      g.fillStyle(0x550000);
      g.fillTriangle(8,  2, 12, 2, 10, -4);
      g.fillTriangle(24, 2, 28, 2, 26, -4);
      // Claws
      g.fillStyle(0x880000);
      g.fillRect(0,  12, 4, 6); g.fillRect(32, 12, 4, 6);
    }, 36);
  }

  _makeEnemy(key, _color, drawFn, size = 28) {
    const g = this.make.graphics({ add: false });
    drawFn(g);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  // ── Item pickup sprite 20×20 ─────────────────────────────
  _makeItem() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffcc00, 0.9); g.fillStar(10, 10, 5, 9, 5);
    g.lineStyle(1, 0xaa8800); g.strokeStar(10, 10, 5, 9, 5);
    g.generateTexture('item_pickup', 20, 20);
    g.destroy();
  }

  // ── Chest sprite 28×22 ──────────────────────────────────
  _makeChest() {
    const g = this.make.graphics({ add: false });
    // Closed chest
    g.fillStyle(0x883300); g.fillRect(0, 8, 28, 14);
    g.fillStyle(0xaa4400); g.fillRect(0, 0, 28, 10);
    g.fillStyle(0xcc8800); g.fillRect(11, 6, 6, 6); // latch
    g.lineStyle(2, 0x552200);
    g.strokeRect(0, 0, 28, 10); g.strokeRect(0, 8, 28, 14);
    g.fillStyle(0xffaa00); g.fillRect(2, 2, 24, 4); // band
    g.generateTexture('chest_closed', 28, 22);
    g.destroy();

    const g2 = this.make.graphics({ add: false });
    // Open chest
    g2.fillStyle(0x883300); g2.fillRect(0, 8, 28, 14);
    g2.fillStyle(0x221100, 0.6); g2.fillRect(2, 9, 24, 12); // dark interior
    g2.fillStyle(0xaa4400); g2.fillRect(0, 0, 28, 8);
    g2.lineStyle(2, 0x552200);
    g2.strokeRect(0, 0, 28, 8); g2.strokeRect(0, 8, 28, 14);
    g2.generateTexture('chest_open', 28, 22);
    g2.destroy();
  }

  // ── Stairs sprite 28×28 ─────────────────────────────────
  _makeStairs() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x334488, 0.8); g.fillRect(0, 0, 28, 28);
    g.fillStyle(0x6688cc);
    for (let i = 0; i < 4; i++) {
      g.fillRect(i * 6 + 2, 28 - (i + 1) * 6, 28 - i * 6 - 2, 5);
    }
    g.lineStyle(1, 0x99aadd);
    g.strokeRect(0, 0, 28, 28);
    g.generateTexture('stairs', 28, 28);
    g.destroy();
  }

  // ── Small UI icons (heart, etc.) ────────────────────────
  _makeUIIcons() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xff2244);
    g.fillCircle(5, 5, 5); g.fillCircle(11, 5, 5);
    g.fillTriangle(0, 7, 8, 16, 16, 7);
    g.generateTexture('icon_heart', 16, 16);
    g.destroy();
  }
}
