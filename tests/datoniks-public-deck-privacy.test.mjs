import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const MANIFEST_PATH = "public/documents/datoniks-pitch-deck-public.manifest.json";
const VERIFY_SCRIPT = "scripts/verify-datoniks-public-deck.mjs";
const VERIFY_CONTACTS_SCRIPT = "scripts/verify-pdf-public-privacy.mjs";
const SOURCE_PATH = "/Users/gguzhov/Downloads/Питч-дек_DATONIKS.pdf";

test("ties the public deck to source pages 1-17 and excludes private slide 18", async (t) => {
  await assert.doesNotReject(access(VERIFY_SCRIPT));
  await assert.doesNotReject(access(MANIFEST_PATH));

  const { inspectPublicDeck, verifyDeckAgainstSource } = await import(
    "../scripts/verify-datoniks-public-deck.mjs"
  );
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const inspection = inspectPublicDeck(manifest.publicPath);

  assert.equal(manifest.sourcePageCount, 18);
  assert.deepEqual(manifest.includedSourcePages, Array.from({ length: 17 }, (_, index) => index + 1));
  assert.deepEqual(manifest.excludedSourcePages, [18]);
  assert.equal(manifest.publicPageCount, 17);
  assert.equal(manifest.publicPageFingerprints.length, 17);
  assert.equal(manifest.excludedSourcePageFingerprints.length, 1);
  assert.match(manifest.excludedSourcePageFingerprints[0], /^[a-f0-9]{64}$/);
  assert.equal(
    manifest.publicPageFingerprints.includes(manifest.excludedSourcePageFingerprints[0]),
    false,
  );
  assert.equal(inspection.pageCount, 17);
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
    t.diagnostic("Source PDF unavailable; durable excluded-page fingerprint verified instead.");
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
