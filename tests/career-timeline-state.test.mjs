import test from "node:test";
import assert from "node:assert/strict";

const stateModule = await import("../src/components/CareerTimeline/careerTimelineState.js").catch(() => null);

test("completes the decorative progress without IntersectionObserver", () => {
  assert.ok(stateModule, "career timeline progress state module should exist");
  assert.equal(
    stateModule.shouldCompleteProgress({ reducedMotion: false, observerAvailable: false }),
    true,
  );
});

test("completes the decorative progress when reduced motion is preferred", () => {
  assert.ok(stateModule, "career timeline progress state module should exist");
  assert.equal(
    stateModule.shouldCompleteProgress({ reducedMotion: true, observerAvailable: true }),
    true,
  );
});

test("uses progressive decoration only when motion and observer are available", () => {
  assert.ok(stateModule, "career timeline progress state module should exist");
  assert.equal(
    stateModule.shouldCompleteProgress({ reducedMotion: false, observerAvailable: true }),
    false,
  );
});

test("disconnects the career observer after registering reached milestones", () => {
  assert.ok(stateModule, "career timeline progress state module should exist");
  const observed = [];
  let callback;
  let disconnected = false;
  const first = { dataset: { careerIndex: "0" } };
  const second = { dataset: { careerIndex: "1" } };

  class CareerObserver {
    constructor(nextCallback, options) {
      callback = nextCallback;
      assert.deepEqual(options, { threshold: 0.2 });
    }

    observe(item) {
      observed.push(item);
    }

    unobserve(item) {
      observed.splice(observed.indexOf(item), 1);
    }

    disconnect() {
      disconnected = true;
    }
  }

  const cleanup = stateModule.observeCareerProgress({
    items: [first, second],
    Observer: CareerObserver,
    onProgress: (indexes) => assert.deepEqual(indexes, [1]),
  });

  assert.deepEqual(observed, [first, second]);
  callback([{ isIntersecting: true, target: second }]);
  assert.deepEqual(observed, [first]);
  cleanup();
  assert.equal(disconnected, true);
});

test("ignores queued progress callbacks after cleanup", () => {
  assert.ok(stateModule, "career timeline progress state module should exist");
  let callback;
  const reached = [];
  const item = { dataset: { careerIndex: "0" } };

  class QueuedCareerObserver {
    constructor(nextCallback) {
      callback = nextCallback;
    }

    observe() {}

    unobserve() {}

    disconnect() {}
  }

  const cleanup = stateModule.observeCareerProgress({
    items: [item],
    Observer: QueuedCareerObserver,
    onProgress: (indexes) => reached.push(...indexes),
  });

  cleanup();
  callback([{ isIntersecting: true, target: item }]);

  assert.deepEqual(reached, []);
});
