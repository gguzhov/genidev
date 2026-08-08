import { projectPath, projectSlugFromPath } from "./projectRouting.js";

const PROJECT_ROUTE_STATE_KEY = "__genidevProjectRoute";

function objectState(historyState) {
  return historyState && typeof historyState === "object" && !Array.isArray(historyState)
    ? historyState
    : {};
}

export function resolveProjectRoute({ pathname, historyState, slugs, sessionId }) {
  const slug = projectSlugFromPath(pathname);

  if (!slug || !slugs.includes(slug)) {
    return { slug: null, origin: null };
  }

  const marker = objectState(historyState)[PROJECT_ROUTE_STATE_KEY];
  const belongsToCurrentSession =
    marker?.sessionId === sessionId &&
    marker?.slug === slug &&
    (marker?.origin === "direct" || marker?.origin === "in-app");

  return {
    slug,
    origin: belongsToCurrentSession ? marker.origin : "direct",
  };
}

export function planProjectOpen({
  pathname,
  historyState,
  slug,
  slugs,
  sessionId,
}) {
  if (!slugs.includes(slug)) {
    return null;
  }

  const currentRoute = resolveProjectRoute({ pathname, historyState, slugs, sessionId });
  const origin = currentRoute.slug ? currentRoute.origin : "in-app";

  return {
    method: currentRoute.slug ? "replace" : "push",
    pathname: projectPath(slug),
    state: {
      ...objectState(historyState),
      [PROJECT_ROUTE_STATE_KEY]: { sessionId, slug, origin },
    },
  };
}

export function planProjectClose({ pathname, historyState, slugs, sessionId }) {
  const currentRoute = resolveProjectRoute({ pathname, historyState, slugs, sessionId });

  if (!currentRoute.slug) {
    return null;
  }

  if (currentRoute.origin === "in-app") {
    return { method: "back" };
  }

  return { method: "replace", pathname: "/", state: {} };
}
