import ProjectVisual from "./ProjectVisual";

export default function ProjectCard({
  project,
  onOpenProject,
  decorative = false,
  variant = "grid",
  tabIndex = decorative ? -1 : 0,
  ui,
}) {
  return (
    <article
      className={`project-card project-card--${variant}${
        project.coverCrop ? ` project-card--cover-${project.coverCrop}` : ""
      }`}
      aria-hidden={decorative ? "true" : undefined}
    >
      <ProjectVisual project={project} interactive={false} />

      <div className="project-card__body">
        <div className="project-card__meta">
        <ul className="project-card__tags" aria-label={ui?.projectCategories}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <time>{project.deliveredAt}</time>
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__summary">{project.summary}</p>
        {!decorative && (
          <button
            className="project-card__open"
            type="button"
            aria-label={`${ui?.case?.open ?? "Открыть кейс"}: ${project.title}`}
            tabIndex={tabIndex}
            onClick={() => onOpenProject(project.slug)}
          >
            {ui?.more ?? "Подробнее"}
          </button>
        )}
      </div>
    </article>
  );
}
