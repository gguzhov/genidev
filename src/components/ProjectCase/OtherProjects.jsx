import ProjectVisual from "../ProjectMarketplace/ProjectVisual";

export default function OtherProjects({ projects, onOpenProject }) {
  if (!projects.length) return null;

  return (
    <section className="project-case__others" aria-labelledby="other-projects-title">
      <h2 id="other-projects-title">Другие проекты</h2>
      <div className="project-case__other-grid">
        {projects.map((project) => (
          <button
            className="project-case__other-card"
            type="button"
            key={project.slug}
            onClick={() => onOpenProject(project.slug)}
          >
            <ProjectVisual project={project} interactive={false} />
            <span className="project-case__other-copy">
              <small>{project.category}</small>
              <strong>{project.title}</strong>
              <span>Открыть кейс</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
