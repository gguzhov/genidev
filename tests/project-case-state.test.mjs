import assert from "node:assert/strict";
import test from "node:test";
import {
  planProjectClose,
  planProjectOpen,
  resolveProjectRoute,
} from "../src/lib/projectRouteState.js";
import { createProjectRouteController } from "../src/lib/projectRouteController.js";
import {
  getFocusWrapIndex,
  shouldResetProjectCaseScroll,
} from "../src/components/ProjectCase/projectCaseFocus.js";

const slugs = ["ostrov-zdoroviya", "ilonmask-vpn"];
const sessionId = "current-spa-session";

function createFakeRouteEnvironment(initialSnapshot) {
  let snapshot = initialSnapshot;
  const historyCalls = [];
  const popStateListeners = new Set();

  return {
    getRouteSnapshot: () => snapshot,
    history: {
      back() {
        historyCalls.push({ method: "back" });
      },
      pushState(state, _unused, pathname) {
        historyCalls.push({ method: "push", pathname, state });
        snapshot = { pathname, historyState: state };
      },
      replaceState(state, _unused, pathname) {
        historyCalls.push({ method: "replace", pathname, state });
        snapshot = { pathname, historyState: state };
      },
    },
    subscribePopState(listener) {
      popStateListeners.add(listener);
      return () => popStateListeners.delete(listener);
    },
    dispatchPopState(nextSnapshot) {
      snapshot = nextSnapshot;
      for (const listener of popStateListeners) listener();
    },
    historyCalls,
    listenerCount: () => popStateListeners.size,
  };
}

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

test("project switch resets the case surface while the same project preserves it", () => {
  assert.equal(shouldResetProjectCaseScroll(null, "ostrov-zdoroviya"), true);
  assert.equal(
    shouldResetProjectCaseScroll("ostrov-zdoroviya", "ilonmask-vpn"),
    true,
  );
  assert.equal(
    shouldResetProjectCaseScroll("ilonmask-vpn", "ilonmask-vpn"),
    false,
  );
});

test("production controller holds CLOSE_PENDING until POPSTATE", () => {
  const opened = planProjectOpen({
    pathname: "/",
    historyState: null,
    slug: "ostrov-zdoroviya",
    slugs,
    sessionId,
  });
  const environment = createFakeRouteEnvironment({
    pathname: opened.pathname,
    historyState: opened.state,
  });
  const activeSlugs = [];
  const controller = createProjectRouteController({
    ...environment,
    getSlugs: () => slugs,
    sessionId,
    onActiveSlugChange: (slug) => activeSlugs.push(slug),
  });

  assert.equal(controller.closeProject(), true);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    assert.equal(controller.closeProject(), false);
  }
  assert.equal(controller.isClosePending(), true);
  assert.deepEqual(environment.historyCalls, [{ method: "back" }]);

  assert.equal(controller.openProject("ilonmask-vpn"), false);
  assert.deepEqual(environment.historyCalls, [{ method: "back" }]);
  assert.deepEqual(activeSlugs, []);

  environment.dispatchPopState({ pathname: "/", historyState: null });
  assert.equal(controller.isClosePending(), false);
  assert.deepEqual(activeSlugs, [null]);

  assert.equal(controller.openProject("ilonmask-vpn"), true);
  assert.equal(environment.historyCalls.at(-1).method, "push");
  assert.equal(activeSlugs.at(-1), "ilonmask-vpn");
  assert.equal(controller.closeProject(), true);
  assert.equal(
    environment.historyCalls.filter(({ method }) => method === "back").length,
    2,
  );

  controller.dispose();
});

test("production controller removes popstate subscription and stops after dispose", () => {
  const opened = planProjectOpen({
    pathname: "/",
    historyState: null,
    slug: "ostrov-zdoroviya",
    slugs,
    sessionId,
  });
  const environment = createFakeRouteEnvironment({
    pathname: opened.pathname,
    historyState: opened.state,
  });
  const activeSlugs = [];
  const controller = createProjectRouteController({
    ...environment,
    getSlugs: () => slugs,
    sessionId,
    onActiveSlugChange: (slug) => activeSlugs.push(slug),
  });

  assert.equal(environment.listenerCount(), 1);
  assert.equal(controller.closeProject(), true);
  assert.equal(controller.isClosePending(), true);
  controller.dispose();
  assert.equal(environment.listenerCount(), 0);
  assert.equal(controller.isClosePending(), false);
  assert.equal(controller.openProject("ostrov-zdoroviya"), false);
  assert.equal(controller.closeProject(), false);
  environment.dispatchPopState({ pathname: "/projects/ostrov-zdoroviya", historyState: null });
  assert.deepEqual(environment.historyCalls, [{ method: "back" }]);
  assert.deepEqual(activeSlugs, []);
});

test("production controller closes direct entry synchronously without pending", () => {
  const environment = createFakeRouteEnvironment({
    pathname: "/projects/ilonmask-vpn",
    historyState: null,
  });
  const activeSlugs = [];
  const controller = createProjectRouteController({
    ...environment,
    getSlugs: () => slugs,
    sessionId,
    onActiveSlugChange: (slug) => activeSlugs.push(slug),
  });

  assert.equal(controller.closeProject(), true);
  assert.equal(controller.isClosePending(), false);
  assert.deepEqual(environment.historyCalls, [
    { method: "replace", pathname: "/", state: {} },
  ]);
  assert.deepEqual(activeSlugs, [null]);
  assert.equal(controller.openProject("ostrov-zdoroviya"), true);

  controller.dispose();
});
