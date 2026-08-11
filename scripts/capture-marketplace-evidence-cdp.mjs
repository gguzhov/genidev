import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readPngDimensions } from "./verify-marketplace-evidence.mjs";

const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9228";
const siteUrl = process.argv[3] ?? "http://127.0.0.1:4173";
const evidenceDirectory = path.resolve(
  process.argv[4] ?? "docs/design-evidence/marketplace-datoniks-final",
);
const manifestPath = path.resolve(
  process.argv[5] ?? "docs/design-evidence/marketplace-datoniks-final-manifest.json",
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
      await new Promise((resolve) => setTimeout(resolve, 220));

      if (section.key === "03-career") {
        await evaluate(`(async () => {
          for (const item of document.querySelectorAll(".career-timeline__event")) {
            item.scrollIntoView({ block: "center" });
            await new Promise((resolve) => setTimeout(resolve, 45));
          }
          scrollTo(0, 0);
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return true;
        })()`);
      } else if (section.key === "04-projects") {
        await evaluate(`(async () => {
          document.querySelector("#projects").scrollIntoView({ block: "center" });
          const deadline = performance.now() + 3000;
          while (
            !document.querySelector(".marketplace__grid.is-revealed") &&
            performance.now() < deadline
          ) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          if (!document.querySelector(".marketplace__grid.is-revealed")) {
            throw new Error("Project cards did not reach their revealed state");
          }
          await new Promise((resolve) => setTimeout(resolve, 800));
          scrollTo(0, 0);
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return true;
        })()`);
      } else {
        await evaluate(`scrollTo(0, 0); true`);
      }

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
      });
      console.log(`${filename} ${metadata.heading} ${png.width}x${png.height}`);
    }
  }

  const manifest = {
    capturedAt: new Date().toISOString(),
    browser: "Google Chrome clean-profile headless CDP fallback",
    siteUrl,
    viewportHeight: 900,
    deviceScaleFactor: 1,
    evidenceDirectory: path.relative(path.dirname(manifestPath), evidenceDirectory),
    entries,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifestPath}`);
} finally {
  await send("Emulation.clearDeviceMetricsOverride").catch(() => {});
  socket.close();
}
