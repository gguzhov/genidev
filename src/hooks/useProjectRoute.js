import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createProjectRouteController } from "../lib/projectRouteController";
import { resolveProjectRoute } from "../lib/projectRouteState";

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `project-route-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function useProjectRoute(projects) {
  const slugs = useMemo(() => projects.map(({ slug }) => slug), [projects]);
  const sessionIdRef = useRef(null);
  const returnFocusRef = useRef(null);
  const previousActiveSlugRef = useRef(null);
  const controllerRef = useRef(null);
  const slugsRef = useRef(slugs);

  slugsRef.current = slugs;

  if (!sessionIdRef.current) {
    sessionIdRef.current = createSessionId();
  }

  const readActiveSlug = useCallback(
    () =>
      resolveProjectRoute({
        pathname: window.location.pathname,
        historyState: window.history.state,
        slugs,
        sessionId: sessionIdRef.current,
      }).slug,
    [slugs],
  );

  const [activeSlug, setActiveSlug] = useState(readActiveSlug);

  useEffect(() => {
    const controller = createProjectRouteController({
      getRouteSnapshot: () => ({
        pathname: window.location.pathname,
        historyState: window.history.state,
      }),
      getSlugs: () => slugsRef.current,
      history: window.history,
      subscribePopState: (listener) => {
        window.addEventListener("popstate", listener);
        return () => window.removeEventListener("popstate", listener);
      },
      sessionId: sessionIdRef.current,
      onActiveSlugChange: setActiveSlug,
      onBeforeOpen: (routeBeforeOpen) => {
        if (!routeBeforeOpen.slug && document.activeElement instanceof HTMLElement) {
          returnFocusRef.current = document.activeElement;
        }
      },
    });
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeSlug) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("is-project-case-open");

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("is-project-case-open");
    };
  }, [activeSlug]);

  useEffect(() => {
    let focusFrame;
    const previousActiveSlug = previousActiveSlugRef.current;

    if (previousActiveSlug && !activeSlug && returnFocusRef.current?.isConnected) {
      focusFrame = window.requestAnimationFrame(() => {
        returnFocusRef.current?.focus({ preventScroll: true });
      });
    }

    previousActiveSlugRef.current = activeSlug;
    return () => {
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
    };
  }, [activeSlug]);

  const openProject = useCallback((slug) => controllerRef.current?.openProject(slug), []);

  const closeProject = useCallback(() => controllerRef.current?.closeProject(), []);

  return {
    activeProject: projects.find(({ slug }) => slug === activeSlug) ?? null,
    openProject,
    closeProject,
  };
}
