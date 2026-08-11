import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCAN_PDFS = String.raw`
import json, re, sys
from pypdf import PdfReader

patterns = {
    "email": re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I),
    "phone": re.compile(r"(?:\+7|8)[\s()\-]*\d{3}[\s()\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}"),
    "participant_age": re.compile(r"\(\s*\d{1,3}\s+(?:год|года|лет)\s*\)", re.I),
    "participant_name": re.compile(
        r"(?:"
        r"Гужов\s+(?:Геннадий|Анатолий)(?:\s+[А-ЯЁ][а-яё]+)?|"
        r"(?:Геннадий|Анатолий)(?:\s+[А-ЯЁ][а-яё]+)?\s+Гужов|"
        r"Мухин\s+Никита(?:\s+[А-ЯЁ][а-яё]+)?|"
        r"Никита(?:\s+[А-ЯЁ][а-яё]+)?\s+Мухин"
        r")",
        re.I,
    ),
    "ownership_row": re.compile(r"(?:Гужов|Мухин|Инвестор)[^\n]{0,60}\(\s*\d+(?:[.,]\d+)?%\s*\)", re.I),
}
findings = []

def scan_value(value, pdf_path, page_number, surface):
    text = str(value or "")
    for kind, pattern in patterns.items():
        if pattern.search(text):
            findings.append({"path": pdf_path, "page": page_number, "kind": kind, "surface": surface})

for pdf_path in sys.argv[1:]:
    reader = PdfReader(pdf_path)
    if reader.is_encrypted:
        reader.decrypt("")
    for page_number, page in enumerate(reader.pages, 1):
        scan_value(page.extract_text() or "", pdf_path, page_number, "text")
        for annotation_ref in page.get("/Annots") or []:
            try:
                annotation = annotation_ref.get_object()
                action = annotation.get("/A") or {}
                scan_value(action.get("/URI"), pdf_path, page_number, "link")
            except Exception:
                continue
        try:
            reader.resolved_objects.clear()
        except Exception:
            pass

print(json.dumps(findings))
`;

export function scanPublishedPdfs(pdfPaths) {
  const bundledPython =
    "/Users/gguzhov/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
  const pythonExecutable = existsSync(bundledPython) ? bundledPython : "python3";
  const result = spawnSync(pythonExecutable, ["-c", SCAN_PDFS, ...pdfPaths], {
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "Unable to scan published PDFs");
  }
  return JSON.parse(result.stdout);
}

const isCli =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const pdfPaths = process.argv.slice(2);
  if (!pdfPaths.length) {
    console.error("Usage: node scripts/verify-pdf-public-privacy.mjs <pdf...>");
    process.exitCode = 2;
  } else {
    const findings = scanPublishedPdfs(pdfPaths);
    if (findings.length) {
      console.error(JSON.stringify(findings, null, 2));
      process.exitCode = 1;
    } else {
      console.log(`PASS public PDF privacy — ${pdfPaths.length} files`);
    }
  }
}
