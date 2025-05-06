import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/sandbox"];
const authPaths = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Check if the user is trying to access a protected route
  const isAccessingProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Check if the user is trying to access an auth route
  const isAccessingAuth = authPaths.includes(pathname);

  if (!sessionCookie) {
    // Redirect unauthenticated users trying to access protected routes to /login
    if (isAccessingProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // Redirect authenticated users trying to access auth routes to /dashboard
    if (isAccessingAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Allow the request to proceed
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
