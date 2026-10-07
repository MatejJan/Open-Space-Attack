'use strict';

class PixelText extends THREE.Group {
  constructor(text, color) {
    super();
    this.text = null;
    this.color = color;
    this.textWidth = 1;
    this.textHeight = 8;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
    this.geometry = null;
    this.mesh = null;
    PixelText.instances.add(this);
    this.setText(text);
  }

  setText(text) {
    text = String(text).toUpperCase();
    if (text === this.text && this.mesh) {
      return;
    }
    this.text = text;
    this.renderText();
  }

  renderText() {
    this.textWidth = Math.max(1, this.text.length * 8);
    this.canvas.width = this.textWidth;
    this.canvas.height = this.textHeight;
    this.context = this.canvas.getContext('2d');
    this.context.clearRect(0, 0, this.textWidth, this.textHeight);
    this.context.fillStyle = PixelSprite.colorToCss(this.color);

    for (var characterIndex = 0; characterIndex < this.text.length; characterIndex += 1) {
      var character = this.text[characterIndex];
      var atlasIndex = PixelText.FONT_ORDER.indexOf(character);
      if (PixelText.fontPixels && atlasIndex >= 0) {
        for (var atlasY = 0; atlasY < 8; atlasY += 1) {
          for (var atlasX = 0; atlasX < 6; atlasX += 1) {
            var pixelIndex = (atlasY * 216 + atlasIndex * 6 + atlasX) * 4;
            if (PixelText.fontPixels[pixelIndex] > 127) {
              this.context.fillRect(characterIndex * 8 + atlasX, atlasY, 1, 1);
            }
          }
        }
      } else {
        var glyph = PixelText.GLYPHS[character] || PixelText.GLYPHS['?'];
        for (var y = 0; y < glyph.length; y += 1) {
          for (var x = 0; x < glyph[y].length; x += 1) {
            if (glyph[y][x] === '1') {
              this.context.fillRect(characterIndex * 8 + x, y, 1, 1);
            }
          }
        }
      }
    }

    this.texture.needsUpdate = true;
    if (this.geometry) {
      this.geometry.dispose();
      this.remove(this.mesh);
    }
    this.geometry = new THREE.PlaneGeometry(this.textWidth, this.textHeight);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(this.textWidth / 2, this.textHeight / 2, 0);
    this.mesh.renderOrder = 20;
    this.add(this.mesh);
  }

  centerAt(centerX) {
    this.position.x = Math.round(centerX - this.textWidth / 2);
    return this;
  }

  dispose() {
    PixelText.instances.delete(this);
    if (this.geometry) {
      this.geometry.dispose();
    }
    this.material.dispose();
    this.texture.dispose();
  }
}

PixelText.FONT_ORDER = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
PixelText.instances = new Set();
PixelText.fontPixels = null;
PixelText.fontImage = new Image();
PixelText.fontImage.addEventListener('load', function () {
  var atlas = document.createElement('canvas');
  atlas.width = PixelText.fontImage.naturalWidth;
  atlas.height = PixelText.fontImage.naturalHeight;
  var context = atlas.getContext('2d');
  context.drawImage(PixelText.fontImage, 0, 0);
  PixelText.fontPixels = context.getImageData(0, 0, atlas.width, atlas.height).data;
  PixelText.instances.forEach(function (instance) {
    instance.renderText();
  });
});
PixelText.fontImage.src = 'content/font.png';

PixelText.GLYPHS = Object.freeze({
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  'G': ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  ':': ['00000', '00100', '00100', '00000', '00100', '00100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100']
});
