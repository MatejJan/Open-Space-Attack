'use strict';

class EnemyFormation {
  constructor(scene, initialOffset) {
    this.scene = scene;
    this.offsetX = initialOffset === undefined ? -12 : initialOffset;
    this.direction = 1;
    this.enemies = [];
    this.createEnemies();
    this.applyFormationPositions();
  }

  createEnemies() {
    var rowCounts = [2, 5, 7, 9, 9, 9];
    var rowColors = [
      GameConfig.COLORS.YELLOW,
      GameConfig.COLORS.RED,
      GameConfig.COLORS.GREEN,
      GameConfig.COLORS.RED,
      GameConfig.COLORS.RED,
      GameConfig.COLORS.RED
    ];

    rowCounts.forEach(function (count, row) {
      var spacing = row === 0 ? 16 : 8;
      var rowWidth = (count - 1) * spacing + GameConfig.SPRITES.SIZE;
      var startX = Math.round((GameConfig.WIDTH - rowWidth) / 2);
      var slotY = GameConfig.FORMATION_TOP + row * 8;
      for (var column = 0; column < count; column += 1) {
        var enemy = new Enemy(row, column, startX + column * spacing, slotY, rowColors[row]);
        this.enemies.push(enemy);
        this.scene.add(enemy);
      }
    }, this);
  }

  applyFormationPositions() {
    this.enemies.forEach(function (enemy) {
      if (enemy.state === 'formation') {
        enemy.worldX = enemy.slotX + this.offsetX;
        enemy.worldY = enemy.slotY;
        enemy.setPixelPosition(enemy.worldX, enemy.worldY);
      }
    }, this);
  }

  update(deltaTime) {
    this.offsetX += this.direction * GameConfig.FORMATION_SPEED * deltaTime;
    if (this.offsetX >= 14) {
      this.offsetX = 14;
      this.direction = -1;
    } else if (this.offsetX <= -14) {
      this.offsetX = -14;
      this.direction = 1;
    }
    this.applyFormationPositions();
    this.enemies.forEach(function (enemy) {
      enemy.updateDive(deltaTime);
    });
  }

  startRandomDive(targetX) {
    if (this.activeDiverCount() >= GameConfig.MAX_DIVERS) {
      return null;
    }

    var candidates = [];
    for (var row = 0; row < 6; row += 1) {
      var rowEnemies = this.enemies.filter(function (enemy) {
        return enemy.row === row && enemy.state === 'formation';
      }).sort(function (left, right) {
        return left.column - right.column;
      });
      if (rowEnemies.length > 0) {
        candidates.push(rowEnemies[0]);
        if (rowEnemies.length > 1) {
          candidates.push(rowEnemies[rowEnemies.length - 1]);
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }
    var enemy = candidates[Math.floor(Math.random() * candidates.length)];
    return enemy.beginDive(targetX) ? enemy : null;
  }

  activeDiverCount() {
    return this.enemies.reduce(function (count, enemy) {
      return count + (enemy.state === 'diving' ? 1 : 0);
    }, 0);
  }

  livingEnemies() {
    return this.enemies.filter(function (enemy) {
      return enemy.state !== 'dead';
    });
  }

  isCleared() {
    return this.livingEnemies().length === 0;
  }

  dispose() {
    this.enemies.forEach(function (enemy) {
      this.scene.remove(enemy);
      enemy.dispose();
    }, this);
    this.enemies.length = 0;
  }
}
