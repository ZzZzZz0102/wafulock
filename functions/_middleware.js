/**
 * Cloudflare Pages — extensionless URLs (replaces Apache .htaccess rewrite).
 * Serves /about from /about.html; 301-redirects /about.html → /about.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  let { pathname } = url;

  if (pathname === "/resource/technology-twentyone" || pathname === "/resource/technology-twentyone.html") {
    return Response.redirect(new URL("/resource/invisible-lock-line" + url.search, url.origin), 301);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const withoutSlash = pathname.slice(0, -1);
    return Response.redirect(new URL(withoutSlash + url.search, url.origin), 301);
  }

  if (/\.html$/i.test(pathname) && !/^\/yandex_[^/]+\.html$/i.test(pathname)) {
    const withoutExt = pathname.slice(0, -5);
    const target = withoutExt === "" || withoutExt === "/index" ? "/" : withoutExt;
    return Response.redirect(new URL(target + url.search, url.origin), 301);
  }

  if (pathname !== "/" && /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return context.next();
  }

  const htmlPath =
    pathname === "/" || pathname === ""
      ? "/index.html"
      : `${pathname.replace(/\/$/, "")}.html`;

  const htmlRequest = new Request(new URL(htmlPath, url.origin), context.request);
  const response = await context.env.ASSETS.fetch(htmlRequest);

  if (response.status === 200) {
    const isExplicit404 = pathname === '/404';
    return new Response(response.body, {
      status: isExplicit404 ? 404 : 200,
      headers: response.headers,
    });
  }

  const notFoundRequest = new Request(new URL('/404.html', url.origin), context.request);
  const notFoundResponse = await context.env.ASSETS.fetch(notFoundRequest);
  if (notFoundResponse.status === 200) {
    return new Response(notFoundResponse.body, {
      status: 404,
      headers: notFoundResponse.headers,
    });
  }

  return context.next();
}
