import { motion, useScroll, useSpring } from "motion/react";
import useReducedMotion from "../../hooks/useReducedMotion";

const DEFAULT_SPRING = {
  stiffness: 280,
  damping: 26,
  mass: 0.28,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export default function ScrollProgress({ className = "", springOptions = DEFAULT_SPRING }) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, springOptions);
  const activeProgress = reducedMotion ? scrollYProgress : smoothProgress;

  return (
    <motion.span
      className={className}
      style={{ scaleX: activeProgress }}
      aria-hidden="true"
    />
  );
}
