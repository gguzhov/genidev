import { useEffect, useRef, useState } from "react";

const DEFAULT_POINTER = {
  "--project-pointer-x": "0px",
  "--project-pointer-y": "0px",
  "--project-light-x": "50%",
  "--project-light-y": "50%",
  "--project-tilt-x": "0deg",
  "--project-tilt-y": "0deg",
};

function canUsePointerDepth() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ProjectVisual({ project }) {
  const visualRef = useRef(null);
  const [atmosphereFailed, setAtmosphereFailed] = useState(false);
  const [productFailed, setProductFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const resetDepth = (element) => {
    for (const [property, value] of Object.entries(DEFAULT_POINTER)) {
      element.style.setProperty(property, value);
    }
  };

  const onPointerMove = (event) => {
    if (!canUsePointerDepth()) return;

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
    if (!visual || !card) return undefined;

    const onPointerLeave = () => resetDepth(visual);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerleave", onPointerLeave);

    return () => {
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <span
      className={`project-visual project-card__media project-visual--${project.slug}`}
      aria-hidden="true"
      style={DEFAULT_POINTER}
      ref={visualRef}
    >
      {!atmosphereFailed && (
        <img
          className="project-visual__atmosphere"
          src={project.visual.background}
          alt=""
          width="1536"
          height="1024"
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setAtmosphereFailed(true)}
        />
      )}

      <span
        className="project-visual__product-frame"
        style={
          project.coverWidth && project.coverHeight
            ? { aspectRatio: `${project.coverWidth} / ${project.coverHeight}` }
            : undefined
        }
      >
        {!productFailed && (
          <img
            className="project-visual__product"
            src={project.cover}
            alt=""
            width={project.coverWidth ?? 1536}
            height={project.coverHeight ?? 1024}
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setProductFailed(true)}
          />
        )}
        {productFailed && (
          <span className="project-visual__fallback-title">{project.title}</span>
        )}
      </span>

      {!logoFailed && (
        <img
          className="project-visual__logo"
          src={project.visual.logo}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setLogoFailed(true)}
        />
      )}
    </span>
  );
}
