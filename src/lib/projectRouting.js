const PROJECT_ROUTE = /^\/projects\/([a-z0-9-]+)\/?$/;

export function projectPath(slug) {
  return `/projects/${slug}`;
}

export function projectSlugFromPath(pathname) {
  return pathname.match(PROJECT_ROUTE)?.[1] ?? null;
}
