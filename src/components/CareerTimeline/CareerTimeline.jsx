import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  getContiguousReachedIndexes,
  observeCareerProgress,
  shouldCompleteProgress,
} from "./careerTimelineState";
import "./CareerTimeline.css";

export default function CareerTimeline({ items }) {
  const reducedMotion = useReducedMotion();
  const itemRefs = useRef([]);
  const [reachedItems, setReachedItems] = useState(() => new Set());

  useEffect(() => {
    const observerAvailable = typeof IntersectionObserver !== "undefined";

    if (shouldCompleteProgress({ reducedMotion, observerAvailable })) {
      setReachedItems(new Set(items.map((_, index) => index)));
      return undefined;
    }

    setReachedItems(new Set());

    return observeCareerProgress({
      items: itemRefs.current,
      Observer: IntersectionObserver,
      onProgress: (reachedIndexes) => {
        setReachedItems((current) => {
          const furthestReached = Math.max(-1, ...current, ...reachedIndexes);
          return new Set(getContiguousReachedIndexes(furthestReached));
        });
      },
    });
  }, [items, reducedMotion]);

  const furthestReached = reachedItems.size ? Math.max(...reachedItems) : -1;
  const contiguousReachedItems = new Set(getContiguousReachedIndexes(furthestReached));
  const progress = items.length ? (furthestReached + 1) / items.length : 0;

  return (
    <section className="section career-section" id="career" aria-labelledby="career-title">
      <div className="section__inner">
        <div className="section__heading">
          <p className="section__eyebrow">Путь</p>
          <h2 id="career-title">От экономики — к продуктам и AI</h2>
          <p>От проверки спроса и экономики — к продуктовым, аналитическим и AI-системам.</p>
        </div>

        <ol
          className="career-timeline"
          style={{ "--career-progress": progress }}
        >
          {items.map((item, index) => (
            <li
              className={`career-timeline__event${contiguousReachedItems.has(index) ? " is-reached" : ""}`}
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
                <p className="career-timeline__body">{item.body}</p>
                {item.metrics?.length ? (
                  <ul
                    className="career-timeline__metrics"
                    aria-label={`Подтверждённые результаты: ${item.title}`}
                  >
                    {item.metrics.map((metric) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
