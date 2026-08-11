import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const MANIFEST_PATH = "docs/design-evidence/marketplace-datoniks-final-manifest.json";
const VERIFY_SCRIPT = "scripts/verify-marketplace-evidence.mjs";
const CAPTURE_SCRIPT = "scripts/capture-marketplace-evidence-cdp.mjs";
const WIDTHS = [375, 430, 768, 1024, 1280, 1440];
const CAPTURE_READINESS = {
  workSequenceFinalNodes: 6,
  problemOutcomesFinalVisible: 4,
  projectCardsFinalVisible: 3,
  projectImagesDecoded: 9,
};
const SECTIONS = [
  ["01-hero", "Разрабатываю цифровые и AI-продукты."],
  ["02-problems", "В чем могу быть полезен?"],
  ["03-career", "От торговли и экономики — к цифровым продуктам"],
  ["04-projects", "Маркетплейс моих разработок"],
  ["05-contact", "Расскажите, что должно измениться."],
];

test("verifies all 30 section captures against DOM headings and PNG dimensions", async () => {
  await assert.doesNotReject(access(VERIFY_SCRIPT));
  await assert.doesNotReject(access(MANIFEST_PATH));

  const { verifyEvidenceManifest } = await import(
    "../scripts/verify-marketplace-evidence.mjs"
  );
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const expected = WIDTHS.flatMap((width) =>
    SECTIONS.map(([section, heading]) => ({
      filename: `${width}-${section}.png`,
      heading,
      width,
    })),
  );

  assert.equal(manifest.deviceScaleFactor, 1);
  assert.equal(manifest.entries.length, 30);
  assert.deepEqual(manifest.captureReadiness, CAPTURE_READINESS);
  assert.equal(manifest.contactSheets.length, WIDTHS.length);
  assert.deepEqual(
    manifest.entries.map(({ filename, heading, width }) => ({ filename, heading, width })),
    expected,
  );

  const result = await verifyEvidenceManifest(MANIFEST_PATH);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(result.rows.length, 30);
  for (const row of result.rows) {
    assert.equal(row.pngWidth, row.width);
    assert.ok(row.pngHeight > 0);
    assert.ok(row.pngHeight >= Math.floor(row.domHeight) - 1);
    assert.ok(row.pngHeight <= Math.ceil(row.domHeight) + 1);
  }

  for (const width of WIDTHS) {
    const hero = manifest.entries.find(({ filename }) => filename === `${width}-01-hero.png`);
    const problems = manifest.entries.find(({ filename }) => filename === `${width}-02-problems.png`);
    const projects = manifest.entries.find(({ filename }) => filename === `${width}-04-projects.png`);
    const contactSheet = manifest.contactSheets.find((entry) => entry.width === width);

    assert.equal(hero.readiness.workSequenceFinalNodes, 6);
    assert.equal(problems.readiness.problemOutcomesFinalVisible, 4);
    assert.equal(projects.readiness.projectCardsFinalVisible, 3);
    assert.equal(projects.readiness.projectImagesDecoded, 9);
    assert.equal(contactSheet.filename, `${width}-all-sections.png`);
    assert.equal(contactSheet.sourceFiles.length, 5);
    assert.equal(contactSheet.pngWidth, width);
    assert.ok(contactSheet.pngHeight > 0);
  }
});

test("the verifier rejects captures that did not reach their final visual states", async () => {
  const verifier = await import("../scripts/verify-marketplace-evidence.mjs");
  assert.equal(typeof verifier.validateCaptureReadiness, "function");

  const errors = verifier.validateCaptureReadiness(
    {
      filename: "375-01-hero.png",
      readiness: { workSequenceFinalNodes: 5 },
    },
    CAPTURE_READINESS,
  );

  assert.ok(errors.some((error) => error.includes("WorkSequence")));
});

test("the capture pipeline waits for animation final states and decoded project images", async () => {
  const capture = await readFile(CAPTURE_SCRIPT, "utf8");

  assert.match(capture, /workSequenceFinalNodes/);
  assert.match(capture, /problemOutcomesFinalVisible/);
  assert.match(capture, /projectCardsFinalVisible/);
  assert.match(capture, /projectImagesDecoded/);
  assert.match(capture, /\.decode\(\)/);
  assert.match(capture, /contactSheets/);
  assert.match(capture, /scrollBehavior\s*=\s*"auto"/);
  assert.match(capture, /scrollY\s*===\s*0/);
});
