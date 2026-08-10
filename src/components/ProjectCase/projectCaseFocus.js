export function getFocusWrapIndex({ activeIndex, focusableCount, shiftKey }) {
  if (focusableCount === 0) {
    return null;
  }

  if (activeIndex === -1) {
    return shiftKey ? focusableCount - 1 : 0;
  }

  if (shiftKey && activeIndex === 0) {
    return focusableCount - 1;
  }

  if (!shiftKey && activeIndex === focusableCount - 1) {
    return 0;
  }

  return null;
}

export function shouldResetProjectCaseScroll(previousSlug, nextSlug) {
  return Boolean(nextSlug) && previousSlug !== nextSlug;
}
