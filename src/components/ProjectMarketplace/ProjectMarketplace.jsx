import { useEffect, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import DriftWall from "../DriftWall/DriftWall";
import ProjectCard from "./ProjectCard";
import { shouldUseStaticMarketplace } from "./marketplaceState";
import "./ProjectMarketplace.css";

const POINTER_QUERY = "(hover: none), (pointer: coarse)";

function readEnvironment() {
  if (typeof window === "undefined") {
    return { coarsePointer: true, viewportWidth: 0 };
  }

  return {
    coarsePointer: window.matchMedia(POINTER_QUERY).matches,
    viewportWidth: window.innerWidth,
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  };
}

export default function ProjectMarketplace({ projects, onOpenProject }) {
  const reducedMotion = useReducedMotion();
  const [environment, setEnvironment] = useState(readEnvironment);

  useEffect(() => {
    const pointerMedia = window.matchMedia(POINTER_QUERY);
    const updateEnvironment = () => setEnvironment(readEnvironment());

    pointerMedia.addEventListener("change", updateEnvironment);
    window.addEventListener("resize", updateEnvironment, { passive: true });
    return () => {
      pointerMedia.removeEventListener("change", updateEnvironment);
      window.removeEventListener("resize", updateEnvironment);
    };
  }, []);

  const useStaticGrid = shouldUseStaticMarketplace({ reducedMotion, ...environment });

  return (
    <section className="section marketplace" id="projects" aria-labelledby="projects-title">
      <div className="section__inner">
        <div className="section__heading marketplace__heading">
          <p className="section__eyebrow">Разработки</p>
          <h2 id="projects-title">Маркетплейс моих разработок</h2>
          <p>Проекты, которые я самостоятельно прошёл от бизнес-задачи до запуска.</p>
        </div>

        {useStaticGrid ? (
          <div className="marketplace__grid">
            {projects.map((project) => (
              <ProjectCard
                project={project}
                onOpenProject={onOpenProject}
                key={project.slug}
              />
            ))}
          </div>
        ) : (
          <DriftWall
            projects={projects}
            onOpenProject={onOpenProject}
            reducedMotion={reducedMotion}
          />
        )}
      </div>
    </section>
  );
}
