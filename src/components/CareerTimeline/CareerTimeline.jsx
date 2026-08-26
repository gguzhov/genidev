import { Airplane01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  getReachedCareerIndexesByProgress,
  smoothCareerProgressByDelta,
} from "./careerTimelineState";
import "./CareerTimeline.css";

const ROAD_PATH = "M50 0 C10 95 90 155 50 245 C10 335 90 405 50 500 C10 595 90 665 50 755 C10 845 90 905 50 1000";

export default function CareerTimeline({ items, copy }) {
  const reducedMotion = useReducedMotion();
  const routeRef = useRef(null);
  const roadRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [reachedItems, setReachedItems] = useState(() => new Set());
  const [checkpointPositions, setCheckpointPositions] = useState([]);
  const checkpointProgresses = useMemo(
    () => items.map((_, index) => (items.length > 1 ? index / (items.length - 1) : 0)),
    [items],
  );

  useEffect(() => {
    const route = routeRef.current;
    if (!route) return undefined;

    let frameId;
    let reachedSignature = "";
    let checkpointSignature = "";
    let lastFrameTime;

    const getRouteGeometry = (progress) => {
      const bounds = route.getBoundingClientRect();
      const road = roadRef.current;
      const totalLength = road?.getTotalLength?.() ?? 0;
      const resolvedProgress = Math.max(0, Math.min(1, progress));
      const point = road?.getPointAtLength?.(totalLength * resolvedProgress)
        ?? { x: 50, y: resolvedProgress * 1000 };
      const tangentProgress = resolvedProgress >= 0.998
        ? Math.max(0, resolvedProgress - 0.002)
        : Math.min(1, resolvedProgress + 0.002);
      const tangentPoint = road?.getPointAtLength?.(totalLength * tangentProgress) ?? point;
      const svgBounds = road?.ownerSVGElement?.getBoundingClientRect();
      const left = svgBounds
        ? svgBounds.left - bounds.left + (point.x / 100) * svgBounds.width
        : bounds.width / 2;
      const top = svgBounds
        ? svgBounds.top - bounds.top + (point.y / 1000) * svgBounds.height
        : resolvedProgress * bounds.height;
      const direction = resolvedProgress >= 0.998 ? -1 : 1;
      const scaleX = (svgBounds?.width ?? 100) / 100;
      const scaleY = (svgBounds?.height ?? 1000) / 1000;
      const dx = (tangentPoint.x - point.x) * scaleX * direction;
      const dy = (tangentPoint.y - point.y) * scaleY * direction;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return { left, top, angle };
    };

    const updateCheckpoints = () => {
      const positions = checkpointProgresses.map((progress) => getRouteGeometry(progress));
      const nextSignature = positions
        .map(({ left, top }) => `${left.toFixed(1)}:${top.toFixed(1)}`)
        .join("|");
      if (nextSignature !== checkpointSignature) {
        checkpointSignature = nextSignature;
        setCheckpointPositions(positions);
      }
    };

    const renderProgress = (progress) => {
      const geometry = getRouteGeometry(progress);
      route.style.setProperty("--career-scroll-progress", progress.toFixed(4));
      roadRef.current?.setAttribute("stroke-dashoffset", (1 - progress).toFixed(4));
      route.style.setProperty("--career-plane-top", `${geometry.top.toFixed(2)}px`);
      route.style.setProperty("--career-plane-left", `${geometry.left.toFixed(2)}px`);
      route.style.setProperty("--career-plane-angle", `${geometry.angle.toFixed(2)}deg`);

      const reachedIndexes = getReachedCareerIndexesByProgress(progress, checkpointProgresses);
      const nextSignature = reachedIndexes.join(",");
      if (nextSignature !== reachedSignature) {
        reachedSignature = nextSignature;
        setReachedItems(new Set(reachedIndexes));
      }
    };

    const drawPlane = (time) => {
      const deltaMs = Math.min(48, lastFrameTime === undefined ? 16 : time - lastFrameTime);
      lastFrameTime = time;
      const progress = smoothCareerProgressByDelta(
        currentProgressRef.current,
        targetProgressRef.current,
        deltaMs,
        95,
      );
      currentProgressRef.current = progress;
      renderProgress(progress);

      if (progress !== targetProgressRef.current) {
        frameId = requestAnimationFrame(drawPlane);
      } else {
        frameId = undefined;
      }
    };

    const updateTarget = () => {
      const bounds = route.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.78;
      const finish = viewportHeight * 0.2 - bounds.height;
      targetProgressRef.current = Math.max(
        0,
        Math.min(1, (start - bounds.top) / (start - finish || 1)),
      );
      updateCheckpoints();
      lastFrameTime = undefined;
      if (frameId === undefined) frameId = requestAnimationFrame(drawPlane);
    };

    if (reducedMotion) {
      currentProgressRef.current = 1;
      targetProgressRef.current = 1;
      updateCheckpoints();
      renderProgress(1);
      return undefined;
    }

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, [checkpointProgresses, reducedMotion]);

  return (
    <section className="section career-section" id="career" aria-labelledby="career-title">
      <div className="section__inner">
        <div className="section__heading">
          <h2 id="career-title">{copy.title}</h2>
        </div>

        <div
          className="career-route"
          ref={routeRef}
        >
          <svg className="career-route__road" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="career-route__road-base" d={ROAD_PATH} />
            <path
              className="career-route__road-progress"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              d={ROAD_PATH}
              ref={roadRef}
            />
          </svg>
          {checkpointProgresses.map((progress, index) => {
            const position = checkpointPositions[index];
            return (
              <span
                className={`career-route__checkpoint${reachedItems.has(index) ? " is-reached" : ""}`}
                style={{
                  "--checkpoint-left": `${position?.left ?? 0}px`,
                  "--checkpoint-top": `${position?.top ?? 0}px`,
                }}
                aria-hidden="true"
                key={`${items[index]?.year ?? index}-${progress}`}
              />
            );
          })}
          <span className="career-route__plane" aria-hidden="true">
            <HugeiconsIcon icon={Airplane01Icon} size={20} strokeWidth={1.8} />
          </span>

          <ol className="career-timeline">
          {items.map((item, index) => (
            <li
              className={`career-timeline__event${reachedItems.has(index) ? " is-reached" : ""}`}
              data-career-index={index}
              key={`${item.year}-${item.title}`}
            >
              <article className="career-timeline__entry">
                <p className="career-timeline__year">{item.year}</p>
                <h3>{item.title}</h3>
                <p className="career-timeline__body">{item.body}</p>
                <p className="career-timeline__result">{item.result}</p>
              </article>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
