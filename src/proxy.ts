import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isInboxRoute = req.nextUrl.pathname.startsWith("/inbox");

  if (isInboxRoute && !isLoggedIn) {
    // Redirect unauthenticated users to the landing page
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/inbox/:path*"],
};
