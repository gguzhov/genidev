export const nextProblemScanRevision = (currentRevision) => currentRevision + 1;

export const getProblemScanKey = (problemId, scanRevision) =>
  `${problemId}:${scanRevision}`;
