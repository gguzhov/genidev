import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  readPngDimensions,
  REQUIRED_CAPTURE_READINESS,
} from "./verify-marketplace-evidence.mjs";

const CONTACT_SHEET_SCRIPT = String.raw`
import json, os, sys
from PIL import Image

evidence_directory, contact_sheet_directory, groups_json = sys.argv[1:4]
os.makedirs(contact_sheet_directory, exist_ok=True)
groups = json.loads(groups_json)

for group in groups:
    sources = [Image.open(os.path.join(evidence_directory, filename)).convert("RGB") for filename in group["sourceFiles"]]
    sheet = Image.new("RGB", (group["width"], sum(image.height for image in sources)))
    y = 0
    for image in sources:
        sheet.paste(image, (0, y))
        y += image.height
        image.close()
    sheet.save(os.path.join(contact_sheet_directory, group["filename"]), "PNG", optimize=True)
`;

const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9228";
const siteUrl = process.argv[3] ?? "http://127.0.0.1:4173";
const evidenceDirectory = path.resolve(
  process.argv[4] ?? "docs/design-evidence/marketplace-datoniks-final",
);
const manifestPath = path.resolve(
  process.argv[5] ?? "docs/design-evidence/marketplace-datoniks-final-manifest.json",
);
const contactSheetDirectory = path.resolve(
  process.argv[6] ?? "docs/design-evidence/marketplace-datoniks-final-contact-sheets",
);
const widths = [375, 430, 768, 1024, 1280, 1440];
const sections = [
  { key: "01-hero", selector: ".hero", headingSelector: "#hero-title", heading: "Разрабатываю цифровые и AI-продукты." },
  { key: "02-problems", selector: "#problems", headingSelector: "#problems h2", heading: "В чем могу быть полезен?" },
  { key: "03-career", selector: "#career", headingSelector: "#career h2", heading: "От торговли и экономики — к цифровым продуктам" },
  { key: "04-projects", selector: "#projects", headingSelector: "#projects h2", heading: "Маркетплейс моих разработок" },
  { key: "05-contact", selector: "#contact", headingSelector: "#contact h2", heading: "Расскажите, что должно измениться." },
];

