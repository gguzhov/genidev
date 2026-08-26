import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("separates the animated ice field into light, base and cobalt regions", async () => {
  const [shader, waveCss, fallbackCss] = await Promise.all([
    read("../src/components/ui/animated-gradient.jsx"),
    read("../src/components/GradientWave/GradientWave.css"),
    read("../src/components/ui/animated-gradient.css"),
  ]);

  assert.match(shader, /float edgeWidth = mix\(/);
  assert.match(shader, /float regionWave = 0\.5 \+ 0\.5 \* sin\(/);
  assert.match(shader, /float lightMask = smoothstep\(/);
  assert.match(shader, /float signalMask = smoothstep\(/);
  assert.match(shader, /mix\(ice, u_color3\.rgb, signalMask \* 0\.82\)/);
  assert.match(shader, /softness:\s*42/);

  assert.match(waveCss, /\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.86/s);
  assert.match(waveCss, /filter:\s*saturate\(1\.08\) contrast\(1\.04\)/);
  assert.match(fallbackCss, /var\(--gradient-ice-signal\)/);
});

test("keeps the stronger color field restrained on mobile and reduced motion", async () => {
  const css = await read("../src/components/GradientWave/GradientWave.css");

  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.76/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.72/s);
  assert.doesNotMatch(css, /animation:/);
});
