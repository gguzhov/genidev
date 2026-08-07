import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import { observeCareerItems, shouldRevealAll } from "./careerTimelineState";
import "./CareerTimeline.css";

export default function CareerTimeline({ items }) {
  const reducedMotion = useReducedMotion();
  const itemRefs = useRef([]);
  const [isRevealEnhanced, setIsRevealEnhanced] = useState(false);
  const [visibleItems, setVisibleItems] = useState(() => new Set());

  useEffect(() => {
    const observerAvailable = typeof IntersectionObserver !== "undefined";

    if (shouldRevealAll({ reducedMotion, observerAvailable })) {
      setIsRevealEnhanced(false);
      setVisibleItems(new Set(items.map((_, index) => index)));
      return undefined;
    }

    setIsRevealEnhanced(true);
    setVisibleItems(new Set());

    return observeCareerItems({
      items: itemRefs.current,
      Observer: IntersectionObserver,
      onReveal: (revealedIndexes) => {
        setVisibleItems((current) => new Set([...current, ...revealedIndexes]));
      },
    });
  }, [items, reducedMotion]);

  return (
    <section className="section career-section" id="career" aria-labelledby="career-title">
      <div className="section__inner">
        <div className="section__heading">
          <p className="section__eyebrow">Путь</p>
          <h2 id="career-title">Как развивалась моя практика</h2>
          <p>От проверки спроса и экономики — к продуктовым, аналитическим и AI-системам.</p>
        </div>

        <ol className={`career-timeline${isRevealEnhanced ? " career-timeline--revealing" : ""}`}>
          {items.map((item, index) => (
            <li
              className={`career-timeline__event${visibleItems.has(index) ? " is-visible" : ""}`}
              data-career-index={index}
              key={`${item.year}-${item.title}`}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
            >
              <span className="career-timeline__marker" aria-hidden="true" />
              <article className="career-timeline__entry">
                <p className="career-timeline__year">{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
