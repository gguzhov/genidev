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
          <h2 id={headingId}>В чем могу быть полезен?</h2>
          <p>
            Беру ответственность за путь от исходной задачи до работающего решения и данных после запуска.
          </p>
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
                  <span className="problem-selector__tab-code" aria-hidden="true">
                    {problem.code}
                  </span>
                  <span className="problem-selector__tab-title">{problem.title}</span>
                </button>
              );
            })}
          </div>

          <p
            className="problem-selector__status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {selected.title}
          </p>

          <article
            className="problem-selector__panel"
            id={panelId}
            role="region"
            aria-labelledby={panelHeadingId}
          >
            <div className="problem-selector__panel-content" key={selected.id}>
              <div className="problem-selector__barcode">
                <span className="problem-selector__code">{selected.code}</span>
                <span className="problem-selector__barcode-bars" aria-hidden="true">
                  <span
                    className="problem-selector__scan"
                    key={selected.id}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <h3 id={panelHeadingId}>{selected.title}</h3>
              <p className="problem-selector__situation">{selected.situation}</p>

              <div className="problem-selector__actions">
                <p className="problem-selector__label">Что беру на себя</p>
                <ul
                  className="problem-selector__actions-list"
                  aria-label={`Действия для задачи «${selected.title}»`}
                >
                  {selected.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <p className="problem-selector__label problem-selector__label--outcomes">
                  На выходе
                </p>
                <ul
                  className="problem-selector__outcomes"
                  aria-label={`Результаты задачи «${selected.title}»`}
                >
                  {selected.outcomes.map((outcome, outcomeIndex) => (
                    <li
                      key={outcome}
                      style={{ "--outcome-index": outcomeIndex }}
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
