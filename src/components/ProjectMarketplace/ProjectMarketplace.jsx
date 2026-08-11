import ProjectCard from "./ProjectCard";
import "./ProjectMarketplace.css";

export default function ProjectMarketplace({ projects, onOpenProject }) {
  return (
    <section className="section marketplace" id="projects" aria-labelledby="projects-title">
      <div className="section__inner">
        <header className="section__heading marketplace__heading">
          <h2 id="projects-title">Маркетплейс моих разработок</h2>
          <p>В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска.</p>
        </header>

        <div className="marketplace__grid">
          {projects.map((project) => (
            <ProjectCard
              project={project}
              onOpenProject={onOpenProject}
              key={project.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
