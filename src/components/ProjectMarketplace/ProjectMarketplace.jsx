import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import ProjectCard from "./ProjectCard";
import {
  clampMarketplaceIndex,
  findClosestMarketplaceIndex,
} from "./marketplaceSliderState";
import "./ProjectMarketplace.css";

export default function ProjectMarketplace({ projects, onOpenProject, copy, ui }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const scrollFrameRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => () => {
    if (scrollFrameRef.current !== undefined) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
  }, []);

  const scrollToProject = (nextIndex) => {
    const viewport = viewportRef.current;
    const cards = trackRef.current?.querySelectorAll(".project-card");
    const resolvedIndex = clampMarketplaceIndex(nextIndex, projects.length);
    const card = cards?.[resolvedIndex];
    if (!viewport || !card) return;

    viewport.scrollTo({
      left: card.offsetLeft,
      behavior: reducedMotion ? "auto" : "smooth",
    });
    setActiveIndex(resolvedIndex);
  };

  const updateActiveProject = () => {
    if (scrollFrameRef.current !== undefined) return;
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = undefined;
      const viewport = viewportRef.current;
      const cards = [...(trackRef.current?.querySelectorAll(".project-card") ?? [])];
      if (!viewport || !cards.length) return;
      setActiveIndex(
        findClosestMarketplaceIndex(
          viewport.scrollLeft,
          cards.map((card) => card.offsetLeft),
        ),
      );
    });
  };

  const handleViewportKeyDown = (event) => {
    const keyTargets = {
      ArrowLeft: activeIndex - 1,
      ArrowRight: activeIndex + 1,
      Home: 0,
      End: projects.length - 1,
    };
    if (!(event.key in keyTargets)) return;
    event.preventDefault();
    scrollToProject(keyTargets[event.key]);
  };

  return (
    <section className="section marketplace" id="projects" aria-labelledby="projects-title">
      <div className="section__inner">
        <header className="section__heading marketplace__heading">
          <h2 id="projects-title">{copy.title}</h2>
          <p>{copy.description}</p>
        </header>

        <div
          className="marketplace__viewport"
          ref={viewportRef}
          role="region"
          aria-roledescription={ui.carousel}
          aria-label={ui.marketplaceRegion}
          tabIndex="0"
          onScroll={updateActiveProject}
          onKeyDown={handleViewportKeyDown}
        >
          <div className="marketplace__track" ref={trackRef}>
            {projects.map((project) => (
              <ProjectCard
                project={project}
                onOpenProject={onOpenProject}
                ui={ui}
                key={project.slug}
              />
            ))}
          </div>
        </div>

        <div className="marketplace__footer">
          <div className="marketplace__controls" aria-label={ui.sliderControls}>
            <button
              className="marketplace__previous"
              type="button"
              aria-label={ui.previousProject}
              disabled={activeIndex === 0}
              onClick={() => scrollToProject(Math.max(0, activeIndex - 1))}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <span aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
            <button
              className="marketplace__next"
              type="button"
              aria-label={ui.nextProject}
              disabled={activeIndex === projects.length - 1}
              onClick={() => scrollToProject(Math.min(projects.length - 1, activeIndex + 1))}
            >
              <HugeiconsIcon icon={ArrowRight02Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
