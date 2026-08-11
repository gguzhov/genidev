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
      cover: "/projects/ostrov/ostrov-home-comet.webp",
      coverWidth: 1341,
      coverHeight: 768,
    },
    "ilonmask-vpn": {
      cover: "/projects/ilonmask-product-cover.png",
      coverWidth: 1200,
      coverHeight: 630,
    },
    datoniks: {
      cover: "/projects/datoniks/datoniks-slide-03.webp",
      coverWidth: 1920,
      coverHeight: 1080,
    },
  });
});

test("uses truthful intrinsic dimensions in the full case while cards use exact logos", () => {
  assert.match(caseSource, /width=\{project\.coverWidth \?\? 1536\}/);
  assert.match(caseSource, /height=\{project\.coverHeight \?\? 1024\}/);
  assert.doesNotMatch(caseSource, /width="1536"|height="1024"/);
  assert.match(visualSource, /src=\{project\.visual\.logo\}/);
  assert.doesNotMatch(visualSource, /project\.cover/);
});

test("shows the complete ProjectCase cover at its metadata aspect ratio", () => {
  assert.match(
    caseSource,
    /project\.coverWidth && project\.coverHeight[\s\S]*aspectRatio:\s*`\$\{project\.coverWidth\} \/ \$\{project\.coverHeight\}`/,
  );
  assert.match(caseCss, /\.project-case__cover\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.match(caseCss, /\.project-case__cover img\s*\{[^}]*object-fit:\s*contain/s);
});