const targets = await fetch(`${cdpBaseUrl}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("No Chrome page target is available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
};

const waitFor = async (expression, label, timeoutMs = 15000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error(`Timed out waiting for ${label}`);
};

const isFinalVisible = (selector) => `(element => {
  if (!element) return false;
  const style = getComputedStyle(element);
  const matrix = style.transform === "none"
    ? new DOMMatrixReadOnly()
    : new DOMMatrixReadOnly(style.transform);
  const rect = element.getBoundingClientRect();
  return Number.parseFloat(style.opacity) >= 0.999 &&
    style.visibility === "visible" &&
    style.display !== "none" &&
    rect.width > 0 && rect.height > 0 &&
    Math.abs(matrix.m41) < 0.1 && Math.abs(matrix.m42) < 0.1;
})(` + selector + `)`;

const settleSection = async (section, width) => {
  await evaluate(`(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    return true;
  })()`);

  if (section.key === "01-hero") {
    await evaluate(`document.querySelector(".work-sequence").scrollIntoView({ block: "center" }); true`);
    await waitFor(
      `(() => {
        const root = document.querySelector(".work-sequence.work-sequence--static");
        const nodes = [...document.querySelectorAll(".work-sequence__item")];
        return Boolean(root) && nodes.length === ${REQUIRED_CAPTURE_READINESS.workSequenceFinalNodes} &&
          nodes.every((node) => ${isFinalVisible("node")});
      })()`,
      `${width}px WorkSequence final nodes`,
    );
  } else if (section.key === "02-problems") {
    await evaluate(`document.querySelector("#problems").scrollIntoView({ block: "center" }); true`);
    await waitFor(
      `(() => {
        const outcomes = [...document.querySelectorAll(".problem-selector__outcomes li")];
        return outcomes.length === ${REQUIRED_CAPTURE_READINESS.problemOutcomesFinalVisible} &&
          outcomes.every((outcome) => ${isFinalVisible("outcome")});
      })()`,
      `${width}px problem outcomes final state`,
    );
  } else if (section.key === "03-career") {
    await evaluate(`(async () => {
      for (const item of document.querySelectorAll(".career-timeline__event")) {
        item.scrollIntoView({ block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
      return true;
    })()`);
  } else if (section.key === "04-projects") {
    await evaluate(`(async () => {
      for (const card of document.querySelectorAll("#projects .project-card")) {
        card.scrollIntoView({ block: "center" });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      return true;
    })()`);
    await waitFor(
      `(() => {
        const grid = document.querySelector(".marketplace__grid.is-revealed");
        const cards = [...document.querySelectorAll("#projects .project-card")];
        return Boolean(grid) && cards.length === ${REQUIRED_CAPTURE_READINESS.projectCardsFinalVisible} &&
          cards.every((card) => ${isFinalVisible("card")} &&
            card.getAnimations().every((animation) => animation.playState === "finished"));
      })()`,
      `${width}px project cards final state`,
    );
    await waitFor(
      `(() => {
        const images = [...document.querySelectorAll("#projects img")];
        return images.length === ${REQUIRED_CAPTURE_READINESS.projectImagesDecoded} &&
          images.every((image) => image.complete && image.naturalWidth > 0);
      })()`,
      `${width}px project image loading`,
    );
    await evaluate(`(async () => {
      const images = [...document.querySelectorAll("#projects img")];
      await Promise.all(images.map((image) => image.decode()));
      images.forEach((image) => { image.dataset.captureDecoded = "true"; });
      return images.length;
    })()`);
  }

  await evaluate(`(async () => {
    scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return true;
  })()`);
  await waitFor(`scrollY === 0`, `${width}px ${section.key} settled scroll`);
};

await mkdir(evidenceDirectory, { recursive: true });
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
});

const entries = [];
try {
  for (const width of widths) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: 900,
    });

    for (const section of sections) {
      await send("Page.navigate", { url: siteUrl });
      await waitFor(
        `document.readyState === "complete" && document.fonts.status === "loaded" && Boolean(document.querySelector(${JSON.stringify(section.headingSelector)}))`,
        `${width}px ${section.key} document`,
      );
      await settleSection(section, width);

      if (section.key !== "01-hero") {
        await evaluate(`(() => {
          const navigation = document.querySelector(".card-nav-container");
          if (navigation) navigation.style.visibility = "hidden";
          return true;
        })()`);
      }

      const metadata = await evaluate(`(() => {
        const element = document.querySelector(${JSON.stringify(section.selector)});
        const heading = document.querySelector(${JSON.stringify(section.headingSelector)});
        const rect = element.getBoundingClientRect();
        const workSequenceNodes = [...document.querySelectorAll(".work-sequence__item")];
        const outcomes = [...document.querySelectorAll(".problem-selector__outcomes li")];
        const projectCards = [...document.querySelectorAll("#projects .project-card")];
        const decodedProjectImages = [...document.querySelectorAll(
          '#projects img[data-capture-decoded="true"]',
        )];
        const finalVisible = (candidate) => ${isFinalVisible("candidate")};
        const readiness = {};
        if (${JSON.stringify(section.key)} === "01-hero") {
          readiness.workSequenceFinalNodes = workSequenceNodes.filter(finalVisible).length;
        }
        if (${JSON.stringify(section.key)} === "02-problems") {
          readiness.problemOutcomesFinalVisible = outcomes.filter(finalVisible).length;
        }
        if (${JSON.stringify(section.key)} === "04-projects") {
          readiness.projectCardsFinalVisible = projectCards.filter(finalVisible).length;
          readiness.projectImagesDecoded = decodedProjectImages.filter(
            (image) => image.complete && image.naturalWidth > 0,
          ).length;
        }
        return {
          dpr: devicePixelRatio,
          innerWidth,
          pageClientWidth: document.documentElement.clientWidth,
          pageScrollWidth: document.documentElement.scrollWidth,
          heading: heading.textContent.trim(),
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height,
          readiness,
        };
      })()`);

      if (metadata.dpr !== 1) throw new Error(`${width}px ${section.key}: DPR is ${metadata.dpr}`);
      if (metadata.innerWidth !== width || metadata.pageClientWidth !== width) {
        throw new Error(`${width}px ${section.key}: viewport mismatch`);
      }
      if (metadata.pageScrollWidth !== width) {
        throw new Error(`${width}px ${section.key}: page overflow ${metadata.pageScrollWidth}`);
      }
      if (metadata.heading !== section.heading) {
        throw new Error(`${width}px ${section.key}: heading mismatch: ${metadata.heading}`);
      }
      if (Math.round(metadata.width) !== width) {
        throw new Error(`${width}px ${section.key}: section width ${metadata.width}`);
      }

      const clip = {
        x: Math.max(0, Math.floor(metadata.x)),
        y: Math.max(0, Math.floor(metadata.y)),
        width,
        height: Math.ceil(metadata.height),
        scale: 1,
      };
      const screenshot = await send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true,
        clip,
      });
      const filename = `${width}-${section.key}.png`;
      const filePath = path.join(evidenceDirectory, filename);
      await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
      const png = await readPngDimensions(filePath);
      entries.push({
        filename,
        selector: section.selector,
        headingSelector: section.headingSelector,
        heading: metadata.heading,
        width,
        domHeight: metadata.height,
        pngWidth: png.width,
        pngHeight: png.height,
        readiness: metadata.readiness,
      });
      console.log(`${filename} ${metadata.heading} ${png.width}x${png.height}`);
    }
  }

  await mkdir(contactSheetDirectory, { recursive: true });
  const contactSheetGroups = widths.map((width) => ({
    filename: `${width}-all-sections.png`,
    width,
    sourceFiles: entries
      .filter((entry) => entry.width === width)
      .map(({ filename }) => filename),
  }));
  const contactSheetResult = spawnSync(
    "python3",
    [
      "-c",
      CONTACT_SHEET_SCRIPT,
      evidenceDirectory,
      contactSheetDirectory,
      JSON.stringify(contactSheetGroups),
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (contactSheetResult.status !== 0) {
    throw new Error(contactSheetResult.stderr || "Unable to generate contact sheets");
  }
  const contactSheets = [];
  for (const group of contactSheetGroups) {
    const png = await readPngDimensions(path.join(contactSheetDirectory, group.filename));
    contactSheets.push({ ...group, pngWidth: png.width, pngHeight: png.height });
    console.log(`${group.filename} ${png.width}x${png.height}`);
  }

  const manifest = {
    capturedAt: new Date().toISOString(),
    browser: "Google Chrome clean-profile headless CDP fallback",
    siteUrl,
    viewportHeight: 900,
    deviceScaleFactor: 1,
    evidenceDirectory: path.relative(path.dirname(manifestPath), evidenceDirectory),
    contactSheetDirectory: path.relative(path.dirname(manifestPath), contactSheetDirectory),
    captureReadiness: REQUIRED_CAPTURE_READINESS,
    entries,
    contactSheets,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifestPath}`);
} finally {
  await send("Emulation.clearDeviceMetricsOverride").catch(() => {});
  socket.close();
}
