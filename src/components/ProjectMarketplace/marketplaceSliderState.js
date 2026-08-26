export function clampMarketplaceIndex(index, projectCount) {
  if (projectCount <= 0) return 0;
  return Math.max(0, Math.min(projectCount - 1, index));
}

export function findClosestMarketplaceIndex(scrollLeft, cardOffsets) {
  if (!cardOffsets.length) return 0;

  return cardOffsets.reduce(
    (best, offset, index) => {
      const distance = Math.abs(offset - scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY },
  ).index;
}
