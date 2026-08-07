export function shouldAnimateDriftWall({ isVisible, documentHidden, reducedMotion }) {
  return Boolean(isVisible && !documentHidden && !reducedMotion);
}

export function getNextTrackOffset(offset, velocity, deltaSeconds, copyHeight) {
  if (!copyHeight) return 0;
  const next = offset + velocity * deltaSeconds;
  return ((next % copyHeight) + copyHeight) % copyHeight;
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
        const decorative = columnIndex !== 0 || copyIndex !== 0;
        return {
          project,
          decorative,
          tabIndex: decorative ? -1 : 0,
          key: `${columnIndex}-${copyIndex}-${projectIndex}-${project.slug}`,
        };
      }),
    ).flat();

    return { key: `column-${columnIndex}`, tiles };
  });
}
