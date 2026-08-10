import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [navCss, navSource, profileSource] = await Promise.all([
  readFile("src/components/CardNav/CardNav.css", "utf8"),
  readFile("src/components/CardNav/CardNav.jsx", "utf8"),
  readFile("src/components/ProfileCard/ProfileCard.jsx", "utf8"),
]);

test("does not permanently promote the fixed CardNav height layer", () => {
  const navRule = navCss.match(/\.card-nav\s*\{[^}]*\}/s)?.[0] ?? "";

  assert.doesNotMatch(navRule, /will-change:\s*height/);
  assert.match(navSource, /timeline\.to\(nav,\s*\{\s*height:\s*calculateHeight/);
});

test("invalidates ProfileCard bounds on passive scroll and refreshes them in its coalesced RAF", () => {
  assert.match(profileSource, /const boundsDirtyRef = useRef\(true\)/);
  assert.match(
    profileSource,
    /const invalidateBounds = useCallback\(\(\) => \{\s*boundsDirtyRef\.current = true;\s*\}, \[\]\)/s,
  );
  assert.match(
    profileSource,
    /if \(!tiltEnabled\) return undefined;[\s\S]*window\.addEventListener\("scroll", invalidateBounds, \{ passive: true \}\)/,
  );
  assert.match(
    profileSource,
    /window\.removeEventListener\("scroll", invalidateBounds\)/,
  );

  const pointerMoveBody = profileSource.match(
    /const handlePointerMove = useCallback\([\s\S]*?\n  \);/,
  )?.[0] ?? "";
  assert.match(pointerMoveBody, /if \(boundsDirtyRef\.current\) cacheBounds\(\)/);
  assert.match(pointerMoveBody, /animationFrameRef\.current != null\) return/);
});
