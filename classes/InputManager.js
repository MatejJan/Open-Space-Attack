'use strict';

class InputManager {
  constructor(target) {
    this.target = target || window;
    this.downKeys = new Set();
    this.pressedKeys = new Set();
    this.handledCodes = new Set(['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'Enter', 'KeyP', 'KeyC']);
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    this.onBlur = this.clear.bind(this);
    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  handleKeyDown(event) {
    if (this.handledCodes.has(event.code)) {
      event.preventDefault();
    }
    if (!this.downKeys.has(event.code)) {
      this.pressedKeys.add(event.code);
    }
    this.downKeys.add(event.code);
  }

  handleKeyUp(event) {
    if (this.handledCodes.has(event.code)) {
      event.preventDefault();
    }
    this.downKeys.delete(event.code);
  }

  isDown() {
    for (var index = 0; index < arguments.length; index += 1) {
      if (this.downKeys.has(arguments[index])) {
        return true;
      }
    }
    return false;
  }

  consume() {
    for (var index = 0; index < arguments.length; index += 1) {
      var code = arguments[index];
      if (this.pressedKeys.has(code)) {
        this.pressedKeys.delete(code);
        return true;
      }
    }
    return false;
  }

  pulse(code) {
    this.pressedKeys.add(code);
  }

  endFrame() {
    this.pressedKeys.clear();
  }

  clear() {
    this.downKeys.clear();
    this.pressedKeys.clear();
  }
}
