import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  beginPointerInteraction,
  clampIndex,
  endPointerInteraction,
  getNextOptionIndex,
  movePointerInteraction,
  shouldCaptureWheel,
} from "./optionWheelState";
import "./OptionWheel.css";

export default function OptionWheel({
  items,
  selectedIndex,
  onChange,
  reducedMotion = false,
  ariaLabel = "Выбор бизнес-задачи",
  draggable = true,
}) {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const positionRef = useRef(selectedIndex);
  const targetRef = useRef(selectedIndex);
  const selectedRef = useRef(selectedIndex);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const settleTimerRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const configRef = useRef({});
  const onChangeRef = useRef(onChange);
  const instanceId = useId();
  const [isDragging, setIsDragging] = useState(false);

  onChangeRef.current = onChange;
  selectedRef.current = selectedIndex;
  configRef.current = {
    count: items.length,
    items,
    rowHeight: 68,
    smoothing: reducedMotion ? 0 : 180,
    draggable,
  };

  const renderPosition = useCallback((position) => {
    const { count, rowHeight } = configRef.current;
    const curve = Number.parseFloat(
      getComputedStyle(rootRef.current).getPropertyValue("--option-wheel-curve"),
    );
    const tiltRadians = (7 * Math.PI) / 180;
    const radius = rowHeight / tiltRadians;

    for (let index = 0; index < count; index += 1) {
      const element = itemRefs.current[index];
      if (!element) continue;

      const offset = index - position;
      const distance = Math.abs(offset);
      const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, offset * tiltRadians));
      const x = -radius * (1 - Math.cos(angle)) * (Number.isFinite(curve) ? curve : 1);
      const y = radius * Math.sin(angle);
      const rotation = (angle * 180) / Math.PI;

      element.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(
        2,
      )}px - 50%)) rotate(${rotation.toFixed(3)}deg)`;
      element.style.opacity = String(Math.max(0.16, 1 - distance * 0.26));
      element.style.setProperty("--option-wheel-active", Math.max(0, 1 - distance).toFixed(4));
    }
  }, []);

  const runFrame = useCallback(
    (time) => {
      const { smoothing } = configRef.current;
      const target = targetRef.current;
      let next = target;

      if (smoothing > 0) {
        const elapsed = Math.min((time - lastFrameRef.current) / 1000, 0.05);
        const easing = 1 - Math.exp(-elapsed / (smoothing / 1000));
        next = positionRef.current + (target - positionRef.current) * easing;
        if (Math.abs(target - next) < 0.001) next = target;
      }

      positionRef.current = next;
      renderPosition(next);

      if (next === target) {
        animationRef.current = null;
      } else {
        lastFrameRef.current = time;
        animationRef.current = requestAnimationFrame(runFrame);
      }
    },
    [renderPosition],
  );

  const startAnimation = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    lastFrameRef.current = performance.now();
    animationRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const setTarget = useCallback(
    (value, snap = false) => {
      const { count } = configRef.current;
      const target = clampIndex(snap ? Math.round(value) : value, count);
      targetRef.current = target;

      const nextSelected = clampIndex(Math.round(target), count);
      if (nextSelected !== selectedRef.current) {
        selectedRef.current = nextSelected;
        onChangeRef.current?.(nextSelected);
      }

      startAnimation();
    },
    [startAnimation],
  );

  useEffect(() => {
    targetRef.current = clampIndex(selectedIndex, items.length);
    if (reducedMotion) positionRef.current = targetRef.current;
    startAnimation();
  }, [items.length, reducedMotion, selectedIndex, startAnimation]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return undefined;

    const handleWheel = (event) => {
      const { count, rowHeight } = configRef.current;
      const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;

      if (!shouldCaptureWheel(targetRef.current, delta, count)) return;
      event.preventDefault();

      const step = Math.max(-1, Math.min(1, delta / rowHeight));
      setTarget(targetRef.current + step);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => setTarget(targetRef.current, true), 120);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [setTarget]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(startAnimation);
    observer.observe(element);
    return () => observer.disconnect();
  }, [startAnimation]);

  useEffect(
    () => () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    },
    [],
  );

  const handleKeyDown = (event) => {
    const nextIndex = getNextOptionIndex(selectedRef.current, event.key, items.length);
    if (nextIndex === null || nextIndex === selectedRef.current) return;
    event.preventDefault();
    setTarget(nextIndex, true);
  };

  const handlePointerDown = (event) => {
    if (!configRef.current.draggable) return;

    const currentInteraction = dragRef.current;
    const nextInteraction = beginPointerInteraction(
      currentInteraction,
      event,
      targetRef.current,
      (pointerId) => event.currentTarget.setPointerCapture(pointerId),
    );
    if (nextInteraction === currentInteraction) return;

    dragRef.current = nextInteraction;
    draggedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    const currentInteraction = dragRef.current;
    if (!currentInteraction || currentInteraction.pointerId !== event.pointerId) return;

    const nextInteraction = movePointerInteraction(currentInteraction, event);
    dragRef.current = nextInteraction;
    draggedRef.current = nextInteraction.moved;

    if (nextInteraction.moved) {
      const distance = event.clientY - nextInteraction.startY;
      setTarget(nextInteraction.startTarget - distance / configRef.current.rowHeight);
    }
  };

  const handlePointerEnd = (event) => {
    const outcome = endPointerInteraction(dragRef.current, event.pointerId);
    if (!outcome.handled) return;

    dragRef.current = outcome.interaction;
    draggedRef.current = outcome.shouldSnap;
    setIsDragging(false);
    if (outcome.shouldSnap) setTarget(targetRef.current, true);

    if (
      event.type !== "lostpointercapture" &&
      event.currentTarget.hasPointerCapture?.(outcome.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(outcome.pointerId);
    }
  };

  const handleOptionClick = (index) => {
    if (draggedRef.current) return;
    setTarget(index, true);
  };

  const activeId = items[selectedIndex] ? `${instanceId}-option-${selectedIndex}` : undefined;

  return (
    <div
      ref={rootRef}
      className={`option-wheel${isDragging ? " option-wheel--dragging" : ""}`}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-activedescendant={activeId}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      {items.map((label, index) => (
        <div
          id={`${instanceId}-option-${index}`}
          key={label}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          className={`option-wheel__item${
            selectedIndex === index ? " option-wheel__item--selected" : ""
          }`}
          role="option"
          aria-selected={selectedIndex === index}
          onClick={() => handleOptionClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
