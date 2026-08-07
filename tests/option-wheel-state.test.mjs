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

test("uses a flatter wheel on tablet and the full curve from 1024px", async () => {
  const component = await readFile("src/components/OptionWheel/OptionWheel.jsx", "utf8");
  const styles = await readFile("src/components/OptionWheel/OptionWheel.css", "utf8");

  assert.match(component, /--option-wheel-curve/);
  assert.match(styles, /--option-wheel-curve:\s*0\.[0-9]+/);
  assert.match(styles, /@media\s*\(min-width:\s*1024px\)[\s\S]*--option-wheel-curve:\s*1/);
});
