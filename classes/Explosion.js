'use strict';

class Explosion extends AtlasSprite {
  constructor(x, y, color) {
    super(GameConfig.SPRITES.EXPLOSION, color);
    this.age = 0;
    this.duration = 0.36;
    this.setPixelPosition(x - this.spriteWidth / 2, y - this.spriteHeight / 2);
    this.mesh.renderOrder = 8;
  }

  update(deltaTime) {
    this.age += deltaTime;
    return this.age >= this.duration;
  }
}
