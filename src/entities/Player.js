/* Player entity — controlled via Controls.js, auto-attacks enemies */
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Core stats (modified by items & perks)
    this.stats = {
      speed:       C.PLAYER_SPEED,
      maxHp:       C.PLAYER_HP,
      damage:      C.PLAYER_DMG,
      attackRange: C.PLAYER_ATTACK_RANGE,
      attackCd:    C.PLAYER_ATTACK_CD,
    };

    this.hp           = this.stats.maxHp;
    this.xp           = 0;
    this.level        = 1;
    this.lifeSteal    = 0;
    this.critChance   = 0;
    this.dodgeChance  = 0;
    this.regenRate    = 0;   // HP per second
    this.hasBerserker = false;
    this.isInvincible = false;
    this.isDashing    = false;
    this.items        = [];

    // Skill cooldown tracking (remaining ms)
    this.skillCooldowns = {
      dash:       0,
      whirlwind:  0,
      shield:     0,
    };

    // Max cooldowns (can be modified by perks)
    this.skillMaxCds = {
      dash:       SKILLS.dash.cooldown,
      whirlwind:  SKILLS.whirlwind.cooldown,
      shield:     SKILLS.shield.cooldown,
    };

    // Movement direction (set by Controls.js)
    this.moveDir = { x: 0, y: 0 };

    this._autoAttackTimer = 0;
    this._regenTimer      = 0;
    this._hitFlashTimer   = 0;

    this.setDepth(C.DEPTH_PLAYER);
    this.setCollideWorldBounds(true);
    this.body.setSize(22, 22);
  }

  // ── Public API ───────────────────────────────────────────

  takeDamage(amount) {
    if (this.isInvincible) return;
    this.hp -= amount;
    this._hitFlashTimer = 200;
    this.setTint(0xff4444);
    this.scene.cameras.main.shake(120, 0.006);
    this.scene.events.emit('player_hp_changed', this.hp, this.stats.maxHp);
    if (this.hp <= 0) this._die();
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.stats.maxHp);
    this.scene.events.emit('player_hp_changed', this.hp, this.stats.maxHp);
  }

  gainXp(amount) {
    this.xp += amount;
    this.scene.events.emit('player_xp_changed', this.xp, this._xpForNextLevel());
    if (this.xp >= this._xpForNextLevel() && this.level < C.XP_TABLE.length) {
      this._levelUp();
    }
  }

  useSkill(skillId) {
    if (this.skillCooldowns[skillId] > 0) return;
    const skill = SKILLS[skillId];
    if (!skill) return;
    skill.execute(this, this.scene);
    this.skillCooldowns[skillId] = this.skillMaxCds[skillId];
    this.scene.events.emit('skill_used', skillId, this.skillMaxCds[skillId]);
  }

  pickupItem(item) {
    this.items.push(item.id);
    item.apply(this);
    this.scene.events.emit('item_picked', item);
    // sync physics body speed
    this.scene.events.emit('player_stats_changed', this.stats);
  }

  // ── Update (called from GameScene) ───────────────────────

  update(time, delta, enemies) {
    if (!this.active) return;

    // Movement
    if (!this.isDashing) {
      this.body.setVelocity(
        this.moveDir.x * this.stats.speed,
        this.moveDir.y * this.stats.speed
      );
      if (this.moveDir.x !== 0 && this.moveDir.y !== 0) {
        this.body.velocity.normalize().scale(this.stats.speed);
      }
    }

    // Hit-flash recovery
    if (this._hitFlashTimer > 0) {
      this._hitFlashTimer -= delta;
      if (this._hitFlashTimer <= 0) this.clearTint();
    }

    // Skill cooldowns
    for (const id of Object.keys(this.skillCooldowns)) {
      if (this.skillCooldowns[id] > 0) {
        this.skillCooldowns[id] = Math.max(0, this.skillCooldowns[id] - delta);
        this.scene.events.emit('skill_cooldown_tick', id, this.skillCooldowns[id], this.skillMaxCds[id]);
      }
    }

    // HP regen
    if (this.regenRate > 0) {
      this._regenTimer += delta;
      if (this._regenTimer >= 2000) {
        this._regenTimer = 0;
        this.heal(this.regenRate);
      }
    }

    // Auto attack
    this._autoAttackTimer -= delta;
    if (this._autoAttackTimer <= 0) {
      this._autoAttackTimer = this.stats.attackCd;
      this._doAutoAttack(enemies);
    }
  }

  // ── Private ───────────────────────────────────────────────

  _doAutoAttack(enemies) {
    if (!enemies) return;
    let nearest = null, nearestDist = Infinity;
    enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    });
    if (!nearest || nearestDist > this.stats.attackRange) return;

    let dmg = this.stats.damage;

    // Berserker bonus
    if (this.hasBerserker && this.hp < this.stats.maxHp * 0.5) dmg *= 1.4;

    // Crit
    const isCrit = this.critChance > 0 && Math.random() < this.critChance;
    if (isCrit) dmg *= 2;

    nearest.takeDamage(dmg, this);

    // Visual attack line
    const line = this.scene.add.line(
      0, 0,
      this.x, this.y,
      nearest.x, nearest.y,
      isCrit ? 0xffff00 : 0xffffff, isCrit ? 0.9 : 0.5
    ).setDepth(C.DEPTH_FX).setLineWidth(isCrit ? 2 : 1);

    this.scene.tweens.add({
      targets: line, alpha: 0, duration: 120,
      onComplete: () => line.destroy(),
    });
  }

  _levelUp() {
    this.level++;
    this.scene.events.emit('player_level_up', this.level);
    this.scene.scene.pause('Game');
    this.scene.scene.launch('LevelUp', { player: this, floor: this.scene.floor });
  }

  _xpForNextLevel() {
    if (this.level >= C.XP_TABLE.length) return Infinity;
    return C.XP_TABLE[this.level];
  }

  _die() {
    this.setActive(false).setVisible(false);
    this.scene.events.emit('player_dead');
  }
}
