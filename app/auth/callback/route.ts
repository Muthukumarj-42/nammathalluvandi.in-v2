import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  // Determine the correct public origin to redirect to
  let targetOrigin = origin;
  if (!isLocalEnv) {
    const host = (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1"))
      ? forwardedHost
      : "nammathalluvandi.in";
    targetOrigin = `https://${host}`;
  }

  // Handle auth errors
  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    return NextResponse.redirect(
      `${targetOrigin}/login?error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful auth — redirect to intended destination
      return NextResponse.redirect(`${targetOrigin}${next}`);
    }

    console.error("Code exchange error:", exchangeError);
  }

  // Fallback: redirect to login with error
  return NextResponse.redirect(
    `${targetOrigin}/login?error=Authentication+failed.+Please+try+again.`
  );
}
