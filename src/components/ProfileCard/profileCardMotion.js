export function applyProfileTilt(element, x, y) {
  if (!element) return;

  const pointerX = Math.min(100, Math.max(0, x));
  const pointerY = Math.min(100, Math.max(0, y));
  const maxTilt = 1.5;

  element.style.setProperty("--pointer-x", `${pointerX}%`);
  element.style.setProperty("--pointer-y", `${pointerY}%`);
  element.style.setProperty("--rotate-x", `${((50 - pointerY) / 50) * maxTilt}deg`);
  element.style.setProperty("--rotate-y", `${((pointerX - 50) / 50) * maxTilt}deg`);
}

export function resetProfileTilt(element, pendingFrameId, cancelFrame) {
  if (pendingFrameId != null) cancelFrame(pendingFrameId);
  applyProfileTilt(element, 50, 50);
  return null;
}
