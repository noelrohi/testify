import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Define protected path prefixes and public root paths
const protectedPrefixes = ["/dashboard", "/sandbox"];
const publicRootPaths = ["/", "/login", "/signup"]; // Add other public root paths if needed
const authPaths = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users trying to access auth pages
  if (sessionCookie && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Determine if the current path is protected
  const isProtectedPrefix = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  // Check for root-level dynamic routes (like /[spaceId]) that aren't known public paths
  const isRootDynamicProtected =
    /^\/[^\/]+$/.test(pathname) &&
    !publicRootPaths.includes(pathname) &&
    !pathname.startsWith("/spaces/"); // Exclude other known top-level route groups

  const isProtectedRoute = isProtectedPrefix || isRootDynamicProtected;

  // Redirect unauthenticated users trying to access protected pages
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - Files with extensions (e.g., .png, .jpg)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
