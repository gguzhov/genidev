export function applyProfileTilt(element, x, y) {
  if (!element) return;

  element.style.setProperty("--pointer-x", `${x}%`);
  element.style.setProperty("--pointer-y", `${y}%`);
  element.style.setProperty("--rotate-x", `${(50 - y) / 9}deg`);
  element.style.setProperty("--rotate-y", `${(x - 50) / 11}deg`);
}

export function resetProfileTilt(element, pendingFrameId, cancelFrame) {
  if (pendingFrameId != null) cancelFrame(pendingFrameId);
  applyProfileTilt(element, 50, 50);
  return null;
}
