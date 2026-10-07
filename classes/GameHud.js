'use strict';

class GameHud extends THREE.Group {
  constructor() {
    super();
    this.resources = [];
    this.lifeIcons = [];
    this.lastLives = -1;

    this.scoreText = new PixelText('000000', GameConfig.COLORS.YELLOW);
    this.scoreText.position.set(0, 1, 0);
    this.add(this.scoreText);

    this.highScoreText = new PixelText('000000', GameConfig.COLORS.YELLOW);
    this.highScoreText.position.set(80, 1, 0);
    this.add(this.highScoreText);

    this.energyLabel = new PixelText('E', GameConfig.COLORS.RED);
    this.energyLabel.position.set(0, GameConfig.HUD_BOTTOM, 0);
    this.add(this.energyLabel);

    this.energyFill = this.createRect(64, 7, GameConfig.COLORS.GREEN);
    this.energyFill.position.set(39, GameConfig.HUD_BOTTOM + 3.5, 0);
    this.add(this.energyFill);

    this.levelText = new PixelText('1', GameConfig.COLORS.GREEN);
    this.levelText.position.set(GameConfig.WIDTH - this.levelText.textWidth, GameConfig.HUD_BOTTOM, 0);
    this.add(this.levelText);
  }

  createRect(width, height, color) {
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 20;
    this.resources.push({ geometry: geometry, material: material });
    return mesh;
  }

  update(score, highScore, enemiesRemaining, enemiesTotal, lives, level) {
    this.scoreText.setText(String(score).padStart(6, '0').slice(-6));
    this.highScoreText.setText(String(highScore).padStart(6, '0').slice(-6));
    var enemyScale = enemiesTotal > 0
      ? Math.max(0, Math.min(1, enemiesRemaining / enemiesTotal))
      : 0;
    var filledWidth = Math.round(64 * enemyScale);
    this.energyFill.scale.x = filledWidth / 64;
    this.energyFill.position.x = 7 + filledWidth / 2;
    this.levelText.setText(String(Math.max(1, level)));
    this.levelText.position.x = GameConfig.WIDTH - this.levelText.textWidth;
    if (lives !== this.lastLives) {
      this.updateLifeIcons(lives);
      this.lastLives = lives;
    }
  }

  updateLifeIcons(lives) {
    this.lifeIcons.forEach(function (icon) {
      this.remove(icon);
      icon.dispose();
    }, this);
    this.lifeIcons.length = 0;

    var spareLives = Math.min(3, Math.max(0, lives - 1));
    for (var index = 0; index < spareLives; index += 1) {
      var icon = new AtlasSprite(GameConfig.SPRITES.PLAYER, GameConfig.COLORS.GREEN);
      icon.setPixelPosition(84 + index * 9, GameConfig.HUD_BOTTOM);
      this.lifeIcons.push(icon);
      this.add(icon);
    }
  }

  dispose() {
    this.scoreText.dispose();
    this.highScoreText.dispose();
    this.energyLabel.dispose();
    this.levelText.dispose();
    this.lifeIcons.forEach(function (icon) {
      icon.dispose();
    });
    this.resources.forEach(function (resource) {
      resource.geometry.dispose();
      resource.material.dispose();
    });
  }
}
