export function shouldCompleteProgress({ reducedMotion, observerAvailable }) {
  return reducedMotion || !observerAvailable;
}

export function getContiguousReachedIndexes(furthestReached) {
  if (!Number.isInteger(furthestReached) || furthestReached < 0) return [];
  return Array.from({ length: furthestReached + 1 }, (_, index) => index);
}

export function smoothCareerProgress(current, target, factor = 0.16) {
  const clampedTarget = Math.max(0, Math.min(1, target));
  const clampedCurrent = Math.max(0, Math.min(1, current));
  if (Math.abs(clampedTarget - clampedCurrent) < 0.0005) return clampedTarget;
  return clampedCurrent + (clampedTarget - clampedCurrent) * factor;
}

export function smoothCareerProgressByDelta(current, target, deltaMs, responseMs = 180) {
  const clampedTarget = Math.max(0, Math.min(1, target));
  const clampedCurrent = Math.max(0, Math.min(1, current));
  if (Math.abs(clampedTarget - clampedCurrent) < 0.0005) return clampedTarget;

  const safeDelta = Math.max(0, Number.isFinite(deltaMs) ? deltaMs : 0);
  const safeResponse = Math.max(1, Number.isFinite(responseMs) ? responseMs : 180);
  const factor = 1 - Math.exp(-safeDelta / safeResponse);
  return clampedCurrent + (clampedTarget - clampedCurrent) * factor;
}

export function getReachedCareerIndexesByProgress(progress, checkpointProgresses) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return checkpointProgresses.reduce((reached, checkpointProgress, index) => {
    if (checkpointProgress <= clampedProgress + 0.0005) reached.push(index);
    return reached;
  }, []);
}

export function getReachedCareerIndexesByPositions(planeTop, markerTops) {
  if (!Number.isFinite(planeTop)) return [];
  return markerTops.reduce((reached, markerTop, index) => {
    if (Number.isFinite(markerTop) && markerTop <= planeTop) reached.push(index);
    return reached;
  }, []);
}

export function observeCareerProgress({ items, Observer, onProgress }) {
  let active = true;
  const observer = new Observer(
    (entries) => {
      if (!active) return;

      const reachedIndexes = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => Number(entry.target.dataset.careerIndex));

      if (reachedIndexes.length) {
        onProgress(reachedIndexes);
        reachedIndexes.forEach((index) => observer.unobserve(items[index]));
      }
    },
    { threshold: 0.2 },
  );

  items.forEach((item) => {
    if (item) observer.observe(item);
  });

  return () => {
    active = false;
    observer.disconnect();
  };
}
