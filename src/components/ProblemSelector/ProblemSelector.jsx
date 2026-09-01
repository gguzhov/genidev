import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import OpenSolutionAccent from "./OpenSolutionAccent";
import { transitionSelectedIndex } from "./problemSelectionState";
import "./ProblemSelector.css";

const DIRECTION_KEYS = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowDown: 1,
};

export default function ProblemSelector({ problems, sectionId, copy, ui }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef([]);
  const carouselRef = useRef(null);
  const scrollFrameRef = useRef();
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
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
  const featuredSolutions = selected?.solutions.slice(0, 3) ?? [];
  const openSolution = selected?.solutions.at(-1);

  useEffect(() => {
    carouselRef.current?.scrollTo({ left: 0, behavior: "auto" });
    setActiveSolutionIndex(0);
  }, [selected?.id]);

  useEffect(() => () => {
    if (scrollFrameRef.current !== undefined) cancelAnimationFrame(scrollFrameRef.current);
  }, []);

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

  const scrollToSolution = (nextIndex) => {
    const carousel = carouselRef.current;
    const cards = carousel?.querySelectorAll(".problem-selector__solution");
    const resolvedIndex = Math.max(0, Math.min(featuredSolutions.length - 1, nextIndex));
    const card = cards?.[resolvedIndex];
    if (!carousel || !card) return;

    carousel.scrollTo({
      left: card.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    setActiveSolutionIndex(resolvedIndex);
  };

  const updateActiveSolution = () => {
    if (scrollFrameRef.current !== undefined) return;
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = undefined;
      const carousel = carouselRef.current;
      const cards = [...(carousel?.querySelectorAll(".problem-selector__solution") ?? [])];
      if (!carousel || !cards.length) return;
      const closestIndex = cards.reduce((best, card, index) => (
        Math.abs(card.offsetLeft - carousel.scrollLeft)
          < Math.abs(cards[best].offsetLeft - carousel.scrollLeft)
          ? index
          : best
      ), 0);
      setActiveSolutionIndex(closestIndex);
    });
  };

  return (
    <section
      className="section problem-section"
      id={resolvedSectionId}
      aria-labelledby={headingId}
    >
      <div className="section__inner">
        <header className="section__heading">
          <h2 id={headingId}>{copy.title}</h2>
        </header>

        <div className="problem-selector">
          <div className="problem-selector__rail" role="group" aria-label={ui.capabilitiesGroup}>
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
              <div className="problem-selector__panel-title">
                <img src={selected.icon} alt="" width="128" height="128" aria-hidden="true" />
                <h3 id={panelHeadingId}>{selected.title}</h3>
              </div>
              <div className="problem-selector__carousel">
                <ul
                  className="problem-selector__solutions"
                  aria-label={`${ui.projectIdeas} «${selected.title}»`}
                  ref={carouselRef}
                  onScroll={updateActiveSolution}
                >
                  {featuredSolutions.map((solution, index) => (
                    <li className="problem-selector__solution" key={solution.title}>
                      <span className="problem-selector__solution-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="problem-selector__solution-copy">
                        <h4>{solution.title}</h4>
                        <dl className="problem-selector__solution-details">
                          <div className="problem-selector__solution-system">
                            <dt>{ui.digitalSolution}</dt>
                            <dd>{solution.project}</dd>
                          </div>
                          <div className="problem-selector__solution-result">
                            <dt>{ui.businessResult}</dt>
                            <dd>{solution.effect}</dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="problem-selector__slider-controls">
                  <button
                    type="button"
                    aria-label={ui.previousCapabilityProjects ?? ui.previousProject}
                    disabled={activeSolutionIndex === 0}
                    onClick={() => scrollToSolution(activeSolutionIndex - 1)}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <span aria-live="polite">
                    {String(activeSolutionIndex + 1).padStart(2, "0")} / {String(featuredSolutions.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    aria-label={ui.nextCapabilityProjects}
                    disabled={activeSolutionIndex === featuredSolutions.length - 1}
                    onClick={() => scrollToSolution(activeSolutionIndex + 1)}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
                {openSolution ? (
                  <OpenSolutionAccent label={openSolution.title} />
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
