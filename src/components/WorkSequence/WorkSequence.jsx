import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {
  createWorkSequenceMotionState,
  createWorkSequenceObserver,
  transitionWorkSequenceMotionState,
} from "./workSequenceRevealState";
import "./WorkSequence.css";

gsap.registerPlugin(CustomEase);
const WORK_SEQUENCE_EASE = CustomEase.create("work-sequence-ease", "0.22,1,0.36,1");

export default function WorkSequence({ items, reducedMotion = false }) {
  const sequenceRef = useRef(null);
  const [motionState, dispatchMotion] = useReducer(
    transitionWorkSequenceMotionState,
    reducedMotion,
    createWorkSequenceMotionState,
  );

  useEffect(() => {
    dispatchMotion(reducedMotion ? "PREFERENCE_REDUCED" : "PREFERENCE_FULL");
  }, [reducedMotion]);

  useEffect(() => {
    if (motionState.hasSettled) return undefined;

    return createWorkSequenceObserver({
      root: sequenceRef.current,
      reducedMotion,
      onReveal: () => dispatchMotion("REVEAL"),
    });
  }, [motionState.hasSettled, reducedMotion]);

  useLayoutEffect(() => {
    if (
      !motionState.isRevealed ||
      motionState.hasSettled ||
      reducedMotion ||
      !sequenceRef.current
    ) {
      return undefined;
    }

    const context = gsap.context(() => {
      const nodes = sequenceRef.current.querySelectorAll(".work-sequence__item");
      const signal = sequenceRef.current.querySelector(".work-sequence__track-signal");
      gsap.set(nodes, { autoAlpha: 0, y: 8 });
      gsap.set(signal, { strokeDashoffset: 1 });

      const timeline = gsap.timeline({
        onComplete: () => dispatchMotion("COMPLETE"),
      });
      timeline
        .to(signal, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: WORK_SEQUENCE_EASE,
        })
        .to(nodes, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: WORK_SEQUENCE_EASE,
          stagger: 0.07,
        }, 0.5);
    }, sequenceRef);

    return () => context.revert();
  }, [motionState.hasSettled, motionState.isRevealed, reducedMotion]);

  const isStatic = reducedMotion || motionState.hasSettled;

  return (
    <div
      className={`work-sequence${motionState.isRevealed ? " is-revealed" : ""}${
        isStatic ? " work-sequence--static" : ""
      }`}
      data-reveal-state={motionState.isRevealed ? "revealed" : "waiting"}
      ref={sequenceRef}
    >
      <svg className="work-sequence__track" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="work-sequence__track-base" pathLength="1" d="M6 88 C 20 12 80 12 94 88" />
        <path className="work-sequence__track-signal" pathLength="1" d="M6 88 C 20 12 80 12 94 88" />
      </svg>
      <ol aria-label="Этапы работы от проблемы до аналитики">
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
