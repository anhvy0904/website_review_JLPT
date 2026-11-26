import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../lib/sound-effects.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

test("sound-effects: calls playCorrectSound and playWrongSound safely in non-browser environment", () => {
  const mod = { exports: {} };
  vm.runInNewContext(compiled, { require, module: mod, exports: mod.exports });
  assert.doesNotThrow(() => {
    mod.exports.playCorrectSound();
    mod.exports.playWrongSound();
  });
});

test("sound-effects: triggers AudioContext oscillators and gain envelopes when browser window is present", () => {
  const oscillatorsCreated = [];
  const gainsCreated = [];

  class MockGainNode {
    constructor() {
      this.gain = {
        value: 1,
        setValueAtTime: (val, time) => { this.gain.value = val; },
        linearRampToValueAtTime: (val, time) => { this.gain.value = val; },
        exponentialRampToValueAtTime: (val, time) => { this.gain.value = val; },
      };
    }
    connect(dest) {}
  }

  class MockOscillatorNode {
    constructor() {
      this.type = "sine";
      this.frequency = {
        value: 440,
        setValueAtTime: (val, time) => { this.frequency.value = val; },
        linearRampToValueAtTime: (val, time) => { this.frequency.value = val; },
      };
      this.started = false;
      this.stopped = false;
      oscillatorsCreated.push(this);
    }
    connect(dest) {}
    start(time) { this.started = true; }
    stop(time) { this.stopped = true; }
  }

  class MockAudioContext {
    constructor() {
      this.state = "running";
      this.currentTime = 0;
      this.destination = {};
    }
    createOscillator() {
      return new MockOscillatorNode();
    }
    createGain() {
      const g = new MockGainNode();
      gainsCreated.push(g);
      return g;
    }
    resume() {
      this.state = "running";
    }
  }

  const mockWindow = {
    AudioContext: MockAudioContext,
  };

  const mod = { exports: {} };
  vm.runInNewContext(compiled, {
    require,
    module: mod,
    exports: mod.exports,
    window: mockWindow,
  });

  // Test Ting Ting (Correct)
  oscillatorsCreated.length = 0;
  gainsCreated.length = 0;
  mod.exports.playCorrectSound();
  assert.ok(oscillatorsCreated.length >= 2, "Should create multiple oscillators for chime and harmonic shimmer");
  assert.ok(oscillatorsCreated.every((o) => o.started && o.stopped), "All oscillators should be started and stopped");

  // Test Boop Boop (Wrong)
  oscillatorsCreated.length = 0;
  gainsCreated.length = 0;
  mod.exports.playWrongSound();
  assert.ok(oscillatorsCreated.length >= 2, "Should create 2 downward tones for wrong feedback");
  assert.ok(oscillatorsCreated.every((o) => o.type === "triangle"), "Wrong feedback should use gentle triangle waves");
});
