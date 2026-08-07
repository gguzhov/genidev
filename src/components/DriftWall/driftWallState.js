export const DRIFT_WALL_LAYOUT = Object.freeze({ tileHeight: 310, tileGap: 20 });

export function shouldAnimateDriftWall({ isVisible, documentHidden, reducedMotion }) {
  return Boolean(isVisible && !documentHidden && !reducedMotion);
}

export function getAnimationFrameAction({ active, frameId }) {
  if (active && frameId === null) return "schedule";
  if (!active && frameId !== null) return "cancel";
  return "none";
}

export function isRectVisibleInViewport(
  rect,
  { viewportWidth, viewportHeight },
) {
  return Boolean(
    rect.bottom > 0 &&
      rect.top < viewportHeight &&
      rect.right > 0 &&
      rect.left < viewportWidth,
  );
}

export function observeViewportVisibility({
  element,
  onChange,
  Observer = typeof IntersectionObserver === "undefined" ? undefined : IntersectionObserver,
  windowTarget = typeof window === "undefined" ? undefined : window,
}) {
  if (Observer) {
    const observer = new Observer(([entry]) => onChange(entry.isIntersecting), {
      rootMargin: "0px",
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }

  if (!windowTarget) {
    onChange(false);
    return () => {};
  }

  const checkVisibility = () => {
    onChange(
      isRectVisibleInViewport(element.getBoundingClientRect(), {
        viewportWidth: windowTarget.innerWidth,
        viewportHeight: windowTarget.innerHeight,
      }),
    );
  };
  checkVisibility();
  windowTarget.addEventListener("scroll", checkVisibility, { passive: true });
  windowTarget.addEventListener("resize", checkVisibility, { passive: true });

  return () => {
    windowTarget.removeEventListener("scroll", checkVisibility);
    windowTarget.removeEventListener("resize", checkVisibility);
  };
}

export function getNextTrackOffset(offset, velocity, deltaSeconds, copyHeight) {
  if (!copyHeight) return 0;
  const next = offset + velocity * deltaSeconds;
  return ((next % copyHeight) + copyHeight) % copyHeight;
}

export function getTrackSegmentHeight(projectCount, layout = DRIFT_WALL_LAYOUT) {
  return Math.max(0, projectCount) * (layout.tileHeight + layout.tileGap);
}

export function buildWallColumns(projects, { columns = 4, copies = 4 } = {}) {
  if (!projects.length) return [];

  const columnCount = Math.max(1, columns);
  const copyCount = Math.max(2, copies);

  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const orderedProjects = projects.map(
      (_, projectIndex) => projects[(projectIndex + columnIndex) % projects.length],
    );

    const tiles = Array.from({ length: copyCount }, (_, copyIndex) =>
      orderedProjects.map((project, projectIndex) => {
        return {
          project,
          decorative: true,
          tabIndex: -1,
          key: `${columnIndex}-${copyIndex}-${projectIndex}-${project.slug}`,
        };
      }),
    ).flat();

    return { key: `column-${columnIndex}`, tiles };
  });
}

export function buildWallPresentation(projects, options) {
  const semanticProjects = [...new Map(projects.map((project) => [project.slug, project])).values()];
  return {
    semanticProjects,
    columns: buildWallColumns(projects, options),
  };
}
