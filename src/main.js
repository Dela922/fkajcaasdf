/* Phaser game bootstrap */
const GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode:          Phaser.Scale.RESIZE,
    parent:        document.body,
    width:         '100%',
    height:        '100%',
    autoCenter:    Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },
  input: {
    activePointers: 4,  // support multi-touch
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    PauseScene,
    LevelUpScene,
    GameOverScene,
  ],
};

window.addEventListener('load', () => {
  new Phaser.Game(GameConfig);
});
