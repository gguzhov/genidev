const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9333";
const siteUrl = process.argv[3] ?? "http://127.0.0.1:4173";

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
  if (exceptionDetails) {
    const description = exceptionDetails.exception?.description ?? exceptionDetails.text;
    throw new Error(description);
  }
  return result.value;
};

const waitFor = async (expression, label, timeoutMs = 10000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${label}`);
};

const check = (condition, label, details = "") => {
  if (!condition) throw new Error(`${label}${details ? `: ${details}` : ""}`);
  console.log(`PASS ${label}${details ? ` — ${details}` : ""}`);
};

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.navigate", { url: `${siteUrl}/?qa=reduced-motion` });
  await waitFor(
    'document.readyState === "complete" && document.querySelectorAll(".project-card").length === 3',
    "redesign content",
  );

  const reduced = await evaluate(`(() => ({
    width: innerWidth,
    overflow: document.documentElement.scrollWidth - innerWidth,
    wave: getComputedStyle(document.querySelector(".gradient-wave__path")).animationName,
    signal: getComputedStyle(document.querySelector(".work-sequence__track-signal")).animationName,
    orbit: getComputedStyle(document.querySelector(".final-contact__orbit")).animationName,
    sequence: [...document.querySelectorAll(".work-sequence__item")].every((node) => getComputedStyle(node).opacity === "1"),
    projects: [...document.querySelectorAll(".project-card")].every((card) => {
      const style = getComputedStyle(card);
      return style.opacity === "1" && style.transform === "none";
    }),
  }))()`);

  check(reduced.width === 375 && reduced.overflow === 0, "reduced mobile geometry");
  check(reduced.wave === "none", "gradient wave is static");
  check(reduced.signal === "none", "hero signal is static");
  check(reduced.orbit === "none", "contact orbit is static");
  check(reduced.sequence && reduced.projects, "essential content is in its final state");
} finally {
  socket.close();
}
