import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("uses the supplied iridescence field inside the existing safe WebGL lifecycle", async () => {
  const [shader, wave, css] = await Promise.all([
    read("../src/components/ui/animated-gradient.jsx"),
    read("../src/components/GradientWave/GradientWave.jsx"),
    read("../src/components/GradientWave/GradientWave.css"),
  ]);

  assert.match(shader, /uniform vec2 u_mouse/);
  assert.match(shader, /uniform float u_amplitude/);
  assert.match(shader, /float noise_scale = \.0005 \+ \.006 \* u_scale/);
  assert.match(shader, /for \(float i = 1\.; i <= iterations_number; i\+\+\)/);
  assert.match(shader, /vec4 color_mix = blend_colors\(/);
  assert.match(shader, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(shader, /pointermove/);
  assert.match(shader, /removeEventListener\("pointermove"/);
  assert.match(wave, /amplitude=\{0\.08\}/);
  assert.match(wave, /mouseReact/);
  assert.doesNotMatch(wave, /gradient-wave__(?:network|orbit|signal)/);
  assert.match(css, /\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.86/s);
});

test("header controls share one grid and one spacing rhythm", async () => {
  const css = await read("../src/components/CardNav/CardNav.css");
  const topRule = css.match(/\.card-nav__top\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";
  const mobile = css.match(/@media \(max-width: 559px\)\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? "";
  const desktop = css.match(/@media \(min-width: 560px\)\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? "";

  assert.match(topRule, /display:\s*grid/);
  assert.match(topRule, /column-gap:\s*8px/);
  assert.match(mobile, /grid-template-columns:\s*44px 44px minmax\(0, 1fr\) 90px/);
  assert.match(desktop, /grid-template-columns:\s*48px auto minmax\(0, 1fr\) auto/);
  assert.doesNotMatch(css, /\.card-nav__cta\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(css, /\.card-nav__language\s*\{[^}]*position:\s*absolute/s);
});
