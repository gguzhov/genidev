import {
  planProjectClose,
  planProjectOpen,
  resolveProjectRoute,
} from "./projectRouteState.js";

export function createProjectRouteController({
  getRouteSnapshot,
  getSlugs,
  history,
  subscribePopState,
  sessionId,
  onActiveSlugChange,
  onBeforeOpen,
}) {
  let closePending = false;
  let disposed = false;

  const handlePopState = () => {
    if (disposed) return;

    closePending = false;
    const { pathname, historyState } = getRouteSnapshot();
    const route = resolveProjectRoute({
      pathname,
      historyState,
      slugs: getSlugs(),
      sessionId,
    });
    onActiveSlugChange(route.slug);
  };

  const unsubscribePopState = subscribePopState(handlePopState);

  return {
    openProject(slug) {
      if (disposed || closePending) return false;

      const { pathname, historyState } = getRouteSnapshot();
      const slugs = getSlugs();
      const routeBeforeOpen = resolveProjectRoute({
        pathname,
        historyState,
        slugs,
        sessionId,
      });
      const transition = planProjectOpen({
        pathname,
        historyState,
        slug,
        slugs,
        sessionId,
      });

      if (!transition) return false;

      onBeforeOpen?.(routeBeforeOpen);
      if (transition.method === "push") {
        history.pushState(transition.state, "", transition.pathname);
      } else {
        history.replaceState(transition.state, "", transition.pathname);
      }
      onActiveSlugChange(slug);
      return true;
    },

    closeProject() {
      if (disposed || closePending) return false;

      const { pathname, historyState } = getRouteSnapshot();
      const transition = planProjectClose({
        pathname,
        historyState,
        slugs: getSlugs(),
        sessionId,
      });

      if (!transition) return false;

      if (transition.method === "back") {
        closePending = true;
        history.back();
        return true;
      }

      history.replaceState(transition.state, "", transition.pathname);
      onActiveSlugChange(null);
      return true;
    },

    isClosePending() {
      return closePending;
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      closePending = false;
      unsubscribePopState();
    },
  };
}
