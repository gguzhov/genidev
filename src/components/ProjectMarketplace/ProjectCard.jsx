import { useState } from "react";

export default function ProjectCard({
  project,
  onOpenProject,
  decorative = false,
  variant = "grid",
  tabIndex = decorative ? -1 : 0,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      className={`project-card project-card--${variant}${imageFailed ? " has-image-fallback" : ""}`}
      type="button"
      aria-label={`Открыть кейс «${project.title}»`}
      aria-hidden={decorative ? "true" : undefined}
      tabIndex={tabIndex}
      onClick={() => onOpenProject(project.slug)}
    >
      <span className="project-card__media" aria-hidden="true">
        {!imageFailed && (
          <img
            src={project.cover}
            alt=""
            width="1536"
            height="1024"
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
        <span className="project-card__duration">{project.duration}</span>
        <span className="project-card__metrics">
          {project.metrics.map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </span>
      </span>
    </button>
  );
}
