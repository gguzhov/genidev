import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { createWorkSequenceObserver } from "./workSequenceRevealState";
import "./WorkSequence.css";

export default function WorkSequence({ items, reducedMotion = false }) {
  const sequenceRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(reducedMotion);

  useEffect(
    () =>
      createWorkSequenceObserver({
        root: sequenceRef.current,
        reducedMotion,
        onReveal: () => setIsRevealed(true),
      }),
    [reducedMotion],
  );

  useLayoutEffect(() => {
    if (!isRevealed || reducedMotion || !sequenceRef.current) return undefined;

    const context = gsap.context(() => {
      const nodes = sequenceRef.current.querySelectorAll(".work-sequence__item");
      gsap.set(nodes, { autoAlpha: 0, y: 8 });
      gsap.timeline().to(nodes, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "0.22,1,0.36,1",
        stagger: 0.07,
      });
    }, sequenceRef);

    return () => context.revert();
  }, [isRevealed, reducedMotion]);

  return (
    <div
      className={`work-sequence${isRevealed ? " is-revealed" : ""}${
        reducedMotion ? " work-sequence--static" : ""
      }`}
      data-reveal-state={isRevealed ? "revealed" : "waiting"}
      ref={sequenceRef}
    >
      <svg className="work-sequence__track" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <path className="work-sequence__track-base" pathLength="1" d="M2 5 H98" />
        <path className="work-sequence__track-signal" pathLength="1" d="M2 5 H98" />
      </svg>
      <ol aria-label="Этапы комплексной работы">
        {items.map((item, index) => (
          <li
            className="work-sequence__item"
            key={item}
          >
            <span className="work-sequence__marker" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="work-sequence__label">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
