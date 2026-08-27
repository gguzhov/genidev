import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";

const [visualSource, caseSource, caseCss] = await Promise.all([
  readFile("src/components/ProjectMarketplace/ProjectVisual.jsx", "utf8"),
  readFile("src/components/ProjectCase/ProjectCase.jsx", "utf8"),
  readFile("src/components/ProjectCase/ProjectCase.css", "utf8"),
]);

test("publishes the real intrinsic dimensions for every project cover", () => {
  const covers = Object.fromEntries(
    projects.map(({ slug, cover, coverWidth, coverHeight }) => [
      slug,
      { cover, coverWidth, coverHeight },
    ]),
  );

  assert.deepEqual(covers, {
    "ostrov-zdoroviya": {
      cover: "/projects/ostrov/ostrov-home-clean.webp",
      coverWidth: 1920,
      coverHeight: 1080,
    },
    "ilonmask-vpn": {
      cover: "/projects/ilonmask/ilonmask-landing-2026.webp",
      coverWidth: 3448,
      coverHeight: 1728,
    },
    datoniks: {
      cover: "/projects/datoniks/datoniks-slide-03.webp",
      coverWidth: 1920,
      coverHeight: 1080,
    },
    "wedding-vote": {
      cover: "/projects/wedding/wedding-display.png",
      coverWidth: 1280,
      coverHeight: 720,
    },
  });
});

test("uses truthful intrinsic dimensions in the full case and evidence plus exact logos in cards", () => {
  assert.match(caseSource, /width=\{project\.coverWidth \?\? 1536\}/);
  assert.match(caseSource, /height=\{project\.coverHeight \?\? 1024\}/);
  assert.doesNotMatch(caseSource, /width="1536"|height="1024"/);
  assert.match(visualSource, /src=\{project\.visual\.logo\}/);
  assert.match(visualSource, /src=\{project\.cardCover \?\? project\.cover\}/);
  assert.match(visualSource, /project-visual__logo-plate/);
});

test("shows the complete ProjectCase cover at its metadata aspect ratio", () => {
  assert.match(
    caseSource,
    /project\.coverWidth && project\.coverHeight[\s\S]*aspectRatio:\s*`\$\{project\.coverWidth\} \/ \$\{project\.coverHeight\}`/,
  );
  assert.match(caseCss, /\.project-case__cover\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.match(caseCss, /\.project-case__cover img\s*\{[^}]*object-fit:\s*contain/s);
});
