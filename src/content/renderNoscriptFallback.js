import {
  career as siteCareer,
  contact as siteContact,
  hero as siteHero,
  problems as siteProblems,
  projects as siteProjects,
  sectionCopy as siteSectionCopy,
  socialLinks as siteSocialLinks,
} from "./siteContent.js";

const defaultContent = {
  hero: siteHero,
  problems: siteProblems,
  career: siteCareer,
  projects: siteProjects,
  contact: siteContact,
  sectionCopy: siteSectionCopy,
  socialLinks: siteSocialLinks,
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderLink = ({ href, target, rel, label, download }) => {
  const targetAttribute = target ? ` target="${escapeHtml(target)}"` : "";
  const relAttribute = rel ? ` rel="${escapeHtml(rel)}"` : "";
  const downloadAttribute = download ? " download" : "";
  return `<a class="noscript-site__cta" href="${escapeHtml(
    href,
  )}"${targetAttribute}${relAttribute}${downloadAttribute}>${escapeHtml(label)}</a>`;
};

const renderItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

export function renderNoscriptFallback(content = defaultContent) {
  const {
    hero,
    problems,
    career,
    projects,
    contact,
    sectionCopy = siteSectionCopy,
    socialLinks = siteSocialLinks,
  } = content;

  return `<style>
  .noscript-site{width:min(calc(100% - 32px),1120px);margin:0 auto;padding:104px 0 64px;color:var(--color-text,#182b67);font:16px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}
  .noscript-site h1,.noscript-site h2,.noscript-site h3{line-height:1.15}.noscript-site h1{max-width:21ch;font-size:clamp(2rem,8vw,4.5rem)}
  .noscript-site section{padding:40px 0;border-top:1px solid var(--color-border,#ccd9f4)}.noscript-site__grid{display:grid;gap:16px}
  .noscript-site__sequence{display:grid;margin:20px 0;padding-left:24px;gap:8px}
  .noscript-site article{padding:20px;border:1px solid var(--color-border,#ccd9f4);border-radius:16px;background:var(--color-surface-raised,#fff)}
  .noscript-site__cta{display:inline-flex;min-height:48px;margin-top:16px;padding:0 20px;align-items:center;border-radius:13px;background:var(--color-accent,#152863);color:var(--color-on-accent,#fff);font-weight:700}
  @media(min-width:768px){.noscript-site{width:min(calc(100% - 64px),1120px)}.noscript-site__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
<main class="noscript-site">
  <header>
    <h1>${escapeHtml(hero.title)}</h1>
    ${hero.promise ? `<p>${escapeHtml(hero.promise)}</p>` : ""}
    ${hero.description ? `<p>${escapeHtml(hero.description)}</p>` : ""}
    ${
      hero.sequence?.length
        ? `<ol class="noscript-site__sequence" aria-label="Этапы комплексной работы">${renderItems(hero.sequence)}</ol>`
        : ""
    }
    ${renderLink(hero.cta)}
  </header>
  <section aria-labelledby="noscript-problems-title">
    <h2 id="noscript-problems-title">${escapeHtml(sectionCopy.problems.title)}</h2>
    <div class="noscript-site__grid">
      ${problems
        .map(
          (problem) => `<article data-noscript-problem>
        <h3>${escapeHtml(problem.title)}</h3>
        <p>${escapeHtml(problem.situation)}</p>
        <p><strong>Что сделаю</strong></p>
        <ul>${renderItems(problem.actions)}</ul>
        <p><strong>Что получите</strong></p>
        <ul>${renderItems(problem.outcomes)}</ul>
      </article>`,
        )
        .join("")}
    </div>
  </section>
  <section aria-labelledby="noscript-career-title">
    <h2 id="noscript-career-title">${escapeHtml(sectionCopy.career.title)}</h2>
    <div class="noscript-site__grid">
      ${career
        .map(
          (event) => `<article data-noscript-career>
        <p><strong>${escapeHtml(event.year)}</strong></p>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.body)}</p>
        <p><strong>${escapeHtml(event.result)}</strong></p>
      </article>`,
        )
        .join("")}
    </div>
  </section>
  <section aria-labelledby="noscript-projects-title">
    <h2 id="noscript-projects-title">${escapeHtml(sectionCopy.marketplace.title)}</h2>
    <p>${escapeHtml(sectionCopy.marketplace.description)}</p>
    <div class="noscript-site__grid">
      ${projects
        .map(
          (project) => `<article data-noscript-project>
        <p>${escapeHtml(project.category)} · ${escapeHtml(project.duration)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        ${project.status ? `<p><strong>${escapeHtml(project.status)}</strong></p>` : ""}
        <p>${escapeHtml(project.summary)}</p>
        <ul>${renderItems(project.metrics)}</ul>
        ${project.externalActions?.map(renderLink).join("") ?? ""}
      </article>`,
        )
        .join("")}
    </div>
  </section>
  <section aria-labelledby="noscript-contact-title">
    <h2 id="noscript-contact-title">${escapeHtml(contact.title)}</h2>
    ${contact.body ? `<p>${escapeHtml(contact.body)}</p>` : ""}
    ${renderLink({ ...contact, label: contact.ctaLabel })}
  </section>
  <footer>
    <p>${socialLinks
      .map(({ href, label, meta }) => `<a href="${escapeHtml(href)}">${escapeHtml(label)} — ${escapeHtml(meta)}</a>`)
      .join(" · ")}</p>
    <p>Разработано genidev. Информация на сайте не является публичной офертой.</p>
  </footer>
</main>`;
}
