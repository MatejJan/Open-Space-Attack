'use strict';

const GameConfig = Object.freeze({
  WIDTH: 128,
  HEIGHT: 208,
  HORIZONTAL_PIXEL_SCALE: 2,
  CANVAS_MARGIN_RATIO: 0.1,
  HUD_TOP: 0,
  HUD_BOTTOM: 200,
  PLAYER_Y: 188,
  PLAYER_SPEED: 48,
  PLAYER_SHOT_SPEED: 144,
  PLAYER_SHOT_COOLDOWN: 0.22,
  ENEMY_SHOT_BASE_SPEED: 24,
  ENEMY_SHOT_LEVEL_STEP: 4,
  FORMATION_TOP: 16,
  FORMATION_SPEED: 5,
  DIVER_SPEED_X: 13,
  DIVER_SPEED_Y: 17,
  MAX_DIVERS: 2,
  ENEMIES_PER_WAVE: 41,
  STARTING_LIVES: 3,
  MAX_LIVES: 9,
  EXTRA_LIFE_SCORE: 5000,
  COLORS: Object.freeze({
    BLACK: 0x000000,
    RED: 0xff0000,
    DIM_RED: 0xff0000,
    GREEN: 0x00ff00,
    DIM_GREEN: 0x00ff00,
    YELLOW: 0xffff00,
    CYAN: 0x00ffff,
    WHITE: 0xffffff
  }),
  SPRITES: Object.freeze({
    TOP_ENEMY: 0,
    MID_ENEMY_A: 1,
    MID_ENEMY_B: 2,
    TOP_DESCENDING_ENEMY: 3,
    MID_DESCENDING_ENEMY: 4,
    PLAYER: 5,
    EXPLOSION: 6,
    SIZE: 8,
    COLUMNS: 7
  })
});

const PixelPatterns = Object.freeze({
  PLAYER_SHOT: Object.freeze([
    '1',
    '1',
    '1',
    '1'
  ]),
  ENEMY_SHOT: Object.freeze([
    '1',
    '1',
    '1',
    '1'
  ])
});
