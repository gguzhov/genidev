export function shouldRevealAll({ reducedMotion, observerAvailable }) {
  return reducedMotion || !observerAvailable;
}

export function observeCareerItems({ items, Observer, onReveal }) {
  const observer = new Observer(
    (entries) => {
      const revealedIndexes = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => Number(entry.target.dataset.careerIndex));

      if (revealedIndexes.length) {
        onReveal(revealedIndexes);
        revealedIndexes.forEach((index) => observer.unobserve(items[index]));
      }
    },
    { threshold: 0.2 },
  );

  items.forEach((item) => {
    if (item) observer.observe(item);
  });

  return () => observer.disconnect();
}
