import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Everything except the sign-in pages needs a session cookie. The layouts then
// check the session itself and the supplier role on the server.
export function proxy(request: NextRequest) {
  const token = request.cookies.get("x-access-token")?.value;
  if (token) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
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
