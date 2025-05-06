import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/sandbox"];
const publicRootPaths = ["/"];
const authPaths = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  if (sessionCookie && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedPrefix = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isRootDynamicProtected =
    /^\/[^\/]+$/.test(pathname) &&
    !publicRootPaths.includes(pathname) &&
    !pathname.startsWith("/spaces/");

  const isProtectedRoute = isProtectedPrefix || isRootDynamicProtected;

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
