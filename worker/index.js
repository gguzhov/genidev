export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    const cleanPath = indexUrl.pathname.replace(/\/+$/, "");
    if (cleanPath) {
      indexUrl.pathname = `${cleanPath}/index.html`;
      indexUrl.search = "";
      const routeShell = await env.ASSETS.fetch(new Request(indexUrl, request));
      if (routeShell.status !== 404) return routeShell;
    }

    indexUrl.pathname = cleanPath === "/en" || cleanPath.startsWith("/en/")
      ? "/en/index.html"
      : "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
