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

function ExternalActions({ actions, label }) {
  if (!actions?.length) return null;

  return (
    <div className="project-case__external-actions" aria-label={label}>
      {actions.map((action) => (
        <a
          className="button button--primary project-case__external-action"
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

export default function ProjectCase({ project, projects, onClose, onOpenProject, ui, languageSwitcher }) {
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
          {languageSwitcher}
          <button
            className="project-case__close"
            type="button"
            aria-label={ui.case.close}
            ref={closeButtonRef}
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <header className="project-case__hero">
          <div className="project-case__intro">
            <ul className="project-case__tags" aria-label={ui.projectCategories}>
              {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <h2 className="project-case__title" id="project-title">{project.title}</h2>
            <time className="project-case__date">{project.deliveredAt}</time>
            <p className="project-case__summary">{project.summary}</p>
          </div>
          {project.videoEmbed ? (
            <div className="project-case__video">
              <iframe
                src={project.videoEmbed}
                title={`${ui.case.video}: ${project.title}`}
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
                  alt={`${ui.case.cover}: ${project.title}`}
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
          <h2 id="project-problem-title">{project.challengeLabel}</h2>
          <div className="project-case__prose"><Paragraphs text={project.challenge} /></div>
        </section>

        <section className="project-case__section" aria-labelledby="project-actions-title">
          <h2 id="project-actions-title">{ui.case.solution}</h2>
          <ul className="project-case__solution-grid">
            {project.solution.map(({ label, text }, index) => (
              <li key={label}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="project-case__section project-case__section--results" aria-labelledby="project-result-title">
          <h2 id="project-result-title">{ui.case.benefit}</h2>
          <div className="project-case__result">
            <p className="project-case__benefit">{project.benefit}</p>
            <ul className="project-case__metrics" aria-label={ui.case.metrics}>
              {project.metrics.map((metric, index) => (
                <li key={metric}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{metric}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {project.gallery.length > 0 && (
          <section className="project-case__gallery-section" aria-labelledby="project-gallery-title">
            <h2 id="project-gallery-title">{ui.case.gallery}</h2>
            <ProjectGallery
              key={project.slug}
              images={project.gallery}
              title={`${ui.case.galleryLabel}: ${project.title}`}
              ui={ui}
            />
          </section>
        )}

        {(project.externalActions?.length || project.url) && (
          <section className="project-case__section project-case__section--links" aria-labelledby="project-links-title">
            <h2 id="project-links-title">{ui.case.links}</h2>
            <ExternalActions actions={project.externalActions} label={ui.case.actions} />
            {project.url && (
            <a
              className="button button--primary project-case__product-link"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              {ui.case.product}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
            </a>
            )}
          </section>
        )}

        <OtherProjects projects={otherProjects} onOpenProject={onOpenProject} ui={ui} />
      </article>
    </div>
  );
}
