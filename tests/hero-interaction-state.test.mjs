import { access } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const exists = async (path) => access(path).then(() => true, () => false);

test("keeps an expanded CardNav coherent when its timeline is recreated", async () => {
  const helperPath = "src/components/CardNav/cardNavState.js";
  assert.equal(await exists(helperPath), true, `Missing ${helperPath}`);

  const { CLOSED_HEIGHT, getMenuRecreationState } = await import(`../${helperPath}`);
  assert.deepEqual(getMenuRecreationState(true, 418), {
    height: 418,
    cardsY: 0,
    cardsOpacity: 1,
    timelineProgress: 1,
  });
  assert.deepEqual(getMenuRecreationState(false, 418), {
    height: CLOSED_HEIGHT,
    cardsY: 32,
    cardsOpacity: 0,
    timelineProgress: 0,
  });
});

test("restores trigger focus only after activating a panel navigation link", async () => {
  const helperPath = "src/components/CardNav/cardNavState.js";
  assert.equal(await exists(helperPath), true, `Missing ${helperPath}`);

  const { getNavigationCloseOptions } = await import(`../${helperPath}`);
  assert.deepEqual(getNavigationCloseOptions("panel"), { restoreFocus: true });
  assert.deepEqual(getNavigationCloseOptions("header"), { restoreFocus: false });
});

test("cancels pending portrait motion and returns every tilt variable to neutral", async () => {
  const helperPath = "src/components/ProfileCard/profileCardMotion.js";
  assert.equal(await exists(helperPath), true, `Missing ${helperPath}`);

  const { resetProfileTilt } = await import(`../${helperPath}`);
  const properties = new Map();
  const element = {
    style: {
      setProperty(name, value) {
        properties.set(name, value);
      },
    },
  };
  const cancelledFrames = [];

  const nextFrame = resetProfileTilt(element, 17, (frameId) => {
    cancelledFrames.push(frameId);
  });

  assert.equal(nextFrame, null);
  assert.deepEqual(cancelledFrames, [17]);
  assert.deepEqual(Object.fromEntries(properties), {
    "--pointer-x": "50%",
    "--pointer-y": "50%",
    "--rotate-x": "0deg",
    "--rotate-y": "0deg",
  });
});
