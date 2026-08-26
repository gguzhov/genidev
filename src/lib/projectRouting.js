const PROJECT_ROUTE = /^\/(?:en\/)?projects\/([a-z0-9-]+)\/?$/;

export function resolveLocale(pathname = "/") {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ru";
}

export function localizedHomePath(locale = "ru") {
  return locale === "en" ? "/en" : "/";
}

export function projectPath(slug, locale = "ru") {
  return `${locale === "en" ? "/en" : ""}/projects/${slug}`;
}

export function projectSlugFromPath(pathname) {
  return pathname.match(PROJECT_ROUTE)?.[1] ?? null;
}
