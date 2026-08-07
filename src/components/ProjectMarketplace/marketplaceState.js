const DESKTOP_MIN_WIDTH = 1024;
const LOW_MEMORY_GB = 4;
const LOW_CORE_COUNT = 4;

export function shouldUseStaticMarketplace({
  reducedMotion,
  coarsePointer,
  viewportWidth,
  deviceMemory,
  hardwareConcurrency,
}) {
  const compactViewport = !Number.isFinite(viewportWidth) || viewportWidth < DESKTOP_MIN_WIDTH;
  const lowMemory = Number.isFinite(deviceMemory) && deviceMemory <= LOW_MEMORY_GB;
  const lowCpu = Number.isFinite(hardwareConcurrency) && hardwareConcurrency <= LOW_CORE_COUNT;

  return Boolean(reducedMotion || coarsePointer || compactViewport || lowMemory || lowCpu);
}
