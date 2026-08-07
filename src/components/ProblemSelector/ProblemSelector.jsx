import { useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import OptionWheel from "../OptionWheel/OptionWheel";
import "./ProblemSelector.css";

export default function ProblemSelector({ problems }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const selected = problems[selectedIndex];

  if (!selected) return null;

  return (
    <section className="section problem-section" id="problems" aria-labelledby="problems-title">
      <div className="section__inner">
        <header className="section__heading">
          <p className="section__eyebrow">С чем я могу помочь</p>
          <h2 id="problems-title">Выберите задачу, которую нужно решить</h2>
          <p>
            Беру на себя путь от разбора ограничений и экономики до работающего цифрового
            решения.
          </p>
        </header>

        <div className="problem-selector">
          <div className="problem-selector__mobile" aria-label="Бизнес-задачи">
            {problems.map((problem, index) => (
              <button
                className={`problem-selector__tab${
                  selectedIndex === index ? " problem-selector__tab--selected" : ""
                }`}
                type="button"
                key={problem.id}
                aria-pressed={selectedIndex === index}
                aria-controls="problem-description"
                onClick={() => setSelectedIndex(index)}
              >
                <span aria-hidden="true">0{index + 1}</span>
                {problem.title}
              </button>
            ))}
          </div>

          <div className="problem-selector__desktop">
            <OptionWheel
              items={problems.map((problem) => problem.title)}
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
              reducedMotion={reducedMotion}
            />
          </div>

          <article
            className="problem-selector__description"
            id="problem-description"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="problem-selector__index">0{selectedIndex + 1} / 0{problems.length}</p>
            <h3>{selected.title}</h3>
            <p className="problem-selector__lead">{selected.description}</p>
            <div className="problem-selector__outcome">
              <p className="problem-selector__label">Ожидаемый результат</p>
              <p>{selected.outcome ?? selected.result}</p>
            </div>
            <ul className="problem-selector__capabilities" aria-label="Компетенции">
              {selected.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
