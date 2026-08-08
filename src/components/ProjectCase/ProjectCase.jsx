import { ArrowUpRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { getFocusWrapIndex } from "./projectCaseFocus";
import "./ProjectCase.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function Paragraphs({ text }) {
  return text.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

export default function ProjectCase({ project, projects, onClose, onOpenProject }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const otherProjects = projects.filter(({ slug }) => slug !== project.slug);

  useEffect(() => {
    setCoverFailed(false);
    closeButtonRef.current?.focus({ preventScroll: true });
  }, [project.slug]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []);
    const activeIndex = focusable.indexOf(document.activeElement);
    const wrapIndex = getFocusWrapIndex({
      activeIndex,
      focusableCount: focusable.length,
      shiftKey: event.shiftKey,
    });

    if (wrapIndex !== null) {
      event.preventDefault();
      focusable[wrapIndex].focus();
    }
  };

  return (
    <div
      className="project-case"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="project-case__surface">
        <div className="project-case__topbar">
          <button
            className="project-case__close"
            type="button"
            aria-label="Закрыть кейс"
            ref={closeButtonRef}
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <header className="project-case__hero">
          <div className="project-case__intro">
            <p className="project-case__eyebrow">{project.category}</p>
            <h1 id="project-title">{project.title}</h1>
            <p className="project-case__duration">{project.duration}</p>
            <p className="project-case__summary">{project.summary}</p>
          </div>
          <div className={`project-case__cover${coverFailed ? " has-image-fallback" : ""}`}>
            {!coverFailed && (
              <img
                src={project.cover}
                alt={`Обложка проекта «${project.title}»`}
                width="1536"
                height="1024"
                decoding="async"
                onError={() => setCoverFailed(true)}
              />
            )}
            <strong>{project.title}</strong>
          </div>
        </header>

        <section className="project-case__section" aria-labelledby="project-problem-title">
          <h2 id="project-problem-title">Проблема</h2>
          <div className="project-case__prose"><Paragraphs text={project.problem} /></div>
        </section>

        <section className="project-case__section" aria-labelledby="project-actions-title">
          <h2 id="project-actions-title">Что я сделал</h2>
          <ul className="project-case__prose project-case__list">
            {project.actions.map((action) => <li key={action}>{action}</li>)}
          </ul>
        </section>

        <section className="project-case__section" aria-labelledby="project-result-title">
          <h2 id="project-result-title">Результат</h2>
          <div className="project-case__result">
            <div className="project-case__metrics">
              {project.metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
            </div>
            <ul className="project-case__prose project-case__list">
              {project.result.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="project-case__result-summary">{project.resultSummary}</p>
          </div>
        </section>

        {project.gallery.length > 0 && (
          <section className="project-case__gallery-section" aria-labelledby="project-gallery-title">
            <h2 id="project-gallery-title">Галерея</h2>
            <div className="project-case__gallery">
              {project.gallery.map((image) => (
                <figure key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="project-case__section project-case__technical" aria-label="Техническая реализация">
          <div aria-hidden="true" />
          <details>
            <summary>Техническая реализация</summary>
            <ul className="project-case__list">
              {project.technical.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </details>
        </section>

        <section className="project-case__section" aria-labelledby="project-stack-title">
          <h2 id="project-stack-title">Стек и интеграции</h2>
          <ul className="project-case__stack">
            {project.stack.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <div className="project-case__product-link-wrap">
          <a
            className="button button--primary project-case__product-link"
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            Открыть публичный продукт
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>

        {otherProjects.length > 0 && (
          <section className="project-case__others" aria-labelledby="other-projects-title">
            <h2 id="other-projects-title">Другие проекты</h2>
            <div className="project-case__other-grid">
              {otherProjects.map((otherProject) => (
                <button
                  className="project-case__other-card"
                  type="button"
                  key={otherProject.slug}
                  onClick={() => onOpenProject(otherProject.slug)}
                >
                  <span>{otherProject.category}</span>
                  <strong>{otherProject.title}</strong>
                  <span>{otherProject.duration}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
