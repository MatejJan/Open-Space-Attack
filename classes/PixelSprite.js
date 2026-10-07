'use strict';

class PixelSprite extends THREE.Group {
  constructor(pattern, color) {
    super();
    this.pattern = pattern;
    this.color = color;
    this.spriteWidth = PixelSprite.patternWidth(pattern);
    this.spriteHeight = pattern.length;
    this.geometry = new THREE.PlaneGeometry(this.spriteWidth, this.spriteHeight);
    this.material = new THREE.MeshBasicMaterial({
      map: PixelSprite.getTexture(pattern, color),
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
  }

  static patternWidth(pattern) {
    return pattern.reduce(function (width, row) {
      return Math.max(width, row.length);
    }, 1);
  }

  static getTexture(pattern, color) {
    var key = pattern.join('/') + ':' + color;
    var cached = PixelSprite.textureCache.get(key);
    if (cached) {
      return cached;
    }

    var width = PixelSprite.patternWidth(pattern);
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = pattern.length;
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, width, pattern.length);
    context.fillStyle = PixelSprite.colorToCss(color);

    pattern.forEach(function (row, y) {
      for (var x = 0; x < row.length; x += 1) {
        if (row[x] !== '0' && row[x] !== ' ') {
          context.fillRect(x, y, 1, 1);
        }
      }
    });

    var texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    PixelSprite.textureCache.set(key, texture);
    return texture;
  }

  static colorToCss(color) {
    return '#' + color.toString(16).padStart(6, '0');
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
    this.geometry.dispose();
    this.material.dispose();
  }
}

PixelSprite.textureCache = new Map();
