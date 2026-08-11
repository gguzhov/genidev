import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = "89504e470d0a1a0a";

export async function readPngDimensions(filePath) {
  const file = await readFile(filePath);
  if (file.length < 24 || file.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    throw new Error(`${filePath}: invalid PNG signature`);
  }
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

export async function verifyEvidenceManifest(manifestPath) {
  const absoluteManifestPath = path.resolve(manifestPath);
  const manifestDirectory = path.dirname(absoluteManifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  const evidenceDirectory = path.resolve(manifestDirectory, manifest.evidenceDirectory);
  const errors = [];
  const rows = [];
  const filenames = manifest.entries.map(({ filename }) => filename);
  const actualPngs = (await readdir(evidenceDirectory))
    .filter((filename) => filename.endsWith(".png"))
    .sort();

  if (manifest.deviceScaleFactor !== 1) errors.push("deviceScaleFactor must equal 1");
  if (manifest.entries.length !== 30) errors.push(`expected 30 entries, got ${manifest.entries.length}`);
  if (new Set(filenames).size !== filenames.length) errors.push("manifest contains duplicate filenames");
  if (JSON.stringify([...filenames].sort()) !== JSON.stringify(actualPngs)) {
    errors.push("manifest filenames do not match the evidence directory");
  }

  for (const entry of manifest.entries) {
    const dimensions = await readPngDimensions(path.join(evidenceDirectory, entry.filename));
    const row = {
      filename: entry.filename,
      heading: entry.heading,
      width: entry.width,
      domHeight: entry.domHeight,
      pngWidth: dimensions.width,
      pngHeight: dimensions.height,
    };
    rows.push(row);

    if (!entry.heading?.trim()) errors.push(`${entry.filename}: missing DOM heading`);
    if (dimensions.width !== entry.width) {
      errors.push(`${entry.filename}: PNG width ${dimensions.width} != expected ${entry.width}`);
    }
    if (dimensions.height <= 0) errors.push(`${entry.filename}: PNG height is zero`);
    if (
      dimensions.height < Math.floor(entry.domHeight) - 1 ||
      dimensions.height > Math.ceil(entry.domHeight) + 1
    ) {
      errors.push(
        `${entry.filename}: PNG height ${dimensions.height} does not cover DOM height ${entry.domHeight}`,
      );
    }
  }

  return { valid: errors.length === 0, errors, rows };
}

export function renderEvidenceTable(rows) {
  return [
    "| Filename | DOM heading | Dimensions |",
    "| --- | --- | ---: |",
    ...rows.map(
      (row) =>
        `| ${row.filename} | ${row.heading.replaceAll("|", "\\|")} | ${row.pngWidth}×${row.pngHeight} |`,
    ),
  ].join("\n");
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  const manifestPath = process.argv[2] ?? "docs/design-evidence/marketplace-datoniks-final-manifest.json";
  const result = await verifyEvidenceManifest(manifestPath);
  console.log(renderEvidenceTable(result.rows));
  if (!result.valid) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  }
}
