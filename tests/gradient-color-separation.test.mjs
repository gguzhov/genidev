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

  assert.match(shader, /color2:\s*"var\(--gradient-ice-signal\)"/);
  assert.match(shader, /color3:\s*"var\(--gradient-ice-light\)"/);
  assert.match(shader, /softness:\s*58/);
  assert.match(shader, /float random\(vec2 st\)/);
  assert.match(shader, /float noise\(vec2 st\)/);
  assert.match(shader, /u_distortion \* n2/);
  assert.match(shader, /clamp\(u_swirl, 0\., 2\.\) \/ i/);
  assert.match(shader, /u_shape < 0\.5/);
  assert.match(shader, /vec4 blend_colors\(/);
  assert.match(shader, /float noise_scale = \.0005 \+ \.006 \* u_scale/);
  assert.match(shader, /uv\.x \+= 4\. \* u_distortion \* n2 \* cos\(angle\)/);
  assert.match(shader, /float iterations_number = ceil\(clamp\(u_swirlIterations, 1\., 30\.\)\)/);
  assert.match(shader, /vec4 color_mix = blend_colors\(/);

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
