#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSiteContent } from "../src/content/siteContent.js";
import { renderNoscriptFallback } from "../src/content/renderNoscriptFallback.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(root, "dist", "client");
const englishIndexPath = "en/index.html";
const englishProjectsPath = "en/projects";
const baseHtml = await readFile(path.join(clientDir, "index.html"), "utf8");

const metadata = {
  ru: {
    title: "Геннадий Гужов — цифровые и AI-продукты",
    description: "Разработка цифровых продуктов, автоматизация бизнес-процессов и внедрение AI.",
  },
  en: {
    title: "Gennady Guzhov — digital products and AI automation",
    description: "Digital product development, business process automation and practical AI systems.",
  },
};

function shell(locale, activeProject) {
  const content = getSiteContent(locale);
  const title = activeProject ? `${activeProject.title} — ${metadata[locale].title}` : metadata[locale].title;
  const description = activeProject?.summary ?? metadata[locale].description;
  return baseHtml
    .replace(/<html lang="[^"]+">/, `<html lang="${locale}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description.replaceAll('"', '&quot;')}" />`)
    .replace(/<noscript id="noscript-fallback">[\s\S]*?<\/noscript>/, `<noscript id="noscript-fallback">${renderNoscriptFallback(content, { activeProject })}</noscript>`);
}

async function emit(relativePath, html) {
  const target = path.join(clientDir, relativePath, "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

for (const locale of ["ru", "en"]) {
  const content = getSiteContent(locale);
  if (locale === "en") await emit(englishIndexPath.replace(/\/index\.html$/, ""), shell(locale));
  for (const project of content.projects) {
    await emit(`${locale === "en" ? `${englishProjectsPath}/` : "projects/"}${project.slug}`, shell(locale, project));
  }
}

console.log("Generated localized landing and project HTML shells");
