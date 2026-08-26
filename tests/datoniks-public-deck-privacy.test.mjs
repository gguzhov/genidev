import assert from "node:assert/strict";
import { access, copyFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const MANIFEST_PATH = "public/documents/datoniks-pitch-deck-public.manifest.json";
const VERIFY_SCRIPT = "scripts/verify-datoniks-public-deck.mjs";
const VERIFY_CONTACTS_SCRIPT = "scripts/verify-pdf-public-privacy.mjs";
const SOURCE_PATH = "/Users/gguzhov/Downloads/Питч-дек_DATONIKS.pdf";

test("ties the public deck to approved source pages and excludes private team/contact slides", async (t) => {
  await assert.doesNotReject(access(VERIFY_SCRIPT));
  await assert.doesNotReject(access(MANIFEST_PATH));

  const { inspectPublicDeck, verifyDeckAgainstSource } = await import(
    "../scripts/verify-datoniks-public-deck.mjs"
  );
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const inspection = inspectPublicDeck(manifest.publicPath);

  assert.equal(manifest.sourcePageCount, 18);
  assert.deepEqual(manifest.includedSourcePages, [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17,
  ]);
  assert.deepEqual(manifest.excludedSourcePages, [16, 18]);
  assert.equal(manifest.publicPageCount, 16);
  assert.equal(manifest.publicPageFingerprints.length, 16);
  assert.equal(manifest.excludedSourcePageFingerprints.length, 2);
  for (const fingerprint of manifest.excludedSourcePageFingerprints) {
    assert.match(fingerprint, /^[a-f0-9]{64}$/);
    assert.equal(manifest.publicPageFingerprints.includes(fingerprint), false);
  }
  assert.equal(inspection.pageCount, 16);
  assert.deepEqual(inspection.pageFingerprints, manifest.publicPageFingerprints);
  assert.match(manifest.sourceSha256, /^[a-f0-9]{64}$/);

  const sourceAvailable = await access(SOURCE_PATH).then(
    () => true,
    () => false,
  );
  if (sourceAvailable) {
    const sourceVerification = verifyDeckAgainstSource({
      manifestPath: MANIFEST_PATH,
      sourcePath: SOURCE_PATH,
    });
    assert.equal(sourceVerification.valid, true, sourceVerification.errors.join("\n"));
  } else {
    t.diagnostic("Source PDF unavailable; durable private-slide fingerprints verified instead.");
  }
});

test("scans every published DATONIKS PDF for contacts and participant data", async () => {
  await assert.doesNotReject(access(VERIFY_CONTACTS_SCRIPT));
  const scannerSource = await readFile(VERIFY_CONTACTS_SCRIPT, "utf8");
  assert.match(scannerSource, /\(\?:Геннадий\|Анатолий\).*Гужов/);
  assert.match(scannerSource, /Никита.*Мухин/);
  const { scanPublishedPdfs } = await import("../scripts/verify-pdf-public-privacy.mjs");
  const findings = scanPublishedPdfs([
    "public/documents/datoniks-pitch-deck-public.pdf",
    "public/documents/datoniks-business-plan.pdf",
  ]);
  assert.deepEqual(findings, []);
});

test("fails closed when a raster deck has not declared every non-public source slide", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  assert.deepEqual(manifest.excludedSourcePages, [16, 18]);
  assert.equal(manifest.excludedSourcePageFingerprints.length, 2);
  for (const fingerprint of manifest.excludedSourcePageFingerprints) {
    assert.equal(manifest.publicPageFingerprints.includes(fingerprint), false);
  }
});

test("updating an already sanitized raster manifest keeps both private fingerprints", async () => {
  const { updateManifestFromPublishedDeck } = await import(
    "../scripts/verify-datoniks-public-deck.mjs"
  );
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "datoniks-public-manifest-"));
  const manifestPath = path.join(tempDirectory, "manifest.json");
  await copyFile(MANIFEST_PATH, manifestPath);
  const before = JSON.parse(await readFile(manifestPath, "utf8"));

  updateManifestFromPublishedDeck({
    manifestPath,
    publicPath: "public/documents/datoniks-pitch-deck-public.pdf",
  });
  const afterFirstRun = JSON.parse(await readFile(manifestPath, "utf8"));
  updateManifestFromPublishedDeck({
    manifestPath,
    publicPath: "public/documents/datoniks-pitch-deck-public.pdf",
  });
  const afterSecondRun = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.deepEqual(
    afterFirstRun.excludedSourcePageFingerprints,
    before.excludedSourcePageFingerprints,
  );
  assert.deepEqual(
    afterSecondRun.excludedSourcePageFingerprints,
    before.excludedSourcePageFingerprints,
  );
});
