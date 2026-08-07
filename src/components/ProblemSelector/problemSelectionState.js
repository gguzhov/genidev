const clampSelection = (index, count) =>
  Math.min(Math.max(Math.round(index), 0), Math.max(count - 1, 0));

export function transitionSelectedIndex(currentIndex, requestedIndex, count) {
  if (count <= 0) return 0;
  if (!Number.isFinite(requestedIndex)) return clampSelection(currentIndex, count);
  return clampSelection(requestedIndex, count);
}
