'use strict';

class Enemy extends AtlasSprite {
  constructor(row, column, slotX, slotY, color) {
    var normalSprite = row === 0
      ? GameConfig.SPRITES.TOP_ENEMY
      : (row === 2 ? GameConfig.SPRITES.MID_ENEMY_B : GameConfig.SPRITES.MID_ENEMY_A);
    super(normalSprite, color);
    this.row = row;
    this.column = column;
    this.slotX = slotX;
    this.slotY = slotY;
    this.normalSprite = normalSprite;
    this.descendingSprite = row === 0
      ? GameConfig.SPRITES.TOP_DESCENDING_ENEMY
      : GameConfig.SPRITES.MID_DESCENDING_ENEMY;
    this.state = 'formation';
    this.worldX = slotX;
    this.worldY = slotY;
    this.velocityX = 0;
    this.velocityY = GameConfig.DIVER_SPEED_Y;
    this.fireDelay = 0;
    this.projectile = null;
    this.setPixelPosition(slotX, slotY);
  }

  beginDive(targetX) {
    if (this.state !== 'formation') {
      return false;
    }
    this.state = 'diving';
    this.setSpriteIndex(this.descendingSprite);
    this.worldX = this.position.x;
    this.worldY = this.position.y;
    var centerX = this.worldX + this.spriteWidth / 2;
    var direction = Math.sign(targetX - centerX);
    if (direction === 0) {
      direction = Math.random() < 0.5 ? -1 : 1;
    }
    this.velocityX = direction * GameConfig.DIVER_SPEED_X;
    this.fireDelay = 0.28 + Math.random() * 0.38;
    return true;
  }

  updateDive(deltaTime) {
    if (this.state !== 'diving') {
      return false;
    }
    this.fireDelay -= deltaTime;
    this.worldX += this.velocityX * deltaTime;
    this.worldY += this.velocityY * deltaTime;

    var rightEdge = GameConfig.WIDTH - this.spriteWidth - 1;
    if (this.worldX <= 1) {
      this.worldX = 1;
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.worldX >= rightEdge) {
      this.worldX = rightEdge;
      this.velocityX = -Math.abs(this.velocityX);
    }

    this.setPixelPosition(this.worldX, this.worldY);
    if (this.worldY > GameConfig.PLAYER_Y + 7) {
      this.returnToFormation();
      return true;
    }
    return false;
  }

  returnToFormation() {
    if (this.state === 'dead') {
      return;
    }
    this.state = 'formation';
    this.setSpriteIndex(this.normalSprite);
    this.worldY = this.slotY;
  }

  destroyEnemy() {
    this.state = 'dead';
    this.visible = false;
  }

  getScoreValue() {
    var formationScores = [60, 50, 40, 30, 30, 30];
    var divingScores = [200, 170, 140, 110, 80, 60];
    return this.state === 'diving' ? divingScores[this.row] : formationScores[this.row];
  }
}
