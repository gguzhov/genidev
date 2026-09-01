import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

const WORD_DURATION = 3.8;
const WORD_TIMES = [0, 0.14, 0.32, 1];

export default function OpenSolutionAccent({ label }) {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState !== "hidden",
  );
  const words = label.trim().split(/\s+/);

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
      <p className="problem-selector__open-solution-copy" aria-label={label}>
        <motion.span
          className="problem-selector__open-solution-plus"
          aria-hidden="true"
          initial={false}
          animate={
            animateSentence
              ? { opacity: [0.76, 1, 0.84], scale: [0.96, 1.06, 1] }
              : { opacity: 1, scale: 1 }
          }
          transition={
            animateSentence
              ? { duration: WORD_DURATION, ease: [0.16, 1, 0.3, 1], repeat: Infinity }
              : { duration: 0.2 }
          }
        >
          +
        </motion.span>
        <span className="problem-selector__open-solution-words" aria-hidden="true">
          {words.map((word, index) => (
            <motion.span
              className="problem-selector__open-solution-word"
              key={`${word}-${index}`}
              initial={false}
              animate={
                animateSentence
                  ? {
                      opacity: [0.76, 1, 0.84, 0.84],
                      y: [2, -2, 0, 0],
                      filter: ["blur(0.35px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                    }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              transition={
                animateSentence
                  ? {
                      duration: WORD_DURATION,
                      times: WORD_TIMES,
                      ease: [0.16, 1, 0.3, 1],
                      delay: index * 0.18,
                      repeat: Infinity,
                      repeatDelay: 0.7,
                    }
                  : { duration: 0.2 }
              }
            >
              {word}
            </motion.span>
          ))}
        </span>
      </p>
    </div>
  );
}
