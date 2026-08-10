const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9222";
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
  if (exceptionDetails) throw new Error(exceptionDetails.text);
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
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.navigate", { url: siteUrl });
  await waitFor(
    'document.readyState === "complete" && document.querySelectorAll(".hero__visual canvas").length === 1',
    "initial LiquidEther canvas",
  );

  check((await evaluate('document.querySelectorAll(".hero__visual canvas").length')) === 1, "initial canvas count", "1");
  await evaluate('window.__qaHeroCanvas = document.querySelector(".hero__visual canvas")');

  await evaluate('document.querySelector(\'[aria-label="Открыть кейс «Остров Здоровья»"]\').click()');
  await waitFor('document.querySelector("#project-title")?.textContent === "Остров Здоровья"', "first project case");
  check(await evaluate('window.__qaHeroCanvas === document.querySelector(".hero__visual canvas")'), "canvas identity after case open");

  await evaluate('document.querySelector(".project-case__other-card").click()');
  await waitFor('document.querySelector("#project-title")?.textContent === "IlonMask VPN"', "project switch");
  check(await evaluate('window.__qaHeroCanvas === document.querySelector(".hero__visual canvas")'), "canvas identity after case switch");

  await evaluate('document.querySelector(".project-case__close").click()');
  await waitFor('!document.querySelector(".project-case")', "project case close");
  check(await evaluate('window.__qaHeroCanvas === document.querySelector(".hero__visual canvas")'), "canvas identity after case close");

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await waitFor('document.querySelectorAll(".hero__visual canvas").length === 0', "reduced-motion canvas teardown");
  check((await evaluate('document.querySelectorAll(".hero__visual canvas").length')) === 0, "reduced-motion canvas count", "0");
  check(await evaluate('window.__qaHeroCanvas.isConnected === false'), "old canvas disconnected");

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await waitFor('document.querySelectorAll(".hero__visual canvas").length === 1', "LiquidEther canvas remount");
  check((await evaluate('document.querySelectorAll(".hero__visual canvas").length')) === 1, "restored canvas count", "1");
  check(await evaluate('window.__qaHeroCanvas !== document.querySelector(".hero__visual canvas")'), "fresh canvas mounted after preference reset");

  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.reload", { ignoreCache: true });
  await waitFor('document.readyState === "complete" && document.querySelector(".noscript-site")', "no-JavaScript fallback");

  const fallback = await evaluate(`(() => {
    const main = document.querySelector(".noscript-site");
    const telegram = main?.querySelector('a[href="https://t.me/gguzhov"]');
    return {
      identity: main?.textContent.includes("Геннадий Гужов — разработчик цифровых и AI-продуктов."),
      problems: main?.querySelectorAll("[data-noscript-problem]").length,
      career: main?.querySelectorAll("[data-noscript-career]").length,
      projects: main?.querySelectorAll("[data-noscript-project]").length,
      metrics: main?.textContent.includes("+72% к посещаемости за месяц") && main?.textContent.includes("100+ активных платящих клиентов"),
      telegram: telegram?.target === "_blank" && telegram?.rel === "noreferrer",
      readable: Boolean(main && getComputedStyle(main).display !== "none" && main.getBoundingClientRect().height > 0),
      reactRootEmpty: document.querySelector("#root")?.childElementCount === 0,
    };
  })()`);

  check(fallback.identity, "no-JavaScript identity");
  check(fallback.problems === 4, "no-JavaScript problems", String(fallback.problems));
  check(fallback.career === 5, "no-JavaScript career events", String(fallback.career));
  check(fallback.projects === 2 && fallback.metrics, "no-JavaScript projects and metrics", String(fallback.projects));
  check(fallback.telegram, "no-JavaScript Telegram contract");
  check(fallback.readable && fallback.reactRootEmpty, "no-JavaScript fallback is visible with an empty React root");
} finally {
  socket.close();
}
