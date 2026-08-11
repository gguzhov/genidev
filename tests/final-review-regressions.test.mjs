import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

const expectedOutcomes = {
  launch: [
    "Гипотеза готова к проверке на реальных пользователях.",
    "Доходы, затраты и ограничения собраны в модели.",
    "MVP готов к первым пользователям.",
    "Определены метрики для решения о развитии.",
  ],
  automate: [
    "Ручные операции переведены в цифровой сценарий.",
    "Статус процесса виден в одной системе.",
    "Ошибки и исключения фиксируются.",
    "Скорость и результат процесса доступны в аналитике.",
  ],
  ai: [
    "Типовые операции выполняются автоматически.",
    "Ответы проверяются по заданным критериям.",
    "Сотрудники быстрее обрабатывают повторяемые задачи.",
    "Ошибки и нестандартные случаи передаются человеку.",
  ],
  growth: [
    "Видны потери на каждом шаге воронки.",
    "Сокращён путь до целевого действия.",
    "Гипотезы приоритизированы по ожидаемому эффекту.",
    "Эффект изменений виден в продуктовых метриках.",
  ],
};

test("publishes the approved operational outcomes exactly", () => {
  assert.deepEqual(
    Object.fromEntries(problems.map(({ id, outcomes }) => [id, outcomes])),
    expectedOutcomes,
  );
});

test("keeps tablet project results in one column without breaking words", async () => {
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );
  const tablet = css.slice(
    css.indexOf("@media (min-width: 768px)"),
    css.indexOf("@media (min-width: 1024px)"),
  );
  const desktop = css.slice(css.indexOf("@media (min-width: 1024px)"));

  assert.doesNotMatch(tablet, /project-card__metrics[\s\S]*grid-template-columns/);
  assert.match(
    desktop,
    /\.project-card__metrics\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /word-break:\s*normal/);
});

test("sequences the 500ms signal before nodes with an exact CustomEase", async () => {
  const source = await readFile("src/components/WorkSequence/WorkSequence.jsx", "utf8");
  assert.match(source, /CustomEase\.create\([^,]+,\s*"0\.22,1,0\.36,1"\)/);
  assert.match(source, /timeline\s*\.to\(signal,[\s\S]*duration:\s*0\.5/s);
  assert.match(
    source,
    /timeline\s*\.to\(signal,[\s\S]*?\)\s*\.to\(nodes,[\s\S]*stagger:\s*0\.07[\s\S]*?,\s*0\.5\s*\)/s,
  );
  assert.match(source, /context\.revert\(\)/);
});

test("delays outcomes until the 280ms action reveal has completed", async () => {
  const css = await readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8");
  assert.match(
    css,
    /animation-delay:\s*calc\(var\(--motion-state\)\s*\+\s*var\(--outcome-index\)\s*\*\s*45ms\)/,
  );
});

test("pointer lifecycle attaches only while fine-hover motion is allowed", async () => {
  const { createProjectPointerLifecycle } = await import(
    "../src/components/ProjectMarketplace/projectVisualPointerLifecycle.js"
  );
  const cardListeners = new Map();
  const media = {
    hover: createMedia(false),
    reduced: createMedia(false),
  };
  const resets = [];
  const card = {
    addEventListener(type, handler) {
      cardListeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (cardListeners.get(type) === handler) cardListeners.delete(type);
    },
  };
  const visual = {};
  const cleanup = createProjectPointerLifecycle({
    card,
    visual,
    interactive: true,
    matchMedia: (query) => (query.includes("prefers-reduced") ? media.reduced : media.hover),
    onPointerMove: () => {},
    resetDepth: (element) => resets.push(element),
  });

  assert.equal(cardListeners.size, 0);
  media.hover.setMatches(true);
  assert.deepEqual([...cardListeners.keys()].sort(), ["pointerleave", "pointermove"]);
  media.reduced.setMatches(true);
  assert.equal(cardListeners.size, 0);
  assert.equal(resets.at(-1), visual);
  media.reduced.setMatches(false);
  assert.equal(cardListeners.size, 2);

  cleanup();
  assert.equal(cardListeners.size, 0);
  assert.equal(media.hover.listenerCount(), 0);
  assert.equal(media.reduced.listenerCount(), 0);
  assert.equal(resets.at(-1), visual);
});

test("a sequence revealed under reduced motion never replays when preference changes", async () => {
  const { createWorkSequenceMotionState, transitionWorkSequenceMotionState } =
    await import("../src/components/WorkSequence/workSequenceRevealState.js");
  const initial = createWorkSequenceMotionState(true);
  const fullMotion = transitionWorkSequenceMotionState(initial, "PREFERENCE_FULL");
  const attemptedReveal = transitionWorkSequenceMotionState(fullMotion, "REVEAL");

  assert.deepEqual(initial, { isRevealed: true, hasSettled: true });
  assert.equal(attemptedReveal, fullMotion);
});

function createMedia(initialMatches) {
  let matches = initialMatches;
  const listeners = new Set();
  return {
    get matches() {
      return matches;
    },
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener);
    },
    setMatches(nextMatches) {
      matches = nextMatches;
      for (const listener of listeners) listener({ matches });
    },
    listenerCount: () => listeners.size,
  };
}
