import {
  career as siteCareer,
  contact as siteContact,
  hero as siteHero,
  problems as siteProblems,
  projects as siteProjects,
  sectionCopy as siteSectionCopy,
  socialLinks as siteSocialLinks,
  navigation as siteNavigation,
  ruUi as siteUi,
} from "./siteContent.js";

const defaultContent = {
  hero: siteHero,
  problems: siteProblems,
  career: siteCareer,
  projects: siteProjects,
  contact: siteContact,
  sectionCopy: siteSectionCopy,
  socialLinks: siteSocialLinks,
  navigation: siteNavigation,
  ui: siteUi,
  locale: "ru",
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

const renderItems = (items = []) => items.map((item) => {
  if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
  return `<li><strong>${escapeHtml(item.label)}</strong><br>${escapeHtml(item.text)}</li>`;
}).join("");

const localizedProjectHref = (locale, slug) =>
  `${locale === "en" ? "/en" : ""}/projects/${encodeURIComponent(slug)}`;

export function renderNoscriptFallback(content = defaultContent, { activeProject } = {}) {
  const {
    hero,
    problems,
    career,
    projects,
    contact,
    sectionCopy = siteSectionCopy,
    socialLinks = siteSocialLinks,
    navigation = siteNavigation,
    ui = siteUi,
    locale = "ru",
  } = content;

  const alternateLocale = locale === "en" ? "ru" : "en";
  const alternateHref = activeProject
    ? localizedProjectHref(alternateLocale, activeProject.slug)
    : alternateLocale === "en" ? "/en" : "/";
  const alternateLabel = ui.languageSwitch?.find(({ locale: option }) => option === alternateLocale)?.label
    ?? alternateLocale.toUpperCase();
  const projectContent = activeProject
    ? `<section aria-labelledby="noscript-active-project-title">
      <p>${escapeHtml(activeProject.tags.join(" · "))} · ${escapeHtml(activeProject.deliveredAt)}</p>
      <h2 id="noscript-active-project-title">${escapeHtml(activeProject.title)}</h2>
      <p>${escapeHtml(activeProject.summary)}</p>
      <h3>${escapeHtml(activeProject.challengeLabel)}</h3>
      <p>${escapeHtml(activeProject.challenge)}</p>
      <h3>${escapeHtml(ui.case.solution)}</h3>
      <ul>${renderItems(activeProject.solution)}</ul>
      <h3>${escapeHtml(ui.case.benefit)}</h3>
      <p>${escapeHtml(activeProject.benefit)}</p>
      <ul>${renderItems(activeProject.metrics)}</ul>
      ${activeProject.externalActions?.map(renderLink).join("") ?? ""}
    </section>`
    : "";

  return `<style>
  .noscript-site{width:min(calc(100% - 32px),1120px);margin:0 auto;padding:104px 0 64px;color:var(--color-text,#182b67);font:16px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}
  .noscript-site h1,.noscript-site h2,.noscript-site h3{max-width:none;line-height:1.15}.noscript-site h1{font-size:clamp(2rem,8vw,4.5rem)}
  .noscript-site section{padding:40px 0;border-top:1px solid var(--color-border,#ccd9f4)}.noscript-site__grid{display:grid;gap:16px}
  .noscript-site article{padding:20px;border:1px solid var(--color-border,#ccd9f4);border-radius:16px;background:var(--color-surface-raised,#fff)}
  .noscript-site__cta{display:inline-flex;min-height:48px;margin-top:16px;padding:0 20px;align-items:center;border-radius:13px;background:var(--color-accent,#152863);color:var(--color-on-accent,#fff);font-weight:700}
  @media(min-width:768px){.noscript-site{width:min(calc(100% - 64px),1120px)}.noscript-site__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
<main class="noscript-site">
  <nav aria-label="${escapeHtml(ui.navLabel)}">
    ${navigation
      .map(({ href, label, target, rel }) =>
        renderLink({ href, label, target, rel }),
      )
      .join("")}
    <a class="noscript-site__cta" href="${alternateHref}" hreflang="${alternateLocale}" lang="${alternateLocale}">${alternateLabel}</a>
  </nav>
  <header>
    <h1>${escapeHtml(hero.title)}</h1>
    ${hero.role ? `<p><strong>${escapeHtml(hero.role)}</strong></p>` : ""}
    ${hero.promise ? `<p>${escapeHtml(hero.promise)}</p>` : ""}
    ${hero.description ? `<p>${escapeHtml(hero.description)}</p>` : ""}
    ${renderLink(hero.cta)}
  </header>
  ${projectContent}
  <section aria-labelledby="noscript-problems-title">
    <h2 id="noscript-problems-title">${escapeHtml(sectionCopy.problems.title)}</h2>
    ${sectionCopy.problems.description ? `<p>${escapeHtml(sectionCopy.problems.description)}</p>` : ""}
    <div class="noscript-site__grid">
      ${problems
        .map(
          (problem) => `<article data-noscript-problem>
        <h3>${escapeHtml(problem.title)}</h3>
        <ul>${problem.solutions
          .map(
            (solution) => `<li><strong>${escapeHtml(solution.title)}</strong>${
              solution.project
                ? `<br><small>${escapeHtml(ui.digitalSolution)}</small><br>${escapeHtml(solution.project)}`
                : ""
            }${
              solution.effect
                ? `<br><small>${escapeHtml(ui.businessResult)}</small><br><em>${escapeHtml(solution.effect)}</em>`
                : ""
            }</li>`,
          )
          .join("")}</ul>
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
        ${event.result ? `<p><strong>${escapeHtml(event.result)}</strong></p>` : ""}
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
        <p>${escapeHtml(project.tags.join(" · "))}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <ul>${renderItems(project.metrics)}</ul>
        ${renderLink({ href: localizedProjectHref(locale, project.slug), label: ui.case.open })}
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
    <p>${escapeHtml(ui.footerIdentity)}</p>
  </footer>
</main>`;
}
