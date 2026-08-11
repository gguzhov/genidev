import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const MANIFEST_PATH = "docs/design-evidence/marketplace-datoniks-final-manifest.json";
const VERIFY_SCRIPT = "scripts/verify-marketplace-evidence.mjs";
const WIDTHS = [375, 430, 768, 1024, 1280, 1440];
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
});
