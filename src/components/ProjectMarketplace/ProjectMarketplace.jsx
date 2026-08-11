import { useEffect, useRef } from "react";
import ProjectCard from "./ProjectCard";
import { createMarketplaceRevealLifecycle } from "./marketplaceRevealLifecycle";
import "./ProjectMarketplace.css";

export default function ProjectMarketplace({ projects, onOpenProject }) {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    return createMarketplaceRevealLifecycle({
      root: grid,
      items: [...grid.querySelectorAll(".project-card")],
    });
  }, [projects]);

  return (
    <section className="section marketplace" id="projects" aria-labelledby="projects-title">
      <div className="section__inner">
        <header className="section__heading marketplace__heading">
          <h2 id="projects-title">Маркетплейс моих разработок</h2>
          <p>В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска.</p>
        </header>

        <div className="marketplace__grid" ref={gridRef}>
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
