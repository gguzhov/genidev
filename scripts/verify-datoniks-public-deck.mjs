import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const INSPECT_PDF = String.raw`
import hashlib, json, sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])

def object_data(obj):
    try:
        resolved = obj.get_object()
    except Exception:
        resolved = obj
    try:
        return resolved.get_data()
    except Exception:
        return b""

def fingerprint(page):
    digest = hashlib.sha256()
    digest.update(str(tuple(float(value) for value in page.mediabox)).encode())
    contents = page.get_contents()
    if contents:
        if isinstance(contents, list):
            for content in contents:
                digest.update(object_data(content))
        else:
            digest.update(object_data(contents))
    resources = page.get("/Resources") or {}
    try:
        resources = resources.get_object()
    except Exception:
        pass
    xobjects = resources.get("/XObject") or {}
    try:
        xobjects = xobjects.get_object()
    except Exception:
        pass
    for name in sorted(xobjects.keys(), key=str):
        digest.update(str(name).encode())
        digest.update(object_data(xobjects[name]))
    return digest.hexdigest()

print(json.dumps({
    "pageCount": len(reader.pages),
    "pageFingerprints": [fingerprint(page) for page in reader.pages],
}))
`;

export function inspectPublicDeck(pdfPath) {
  const result = spawnSync("python3", ["-c", INSPECT_PDF, pdfPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `Unable to inspect ${pdfPath}`);
  }
  return JSON.parse(result.stdout);
}

export function sha256File(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export function createDeckManifest({ sourcePath, publicPath, manifestPath }) {
  const source = inspectPublicDeck(sourcePath);
  const published = inspectPublicDeck(publicPath);
  if (source.pageCount !== 18 || published.pageCount !== 17) {
    throw new Error(`Expected source/public page counts 18/17, got ${source.pageCount}/${published.pageCount}`);
  }
  if (JSON.stringify(source.pageFingerprints.slice(0, 17)) !== JSON.stringify(published.pageFingerprints)) {
    throw new Error("Public deck pages do not match source pages 1-17");
  }
  if (published.pageFingerprints.includes(source.pageFingerprints[17])) {
    throw new Error("Private source slide 18 is present in the public deck");
  }

  const manifest = {
    sourceFilename: path.basename(sourcePath),
    sourceSha256: sha256File(sourcePath),
    sourcePageCount: source.pageCount,
    includedSourcePages: Array.from({ length: 17 }, (_, index) => index + 1),
    excludedSourcePages: [18],
    excludedSourcePageFingerprints: [source.pageFingerprints[17]],
    publicPath,
    publicSha256: sha256File(publicPath),
    publicPageCount: published.pageCount,
    publicPageFingerprints: published.pageFingerprints,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function verifyDeckAgainstSource({ manifestPath, sourcePath }) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const source = inspectPublicDeck(sourcePath);
  const published = inspectPublicDeck(manifest.publicPath);
  const errors = [];

  if (sha256File(sourcePath) !== manifest.sourceSha256) errors.push("source SHA-256 changed");
  if (sha256File(manifest.publicPath) !== manifest.publicSha256) errors.push("public SHA-256 changed");
  if (source.pageCount !== 18) errors.push(`source page count is ${source.pageCount}, expected 18`);
  if (published.pageCount !== 17) errors.push(`public page count is ${published.pageCount}, expected 17`);
  if (JSON.stringify(source.pageFingerprints.slice(0, 17)) !== JSON.stringify(published.pageFingerprints)) {
    errors.push("public pages do not match source pages 1-17");
  }
  if (published.pageFingerprints.includes(source.pageFingerprints[17])) {
    errors.push("private source slide 18 is present in the public deck");
  }
  if (
    JSON.stringify(manifest.excludedSourcePageFingerprints) !==
    JSON.stringify([source.pageFingerprints[17]])
  ) {
    errors.push("excluded source page fingerprint changed");
  }
  if (
    manifest.excludedSourcePageFingerprints?.some((fingerprint) =>
      published.pageFingerprints.includes(fingerprint),
    )
  ) {
    errors.push("durable excluded-page fingerprint is present in the public deck");
  }
  if (JSON.stringify(published.pageFingerprints) !== JSON.stringify(manifest.publicPageFingerprints)) {
    errors.push("public page fingerprints changed");
  }

  return { valid: errors.length === 0, errors };
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  const [command, sourcePath, publicPath, manifestPath] = process.argv.slice(2);
  if (command === "--write-manifest") {
    createDeckManifest({ sourcePath, publicPath, manifestPath });
    console.log(`Wrote ${manifestPath}`);
  } else if (command === "--verify-source") {
    const result = verifyDeckAgainstSource({ manifestPath: publicPath, sourcePath });
    if (!result.valid) {
      console.error(result.errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("DATONIKS public deck matches source pages 1-17; slide 18 excluded.");
    }
  } else {
    console.error("Usage: --write-manifest <source.pdf> <public.pdf> <manifest.json>");
    process.exitCode = 1;
  }
}
