'use strict';

class AtlasSprite extends THREE.Group {
  constructor(spriteIndex, color) {
    super();
    this.spriteIndex = spriteIndex;
    this.color = color;
    this.spriteWidth = GameConfig.SPRITES.SIZE;
    this.spriteHeight = GameConfig.SPRITES.SIZE;
    this.geometry = new THREE.PlaneGeometry(this.spriteWidth, this.spriteHeight);
    this.material = new THREE.MeshBasicMaterial({
      map: AtlasSprite.getTexture(),
      color: color,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(this.spriteWidth / 2, this.spriteHeight / 2, 0);
    this.mesh.renderOrder = 4;
    this.add(this.mesh);
    AtlasSprite.instances.add(this);
    this.setSpriteIndex(spriteIndex);
  }

  static getTexture() {
    if (!AtlasSprite.texture) {
      AtlasSprite.texture = new THREE.TextureLoader().load('content/sprites.png', function (texture) {
        var expectedWidth = GameConfig.SPRITES.SIZE * GameConfig.SPRITES.COLUMNS;
        var width = texture.image.naturalWidth;
        var height = texture.image.naturalHeight;
        if (height !== GameConfig.SPRITES.SIZE || width % GameConfig.SPRITES.SIZE !== 0) {
          console.error(
            'Sprite atlas must be ' + expectedWidth + '×' + GameConfig.SPRITES.SIZE +
            ' pixels with 8×8 cells; received ' + width + '×' + height + '.'
          );
          return;
        }

        AtlasSprite.atlasColumns = width / GameConfig.SPRITES.SIZE;
        if (AtlasSprite.atlasColumns !== GameConfig.SPRITES.COLUMNS) {
          var message = 'Sprite atlas has ' + AtlasSprite.atlasColumns +
            ' cells; expected ' + GameConfig.SPRITES.COLUMNS + '.';
          if (AtlasSprite.atlasColumns === 6) {
            console.warn(message + ' Using the legacy shared descending-enemy cell.');
          } else {
            console.error(message);
          }
        }
        AtlasSprite.instances.forEach(function (instance) {
          instance.updateTextureCoordinates();
        });
      });
      AtlasSprite.texture.flipY = false;
      AtlasSprite.texture.magFilter = THREE.NearestFilter;
      AtlasSprite.texture.minFilter = THREE.NearestFilter;
      AtlasSprite.texture.generateMipmaps = false;
    }
    return AtlasSprite.texture;
  }

  setSpriteIndex(spriteIndex) {
    this.spriteIndex = spriteIndex;
    this.updateTextureCoordinates();
  }

  updateTextureCoordinates() {
    var atlasIndex = AtlasSprite.resolveAtlasIndex(this.spriteIndex);
    var columns = AtlasSprite.atlasColumns;
    var uv = this.geometry.attributes.uv;
    var positions = this.geometry.attributes.position;
    for (var index = 0; index < uv.count; index += 1) {
      var atlasU = positions.getX(index) < 0 ? 0 : 1;
      uv.setX(index, (atlasIndex + atlasU) / columns);
    }
    uv.needsUpdate = true;
  }

  static resolveAtlasIndex(spriteIndex) {
    if (AtlasSprite.atlasColumns === 6) {
      return [0, 1, 2, 3, 3, 4, 5][spriteIndex];
    }
    return spriteIndex;
  }

  setPixelPosition(x, y) {
    this.position.x = Math.round(x);
    this.position.y = Math.round(y);
  }

  getBounds() {
    return {
      left: this.position.x,
      top: this.position.y,
      right: this.position.x + this.spriteWidth,
      bottom: this.position.y + this.spriteHeight
    };
  }

  dispose() {
    AtlasSprite.instances.delete(this);
    this.geometry.dispose();
    this.material.dispose();
  }
}

AtlasSprite.texture = null;
AtlasSprite.atlasColumns = GameConfig.SPRITES.COLUMNS;
AtlasSprite.instances = new Set();
