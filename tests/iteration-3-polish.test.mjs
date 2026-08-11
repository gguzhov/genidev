import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [navCss, navSource, profileCss, sectionsCss, finalContactCss, cardSource, contentSource, marketplaceCss] =
  await Promise.all([
    readFile("src/components/CardNav/CardNav.css", "utf8"),
    readFile("src/components/CardNav/CardNav.jsx", "utf8"),
    readFile("src/components/ProfileCard/ProfileCard.css", "utf8"),
    readFile("src/styles/sections.css", "utf8"),
    readFile("src/components/FinalContact/FinalContact.css", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8"),
    readFile("src/content/siteContent.js", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
  ]);

test("keeps the closed contact CTA visible and bounded on 375px and 430px", () => {
  assert.match(navSource, /className="card-nav__cta"/);
  assert.match(navSource, /\{cta\?\.label\s*\?\?\s*"Решить проблему"\}/);
  assert.match(
    navCss,
    /\.card-nav__cta\s*\{[^}]*min-height:\s*(?:44|48)px[^}]*max-width:\s*100%/s,
  );
  assert.match(
    navCss,
    /@media \(max-width:\s*559px\)[\s\S]*grid-template-columns:\s*48px\s+minmax\(0,\s*1fr\)\s+48px[\s\S]*\.card-nav__cta\s*\{[^}]*display:\s*inline-flex/s,
  );
});

test("keeps the compact ProfileCard action sized within the card", () => {
  assert.match(
    profileCss,
    /\.profile-card-wrapper\s*\{[^}]*container:\s*profile-card\s*\/\s*inline-size/s,
  );
  assert.match(profileCss, /\.profile-card__action-layer\s*\{[^}]*right:\s*16px/s);
  assert.match(profileCss, /\.profile-card__contact\s*\{[^}]*width:\s*100%/s);
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

test("keeps cover metadata for the full case while marketplace uses centered brand", () => {
  assert.match(contentSource, /slug:\s*"ostrov-zdoroviya"[\s\S]*coverCrop:\s*"browser-chrome"/);
  assert.match(cardSource, /project\.coverCrop/);
  assert.match(cardSource, /project-card--cover-/);
  assert.doesNotMatch(marketplaceCss, /project-visual__product/);
  assert.match(marketplaceCss, /\.project-visual__logo\s*\{[^}]*top:\s*50%[^}]*left:\s*50%/s);
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
