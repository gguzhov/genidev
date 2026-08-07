import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "../ProjectMarketplace/ProjectCard";
import {
  DRIFT_WALL_LAYOUT,
  buildWallPresentation,
  getAnimationFrameAction,
  getNextTrackOffset,
  getTrackSegmentHeight,
  observeViewportVisibility,
  shouldAnimateDriftWall,
} from "./driftWallState";
import "./DriftWall.css";

const COLUMN_COUNT = 4;
const TRACK_COPIES = 4;

export default function DriftWall({
  projects,
  onOpenProject,
  reducedMotion = false,
  tileHeight = DRIFT_WALL_LAYOUT.tileHeight,
  tileGap = DRIFT_WALL_LAYOUT.tileGap,
}) {
  const containerRef = useRef(null);
  const planeRef = useRef(null);
  const trackRefs = useRef([]);
  const offsetsRef = useRef([]);
  const lastTimestampRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const dampedPointerRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(() =>
    typeof document === "undefined" ? false : document.hidden,
  );

  const { columns, semanticProjects } = useMemo(
    () => buildWallPresentation(projects, { columns: COLUMN_COUNT, copies: TRACK_COPIES }),
    [projects],
  );
  const copyHeight = getTrackSegmentHeight(projects.length, { tileHeight, tileGap });
  const animationActive = shouldAnimateDriftWall({ isVisible, documentHidden, reducedMotion });
  const wallStyle = {
    "--dw-tile-height": `${tileHeight}px`,
    "--dw-tile-gap": `${tileGap}px`,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    return observeViewportVisibility({ element: container, onChange: setIsVisible });
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    offsetsRef.current = columns.map((_, columnIndex) =>
      copyHeight ? copyHeight * ((columnIndex * 0.29) % 1) : 0,
    );
  }, [columns, copyHeight]);

  useEffect(() => {
    const active = animationActive && copyHeight > 0;
    if (getAnimationFrameAction({ active, frameId: rafRef.current }) !== "schedule") {
      return undefined;
    }

    const animate = (timestamp) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaSeconds = Math.min(0.05, (timestamp - lastTimestampRef.current) / 1000);
      lastTimestampRef.current = timestamp;

      const damping = 1 - Math.exp(-deltaSeconds / 0.14);
      dampedPointerRef.current.x +=
        (pointerRef.current.x - dampedPointerRef.current.x) * damping;
      dampedPointerRef.current.y +=
        (pointerRef.current.y - dampedPointerRef.current.y) * damping;

      if (planeRef.current) {
        const turn = -8 + dampedPointerRef.current.x * 5;
        const tilt = 7 - dampedPointerRef.current.y * 4;
        planeRef.current.style.transform =
          `translate(-50%, -50%) rotateX(${tilt}deg) rotateY(${turn}deg) translateZ(-52px)`;
      }

      trackRefs.current.forEach((track, columnIndex) => {
        if (!track) return;
        const direction = columnIndex % 2 === 0 ? 1 : -1;
        const velocity = direction * (17 + columnIndex * 2.5);
        const offset = getNextTrackOffset(
          offsetsRef.current[columnIndex] ?? 0,
          velocity,
          deltaSeconds,
          copyHeight,
        );
        offsetsRef.current[columnIndex] = offset;
        track.style.transform = `translate3d(0, ${-offset}px, 0)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (
        getAnimationFrameAction({ active: false, frameId: rafRef.current }) === "cancel"
      ) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [animationActive, copyHeight]);

  const handlePointerMove = useCallback((event) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    };
  }, []);

  const resetPointer = useCallback(() => {
    pointerRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      className="drift-wall"
      ref={containerRef}
      style={wallStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      role="group"
      aria-label="Проекты в движущейся витрине"
    >
      <div className="drift-wall__visual" aria-hidden="true">
        <div className="drift-wall__plane" ref={planeRef}>
          {columns.map((column, columnIndex) => (
            <div className="drift-wall__column" key={column.key}>
              <div
                className="drift-wall__track"
                ref={(element) => {
                  trackRefs.current[columnIndex] = element;
                }}
              >
                {column.tiles.map(({ project, decorative, tabIndex, key }) => (
                  <div className="drift-wall__tile" key={key}>
                    <ProjectCard
                      project={project}
                      onOpenProject={onOpenProject}
                      decorative={decorative}
                      tabIndex={tabIndex}
                      variant="wall"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="drift-wall__semantic-layer" aria-label="Открыть кейс проекта">
        {semanticProjects.map((project) => (
          <ProjectCard
            project={project}
            onOpenProject={onOpenProject}
            variant="wall-control"
            key={project.slug}
          />
        ))}
      </div>
    </div>
  );
}
