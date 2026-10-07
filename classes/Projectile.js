'use strict';

class Projectile extends PixelSprite {
  constructor(kind, x, y, velocityY, owner) {
    var playerShot = kind === 'player';
    super(
      playerShot ? PixelPatterns.PLAYER_SHOT : PixelPatterns.ENEMY_SHOT,
      playerShot ? GameConfig.COLORS.WHITE : GameConfig.COLORS.RED
    );
    this.kind = kind;
    this.owner = owner || null;
    this.worldX = x;
    this.worldY = y;
    this.velocityY = velocityY;
    this.active = true;
    this.setPixelPosition(this.worldX, this.worldY);
  }

  update(deltaTime) {
    this.worldY += this.velocityY * deltaTime;
    this.setPixelPosition(this.worldX, this.worldY);
    if (this.position.y + this.spriteHeight < 8 || this.position.y > GameConfig.HUD_BOTTOM) {
      this.active = false;
    }
  }
}
