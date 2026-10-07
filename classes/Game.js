'use strict';

class Game {
  constructor(stage, instructions) {
    this.stage = stage;
    this.instructions = instructions;
    this.input = new InputManager(window);
    this.audio = new AudioManager();
    this.state = 'title';
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.level = 1;
    this.nextExtraLife = GameConfig.EXTRA_LIFE_SCORE;
    this.lastFrameTime = performance.now();
    this.diveTimer = 1.2;
    this.waveTimer = 0;
    this.overlayTexts = [];
    this.messageText = null;
    this.messageTimer = 0;
    this.projectiles = [];
    this.explosions = [];
    this.player = null;
    this.formation = null;

    this.createRenderer();
    this.createScene();
    this.bindEvents();
    this.resize();
    this.enterTitle();
    this.render();

    this.frame = this.frame.bind(this);
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio || 1));
    this.renderer.setSize(
      GameConfig.WIDTH * GameConfig.HORIZONTAL_PIXEL_SCALE,
      GameConfig.HEIGHT,
      false
    );
    this.renderer.setClearColor(GameConfig.COLORS.BLACK, 1);
    if ('outputEncoding' in this.renderer) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    this.renderer.domElement.setAttribute('role', 'img');
    this.renderer.domElement.setAttribute('aria-label', 'Open Space Attack. Use arrow keys or A and D to move, Space to fire, and C to toggle the CRT filter.');
    this.renderer.domElement.tabIndex = 0;
    this.stage.appendChild(this.renderer.domElement);

    this.renderTarget = new THREE.WebGLRenderTarget(GameConfig.WIDTH, GameConfig.HEIGHT, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false
    });
    this.renderTarget.texture.generateMipmaps = false;

    this.presentationScene = new THREE.Scene();
    this.presentationCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    this.presentationCamera.position.z = 1;
    this.presentationGeometry = new THREE.PlaneGeometry(2, 2);
    this.crtFilter = new CrtFilter(
      this.renderTarget.texture,
      GameConfig.WIDTH,
      GameConfig.HEIGHT
    );
    this.presentationMaterial = this.crtFilter.material;
    this.presentationQuad = new THREE.Mesh(this.presentationGeometry, this.presentationMaterial);
    this.presentationScene.add(this.presentationQuad);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GameConfig.COLORS.BLACK);
    this.camera = new THREE.OrthographicCamera(
      0,
      GameConfig.WIDTH,
      0,
      GameConfig.HEIGHT,
      0.1,
      100
    );
    this.camera.position.z = 10;

    this.starfield = new Starfield();
    this.scene.add(this.starfield);
    this.hud = new GameHud();
    this.scene.add(this.hud);
  }

  bindEvents() {
    this.onResize = this.resize.bind(this);
    window.addEventListener('resize', this.onResize);

    var game = this;
    this.renderer.domElement.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      game.renderer.domElement.focus({ preventScroll: true });
      game.audio.unlock();
      game.input.pulse('Space');
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && game.state === 'playing') {
        game.pause();
      }
    });
  }

  resize() {
    var marginMultiplier = 1 - GameConfig.CANVAS_MARGIN_RATIO * 2;
    var availableWidth = Math.max(1, this.stage.clientWidth * marginMultiplier);
    var availableHeight = Math.max(1, this.stage.clientHeight * marginMultiplier);
    var baseWidth = GameConfig.WIDTH * GameConfig.HORIZONTAL_PIXEL_SCALE;
    var scale = Math.floor(Math.min(
      availableWidth / baseWidth,
      availableHeight / GameConfig.HEIGHT
    ));
    scale = Math.max(1, scale);
    var displayWidth = baseWidth * scale;
    var displayHeight = GameConfig.HEIGHT * scale;
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio || 1));
    this.renderer.setSize(displayWidth, displayHeight, false);
    this.renderer.domElement.style.width = displayWidth + 'px';
    this.renderer.domElement.style.height = displayHeight + 'px';
    this.crtFilter.setOutputResolution(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  enterTitle() {
    this.cleanupGameplay();
    this.clearOverlayTexts();
    this.state = 'title';
    this.score = 0;
    this.level = 1;
    this.formation = new EnemyFormation(this.scene, -13);
    this.updateHud();
    this.addOverlayText('SPACE ATTACK', GameConfig.COLORS.RED, 88);
    this.addOverlayText('A TRIBUTE', GameConfig.COLORS.GREEN, 104);
    this.addOverlayText('PRESS FIRE', GameConfig.COLORS.YELLOW, 120);
  }

  startGame() {
    this.audio.unlock();
    this.cleanupGameplay();
    this.clearOverlayTexts();
    this.score = 0;
    this.level = 1;
    this.nextExtraLife = GameConfig.EXTRA_LIFE_SCORE;
    this.diveTimer = 1.25;
    this.player = new Player();
    this.scene.add(this.player);
    this.formation = new EnemyFormation(this.scene, -12);
    this.state = 'playing';
    this.updateHud();
    this.setTemporaryMessage('WAVE 1', GameConfig.COLORS.GREEN, 0.9);
    this.audio.wave();
  }

  cleanupGameplay() {
    if (this.formation) {
      this.formation.dispose();
      this.formation = null;
    }
    if (this.player) {
      this.scene.remove(this.player);
      this.player.dispose();
      this.player = null;
    }
    this.clearProjectiles();
    this.explosions.forEach(function (explosion) {
      this.scene.remove(explosion);
      explosion.dispose();
    }, this);
    this.explosions.length = 0;
  }

  addOverlayText(text, color, y) {
    var pixelText = new PixelText(text, color);
    pixelText.centerAt(GameConfig.WIDTH / 2);
    pixelText.position.y = y;
    this.scene.add(pixelText);
    this.overlayTexts.push(pixelText);
    return pixelText;
  }

  removeOverlayText(pixelText) {
    if (!pixelText) {
      return;
    }
    var index = this.overlayTexts.indexOf(pixelText);
    if (index >= 0) {
      this.overlayTexts.splice(index, 1);
    }
    this.scene.remove(pixelText);
    pixelText.dispose();
    if (this.messageText === pixelText) {
      this.messageText = null;
      this.messageTimer = 0;
    }
  }

  clearOverlayTexts() {
    this.overlayTexts.slice().forEach(function (text) {
      this.removeOverlayText(text);
    }, this);
    this.overlayTexts.length = 0;
    this.messageText = null;
    this.messageTimer = 0;
  }

  setTemporaryMessage(text, color, duration) {
    if (this.messageText) {
      this.removeOverlayText(this.messageText);
    }
    this.messageText = this.addOverlayText(text, color, 104);
    this.messageTimer = duration;
  }

  updateTemporaryMessage(deltaTime) {
    if (!this.messageText) {
      return;
    }
    this.messageTimer -= deltaTime;
    if (this.messageTimer <= 0) {
      this.removeOverlayText(this.messageText);
    }
  }

  frame(frameTime) {
    var deltaTime = Math.min(0.05, Math.max(0, (frameTime - this.lastFrameTime) / 1000));
    this.lastFrameTime = frameTime;
    this.update(deltaTime);
    this.render();
    this.input.endFrame();
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  update(deltaTime) {
    if (this.input.consume('KeyC')) {
      this.toggleCrtFilter();
    }

    if (this.state === 'paused') {
      if (this.input.consume('KeyP')) {
        this.resume();
      }
      return;
    }

    if (this.state === 'playing' && this.input.consume('KeyP')) {
      this.pause();
      return;
    }

    if (this.state === 'title') {
      if (this.input.consume('Space', 'Enter')) {
        this.startGame();
      }
      return;
    }

    if (this.state === 'gameover') {
      this.updateExplosions(deltaTime);
      if (this.input.consume('Space', 'Enter')) {
        this.startGame();
      }
      return;
    }

    if (this.state === 'wave') {
      this.updateExplosions(deltaTime);
      this.waveTimer -= deltaTime;
      if (this.waveTimer <= 0) {
        this.clearOverlayTexts();
        this.formation = new EnemyFormation(this.scene, -12);
        this.diveTimer = 1.25;
        this.state = 'playing';
        this.updateHud();
      }
      return;
    }

    this.updatePlaying(deltaTime);
  }

  toggleCrtFilter() {
    var enabled = this.crtFilter.toggle();
    var status = this.instructions.querySelector('#crt-status');
    var control = this.instructions.querySelector('#crt-control');
    if (status) {
      status.textContent = enabled ? 'On' : 'Off';
    }
    if (control) {
      control.setAttribute('aria-label', 'CRT filter ' + (enabled ? 'on' : 'off') + '. Press C to toggle.');
    }
  }

  updatePlaying(deltaTime) {
    this.updateTemporaryMessage(deltaTime);
    this.player.update(deltaTime, this.input);
    this.formation.update(deltaTime);

    this.diveTimer -= deltaTime;
    if (this.diveTimer <= 0) {
      var diver = this.formation.startRandomDive(this.player.position.x + this.player.spriteWidth / 2);
      this.diveTimer = diver ? 1.35 + Math.random() * 1.55 : 0.35;
    }

    if (this.input.isDown('Space') || this.input.consume('Space')) {
      this.firePlayerShot();
    }

    this.fireEnemyShots();
    this.updateProjectiles(deltaTime);
    if (this.state !== 'playing') {
      return;
    }
    this.checkDiverCollisions();
    this.updateExplosions(deltaTime);

    this.updateHud();
    if (this.formation.isCleared()) {
      this.beginNextWave();
    }
  }

  firePlayerShot() {
    var existingShot = this.projectiles.some(function (projectile) {
      return projectile.kind === 'player' && projectile.active;
    });
    if (!this.player.canShoot() || existingShot) {
      return;
    }

    this.player.markShot();
    var x = this.player.position.x + Math.floor(this.player.spriteWidth / 2);
    var projectile = new Projectile(
      'player',
      x,
      this.player.position.y - PixelPatterns.PLAYER_SHOT.length,
      -GameConfig.PLAYER_SHOT_SPEED,
      this.player
    );
    this.projectiles.push(projectile);
    this.scene.add(projectile);
    this.audio.shoot();
  }

  fireEnemyShots() {
    var speed = GameConfig.ENEMY_SHOT_BASE_SPEED + (this.level - 1) * GameConfig.ENEMY_SHOT_LEVEL_STEP;
    this.formation.enemies.forEach(function (enemy) {
      if (enemy.state !== 'diving' || enemy.projectile || enemy.fireDelay > 0 || enemy.position.y >= GameConfig.PLAYER_Y - 10) {
        return;
      }
      var x = enemy.position.x + Math.floor(enemy.spriteWidth / 2) - 1;
      var projectile = new Projectile('enemy', x, enemy.position.y + enemy.spriteHeight, speed, enemy);
      enemy.projectile = projectile;
      this.projectiles.push(projectile);
      this.scene.add(projectile);
      this.audio.enemyShoot();
    }, this);
  }

  updateProjectiles(deltaTime) {
    for (var index = this.projectiles.length - 1; index >= 0; index -= 1) {
      var projectile = this.projectiles[index];
      projectile.update(deltaTime);
      if (!projectile.active) {
        this.removeProjectile(index);
        continue;
      }

      if (projectile.kind === 'player') {
        var enemies = this.formation.livingEnemies();
        for (var enemyIndex = 0; enemyIndex < enemies.length; enemyIndex += 1) {
          var enemy = enemies[enemyIndex];
          if (Game.boundsOverlap(projectile.getBounds(), enemy.getBounds())) {
            var value = enemy.getScoreValue();
            enemy.destroyEnemy();
            this.addScore(value);
            this.audio.explosion();
            this.removeProjectile(index);
            break;
          }
        }
      } else if (this.player && Game.boundsOverlap(projectile.getBounds(), this.player.getBounds())) {
        this.removeProjectile(index);
        this.damagePlayer();
        if (this.state !== 'playing') {
          return;
        }
      }
    }
  }

  checkDiverCollisions() {
    if (!this.player.canBeHit()) {
      return;
    }
    var playerBounds = this.player.getBounds();
    var divers = this.formation.enemies.filter(function (enemy) {
      return enemy.state === 'diving';
    });
    for (var index = 0; index < divers.length; index += 1) {
      var enemy = divers[index];
      if (Game.boundsOverlap(playerBounds, enemy.getBounds())) {
        enemy.returnToFormation();
        this.damagePlayer();
        return;
      }
    }
  }

  damagePlayer() {
    var explosionX = this.player.position.x + this.player.spriteWidth / 2;
    var explosionY = this.player.position.y + this.player.spriteHeight / 2;
    var result = this.player.takeDamage();
    if (!result.hit) {
      return;
    }
    this.addExplosion(
      explosionX,
      explosionY,
      GameConfig.COLORS.CYAN
    );
    this.audio.playerHit();
    if (result.lifeLost) {
      this.clearEnemyProjectiles();
    }
    this.updateHud();
    if (result.gameOver) {
      this.endGame();
    }
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    while (this.score >= this.nextExtraLife) {
      this.player.addLife();
      this.nextExtraLife += GameConfig.EXTRA_LIFE_SCORE;
      this.setTemporaryMessage('EXTRA LIFE', GameConfig.COLORS.YELLOW, 1.25);
      this.audio.extraLife();
    }
    this.updateHud();
  }

  updateHud() {
    var enemiesRemaining = this.formation ? this.formation.livingEnemies().length : 0;
    var lives = this.player ? this.player.lives : 0;
    this.hud.update(
      this.score,
      this.highScore,
      enemiesRemaining,
      GameConfig.ENEMIES_PER_WAVE,
      lives,
      this.level
    );
  }

  addExplosion(x, y, color) {
    var explosion = new Explosion(x, y, color);
    this.explosions.push(explosion);
    this.scene.add(explosion);
  }

  updateExplosions(deltaTime) {
    for (var index = this.explosions.length - 1; index >= 0; index -= 1) {
      var explosion = this.explosions[index];
      if (explosion.update(deltaTime)) {
        this.scene.remove(explosion);
        explosion.dispose();
        this.explosions.splice(index, 1);
      }
    }
  }

  removeProjectile(index) {
    var projectile = this.projectiles[index];
    if (!projectile) {
      return;
    }
    if (projectile.owner instanceof Enemy && projectile.owner.projectile === projectile) {
      projectile.owner.projectile = null;
    }
    this.scene.remove(projectile);
    projectile.dispose();
    this.projectiles.splice(index, 1);
  }

  clearEnemyProjectiles() {
    for (var index = this.projectiles.length - 1; index >= 0; index -= 1) {
      if (this.projectiles[index].kind === 'enemy') {
        this.removeProjectile(index);
      }
    }
  }

  clearProjectiles() {
    for (var index = this.projectiles.length - 1; index >= 0; index -= 1) {
      this.removeProjectile(index);
    }
  }

  beginNextWave() {
    this.clearProjectiles();
    this.formation.dispose();
    this.formation = null;
    this.level += 1;
    this.state = 'wave';
    this.waveTimer = 1.25;
    this.updateHud();
    this.clearOverlayTexts();
    this.addOverlayText('WAVE ' + this.level, GameConfig.COLORS.GREEN, 104);
    this.audio.wave();
  }

  endGame() {
    this.state = 'gameover';
    this.clearProjectiles();
    this.player.visible = false;
    this.saveHighScore();
    this.clearOverlayTexts();
    this.addOverlayText('GAME OVER', GameConfig.COLORS.YELLOW, 105);
    this.addOverlayText('PRESS FIRE', GameConfig.COLORS.RED, 121);
  }

  pause() {
    if (this.state !== 'playing') {
      return;
    }
    this.state = 'paused';
    this.setTemporaryMessage('PAUSED', GameConfig.COLORS.YELLOW, Infinity);
  }

  resume() {
    if (this.state !== 'paused') {
      return;
    }
    if (this.messageText) {
      this.removeOverlayText(this.messageText);
    }
    this.state = 'playing';
    this.lastFrameTime = performance.now();
  }

  render() {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.presentationScene, this.presentationCamera);
  }

  loadHighScore() {
    try {
      var value = Number.parseInt(window.localStorage.getItem('open-space-attack-high-score'), 10);
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    } catch (reason) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      window.localStorage.setItem('open-space-attack-high-score', String(this.highScore));
    } catch (reason) {
      // Storage can be unavailable in private browsing; the in-memory score still works.
    }
  }

  static boundsOverlap(left, right) {
    return left.left < right.right &&
      left.right > right.left &&
      left.top < right.bottom &&
      left.bottom > right.top;
  }
}
