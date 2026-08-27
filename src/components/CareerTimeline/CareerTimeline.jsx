import { Airplane01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  getReachedCareerIndexesByProgress,
  normalizeCareerProgress,
} from "./careerTimelineState";
import "./CareerTimeline.css";

const ROAD_PATH = "M50 0 C25 95 75 155 50 245 C25 335 75 405 50 500 C25 595 75 665 50 755 C25 845 75 905 50 1000";
const ROAD_VIEWBOX_WIDTH = 100;
const ROAD_VIEWBOX_HEIGHT = 1000;

function OngoingSignal({ reducedMotion }) {
  const signalRef = useRef(null);
  const isInView = useInView(signalRef, { amount: "all" });
  const shouldBlink = !reducedMotion && isInView;

  return (
    <motion.span
      ref={signalRef}
      className="career-timeline__ongoing-signal"
      aria-hidden="true"
      initial={false}
      animate={{ opacity: shouldBlink ? [1, 0.24, 1] : 1 }}
      transition={{
        duration: 1.6,
        ease: "easeInOut",
        repeat: reducedMotion || !isInView ? 0 : Infinity,
      }}
    />
  );
}

export default function CareerTimeline({ items, copy, onOpenProject }) {
  const reducedMotion = useReducedMotion();
  const routeRef = useRef(null);
  const roadRef = useRef(null);
  const reachedSignatureRef = useRef("");
  const [reachedItems, setReachedItems] = useState(() => new Set());
  const [checkpointPositions, setCheckpointPositions] = useState([]);
  const planeX = useMotionValue(0);
  const planeY = useMotionValue(0);
  const planeAngle = useMotionValue(135);
  const completedProgress = useMotionValue(1);
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ["start 76%", "end 56%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    mass: 0.28,
    restDelta: 0.0005,
    restSpeed: 0.0005,
  });
  const sourceProgress = reducedMotion ? completedProgress : smoothProgress;
  const activeProgress = useTransform(sourceProgress, normalizeCareerProgress);
  const checkpointProgresses = useMemo(
    () => items.map((_, index) => (items.length > 1 ? index / (items.length - 1) : 0)),
    [items],
  );

  const getRouteGeometry = useCallback((progress) => {
    const route = routeRef.current;
    const road = roadRef.current;
    if (!route || !road) return { left: 0, top: 0, angle: 135 };

    const resolvedProgress = Math.max(0, Math.min(1, progress));
    const totalLength = road.getTotalLength?.() ?? 0;
    const point = road.getPointAtLength?.(totalLength * resolvedProgress)
      ?? { x: 50, y: resolvedProgress * ROAD_VIEWBOX_HEIGHT };
    const tangentStart = Math.max(0, resolvedProgress - 0.0025);
    const tangentEnd = Math.min(1, resolvedProgress + 0.0025);
    const before = road.getPointAtLength?.(totalLength * tangentStart) ?? point;
    const after = road.getPointAtLength?.(totalLength * tangentEnd) ?? point;
    const routeBounds = route.getBoundingClientRect();
    const svgBounds = road.ownerSVGElement?.getBoundingClientRect();
    const scaleX = (svgBounds?.width ?? ROAD_VIEWBOX_WIDTH) / ROAD_VIEWBOX_WIDTH;
    const scaleY = (svgBounds?.height ?? ROAD_VIEWBOX_HEIGHT) / ROAD_VIEWBOX_HEIGHT;
    const left = svgBounds
      ? svgBounds.left - routeBounds.left + point.x * scaleX
      : routeBounds.width / 2;
    const top = svgBounds
      ? svgBounds.top - routeBounds.top + point.y * scaleY
      : resolvedProgress * routeBounds.height;
    const tangentAngle = Math.atan2(
      (after.y - before.y) * scaleY,
      (after.x - before.x) * scaleX,
    ) * (180 / Math.PI);

    return { left, top, angle: tangentAngle + 45 };
  }, []);

  const syncProgress = useCallback((progress) => {
    const geometry = getRouteGeometry(progress);
    planeX.set(geometry.left);
    planeY.set(geometry.top);
    planeAngle.set(geometry.angle);

    const reachedIndexes = getReachedCareerIndexesByProgress(progress, checkpointProgresses);
    const nextSignature = reachedIndexes.join(",");
    if (nextSignature !== reachedSignatureRef.current) {
      reachedSignatureRef.current = nextSignature;
      setReachedItems(new Set(reachedIndexes));
    }
  }, [checkpointProgresses, getRouteGeometry, planeAngle, planeX, planeY]);

  useMotionValueEvent(activeProgress, "change", syncProgress);

  useEffect(() => {
    const route = routeRef.current;
    const road = roadRef.current;
    if (!route || !road) return undefined;

    const updateLayout = () => {
      setCheckpointPositions(checkpointProgresses.map(getRouteGeometry));
      syncProgress(activeProgress.get());
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(route);
    if (road.ownerSVGElement) resizeObserver.observe(road.ownerSVGElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeProgress, checkpointProgresses, getRouteGeometry, syncProgress]);

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
            <motion.path
              className="career-route__road-progress"
              d={ROAD_PATH}
              ref={roadRef}
              style={{ pathLength: activeProgress }}
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
          <motion.span
            className="career-route__plane"
            style={{ x: planeX, y: planeY, rotate: planeAngle }}
            aria-hidden="true"
          >
            <HugeiconsIcon icon={Airplane01Icon} size={20} strokeWidth={1.8} />
          </motion.span>

          <ol className="career-timeline">
          {items.map((item, index) => (
            <li
              className={`career-timeline__event${reachedItems.has(index) ? " is-reached" : ""}`}
              data-career-index={index}
              key={`${item.year}-${item.title}`}
            >
              <article className="career-timeline__entry">
                <div className="career-timeline__meta">
                  <p className="career-timeline__year">
                    {item.year}
                    {item.ongoing ? <OngoingSignal reducedMotion={reducedMotion} /> : null}
                  </p>
                  {item.logos?.length ? (
                    <div className="career-timeline__logos" aria-label={item.title}>
                      {item.logos?.map((logo) => (
                        <img
                          className={`career-timeline__logo career-timeline__logo--${logo.id}`}
                          src={logo.src}
                          alt={logo.alt}
                          width={logo.width}
                          height={logo.height}
                          loading="lazy"
                          decoding="async"
                          key={logo.id}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <h3>{item.title}</h3>
                <p className="career-timeline__body">{item.body}</p>
                {item.result || item.action ? (
                  <div className="career-timeline__footer">
                    {item.result ? (
                      <p
                        className={`career-timeline__result${item.highlightResult ? " career-timeline__result--highlight" : ""}`}
                      >
                        {item.result}
                      </p>
                    ) : null}
                    {item.action ? (
                      <button
                        className="career-timeline__action"
                        type="button"
                        onClick={() => onOpenProject?.(item.action.projectSlug)}
                        aria-label={`${item.action.label}: ${item.title}`}
                      >
                        <span>{item.action.label}</span>
                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
