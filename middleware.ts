import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require the user to be authenticated
const AUTHENTICATED_ROUTES = ["/profile", "/publish", "/notifications"];
// Routes that require VENDOR role
const VENDOR_ROUTES = ["/vendor"];
// Routes that require ADMIN or SUPER_ADMIN role
const ADMIN_ROUTES = ["/admin"];

const USE_TEMPORARY_PHONE_LOGIN = false;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow all routes (dev mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- Redirect profile page in temporary mode since buyers don't need profile/login ---
  if (pathname.startsWith("/profile") && USE_TEMPORARY_PHONE_LOGIN) {
    return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
  }

  // --- Admin route protection ---
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    // Allow direct access to admin pages as they handle passcode-based auth internally
    return supabaseResponse;
  }

  const forcedPhone = request.cookies.get("forced_user_phone")?.value;
  const isForcedLoggedIn = USE_TEMPORARY_PHONE_LOGIN && (forcedPhone === "8838292849" || forcedPhone === "+918838292849" || forcedPhone === "918838292849");

  // --- Vendor route protection ---
  if (VENDOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user && !isForcedLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // --- Authenticated route protection ---
  if (AUTHENTICATED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user && !isForcedLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // --- Redirect already logged-in users away from /login ---
  if (pathname === "/login" && (user || isForcedLoggedIn)) {
    const targetRedirect = USE_TEMPORARY_PHONE_LOGIN ? "/vendor/dashboard" : "/profile";
    return NextResponse.redirect(new URL(targetRedirect, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
