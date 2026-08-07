export const CLOSED_HEIGHT = 64;

export function getMenuRecreationState(isExpanded, expandedHeight) {
  if (isExpanded) {
    return {
      height: expandedHeight,
      cardsY: 0,
      cardsOpacity: 1,
      timelineProgress: 1,
    };
  }

  return {
    height: CLOSED_HEIGHT,
    cardsY: 32,
    cardsOpacity: 0,
    timelineProgress: 0,
  };
}

export function getNavigationCloseOptions(source) {
  return { restoreFocus: source === "panel" };
}
