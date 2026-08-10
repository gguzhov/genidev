import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("moves through wheel options with arrow keys and stays within bounds", async () => {
  const { getNextOptionIndex } = await import(
    "../src/components/OptionWheel/optionWheelState.js"
  );

  assert.equal(getNextOptionIndex(0, "ArrowDown", 4), 1);
  assert.equal(getNextOptionIndex(1, "ArrowRight", 4), 2);
  assert.equal(getNextOptionIndex(2, "ArrowUp", 4), 1);
  assert.equal(getNextOptionIndex(1, "ArrowLeft", 4), 0);
  assert.equal(getNextOptionIndex(0, "ArrowUp", 4), 0);
  assert.equal(getNextOptionIndex(3, "ArrowDown", 4), 3);
  assert.equal(getNextOptionIndex(2, "Escape", 4), null);
});

test("captures wheel movement only while another option exists in that direction", async () => {
  const { shouldCaptureWheel } = await import(
    "../src/components/OptionWheel/optionWheelState.js"
  );

  assert.equal(shouldCaptureWheel(0, -12, 4), false);
  assert.equal(shouldCaptureWheel(0, 12, 4), true);
  assert.equal(shouldCaptureWheel(2, -12, 4), true);
  assert.equal(shouldCaptureWheel(3, 12, 4), false);
  assert.equal(shouldCaptureWheel(2.7, 12, 4), true);
  assert.equal(shouldCaptureWheel(0.3, -12, 4), true);
  assert.equal(shouldCaptureWheel(1, 0, 4), false);
});

test("turns one page-mode wheel tick into meaningful bounded movement", async () => {
  const { getWheelInteraction, normalizeWheelDelta } = await import(
    "../src/components/OptionWheel/optionWheelState.js"
  );

  assert.equal(normalizeWheelDelta(12, 0, 410), 12);
  assert.equal(normalizeWheelDelta(2, 1, 410), 48);
  assert.equal(normalizeWheelDelta(1, 2, 410), 410);
  assert.deepEqual(
    getWheelInteraction({
      target: 1,
      deltaY: 1,
      deltaMode: 2,
      count: 4,
      rowHeight: 68,
      pageHeight: 410,
    }),
    { capture: true, nextTarget: 2 },
  );
});

test("releases page-mode wheel scrolling at the matching boundary", async () => {
  const { getWheelInteraction } = await import(
    "../src/components/OptionWheel/optionWheelState.js"
  );

  assert.deepEqual(
    getWheelInteraction({
      target: 3,
      deltaY: 1,
      deltaMode: 2,
      count: 4,
      rowHeight: 68,
      pageHeight: 410,
    }),
    { capture: false, nextTarget: 3 },
  );
  assert.deepEqual(
    getWheelInteraction({
      target: 0,
      deltaY: -1,
      deltaMode: 2,
      count: 4,
      rowHeight: 68,
      pageHeight: 410,
    }),
    { capture: false, nextTarget: 0 },
  );
});

test("uses a flatter wheel on tablet and the full curve from 1024px", async () => {
  const component = await readFile("src/components/OptionWheel/OptionWheel.jsx", "utf8");
  const styles = await readFile("src/components/OptionWheel/OptionWheel.css", "utf8");

  assert.match(component, /--option-wheel-curve/);
  assert.match(styles, /--option-wheel-curve:\s*0\.[0-9]+/);
  assert.match(styles, /@media\s*\(min-width:\s*1024px\)[\s\S]*--option-wheel-curve:\s*1/);
});

test("captures the initiating pointer immediately and settles a click lifecycle", async () => {
  const { beginPointerInteraction, endPointerInteraction, movePointerInteraction } =
    await import("../src/components/OptionWheel/optionWheelState.js");
  const capturedPointers = [];

  const started = beginPointerInteraction(
    null,
    { pointerId: 17, clientY: 120 },
    1,
    (pointerId) => capturedPointers.push(pointerId),
  );

  assert.deepEqual(capturedPointers, [17]);
  assert.deepEqual(started, {
    pointerId: 17,
    startY: 120,
    startTarget: 1,
    moved: false,
  });
  assert.strictEqual(
    movePointerInteraction(started, { pointerId: 18, clientY: 180 }),
    started,
    "A second pointer must not take over the interaction",
  );

  const ended = endPointerInteraction(started, 17);
  assert.deepEqual(ended, {
    interaction: null,
    handled: true,
    pointerId: 17,
    shouldSnap: false,
  });
});

test("cleans up moved pointer interactions once on cancel or lost capture", async () => {
  const { beginPointerInteraction, endPointerInteraction, movePointerInteraction } =
    await import("../src/components/OptionWheel/optionWheelState.js");

  for (const endReason of ["pointercancel", "lostpointercapture"]) {
    const started = beginPointerInteraction(
      null,
      { pointerId: 31, clientY: 80 },
      2,
      () => {},
    );
    const moved = movePointerInteraction(started, { pointerId: 31, clientY: 91 });
    assert.equal(moved.moved, true, `${endReason} setup must classify a drag`);

    const ended = endPointerInteraction(moved, 31);
    assert.deepEqual(ended, {
      interaction: null,
      handled: true,
      pointerId: 31,
      shouldSnap: true,
    });
    assert.deepEqual(endPointerInteraction(ended.interaction, 31), {
      interaction: null,
      handled: false,
      pointerId: null,
      shouldSnap: false,
    });
  }
});

test("routes every production pointer completion event through the same cleanup", async () => {
  const component = await readFile("src/components/OptionWheel/OptionWheel.jsx", "utf8");

  assert.match(component, /beginPointerInteraction/);
  assert.match(component, /setPointerCapture/);
  assert.match(component, /onPointerUp=\{handlePointerEnd\}/);
  assert.match(component, /onPointerCancel=\{handlePointerEnd\}/);
  assert.match(component, /onLostPointerCapture=\{handlePointerEnd\}/);
});

test("derives internal relationship ids instead of reusing fixed DOM ids", async () => {
  const wheel = await readFile("src/components/OptionWheel/OptionWheel.jsx", "utf8");
  const selector = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");

  assert.match(wheel, /useId/);
  assert.doesNotMatch(wheel, /problem-wheel-option-/);
  assert.match(selector, /useId/);
  assert.doesNotMatch(selector, /id="problems-title"|id="problem-description"/);
});
