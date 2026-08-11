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

  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${siteUrl}/?qa=desktop-reduced` });
  await waitFor(
    'document.readyState === "complete" && document.querySelectorAll(".work-sequence__item").length === 6',
    "desktop work sequence",
  );
  const arcNodes = await evaluate(`(() => {
    const sequence = document.querySelector(".work-sequence");
    const sequenceRect = sequence.getBoundingClientRect();
    return [...document.querySelectorAll(".work-sequence__item")].map((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const expectedX = sequenceRect.left + parseFloat(style.left);
      const expectedY = sequenceRect.top + parseFloat(style.top);
      return {
        dx: Math.round((rect.left + rect.width / 2 - expectedX) * 100) / 100,
        dy: Math.round((rect.top + rect.height / 2 - expectedY) * 100) / 100,
        transform: style.transform,
      };
    });
  })()`);
  check(
    arcNodes.every(({ dx, dy }) => Math.abs(dx) < 2 && Math.abs(dy) < 2),
    "desktop reduced hero nodes stay centered on the arc",
    JSON.stringify(arcNodes),
  );

  await send("Emulation.setEmulatedMedia", { features: [] });
  await send("Page.navigate", { url: `${siteUrl}/?qa=gallery-switch` });
  await waitFor(
    'document.readyState === "complete" && document.querySelectorAll(".project-card__open").length === 3',
    "project controls",
  );
  await evaluate('document.querySelector(".project-card__open").click()');
  await waitFor('Boolean(document.querySelector(".project-gallery"))', "first project gallery");
  await evaluate(`(() => {
    const next = document.querySelector('[aria-label="Следующий кадр"]');
    for (let step = 0; step < 5; step += 1) next.click();
  })()`);
  await evaluate(`(() => {
    const target = [...document.querySelectorAll(".project-case__other-card")]
      .find((button) => button.textContent.includes("DATONIKS"));
    target.click();
  })()`);
  await waitFor(
    'document.querySelector(".project-case__title")?.textContent.includes("DATONIKS")',
    "DATONIKS project switch",
  );
  const switchedGallery = await evaluate(`(() => ({
    counter: document.querySelector(".project-gallery__controls p")?.textContent.trim(),
    hasImage: Boolean(document.querySelector(".project-gallery__frame img")),
    title: document.querySelector(".project-case__title")?.textContent.trim(),
  }))()`);
  check(
    switchedGallery.counter === "01 / 02" && switchedGallery.hasImage,
    "long gallery switches safely to the shorter DATONIKS gallery",
    switchedGallery.title,
  );

  await send("Page.navigate", { url: `${siteUrl}/projects/datoniks?qa=direct-close` });
  await waitFor('Boolean(document.querySelector(".project-case__close"))', "direct project route");
  await evaluate('document.querySelector(".project-case__close").click()');
  await waitFor('!document.querySelector(".project-case")', "direct project close");
  const focusReturned = await evaluate(`(() => {
    const target = document.querySelector(".project-card__open");
    const rect = target.getBoundingClientRect();
    return {
      focused: document.activeElement === target,
      visible: rect.bottom > 0 && rect.top < innerHeight,
      scrollY,
    };
  })()`);
  check(
    focusReturned.focused && focusReturned.visible && focusReturned.scrollY > 0,
    "direct project close returns visible focus to the first case",
    JSON.stringify(focusReturned),
  );

  await evaluate(`(() => {
    const contact = document.querySelector(".final-contact__inner");
    contact.scrollIntoView({ block: "center" });
  })()`);
  await waitFor(
    'document.querySelector(".final-contact__inner")?.classList.contains("is-revealed")',
    "contact reveal",
  );
  await waitFor(
    'document.querySelector(".final-contact__inner")?.classList.contains("is-settled")',
    "contact intro completion",
  );
  const orbitBeforeFocus = await evaluate(
    'getComputedStyle(document.querySelector(".final-contact__orbit--outer")).transform',
  );
  const contactFocus = await evaluate(`(() => {
    const link = document.querySelector(".final-contact__actions a");
    link.focus();
    return {
      focused: document.activeElement === link,
      focusWithin: document.querySelector(".final-contact__inner").matches(":focus-within"),
    };
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 900));
  const orbitAfterFocus = await evaluate(
    'getComputedStyle(document.querySelector(".final-contact__orbit--outer")).transform',
  );
  check(
    contactFocus.focused && contactFocus.focusWithin && orbitBeforeFocus !== orbitAfterFocus,
    "contact orbit visibly responds to keyboard focus",
    `${orbitBeforeFocus} → ${orbitAfterFocus}`,
  );

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await waitFor(
    'getComputedStyle(document.querySelector(".final-contact__orbit--outer")).animationName === "none"',
    "contact reduced-motion state",
  );
  await send("Emulation.setEmulatedMedia", { features: [] });
  await new Promise((resolve) => setTimeout(resolve, 120));
  const noReplayAfterToggle = await evaluate(`(() => {
    const inner = document.querySelector(".final-contact__inner");
    const orbit = document.querySelector(".final-contact__orbit--outer");
    return inner.classList.contains("is-settled") && getComputedStyle(orbit).animationName === "none";
  })()`);
  check(noReplayAfterToggle, "contact intro does not replay after reduced-motion toggle");

  for (const width of [375, 430, 768, 1024, 1280, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await send("Page.navigate", { url: `${siteUrl}/?qa=matrix-${width}` });
    await waitFor(
      'document.readyState === "complete" && document.querySelectorAll(".project-card").length === 3',
      `${width}px content`,
    );
    const geometry = await evaluate(`(() => {
      const cta = document.querySelector(".hero .button");
      const portrait = document.querySelector(".profile-card");
      const ctaRect = cta.getBoundingClientRect();
      const portraitRect = portrait.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        portraitWidth: portraitRect.width,
        projects: document.querySelectorAll(".project-card").length,
        exactResults: [...document.querySelectorAll(".project-card__metrics")]
          .every((list) => list.children.length === 4),
      };
    })()`);
    check(
      geometry.overflow === 0 &&
        geometry.ctaWidth >= 44 &&
        geometry.ctaHeight >= 44 &&
        geometry.portraitWidth > 0 &&
        geometry.projects === 3 &&
        geometry.exactResults,
      `${width}px responsive geometry`,
    );
  }
} finally {
  socket.close();
}
