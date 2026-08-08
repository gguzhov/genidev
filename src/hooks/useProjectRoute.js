import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  planProjectClose,
  planProjectOpen,
  resolveProjectRoute,
} from "../lib/projectRouteState";

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
    const handlePopState = () => setActiveSlug(readActiveSlug());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [readActiveSlug]);

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

  const openProject = useCallback(
    (slug) => {
      const routeBeforeOpen = resolveProjectRoute({
        pathname: window.location.pathname,
        historyState: window.history.state,
        slugs,
        sessionId: sessionIdRef.current,
      });
      const transition = planProjectOpen({
        pathname: window.location.pathname,
        historyState: window.history.state,
        slug,
        slugs,
        sessionId: sessionIdRef.current,
      });

      if (!transition) return;

      if (!routeBeforeOpen.slug && document.activeElement instanceof HTMLElement) {
        returnFocusRef.current = document.activeElement;
      }

      window.history[`${transition.method}State`](transition.state, "", transition.pathname);
      setActiveSlug(slug);
    },
    [slugs],
  );

  const closeProject = useCallback(() => {
    const transition = planProjectClose({
      pathname: window.location.pathname,
      historyState: window.history.state,
      slugs,
      sessionId: sessionIdRef.current,
    });

    if (!transition) return;

    if (transition.method === "back") {
      window.history.back();
      return;
    }

    window.history.replaceState(transition.state, "", transition.pathname);
    setActiveSlug(null);
  }, [slugs]);

  return {
    activeProject: projects.find(({ slug }) => slug === activeSlug) ?? null,
    openProject,
    closeProject,
  };
}
