export function createMarketplaceRevealLifecycle({
  root,
  items = [],
  reducedMotion,
  matchMedia = globalThis.matchMedia?.bind(globalThis),
  Observer = globalThis.IntersectionObserver,
}) {
  let active = true;
  let observer;
  let disconnected = false;
  const motionPreference = matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = reducedMotion ?? motionPreference?.matches ?? false;

  const disconnect = () => {
    if (!observer || disconnected) return;
    disconnected = true;
    observer.disconnect();
  };

  const settle = () => {
    if (!root) return;
    root.classList.add("is-revealed");
    disconnect();
  };

  const onMotionPreferenceChange = (event) => {
    if (active && event.matches) settle();
  };

  if (!root) return () => {};

  if (root.classList.contains?.("is-revealed") || prefersReducedMotion || !Observer || !items.length) {
    root.classList.remove("is-reveal-ready");
    settle();
    return () => {
      active = false;
    };
  }

  items.forEach((item, index) => {
    item.style.setProperty("--reveal-index", String(index));
  });
  root.classList.add("is-reveal-ready");
  motionPreference?.addEventListener?.("change", onMotionPreferenceChange);

  observer = new Observer((entries) => {
    if (!active || !entries.some((entry) => entry.isIntersecting)) return;
    settle();
  }, { threshold: 0.12 });
  observer.observe(root);

  return () => {
    active = false;
    disconnect();
    motionPreference?.removeEventListener?.("change", onMotionPreferenceChange);
    items.forEach((item) => item.style.removeProperty("--reveal-index"));
  };
}
