import test from "node:test";
import assert from "node:assert/strict";

const stateModule = await import("../src/components/CareerTimeline/careerTimelineState.js").catch(() => null);

test("reveals every career event without IntersectionObserver", () => {
  assert.ok(stateModule, "career timeline reveal state module should exist");
  assert.equal(
    stateModule.shouldRevealAll({ reducedMotion: false, observerAvailable: false }),
    true,
  );
});

test("reveals every career event when reduced motion is preferred", () => {
  assert.ok(stateModule, "career timeline reveal state module should exist");
  assert.equal(
    stateModule.shouldRevealAll({ reducedMotion: true, observerAvailable: true }),
    true,
  );
});

test("uses per-item reveal only when motion and observer are available", () => {
  assert.ok(stateModule, "career timeline reveal state module should exist");
  assert.equal(
    stateModule.shouldRevealAll({ reducedMotion: false, observerAvailable: true }),
    false,
  );
});

test("disconnects the career observer after registering visible events", () => {
  assert.ok(stateModule, "career timeline reveal state module should exist");
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

  const cleanup = stateModule.observeCareerItems({
    items: [first, second],
    Observer: CareerObserver,
    onReveal: (indexes) => assert.deepEqual(indexes, [1]),
  });

  assert.deepEqual(observed, [first, second]);
  callback([{ isIntersecting: true, target: second }]);
  assert.deepEqual(observed, [first]);
  cleanup();
  assert.equal(disconnected, true);
});
