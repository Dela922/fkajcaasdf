/* Enemy entity — extend this for special boss behaviour */
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, template) {
    super(scene, x, y, template.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.template   = template;
    this.hp         = template.hp;
    this.maxHp      = template.hp;
    this.damage     = template.damage;
    this.speed      = template.speed;
    this.xpReward   = template.xp;
    this.attackRange = template.range;
    this.attackCd   = template.attackCD;
    this._attackTimer = 0;
    this._aggroRange  = 200;

    this.setDepth(C.DEPTH_ENEMY);
    this.setCollideWorldBounds(true);
    this.body.setSize(22, 22);

    // Health bar (in world space, above enemy)
    this._hpBg  = scene.add.rectangle(x, y - 18, 28, 4, 0x440000).setDepth(C.DEPTH_ENEMY + 1);
    this._hpBar = scene.add.rectangle(x, y - 18, 28, 4, 0xff3333).setDepth(C.DEPTH_ENEMY + 2);

    if (template.isBoss) {
      this.setScale(1.6);
      this._aggroRange = 350;
      this.body.setSize(35, 35);
    }
  }

  takeDamage(amount, player) {
    // Guard: ignore hits on already-dead enemies (auto-attack can overlap with death frame)
    if (!this.active) return;

    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });

    this.hp -= amount;
    this._updateHpBar();

    if (player && player.lifeSteal > 0) {
      player.heal(amount * player.lifeSteal);
    }

    this._showDmgNumber(amount);

    if (this.hp <= 0) this._die(player);
  }

  _die(player) {
    // Capture refs before destroy() nulls them
    const scene  = this.scene;
    const x      = this.x;
    const y      = this.y;
    const tint   = this.template.tint;

    if (this._hpBg.active)  this._hpBg.destroy();
    if (this._hpBar.active) this._hpBar.destroy();

    // Destroy BEFORE emitting so that active=false when GameScene checks for
    // remaining enemies (boss-stair activation logic needs the dying enemy gone)
    this.destroy();

    // Death particles (scene ref saved above)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const p = scene.add.circle(x, y, 4, tint).setDepth(C.DEPTH_FX);
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }

    scene.events.emit('enemy_killed', this, player);
  }

  _showDmgNumber(amount) {
    if (!this.scene) return;
    const txt = this.scene.add.text(this.x, this.y - 10, `-${Math.round(amount)}`, {
      fontSize: '12px', fill: '#ff6666', stroke: '#000', strokeThickness: 2,
    }).setDepth(C.DEPTH_FX).setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt, y: txt.y - 24, alpha: 0, duration: 700,
      onComplete: () => txt.destroy(),
    });
  }

  _updateHpBar() {
    const pct = Math.max(0, this.hp / this.maxHp);
    this._hpBar.setScale(pct, 1);
    this._hpBar.setX(this._hpBg.x - 14 * (1 - pct));
  }

  update(time, delta, player) {
    if (!this.active || !player || !player.active) {
      this.body.setVelocity(0, 0);
      this._syncBars();
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist <= this._aggroRange) {
      // Chase player
      if (dist > this.attackRange) {
        this.scene.physics.moveToObject(this, player, this.speed);
      } else {
        this.body.setVelocity(0, 0);
        // Attack
        this._attackTimer -= delta;
        if (this._attackTimer <= 0) {
          this._attackTimer = this.attackCd;
          if (!player.isInvincible) {
            // Dodge check
            if (player.dodgeChance > 0 && Math.random() < player.dodgeChance) {
              this._showMiss(player);
            } else {
              player.takeDamage(this.damage);
            }
          }
        }
      }
    } else {
      // Wander slightly
      if (Math.random() < 0.005) {
        const angle = Math.random() * Math.PI * 2;
        this.body.setVelocity(Math.cos(angle) * 30, Math.sin(angle) * 30);
        this.scene.time.delayedCall(800, () => { if (this.active) this.body.setVelocity(0, 0); });
      }
    }

    this._syncBars();
  }

  _showMiss(player) {
    const txt = this.scene.add.text(player.x, player.y - 16, 'DODGE', {
      fontSize: '11px', fill: '#ffff44', stroke: '#000', strokeThickness: 2,
    }).setDepth(C.DEPTH_FX).setOrigin(0.5);
    this.scene.tweens.add({
      targets: txt, y: txt.y - 20, alpha: 0, duration: 600,
      onComplete: () => txt.destroy(),
    });
  }

  _syncBars() {
    this._hpBg.setPosition(this.x, this.y - (this.template.isBoss ? 28 : 18));
    this._hpBar.setPosition(this._hpBg.x - 14 * (1 - Math.max(0, this.hp / this.maxHp)), this._hpBg.y);
  }

  destroy(fromScene) {
    if (this._hpBg  && this._hpBg.active)  this._hpBg.destroy();
    if (this._hpBar && this._hpBar.active) this._hpBar.destroy();
    super.destroy(fromScene);
  }
}
