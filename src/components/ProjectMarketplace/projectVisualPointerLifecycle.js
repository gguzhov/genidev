export const PROJECT_FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const PROJECT_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const PROJECT_DEPTH_ACTIVE_CLASS = "project-visual--depth-active";

function subscribeMedia(media, listener) {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }

  media.addListener?.(listener);
  return () => media.removeListener?.(listener);
}

export function createProjectPointerLifecycle({
  card,
  visual,
  interactive,
  matchMedia,
  onPointerMove,
  resetDepth,
}) {
  if (!interactive || !card || !visual || typeof matchMedia !== "function") {
    if (visual) {
      visual.classList?.remove(PROJECT_DEPTH_ACTIVE_CLASS);
      resetDepth(visual);
    }
    return () => {};
  }

  const finePointerMedia = matchMedia(PROJECT_FINE_POINTER_QUERY);
  const reducedMotionMedia = matchMedia(PROJECT_REDUCED_MOTION_QUERY);
  let disposed = false;
  let pointerListenersAttached = false;

  const resetInteraction = () => {
    visual.classList?.remove(PROJECT_DEPTH_ACTIVE_CLASS);
    resetDepth(visual);
  };
  const handlePointerMove = (event) => {
    visual.classList?.add(PROJECT_DEPTH_ACTIVE_CLASS);
    onPointerMove(event);
  };
  const onPointerLeave = () => resetInteraction();
  const detachPointerListeners = () => {
    if (!pointerListenersAttached) return;
    card.removeEventListener("pointermove", handlePointerMove);
    card.removeEventListener("pointerleave", onPointerLeave);
    pointerListenersAttached = false;
  };
  const syncPointerListeners = () => {
    if (disposed) return;
    const shouldAttach = finePointerMedia.matches && !reducedMotionMedia.matches;
    if (shouldAttach && !pointerListenersAttached) {
      card.addEventListener("pointermove", handlePointerMove);
      card.addEventListener("pointerleave", onPointerLeave);
      pointerListenersAttached = true;
      return;
    }
    if (!shouldAttach) {
      detachPointerListeners();
      resetInteraction();
    }
  };

  const unsubscribeFinePointer = subscribeMedia(finePointerMedia, syncPointerListeners);
  const unsubscribeReducedMotion = subscribeMedia(reducedMotionMedia, syncPointerListeners);
  syncPointerListeners();

  return () => {
    disposed = true;
    detachPointerListeners();
    unsubscribeFinePointer();
    unsubscribeReducedMotion();
    resetInteraction();
  };
}
