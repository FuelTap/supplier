import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  isTokenExpiring,
  REFRESH_COOKIE,
  refreshSession,
} from "@/lib/helpers/session-tokens";

function toLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

// Everything except the sign-in pages needs a session cookie. The layouts then
// check the session itself and the supplier role on the server.
//
// Pages can't set cookies while rendering, so an expired access token is
// refreshed here, before the page reads it.
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (accessToken && !isTokenExpiring(accessToken)) return NextResponse.next();
  if (!refreshToken) {
    // An expiring token with no way to renew it: let the page try, and its
    // request redirects to /login once the backend rejects it.
    return accessToken ? NextResponse.next() : toLogin(request);
  }

  const refreshed = await refreshSession(refreshToken);

  if (!refreshed.ok) {
    if (refreshed.expired) {
      const response = toLogin(request);
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }
    // Backend unreachable: let the page render its own error state.
    return accessToken ? NextResponse.next() : toLogin(request);
  }

  // Forward the new tokens to this render and store them in the browser.
  for (const cookie of refreshed.cookies) {
    request.cookies.set(cookie.name, cookie.value);
  }
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of refreshed.cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/stations/:path*",
    "/managers/:path*",
    "/inventory/:path*",
    "/kyb/:path*",
  ],
};
