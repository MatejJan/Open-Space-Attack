'use strict';

class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
  }

  unlock() {
    if (!this.context) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.11;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  tone(startFrequency, endFrequency, duration, type, volume) {
    if (!this.context || !this.master) {
      return;
    }
    var now = this.context.currentTime;
    var oscillator = this.context.createOscillator();
    var gain = this.context.createGain();
    oscillator.type = type || 'square';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
    gain.gain.setValueAtTime(volume || 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  shoot() {
    this.tone(720, 270, 0.08, 'square', 0.38);
  }

  enemyShoot() {
    this.tone(210, 120, 0.09, 'sawtooth', 0.2);
  }

  explosion() {
    this.tone(130, 32, 0.22, 'sawtooth', 0.65);
  }

  playerHit() {
    this.tone(330, 42, 0.42, 'square', 0.7);
  }

  extraLife() {
    this.tone(440, 880, 0.12, 'square', 0.45);
    var manager = this;
    window.setTimeout(function () {
      manager.tone(660, 1320, 0.14, 'square', 0.4);
    }, 110);
  }

  wave() {
    this.tone(180, 520, 0.25, 'square', 0.35);
  }
}
