import { useState } from "react";

export default function ProjectCard({
  project,
  onOpenProject,
  decorative = false,
  variant = "grid",
  tabIndex = decorative ? -1 : 0,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Element = decorative ? "div" : "button";

  return (
    <Element
      className={`project-card project-card--${variant}${
        project.coverCrop ? ` project-card--cover-${project.coverCrop}` : ""
      }${imageFailed ? " has-image-fallback" : ""}`}
      type={decorative ? undefined : "button"}
      aria-hidden={decorative ? "true" : undefined}
      tabIndex={tabIndex}
      onClick={decorative ? undefined : () => onOpenProject(project.slug)}
    >
      <span className="project-card__media" aria-hidden="true">
        {!imageFailed && (
          <img
            src={project.cover}
            alt=""
            width={project.coverWidth ?? 1536}
            height={project.coverHeight ?? 1024}
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="project-card__fallback-title">{project.title}</span>
      </span>

      <span className="project-card__body">
        <span className="project-card__category">{project.category}</span>
        <strong className="project-card__title">{project.title}</strong>
        <span className="project-card__summary">{project.summary}</span>
        <span className="project-card__duration">{project.duration}</span>
        <span className="project-card__metrics" role="list" aria-label="Результаты проекта">
          {project.metrics.map((metric) => (
            <span role="listitem" key={metric}>
              {metric}
            </span>
          ))}
        </span>
        {!decorative && <span className="project-card__action">Открыть кейс</span>}
      </span>
    </Element>
  );
}
