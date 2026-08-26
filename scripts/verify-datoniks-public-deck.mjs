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
  const includedSourcePages = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17,
  ];
  const excludedSourcePages = [16, 18];
  const includedFingerprints = includedSourcePages.map(
    (pageNumber) => source.pageFingerprints[pageNumber - 1],
  );
  const excludedFingerprints = excludedSourcePages.map(
    (pageNumber) => source.pageFingerprints[pageNumber - 1],
  );
  if (source.pageCount !== 18 || published.pageCount !== includedSourcePages.length) {
    throw new Error(
      `Expected source/public page counts 18/${includedSourcePages.length}, got ${source.pageCount}/${published.pageCount}`,
    );
  }
  if (JSON.stringify(includedFingerprints) !== JSON.stringify(published.pageFingerprints)) {
    throw new Error("Public deck pages do not match the approved source page allowlist");
  }
  if (excludedFingerprints.some((fingerprint) => published.pageFingerprints.includes(fingerprint))) {
    throw new Error("A private source slide is present in the public deck");
  }

  const manifest = {
    sourceFilename: path.basename(sourcePath),
    sourceSha256: sha256File(sourcePath),
    sourcePageCount: source.pageCount,
    includedSourcePages,
    excludedSourcePages,
    excludedSourcePageFingerprints: excludedFingerprints,
    publicPath,
    publicSha256: sha256File(publicPath),
    publicPageCount: published.pageCount,
    publicPageFingerprints: published.pageFingerprints,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function updateManifestFromPublishedDeck({ manifestPath, publicPath }) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const published = inspectPublicDeck(publicPath);
  const hasCurrentPrivateAllowlist =
    manifest.excludedSourcePages?.includes(16) &&
    manifest.excludedSourcePageFingerprints?.length >= 2;
  const privateTeamFingerprint = hasCurrentPrivateAllowlist
    ? manifest.excludedSourcePageFingerprints[0]
    : manifest.publicPageFingerprints?.[15];
  const privateContactFingerprint = manifest.excludedSourcePageFingerprints?.at(-1);
  if (!privateTeamFingerprint || !privateContactFingerprint) {
    throw new Error("Existing manifest does not contain durable private-slide fingerprints");
  }
  const includedSourcePages = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17,
  ];
  if (published.pageCount !== includedSourcePages.length) {
    throw new Error(
      `Expected ${includedSourcePages.length} public pages, got ${published.pageCount}`,
    );
  }
  if (
    [privateTeamFingerprint, privateContactFingerprint].some((fingerprint) =>
      published.pageFingerprints.includes(fingerprint),
    )
  ) {
    throw new Error("A private source slide is present in the public deck");
  }
  const updated = {
    ...manifest,
    includedSourcePages,
    excludedSourcePages: [16, 18],
    excludedSourcePageFingerprints: [
      privateTeamFingerprint,
      privateContactFingerprint,
    ],
    publicPath,
    publicSha256: sha256File(publicPath),
    publicPageCount: published.pageCount,
    publicPageFingerprints: published.pageFingerprints,
  };
  writeFileSync(manifestPath, `${JSON.stringify(updated, null, 2)}\n`);
  return updated;
}

export function verifyDeckAgainstSource({ manifestPath, sourcePath }) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const source = inspectPublicDeck(sourcePath);
  const published = inspectPublicDeck(manifest.publicPath);
  const errors = [];

  if (sha256File(sourcePath) !== manifest.sourceSha256) errors.push("source SHA-256 changed");
  if (sha256File(manifest.publicPath) !== manifest.publicSha256) errors.push("public SHA-256 changed");
  if (source.pageCount !== 18) errors.push(`source page count is ${source.pageCount}, expected 18`);
  if (published.pageCount !== manifest.includedSourcePages.length) {
    errors.push(
      `public page count is ${published.pageCount}, expected ${manifest.includedSourcePages.length}`,
    );
  }
  const includedFingerprints = manifest.includedSourcePages.map(
    (pageNumber) => source.pageFingerprints[pageNumber - 1],
  );
  const excludedFingerprints = manifest.excludedSourcePages.map(
    (pageNumber) => source.pageFingerprints[pageNumber - 1],
  );
  if (JSON.stringify(includedFingerprints) !== JSON.stringify(published.pageFingerprints)) {
    errors.push("public pages do not match the approved source page allowlist");
  }
  if (
    JSON.stringify(manifest.excludedSourcePageFingerprints) !==
    JSON.stringify(excludedFingerprints)
  ) {
    errors.push("excluded source page fingerprints changed");
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
      console.log("DATONIKS public deck matches the approved source page allowlist.");
    }
  } else if (command === "--update-public-manifest") {
    updateManifestFromPublishedDeck({
      manifestPath: sourcePath,
      publicPath,
    });
    console.log(`Updated ${sourcePath}`);
  } else {
    console.error(
      "Usage: --write-manifest <source.pdf> <public.pdf> <manifest.json> | --update-public-manifest <manifest.json> <public.pdf>",
    );
    process.exitCode = 1;
  }
}
