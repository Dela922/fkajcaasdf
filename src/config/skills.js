/* Skill definitions — referenced by Player.js */
const SKILLS = {
  dash: {
    id:      'dash',
    label:   'Dash',
    desc:    'Dash in movement direction. Brief invincibility.',
    cooldown: 4000,   // ms
    color:    0x44aaff,
    execute(player, scene) {
      const speed  = 400;
      const dur    = 200; // ms
      const dx = player.moveDir.x || (Math.random() > 0.5 ? 1 : -1);
      const dy = player.moveDir.y;
      player.isDashing   = true;
      player.isInvincible = true;
      player.body.setVelocity(dx * speed, dy * speed);

      scene.time.delayedCall(dur, () => {
        player.isDashing    = false;
        player.isInvincible = false;
        player.body.setVelocity(0, 0);
      });

      scene.cameras.main.flash(80, 44, 170, 255, true);
    },
  },

  whirlwind: {
    id:      'whirlwind',
    label:   'Whirl',
    desc:    'Spin attack hitting all enemies in range for 3× damage.',
    cooldown: 6000,
    color:    0xffaa00,
    execute(player, scene) {
      const radius = player.stats.attackRange * 1.4;
      const damage = player.stats.damage * 3;

      scene.enemies.getChildren().forEach(enemy => {
        if (!enemy.active) return;
        const d = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        if (d <= radius) enemy.takeDamage(damage, player);
      });

      // Visual ring
      const ring = scene.add.circle(player.x, player.y, radius, 0xffaa00, 0.3).setDepth(C.DEPTH_FX);
      scene.tweens.add({
        targets:  ring,
        alpha:    0,
        scaleX:   1.5,
        scaleY:   1.5,
        duration: 400,
        onComplete: () => ring.destroy(),
      });
    },
  },

  shield: {
    id:      'shield',
    label:   'Shield',
    desc:    'Block all damage for 2 seconds.',
    cooldown: 8000,
    color:    0x44ff88,
    execute(player, scene) {
      player.isInvincible = true;

      const ring = scene.add.circle(player.x, player.y, 22, 0x44ff88, 0.35)
        .setStrokeStyle(3, 0x44ff88)
        .setDepth(C.DEPTH_FX);

      const tween = scene.tweens.add({
        targets: ring,
        alpha:   { from: 0.35, to: 0.55 },
        yoyo:    true,
        repeat:  -1,
        duration: 300,
      });

      scene.time.delayedCall(2000, () => {
        player.isInvincible = false;
        tween.stop();
        ring.destroy();
      });

      // Make ring follow player
      scene.events.on('postupdate', function follow() {
        if (!ring.active) { scene.events.off('postupdate', follow); return; }
        ring.setPosition(player.x, player.y);
      });
    },
  },
};
