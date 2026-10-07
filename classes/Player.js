'use strict';

class Player extends AtlasSprite {
  constructor() {
    super(GameConfig.SPRITES.PLAYER, GameConfig.COLORS.CYAN);
    this.worldX = Math.round((GameConfig.WIDTH - this.spriteWidth) / 2);
    this.worldY = GameConfig.PLAYER_Y;
    this.lives = GameConfig.STARTING_LIVES;
    this.shotCooldown = 0;
    this.invulnerability = 0;
    this.setPixelPosition(this.worldX, this.worldY);
  }

  update(deltaTime, input) {
    var direction = 0;
    if (input.isDown('ArrowLeft', 'KeyA')) {
      direction -= 1;
    }
    if (input.isDown('ArrowRight', 'KeyD')) {
      direction += 1;
    }

    this.worldX += direction * GameConfig.PLAYER_SPEED * deltaTime;
    this.worldX = Math.max(1, Math.min(GameConfig.WIDTH - this.spriteWidth - 1, this.worldX));
    this.setPixelPosition(this.worldX, this.worldY);
    this.shotCooldown = Math.max(0, this.shotCooldown - deltaTime);

    if (this.invulnerability > 0) {
      this.invulnerability = Math.max(0, this.invulnerability - deltaTime);
      this.visible = Math.floor(this.invulnerability * 12) % 2 === 0;
    } else {
      this.visible = true;
    }
  }

  canShoot() {
    return this.shotCooldown <= 0 && this.lives > 0;
  }

  markShot() {
    this.shotCooldown = GameConfig.PLAYER_SHOT_COOLDOWN;
  }

  takeDamage() {
    if (this.invulnerability > 0 || this.lives <= 0) {
      return { hit: false, lifeLost: false, gameOver: this.lives <= 0 };
    }

    this.lives -= 1;
    if (this.lives > 0) {
      this.worldX = Math.round((GameConfig.WIDTH - this.spriteWidth) / 2);
      this.setPixelPosition(this.worldX, this.worldY);
    }
    this.invulnerability = this.lives > 0 ? 1.45 : 0;
    return { hit: true, lifeLost: true, gameOver: this.lives <= 0 };
  }

  addLife() {
    this.lives = Math.min(GameConfig.MAX_LIVES, this.lives + 1);
  }

  canBeHit() {
    return this.invulnerability <= 0 && this.lives > 0;
  }
}
