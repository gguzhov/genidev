export function shouldCompleteProgress({ reducedMotion, observerAvailable }) {
  return reducedMotion || !observerAvailable;
}

export function observeCareerProgress({ items, Observer, onProgress }) {
  let active = true;
  const observer = new Observer(
    (entries) => {
      if (!active) return;

      const reachedIndexes = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => Number(entry.target.dataset.careerIndex));

      if (reachedIndexes.length) {
        onProgress(reachedIndexes);
        reachedIndexes.forEach((index) => observer.unobserve(items[index]));
      }
    },
    { threshold: 0.2 },
  );

  items.forEach((item) => {
    if (item) observer.observe(item);
  });

  return () => {
    active = false;
    observer.disconnect();
  };
}
