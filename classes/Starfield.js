'use strict';

class Starfield extends THREE.Group {
  constructor() {
    super();
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: GameConfig.COLORS.YELLOW,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });

    Starfield.POSITIONS.forEach(function (position) {
      var star = new THREE.Mesh(this.geometry, this.material);
      star.position.set(position[0] + 0.5, position[1] + 0.5, 0);
      star.renderOrder = 0;
      this.add(star);
    }, this);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

Starfield.POSITIONS = Object.freeze([
  [18, 75], [42, 72], [93, 76], [116, 68], [7, 91], [57, 87], [109, 96],
  [25, 104], [76, 101], [122, 113], [13, 119], [46, 124], [99, 119],
  [65, 135], [117, 139], [5, 145], [34, 151], [87, 148], [108, 158],
  [18, 165], [55, 171], [80, 164], [124, 177], [8, 187], [41, 182],
  [104, 187], [72, 194], [119, 196]
]);
