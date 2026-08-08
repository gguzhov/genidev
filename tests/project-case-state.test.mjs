import assert from "node:assert/strict";
import test from "node:test";
import {
  planProjectClose,
  planProjectOpen,
  resolveProjectRoute,
} from "../src/lib/projectRouteState.js";
import { getFocusWrapIndex } from "../src/components/ProjectCase/projectCaseFocus.js";

const slugs = ["ostrov-zdoroviya", "ilonmask-vpn"];
const sessionId = "current-spa-session";

test("direct project entry resolves only a known project and stays direct", () => {
  assert.deepEqual(
    resolveProjectRoute({
      pathname: "/projects/ostrov-zdoroviya",
      historyState: null,
      slugs,
      sessionId,
    }),
    { slug: "ostrov-zdoroviya", origin: "direct" },
  );

  assert.deepEqual(
    resolveProjectRoute({
      pathname: "/projects/missing",
      historyState: null,
      slugs,
      sessionId,
    }),
    { slug: null, origin: null },
  );
});

test("in-app open pushes one marked project entry", () => {
  const transition = planProjectOpen({
    pathname: "/",
    historyState: { preserved: true },
    slug: "ostrov-zdoroviya",
    slugs,
    sessionId,
  });

  assert.equal(transition.method, "push");
  assert.equal(transition.pathname, "/projects/ostrov-zdoroviya");
  assert.equal(transition.state.preserved, true);
  assert.deepEqual(
    resolveProjectRoute({
      pathname: transition.pathname,
      historyState: transition.state,
      slugs,
      sessionId,
    }),
    { slug: "ostrov-zdoroviya", origin: "in-app" },
  );
});

test("Back closes an in-app project and Forward resolves the marked entry again", () => {
  const opened = planProjectOpen({
    pathname: "/",
    historyState: null,
    slug: "ostrov-zdoroviya",
    slugs,
    sessionId,
  });

  assert.equal(
    planProjectClose({
      pathname: opened.pathname,
      historyState: opened.state,
      slugs,
      sessionId,
    }).method,
    "back",
  );
  assert.deepEqual(
    resolveProjectRoute({ pathname: "/", historyState: null, slugs, sessionId }),
    { slug: null, origin: null },
  );
  assert.deepEqual(
    resolveProjectRoute({
      pathname: opened.pathname,
      historyState: opened.state,
      slugs,
      sessionId,
    }),
    { slug: "ostrov-zdoroviya", origin: "in-app" },
  );
});

test("switching projects replaces the active entry and preserves its close behavior", () => {
  const opened = planProjectOpen({
    pathname: "/",
    historyState: null,
    slug: "ostrov-zdoroviya",
    slugs,
    sessionId,
  });
  const switched = planProjectOpen({
    pathname: opened.pathname,
    historyState: opened.state,
    slug: "ilonmask-vpn",
    slugs,
    sessionId,
  });

  assert.equal(switched.method, "replace");
  assert.equal(switched.pathname, "/projects/ilonmask-vpn");
  assert.equal(
    planProjectClose({
      pathname: switched.pathname,
      historyState: switched.state,
      slugs,
      sessionId,
    }).method,
    "back",
  );
});

test("direct-entry close replaces to home and never navigates away", () => {
  const transition = planProjectClose({
    pathname: "/projects/ilonmask-vpn",
    historyState: { staleProjectSession: true },
    slugs,
    sessionId,
  });

  assert.deepEqual(transition, { method: "replace", pathname: "/", state: {} });
});

test("unknown project slugs cannot create or close a dialog route", () => {
  assert.equal(
    planProjectOpen({
      pathname: "/",
      historyState: null,
      slug: "missing",
      slugs,
      sessionId,
    }),
    null,
  );
  assert.equal(
    planProjectClose({
      pathname: "/projects/missing",
      historyState: null,
      slugs,
      sessionId,
    }),
    null,
  );
});

test("focus cycle wraps only at the first and last focusable controls", () => {
  assert.equal(getFocusWrapIndex({ activeIndex: 0, focusableCount: 4, shiftKey: true }), 3);
  assert.equal(getFocusWrapIndex({ activeIndex: 3, focusableCount: 4, shiftKey: false }), 0);
  assert.equal(getFocusWrapIndex({ activeIndex: 1, focusableCount: 4, shiftKey: false }), null);
  assert.equal(getFocusWrapIndex({ activeIndex: -1, focusableCount: 4, shiftKey: false }), 0);
  assert.equal(getFocusWrapIndex({ activeIndex: -1, focusableCount: 0, shiftKey: false }), null);
});
