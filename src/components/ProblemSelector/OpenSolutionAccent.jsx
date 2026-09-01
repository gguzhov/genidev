import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

export default function OpenSolutionAccent({ label }) {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
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
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { rootMargin: "120px", threshold: 0.08 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const animateSentence = !reducedMotion && isInView && isPageVisible;

  return (
    <div className="problem-selector__open-solution" ref={rootRef}>
      <p className="problem-selector__open-solution-copy">
        <motion.span
          className={`problem-selector__open-solution-text${
            animateSentence ? " problem-selector__open-solution-text--active" : ""
          }`}
          initial={false}
          animate={
            animateSentence
              ? { backgroundPosition: ["170% 50%", "-70% 50%"] }
              : { backgroundPosition: "170% 50%" }
          }
          transition={
            animateSentence
              ? { duration: 4.8, ease: "linear", repeat: Infinity }
              : { duration: 0.2 }
          }
        >
          + {label}
        </motion.span>
      </p>
    </div>
  );
}
