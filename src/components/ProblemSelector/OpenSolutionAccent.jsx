import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

const SIGNAL_NODES = [144, 376, 608, 840, 1072];

function SolutionSignal({ active }) {
  const travelTransition = {
    duration: 3.4,
    ease: [0.45, 0, 0.2, 1],
    repeat: Infinity,
    repeatDelay: 0.45,
  };

  return (
    <svg
      className="problem-selector__open-solution-svg"
      viewBox="0 0 1200 64"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="open-solution-track" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7baaff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#315fbd" stopOpacity="0.5" />
          <stop offset="0.82" stopColor="#315fbd" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7baaff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="open-solution-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f7fbff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#89bcff" stopOpacity="0.88" />
          <stop offset="1" stopColor="#174fc3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="open-solution-core">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#8fc5ff" />
          <stop offset="1" stopColor="#174fc3" />
        </radialGradient>
        <filter id="open-solution-glow" x="-180%" y="-400%" width="460%" height="900%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <path
        d="M24 32 H1176"
        fill="none"
        stroke="url(#open-solution-track)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />

      {SIGNAL_NODES.map((x, index) => (
        <g className="problem-selector__open-solution-node" key={x}>
          <motion.circle
            cx={x}
            cy="32"
            fill="#f8fbff"
            stroke="#245cc8"
            strokeWidth="1.2"
            initial={false}
            animate={
              active
                ? { r: [4, 4, 7, 4], opacity: [0.48, 0.48, 1, 0.48] }
                : { r: 4, opacity: 0.58 }
            }
            transition={
              active
                ? { ...travelTransition, delay: (index / SIGNAL_NODES.length) * 2.7 }
                : { duration: 0.2 }
            }
          />
        </g>
      ))}

      <motion.g
        initial={false}
        animate={active ? { x: [0, 1128], opacity: [0, 1, 1, 0] } : { x: 0, opacity: 0 }}
        transition={active ? travelTransition : { duration: 0.2 }}
      >
        <rect
          x="18"
          y="27"
          width="108"
          height="10"
          rx="5"
          fill="url(#open-solution-beam)"
          filter="url(#open-solution-glow)"
          opacity="0.9"
        />
        <circle
          cx="24"
          cy="32"
          r="8"
          fill="#4384ee"
          opacity="0.3"
          filter="url(#open-solution-glow)"
        />
        <circle cx="24" cy="32" r="4.2" fill="url(#open-solution-core)" />
      </motion.g>
    </svg>
  );
}

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

  const animateSignal = !reducedMotion && isInView && isPageVisible;

  return (
    <div className="problem-selector__open-solution" ref={rootRef}>
      <p className="problem-selector__open-solution-copy">
        <span className="problem-selector__open-solution-plus" aria-hidden="true">+</span>
        <span>{label}</span>
      </p>
      <div className="problem-selector__open-solution-motion" aria-hidden="true">
        <SolutionSignal active={animateSignal} />
      </div>
    </div>
  );
}
