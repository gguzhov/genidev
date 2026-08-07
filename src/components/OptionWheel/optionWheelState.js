const clampIndex = (index, count) =>
  Math.min(Math.max(index, 0), Math.max(count - 1, 0));

export function getNextOptionIndex(currentIndex, key, count) {
  const direction = {
    ArrowUp: -1,
    ArrowLeft: -1,
    ArrowDown: 1,
    ArrowRight: 1,
  }[key];

  if (!direction || count <= 0) return null;
  return clampIndex(currentIndex + direction, count);
}

export function shouldCaptureWheel(target, deltaY, count) {
  if (!deltaY || count <= 1) return false;
  return deltaY < 0 ? target > 0 : target < count - 1;
}

export function beginPointerInteraction(
  currentInteraction,
  { pointerId, clientY },
  startTarget,
  capturePointer,
) {
  if (currentInteraction) return currentInteraction;

  capturePointer(pointerId);
  return {
    pointerId,
    startY: clientY,
    startTarget,
    moved: false,
  };
}

export function movePointerInteraction(interaction, { pointerId, clientY }, threshold = 4) {
  if (!interaction || interaction.pointerId !== pointerId || interaction.moved) {
    return interaction;
  }

  if (Math.abs(clientY - interaction.startY) <= threshold) return interaction;
  return { ...interaction, moved: true };
}

export function endPointerInteraction(interaction, pointerId) {
  if (!interaction || interaction.pointerId !== pointerId) {
    return {
      interaction,
      handled: false,
      pointerId: null,
      shouldSnap: false,
    };
  }

  return {
    interaction: null,
    handled: true,
    pointerId: interaction.pointerId,
    shouldSnap: interaction.moved,
  };
}

export { clampIndex };
