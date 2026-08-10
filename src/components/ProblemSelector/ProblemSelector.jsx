import { useCallback, useId, useRef, useState } from "react";
import { transitionSelectedIndex } from "./problemSelectionState";
import "./ProblemSelector.css";

const DIRECTION_KEYS = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowDown: 1,
};

export default function ProblemSelector({ problems, sectionId }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef([]);
  const instanceId = useId();
  const resolvedSectionId = sectionId ?? `${instanceId}-section`;
  const headingId = `${instanceId}-heading`;
  const panelId = `${instanceId}-panel`;
  const panelHeadingId = `${instanceId}-panel-heading`;
  const selectProblem = useCallback(
    (nextIndex) => {
      setSelectedIndex((currentIndex) =>
        transitionSelectedIndex(currentIndex, nextIndex, problems.length),
      );
    },
    [problems.length],
  );
  const selected = problems[selectedIndex];

  if (!selected) return null;

  const handleTabKeyDown = (event, index) => {
    let nextIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = problems.length - 1;
    if (event.key in DIRECTION_KEYS) {
      nextIndex = (index + DIRECTION_KEYS[event.key] + problems.length) % problems.length;
    }
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectProblem(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      className="section problem-section"
      id={resolvedSectionId}
      aria-labelledby={headingId}
    >
      <div className="section__inner">
        <header className="section__heading">
          <p className="section__eyebrow">С чем я могу помочь</p>
          <h2 id={headingId}>От запуска продукта до AI-автоматизации</h2>
          <p>Разбираю задачу, считаю эффект и довожу решение до запуска.</p>
        </header>

        <div className="problem-selector">
          <div className="problem-selector__rail" role="group" aria-label="Бизнес-задачи">
            {problems.map((problem, index) => {
              const isSelected = selectedIndex === index;

              return (
                <button
                  className={`problem-selector__tab${
                    isSelected ? " problem-selector__tab--selected" : ""
                  }`}
                  type="button"
                  key={problem.id}
                  ref={(element) => {
                    buttonRefs.current[index] = element;
                  }}
                  aria-pressed={selectedIndex === index}
                  aria-controls={panelId}
                  onClick={() => selectProblem(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span className="problem-selector__tab-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{problem.title}</span>
                </button>
              );
            })}
          </div>

          <article
            className="problem-selector__panel"
            id={panelId}
            key={selected.id}
            role="region"
            aria-labelledby={panelHeadingId}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="problem-selector__index">0{selectedIndex + 1} / 0{problems.length}</p>
            <h3 id={panelHeadingId}>{selected.title}</h3>

            <div className="problem-selector__actions">
              <p className="problem-selector__label">Что делаю</p>
              <p className="problem-selector__lead">{selected.description}</p>
              <p className="problem-selector__label problem-selector__label--actions">Действия</p>
              <ul
                className="problem-selector__capabilities"
                aria-label={`Действия для задачи «${selected.title}»`}
              >
                {selected.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>

            <div className="problem-selector__outcome">
              <p className="problem-selector__label">Результат</p>
              <p>{selected.result}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
