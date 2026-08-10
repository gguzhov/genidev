import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [navCss, profileCss, sectionsCss, finalContactCss, cardSource, contentSource, marketplaceCss] =
  await Promise.all([
    readFile("src/components/CardNav/CardNav.css", "utf8"),
    readFile("src/components/ProfileCard/ProfileCard.css", "utf8"),
    readFile("src/styles/sections.css", "utf8"),
    readFile("src/components/FinalContact/FinalContact.css", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8"),
    readFile("src/content/siteContent.js", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
  ]);

test("keeps the sticky CTA hidden until 560px and preserves the compact header grid", () => {
  assert.match(navCss, /@media \(max-width:\s*559px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+48px/);
  assert.match(
    navCss,
    /@media \(min-width:\s*560px\)[\s\S]*\.card-nav__cta\s*\{[^}]*display:\s*inline-flex/s,
  );
  const wideMobileBlock = navCss.match(/@media \(min-width:\s*430px\)\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
  assert.doesNotMatch(wideMobileBlock, /\.card-nav__cta/);
});

test("switches ProfileCard info columns from the card width instead of viewport width", () => {
  assert.match(
    profileCss,
    /\.profile-card-wrapper\s*\{[^}]*container:\s*profile-card\s*\/\s*inline-size/s,
  );
  assert.match(
    profileCss,
    /@container\s+profile-card\s*\(min-width:\s*3(?:4|5|6)\dpx\)[\s\S]*\.profile-card__info\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s,
  );
  assert.doesNotMatch(
    profileCss,
    /@media \(min-width:\s*430px\)[\s\S]*\.profile-card__info\s*\{[^}]*grid-template-columns/s,
  );
});

test("does not run backdrop filtering behind the opaque CardNav", () => {
  const navRule = navCss.match(/\.card-nav\s*\{[^}]*\}/s)?.[0] ?? "";
  assert.doesNotMatch(navRule, /backdrop-filter/);
  assert.match(navRule, /background:\s*var\(--color-surface-raised\)/);
});

test("uses a taller mobile anchor offset and restores the desktop offset", () => {
  assert.match(
    sectionsCss,
    /\.section\[id\],[\s\S]*?\.final-contact\[id\]\s*\{[^}]*scroll-margin-top:\s*120px/s,
  );
  assert.match(
    sectionsCss,
    /@media \(min-width:\s*768px\)[\s\S]*\.section\[id\],[\s\S]*?\.final-contact\[id\]\s*\{[^}]*scroll-margin-top:\s*104px/s,
  );
});

test("crops only the real Ostrov cover chrome through semantic CSS metadata", () => {
  assert.match(contentSource, /slug:\s*"ostrov-zdoroviya"[\s\S]*coverCrop:\s*"browser-chrome"/);
  assert.match(cardSource, /project\.coverCrop/);
  assert.match(cardSource, /project-card--cover-/);
  assert.match(
    marketplaceCss,
    /\.project-card--cover-browser-chrome \.project-card__media img\s*\{[^}]*height:\s*11[4-9]%[^}]*object-position:\s*center bottom/s,
  );
  assert.match(contentSource, /cover:\s*"\/projects\/ostrov\/ostrov-home-comet\.webp"/);
});

test("uses marketplace bottom padding as the only gap before contact", () => {
  assert.match(finalContactCss, /\.marketplace \+ \.final-contact\s*\{[^}]*padding-top:\s*0/s);
  assert.match(sectionsCss, /\.section\s*\{[^}]*padding:\s*72px 0/s);
  assert.match(
    sectionsCss,
    /@media \(min-width:\s*1280px\)[\s\S]*\.section\s*\{[^}]*padding:\s*120px 0/s,
  );
});
