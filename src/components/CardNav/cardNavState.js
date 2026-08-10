export const CLOSED_HEIGHT = 64;

export const CARD_NAV_EASE = Object.freeze({
  css: "cubic-bezier(0.22, 1, 0.36, 1)",
  gsap: "0.22,1,0.36,1",
});

export const CARD_NAV_INITIAL_STATE = Object.freeze({
  desiredOpen: false,
  isExpanded: false,
  isHamburgerOpen: false,
  panelInteractive: false,
  contentVisible: false,
});

export function transitionCardNavState(state, event) {
  if (
    event !== "OPEN" &&
    event !== "CLOSE" &&
    event !== "CLOSE_FINISHED" &&
    event !== "TIMELINE_RECREATED"
  ) {
    return state;
  }

  const desiredOpen = event === "OPEN" || (event === "TIMELINE_RECREATED" && state.desiredOpen);
  const contentVisible = desiredOpen || (event === "CLOSE" && state.desiredOpen);
  return {
    desiredOpen,
    isExpanded: desiredOpen,
    isHamburgerOpen: desiredOpen,
    panelInteractive: desiredOpen,
    contentVisible,
  };
}

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
