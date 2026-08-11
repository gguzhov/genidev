import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = "89504e470d0a1a0a";

export const REQUIRED_CAPTURE_READINESS = Object.freeze({
  workSequenceFinalNodes: 6,
  problemOutcomesFinalVisible: 4,
  projectCardsFinalVisible: 3,
  projectImagesDecoded: 9,
});

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

export function validateCaptureReadiness(entry, contract = REQUIRED_CAPTURE_READINESS) {
  const errors = [];
  const readiness = entry.readiness ?? {};

  if (
    entry.filename?.endsWith("-01-hero.png") &&
    readiness.workSequenceFinalNodes !== contract.workSequenceFinalNodes
  ) {
    errors.push(
      `${entry.filename}: WorkSequence settled ${readiness.workSequenceFinalNodes ?? 0}/${contract.workSequenceFinalNodes} nodes`,
    );
  }
  if (
    entry.filename?.endsWith("-02-problems.png") &&
    readiness.problemOutcomesFinalVisible !== contract.problemOutcomesFinalVisible
  ) {
    errors.push(
      `${entry.filename}: problem outcomes settled ${readiness.problemOutcomesFinalVisible ?? 0}/${contract.problemOutcomesFinalVisible}`,
    );
  }
  if (entry.filename?.endsWith("-04-projects.png")) {
    if (readiness.projectCardsFinalVisible !== contract.projectCardsFinalVisible) {
      errors.push(
        `${entry.filename}: project cards settled ${readiness.projectCardsFinalVisible ?? 0}/${contract.projectCardsFinalVisible}`,
      );
    }
    if (readiness.projectImagesDecoded !== contract.projectImagesDecoded) {
      errors.push(
        `${entry.filename}: project images decoded ${readiness.projectImagesDecoded ?? 0}/${contract.projectImagesDecoded}`,
      );
    }
  }

  return errors;
}

export async function verifyEvidenceManifest(manifestPath) {
  const absoluteManifestPath = path.resolve(manifestPath);
  const manifestDirectory = path.dirname(absoluteManifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  const evidenceDirectory = path.resolve(manifestDirectory, manifest.evidenceDirectory);
  const contactSheetDirectory = path.resolve(
    manifestDirectory,
    manifest.contactSheetDirectory ?? "marketplace-datoniks-final-contact-sheets",
  );
  const errors = [];
  const rows = [];
  const filenames = manifest.entries.map(({ filename }) => filename);
  const actualPngs = (await readdir(evidenceDirectory))
    .filter((filename) => filename.endsWith(".png"))
    .sort();

  if (manifest.deviceScaleFactor !== 1) errors.push("deviceScaleFactor must equal 1");
  if (manifest.entries.length !== 30) errors.push(`expected 30 entries, got ${manifest.entries.length}`);
  if (
    JSON.stringify(manifest.captureReadiness) !==
    JSON.stringify(REQUIRED_CAPTURE_READINESS)
  ) {
    errors.push("capture readiness contract is missing or stale");
  }
  if (new Set(filenames).size !== filenames.length) errors.push("manifest contains duplicate filenames");
  if (JSON.stringify([...filenames].sort()) !== JSON.stringify(actualPngs)) {
    errors.push("manifest filenames do not match the evidence directory");
  }

  for (const entry of manifest.entries) {
    errors.push(...validateCaptureReadiness(entry));
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

  const contactSheets = manifest.contactSheets ?? [];
  const contactSheetFilenames = contactSheets.map(({ filename }) => filename);
  const actualContactSheets = (await readdir(contactSheetDirectory))
    .filter((filename) => filename.endsWith(".png"))
    .sort();
  if (contactSheets.length !== 6) {
    errors.push(`expected 6 contact sheets, got ${contactSheets.length}`);
  }
  if (JSON.stringify([...contactSheetFilenames].sort()) !== JSON.stringify(actualContactSheets)) {
    errors.push("manifest contact sheets do not match the contact-sheet directory");
  }

  for (const contactSheet of contactSheets) {
    const dimensions = await readPngDimensions(
      path.join(contactSheetDirectory, contactSheet.filename),
    );
    const expectedSourceFiles = manifest.entries
      .filter(({ width }) => width === contactSheet.width)
      .map(({ filename }) => filename);
    const expectedHeight = manifest.entries
      .filter(({ width }) => width === contactSheet.width)
      .reduce((sum, entry) => sum + entry.pngHeight, 0);

    if (JSON.stringify(contactSheet.sourceFiles) !== JSON.stringify(expectedSourceFiles)) {
      errors.push(`${contactSheet.filename}: source file list is stale`);
    }
    if (dimensions.width !== contactSheet.width || dimensions.width !== contactSheet.pngWidth) {
      errors.push(`${contactSheet.filename}: contact-sheet width is invalid`);
    }
    if (dimensions.height !== expectedHeight || dimensions.height !== contactSheet.pngHeight) {
      errors.push(`${contactSheet.filename}: contact-sheet height is invalid`);
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
