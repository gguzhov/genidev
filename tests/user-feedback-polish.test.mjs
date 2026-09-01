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
    assert.equal(capability.solutions.at(-1).title, "Любое другое цифровое решение под вашу проблему");
  }

  const component = await read("src/components/ProblemSelector/ProblemSelector.jsx");
  assert.match(component, /featuredSolutions\s*=\s*selected\?\.solutions\.slice\(0,\s*3\)/);
  assert.match(component, /<OpenSolutionAccent label=\{openSolution\.title\}/);
  assert.doesNotMatch(component, /selected\.solutions\.map/);
});

test("career motion is time-based and checkpoints share the exact path progress", () => {
  assert.equal(typeof careerState.smoothCareerProgressByDelta, "function");
  assert.equal(typeof careerState.getReachedCareerIndexesByProgress, "function");
  assert.equal(typeof careerState.normalizeCareerProgress, "function");
  assert.equal(typeof careerState.getCareerProgressSampleLengths, "function");
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
  assert.deepEqual(careerState.getCareerProgressSampleLengths(0.35, 1000, 4), [
    0, 87.5, 175, 262.5, 350,
  ]);
  assert.deepEqual(careerState.getCareerProgressSampleLengths(0, 1000, 4), [0, 0]);
});

test("career renders path checkpoints instead of measuring unrelated card markers", async () => {
  const component = await read("src/components/CareerTimeline/CareerTimeline.jsx");
  assert.match(component, /const ROAD_VIEWBOX_WIDTH = 100;/);
  assert.match(component, /const ROAD_VIEWBOX_HEIGHT = 1000;/);
  assert.match(component, /career-route__checkpoint/);
  assert.match(component, /checkpointProgresses/);
  assert.doesNotMatch(component, /querySelector\("\.career-timeline__marker"\)/);
  assert.match(component, /progressRoadRef/);
  assert.match(component, /progressRoad\.setAttribute\("d",\s*progressPath\)/);
  assert.doesNotMatch(component, /strokeDasharray|strokeDashoffset|stroke-dasharray|stroke-dashoffset/);
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

test("section headings use the complete line and career accents are deliberate", async () => {
  const [sections, career] = await Promise.all([
    read("src/styles/sections.css"),
    read("src/components/CareerTimeline/CareerTimeline.css"),
  ]);

  const headingRule = sections.match(/\.section__heading h2\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";
  const actionRule = career.match(/\.career-timeline__action\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";
  assert.match(headingRule, /width:\s*100%/);
  assert.match(headingRule, /text-wrap:\s*wrap/);
  assert.doesNotMatch(headingRule, /text-wrap:\s*balance/);
  assert.match(actionRule, /width:\s*100%/);
  assert.match(career, /\.career-timeline__role\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(career, /\.career-timeline__ongoing-label\s*\{[^}]*box-shadow:/s);
});
