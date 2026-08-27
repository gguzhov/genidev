import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { problems } from "../src/content/siteContent.js";
import * as careerState from "../src/components/CareerTimeline/careerTimelineState.js";

const read = (path) => readFile(path, "utf8");

test("capabilities present three clear products and render the open solution as plain text", async () => {
  const management = problems.find(({ id }) => id === "management");
  assert.ok(management.solutions.some(({ title }) => title === "Цифровой двойник бизнеса"));

  for (const capability of problems) {
    assert.equal(capability.solutions.length, 4);
    assert.equal(capability.solutions.at(-1).title, "И другое цифровое решение");
  }

  const component = await read("src/components/ProblemSelector/ProblemSelector.jsx");
  assert.match(component, /featuredSolutions\s*=\s*selected\?\.solutions\.slice\(0,\s*3\)/);
  assert.match(component, /problem-selector__open-solution/);
  assert.doesNotMatch(component, /selected\.solutions\.map/);
});

test("career motion is time-based and checkpoints share the exact path progress", () => {
  assert.equal(typeof careerState.smoothCareerProgressByDelta, "function");
  assert.equal(typeof careerState.getReachedCareerIndexesByProgress, "function");
  assert.equal(typeof careerState.normalizeCareerProgress, "function");
  assert.equal(typeof careerState.getCareerStrokeState, "function");
  const oneFrame = careerState.smoothCareerProgressByDelta(0, 1, 16, 180);
  const twoFrames = careerState.smoothCareerProgressByDelta(
    careerState.smoothCareerProgressByDelta(0, 1, 8, 180),
    1,
    8,
    180,
  );
  assert.ok(Math.abs(oneFrame - twoFrames) < 0.002);
  assert.deepEqual(
    careerState.getReachedCareerIndexesByProgress(0.5, [0, 0.25, 0.5, 0.75, 1]),
    [0, 1, 2],
  );
  assert.equal(careerState.normalizeCareerProgress(0.008), 0);
  assert.equal(careerState.normalizeCareerProgress(0.992), 1);
  assert.ok(Math.abs(careerState.normalizeCareerProgress(0.5) - 0.5) < 0.0001);
  assert.deepEqual(careerState.getCareerStrokeState(0.35, 1200), {
    dasharray: "1200px 1200px",
    dashoffset: "780px",
  });
  assert.deepEqual(careerState.getCareerStrokeState(1, 1200), {
    dasharray: "1200px 1200px",
    dashoffset: "0px",
  });
});

test("career renders path checkpoints instead of measuring unrelated card markers", async () => {
  const component = await read("src/components/CareerTimeline/CareerTimeline.jsx");
  assert.match(component, /career-route__checkpoint/);
  assert.match(component, /checkpointProgresses/);
  assert.doesNotMatch(component, /querySelector\("\.career-timeline__marker"\)/);
  assert.match(component, /road\.style\.strokeDasharray/);
  assert.match(component, /road\.style\.strokeDashoffset/);
  assert.doesNotMatch(component, /<motion\.path/);
});

test("project gallery has no arrow buttons but keeps swipe, dots and keyboard navigation", async () => {
  const component = await read("src/components/ProjectCase/ProjectGallery.jsx");
  assert.doesNotMatch(component, /ArrowLeft02Icon|ArrowRight02Icon/);
  const controlsMarkup = component.match(/<div className="project-gallery__controls">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.doesNotMatch(controlsMarkup, /<button/);
  assert.match(component, /project-gallery__track/);
  assert.match(component, /project-gallery__dots/);
  assert.match(component, /event\.key === "ArrowRight"/);
});

test("result bento never outgrows its section heading", async () => {
  const css = await read("src/components/ProjectCase/ProjectCase.css");
  assert.match(css, /project-case__metrics strong\s*\{[^}]*font-size:\s*clamp\([^;]*1\.35rem\)/s);
  assert.doesNotMatch(css, /project-case__metric--lead strong\s*\{[^}]*3rem/s);
  assert.doesNotMatch(css, /min-height:\s*14rem\s*!important/);
});
