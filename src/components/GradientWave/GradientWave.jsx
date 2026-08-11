import { useEffect, useRef } from "react";
import "./GradientWave.css";

export default function GradientWave() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty("--wave-x", `${(x * 18).toFixed(2)}px`);
      root.style.setProperty("--wave-y", `${(y * 12).toFixed(2)}px`);
    };

    const reset = () => {
      root.style.setProperty("--wave-x", "0px");
      root.style.setProperty("--wave-y", "0px");
    };

    const sync = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (finePointer.matches && !reducedMotion.matches) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      } else {
        reset();
      }
    };

    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    sync();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      reset();
    };
  }, []);

  return (
    <div className="gradient-wave" aria-hidden="true" ref={rootRef}>
      <div className="gradient-wave__light gradient-wave__light--near" />
      <div className="gradient-wave__light gradient-wave__light--far" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path className="gradient-wave__path gradient-wave__path--one" d="M-100 570 C 220 230 430 710 760 410 S 1260 160 1540 420" />
        <path className="gradient-wave__path gradient-wave__path--two" d="M-120 690 C 190 390 470 760 780 520 S 1240 310 1580 510" />
        <path className="gradient-wave__path gradient-wave__path--three" d="M-160 780 C 170 570 500 820 860 650 S 1280 500 1620 650" />
      </svg>
    </div>
  );
}
