import ProjectVisual from "./ProjectVisual";

export default function ProjectCard({
  project,
  onOpenProject,
  decorative = false,
  variant = "grid",
  tabIndex = decorative ? -1 : 0,
}) {
  return (
    <article
      className={`project-card project-card--${variant}${
        project.coverCrop ? ` project-card--cover-${project.coverCrop}` : ""
      }`}
      aria-hidden={decorative ? "true" : undefined}
    >
      <ProjectVisual project={project} interactive={!decorative} />

      <div className="project-card__body">
        <p className="project-card__category">{project.category}</p>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__summary">{project.summary}</p>
        <div className="project-card__meta" aria-label="Статус и срок проекта">
          <span className="project-card__status">
            {project.status ?? "Реализованный продукт"}
          </span>
          <span className="project-card__duration">{project.duration}</span>
        </div>
        <ul className="project-card__metrics" aria-label="Результаты проекта">
          {project.metrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
        {!decorative && (
          <button
            className="project-card__open"
            type="button"
            aria-label={`Открыть кейс: ${project.title}`}
            tabIndex={tabIndex}
            onClick={() => onOpenProject(project.slug)}
          >
            Открыть кейс
          </button>
        )}
      </div>
    </article>
  );
}
