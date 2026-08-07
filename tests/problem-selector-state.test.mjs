import test from "node:test";
import assert from "node:assert/strict";

test("uses one bounded selectedIndex transition for mobile and desktop input", async () => {
  const { transitionSelectedIndex } = await import(
    "../src/components/ProblemSelector/problemSelectionState.js"
  );

  assert.equal(transitionSelectedIndex(0, 2, 4), 2);
  assert.equal(transitionSelectedIndex(2, -1, 4), 0);
  assert.equal(transitionSelectedIndex(2, 9, 4), 3);
  assert.equal(transitionSelectedIndex(2, Number.NaN, 4), 2);
  assert.equal(transitionSelectedIndex(2, 1, 0), 0);
});
