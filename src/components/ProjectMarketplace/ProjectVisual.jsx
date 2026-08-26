import { useEffect, useRef, useState } from "react";
import { createProjectPointerLifecycle } from "./projectVisualPointerLifecycle";

const DEFAULT_POINTER = {
  "--project-pointer-x": "0px",
  "--project-pointer-y": "0px",
  "--project-light-x": "50%",
  "--project-light-y": "50%",
  "--project-tilt-x": "0deg",
  "--project-tilt-y": "0deg",
};

export default function ProjectVisual({ project, interactive = true }) {
  const visualRef = useRef(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const resetDepth = (element) => {
    for (const [property, value] of Object.entries(DEFAULT_POINTER)) {
      element.style.setProperty(property, value);
    }
  };

  const onPointerMove = (event) => {
    const visual = visualRef.current;
    if (!visual) return;

    const bounds = visual.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
    );
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2),
    );

    visual.style.setProperty("--project-pointer-x", `${(x * 7).toFixed(2)}px`);
    visual.style.setProperty("--project-pointer-y", `${(y * 5).toFixed(2)}px`);
    visual.style.setProperty("--project-light-x", `${(50 + x * 27).toFixed(2)}%`);
    visual.style.setProperty("--project-light-y", `${(50 + y * 22).toFixed(2)}%`);
    visual.style.setProperty("--project-tilt-x", `${(y * -0.9).toFixed(2)}deg`);
    visual.style.setProperty("--project-tilt-y", `${(x * 1.15).toFixed(2)}deg`);
  };

  useEffect(() => {
    const visual = visualRef.current;
    const card = visual?.closest(".project-card");
    return createProjectPointerLifecycle({
      card,
      visual,
      interactive,
      matchMedia:
        typeof window === "undefined" ? undefined : window.matchMedia.bind(window),
      onPointerMove,
      resetDepth,
    });
  }, [interactive]);

  return (
    <span
      className={`project-visual project-card__media project-visual--${project.slug}`}
      aria-hidden="true"
      style={DEFAULT_POINTER}
      ref={visualRef}
    >
      <img
        className="project-visual__cover"
        data-visual-layer="evidence"
        src={project.cardCover ?? project.cover}
        alt=""
        width={project.cardCoverWidth ?? project.coverWidth ?? 1536}
        height={project.cardCoverHeight ?? project.coverHeight ?? 1024}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
      <span className="project-visual__gradient" data-visual-layer="atmosphere" />

      {!logoFailed && (
        <span className="project-visual__logo-plate">
        <img
          className="project-visual__logo"
          data-visual-layer="brand"
          src={project.visual.logo}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setLogoFailed(true)}
        />
        </span>
      )}
      {logoFailed && (
        <span className="project-visual__fallback-title">{project.title}</span>
      )}
    </span>
  );
}
