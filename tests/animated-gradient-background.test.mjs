import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("uses the supplied WebGL shader as a full-landing UI component", async () => {
  const [component, wave, waveCss] = await Promise.all([
    read("../src/components/ui/animated-gradient.jsx"),
    read("../src/components/GradientWave/GradientWave.jsx"),
    read("../src/components/GradientWave/GradientWave.css"),
  ]);

  assert.match(component, /getContext\("webgl2"/);
  assert.match(component, /const FRAGMENT_SHADER/);
  assert.match(component, /ResizeObserver/);
  assert.match(component, /document\.visibilityState/);
  assert.match(component, /prefers-reduced-motion:\s*reduce/);
  assert.match(component, /Math\.min\(window\.devicePixelRatio\s*\|\|\s*1,\s*1\.5\)/);
  assert.match(component, /const TARGET_FRAME_MS = 1000 \/ 30/);
  assert.match(component, /delta < TARGET_FRAME_MS/);
  assert.match(component, /rotate\(uv, u_rotation\)/);
  assert.doesNotMatch(component, /u_rotation \* \.5 \* PI/);
  assert.match(component, /webglcontextlost/);
  assert.match(component, /webglcontextrestored/);
  assert.match(component, /contextRevision/);
  assert.match(component, /const DEFAULT_CONFIG = Object\.freeze/);
  assert.match(component, /config = DEFAULT_CONFIG/);
  assert.match(wave, /components\/ui\/animated-gradient|\.\.\/ui\/animated-gradient/);
  assert.match(wave, /preset:\s*"Ice"/);
  assert.doesNotMatch(wave, /<svg/);
  assert.match(waveCss, /position:\s*fixed/);
  assert.match(waveCss, /pointer-events:\s*none/);
});

test("adapts the shader to the Evidence-first Ice palette and keeps a CSS fallback", async () => {
  const [component, tokens, design, sections, marketplace, contact] = await Promise.all([
    read("../src/components/ui/animated-gradient.jsx"),
    read("../src/styles/tokens.css"),
    read("../docs/design-system.md"),
    read("../src/styles/sections.css"),
    read("../src/components/ProjectMarketplace/ProjectMarketplace.css"),
    read("../src/components/FinalContact/FinalContact.css"),
  ]);

  assert.match(component, /Ice:\s*\{/);
  assert.match(component, /var\(--gradient-ice-base\)/);
  assert.match(component, /var\(--gradient-ice-light\)/);
  assert.match(component, /var\(--gradient-ice-signal\)/);
  assert.match(tokens, /--gradient-ice-base:/);
  assert.match(tokens, /--gradient-ice-light:/);
  assert.match(tokens, /--gradient-ice-signal:/);
  assert.match(component, /animated-gradient__fallback/);
  assert.match(design, /WebGL/);
  assert.match(design, /останавливается, когда вкладка скрыта/);
  assert.match(sections, /color-mix\(in oklch, var\(--color-surface\) 90%, transparent\)/);
  assert.match(marketplace, /color-mix\(in oklch, var\(--color-surface\) 90%, transparent\)/);
  assert.match(contact, /color-mix\(in oklch, var\(--color-surface\) 90%, transparent\)/);
});

test("releases every WebGL and browser lifecycle resource", async () => {
  const component = await read("../src/components/ui/animated-gradient.jsx");

  assert.match(component, /cancelAnimationFrame/);
  assert.match(component, /resizeObserver\.disconnect\(\)/);
  assert.match(component, /removeEventListener\("visibilitychange"/);
  assert.match(component, /removeEventListener\("webglcontextlost"/);
  assert.match(component, /removeEventListener\("webglcontextrestored"/);
  assert.match(component, /motionQuery\.removeEventListener\("change"/);
  assert.match(component, /gl\.deleteProgram/);
  assert.match(component, /gl\.deleteShader/);
  assert.match(component, /gl\.deleteBuffer/);
  assert.match(component, /WEBGL_lose_context/);
  assert.equal((component.match(/WEBGL_lose_context/g) ?? []).length, 3);
});
