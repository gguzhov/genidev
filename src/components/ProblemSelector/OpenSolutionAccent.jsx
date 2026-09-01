import { lazy, Suspense, useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

const OpenSolutionMotion = lazy(() => import("./OpenSolutionMotion"));

export default function OpenSolutionAccent({ label }) {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) {
      setIsInView(false);
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsInView = Boolean(entry?.isIntersecting);
        setIsInView(nextIsInView);
        if (nextIsInView) setShouldLoad(true);
      },
      { rootMargin: "240px", threshold: 0.01 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const showMotion = !reducedMotion && shouldLoad && isInView && isPageVisible;

  return (
    <div className="problem-selector__open-solution" ref={rootRef}>
      <p className="problem-selector__open-solution-copy">
        <span className="problem-selector__open-solution-plus" aria-hidden="true">+</span>
        <span>{label}</span>
      </p>
      <div className="problem-selector__open-solution-motion" aria-hidden="true">
        {showMotion ? (
          <Suspense fallback={<span className="problem-selector__open-solution-static" />}>
            <OpenSolutionMotion />
          </Suspense>
        ) : (
          <span className="problem-selector__open-solution-static" />
        )}
      </div>
    </div>
  );
}
