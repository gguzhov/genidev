import { ArrowUpRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  getFocusWrapIndex,
  shouldResetProjectCaseScroll,
} from "./projectCaseFocus";
import OtherProjects from "./OtherProjects";
import ProjectGallery from "./ProjectGallery";
import "./ProjectCase.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function Paragraphs({ text }) {
  return text.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function ExternalActions({ actions }) {
  if (!actions?.length) return null;

  return (
    <div className="project-case__external-actions" aria-label="Действия проекта">
      {actions.map((action, index) => (
        <a
          className={`button project-case__external-action${
            index === 0 ? " button--primary" : ""
          }`}
          href={action.href}
          target={action.target}
          rel={action.rel}
          download={action.download ? "" : undefined}
          key={`${action.label}-${action.href}`}
        >
          {action.label}
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </a>
      ))}
    </div>
  );
}

export default function ProjectCase({ project, projects, onClose, onOpenProject }) {
  const dialogRef = useRef(null);
  const surfaceRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousProjectSlugRef = useRef(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const otherProjects = projects.filter(({ slug }) => slug !== project.slug);

  useEffect(() => {
    setCoverFailed(false);
  }, [project.slug]);

  useLayoutEffect(() => {
    if (
      surfaceRef.current &&
      shouldResetProjectCaseScroll(previousProjectSlugRef.current, project.slug)
    ) {
      surfaceRef.current.scrollTop = 0;
    }

    previousProjectSlugRef.current = project.slug;
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
      <article className="project-case__surface" ref={surfaceRef}>
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
            <h2 className="project-case__title" id="project-title">{project.title}</h2>
            {project.status && <p className="project-case__status">{project.status}</p>}
            <p className="project-case__duration">{project.duration}</p>
            <p className="project-case__summary">{project.summary}</p>
            <ExternalActions actions={project.primaryAction ? [project.primaryAction] : undefined} />
          </div>
          {project.videoEmbed ? (
            <div className="project-case__video">
              <iframe
                src={project.videoEmbed}
                title={`Видео проекта «${project.title}»`}
                allow="autoplay; encrypted-media"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className={`project-case__cover${coverFailed ? " has-image-fallback" : ""}`}
              style={
                project.coverWidth && project.coverHeight
                  ? { aspectRatio: `${project.coverWidth} / ${project.coverHeight}` }
                  : undefined
              }
            >
              {!coverFailed && (
                <img
                  src={project.cover}
                  alt={`Обложка проекта «${project.title}»`}
                  width={project.coverWidth ?? 1536}
                  height={project.coverHeight ?? 1024}
                  decoding="async"
                  onError={() => setCoverFailed(true)}
                />
              )}
              <strong>{project.title}</strong>
            </div>
          )}
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
            <ul className="project-case__metrics" aria-label="Ключевые результаты проекта">
              {project.metrics.map((metric) => (
                <li key={metric}><strong>{metric}</strong></li>
              ))}
            </ul>
            <p className="project-case__result-summary">{project.resultSummary}</p>
          </div>
        </section>

        {project.gallery.length > 0 && (
          <section className="project-case__gallery-section" aria-labelledby="project-gallery-title">
            <h2 id="project-gallery-title">Галерея</h2>
            <ProjectGallery images={project.gallery} title={`Галерея проекта ${project.title}`} />
          </section>
        )}

        <section className="project-case__section" aria-labelledby="project-stack-title">
          <h2 id="project-stack-title">Навыки и инструменты</h2>
          <div className="project-case__stack-wrap">
            <ul className="project-case__stack">
              {project.skills.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <ExternalActions actions={project.externalActions} />
          </div>
        </section>

        {project.url && (
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
        )}

        <OtherProjects projects={otherProjects} onOpenProject={onOpenProject} />
      </article>
    </div>
  );
}
