import ProjectCard from "./ProjectCard";
import "./ProjectMarketplace.css";

export default function ProjectMarketplace({ projects, onOpenProject }) {
  return (
    <section className="section marketplace" id="projects" aria-labelledby="projects-title">
      <div className="section__inner">
        <header className="section__heading marketplace__heading">
          <p className="section__eyebrow">Реализованные проекты</p>
          <h2 id="projects-title">От задачи до работающего продукта</h2>
          <p>В этих проектах я самостоятельно прошёл путь от бизнес-задачи до запуска.</p>
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
