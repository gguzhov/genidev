export function createWorkSequenceObserver({
  root,
  reducedMotion,
  onReveal,
  IntersectionObserverClass = globalThis.IntersectionObserver,
}) {
  let disposed = false;
  let revealed = false;

  const revealOnce = () => {
    if (disposed || revealed) return;
    revealed = true;
    onReveal();
  };

  if (!root || reducedMotion || !IntersectionObserverClass) {
    revealOnce();
    return () => {
      disposed = true;
    };
  }

  const observer = new IntersectionObserverClass(
    (entries) => {
      if (disposed || revealed || !entries.some((entry) => entry.isIntersecting)) return;
      revealOnce();
      observer.disconnect();
    },
    { root: null, rootMargin: "0px", threshold: 0.35 },
  );

  observer.observe(root);

  return () => {
    disposed = true;
    observer.disconnect();
  };
}
