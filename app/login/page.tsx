"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { isDbConfigured } from "@/lib/supabase";

const USE_TEMPORARY_PHONE_LOGIN = true;

// ─── Bilingual text helper ────────────────────────────────────────────────────
function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

// ─── Google icon SVG ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ─── Main login form (wrapped in Suspense for useSearchParams) ────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRedirect = USE_TEMPORARY_PHONE_LOGIN ? "/vendor/dashboard" : "/profile";
  const redirect = searchParams.get("redirect") ?? defaultRedirect;
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"choose" | "email" | "sent">("choose");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError ?? "");

  // ── Phone Login ─────────────────────────────────────────────────────────────
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");

    const sanitizedPhone = phone.trim().replace(/\s+/g, "");
    
    // Admin / Vendor forced credentials checks
    const isAllowed = sanitizedPhone === "8838292849" || 
                      sanitizedPhone === "+918838292849" || 
                      sanitizedPhone === "918838292849" ||
                      sanitizedPhone === "muthuadmin";

    if (isAllowed) {
      const cookieValue = sanitizedPhone === "muthuadmin" ? "8838292849" : sanitizedPhone;
      document.cookie = `forced_user_phone=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}`;
      
      // Perform direct page navigation so auth state is fully re-initialized
      window.location.href = redirect;
    } else {
      setError("Unauthorized phone number. Access Denied.");
      setLoading(false);
    }
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (!isDbConfigured) {
      setError("Supabase is not connected yet. Please set up your environment variables.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  // ── Magic Link ──────────────────────────────────────────────────────────────
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isDbConfigured) {
      setError("Supabase is not connected yet. Please set up your environment variables.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);
    if (magicError) {
      setError(magicError.message);
    } else {
      setMode("sent");
    }
  };

  if (USE_TEMPORARY_PHONE_LOGIN) {
    return (
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 relative flex items-center justify-center mb-4">
            <Image
              src="/brand/full-logo.webp"
              alt="Thalluvandi Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Link href="/admin">
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 hover:text-[#075200] transition-colors cursor-pointer">
              THALLUVANDI
            </h1>
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            <T en="Premium Cart Marketplace" ta="தரமான வண்டி சந்தை" />
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-gray-100">
          {/* Back to home — top-left arrow */}
          <Link
            href="/"
            className="absolute top-5 left-5 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-green-100 hover:text-[#075200] text-gray-500 transition-all duration-200 group"
            aria-label="Back to home"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-2 mt-4">
            <T en="Vendor Login" ta="விற்பனையாளர் உள்நுழைவு" />
          </h2>
          <p className="text-sm text-gray-400 text-center mb-8">
            <T en="Enter your phone number to manage your carts" ta="உங்கள் வண்டிகளை நிர்வகிக்க தொலைபேசி எண்ணை உள்ளிடவும்" />
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium text-gray-600 mb-2">
                <T en="Phone Number" ta="தொலைபேசி எண்" />
              </label>
              <input
                id="phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 8838292849"
                required
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#075200]/40 focus:border-[#075200] transition-all"
              />
            </div>
            <button
              id="phone-login-submit-btn"
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#075200] to-[#116d03] text-white font-bold text-sm hover:from-[#116d03] hover:to-[#075200] transition-all duration-200 shadow-md shadow-green-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                  </svg>
                  <T en="Verifying…" ta="சரிபார்க்கிறது…" />
                </span>
              ) : (
                <T en="Login" ta="உள்நுழையவும்" />
              )}
            </button>
          </form>

          {/* Legal / Notice */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            <T
              en="Only authorized vendors are allowed access to the console."
              ta="அங்கீகரிக்கப்பட்ட விற்பனையாளர்களுக்கு மட்டுமே அனுமதி."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 relative flex items-center justify-center mb-4">
          <Image
            src="/brand/full-logo.webp"
            alt="Thalluvandi Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link href="/admin">
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 hover:text-[#075200] transition-colors cursor-pointer">
            THALLUVANDI
          </h1>
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          <T en="Premium Cart Marketplace" ta="தரமான வண்டி சந்தை" />
        </p>
      </div>

      {/* Card */}
      <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-gray-100">
        {/* Back to home — top-left arrow */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-green-100 hover:text-[#075200] text-gray-500 transition-all duration-200 group"
          aria-label="Back to home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {mode === "choose" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              <T en="Sign in to continue" ta="தொடர உள்நுழையவும்" />
            </h2>
            <p className="text-sm text-gray-400 text-center mb-8">
              <T en="No password. No OTP. Just your email." ta="கடவுச்சொல் இல்லை. OTP இல்லை." />
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Google button */}
            <button
              id="login-google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-60 mb-3"
            >
              <GoogleIcon />
              <T en="Continue with Google" ta="Google மூலம் தொடரவும்" />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">
                <T en="or" ta="அல்லது" />
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email button */}
            <button
              id="login-email-btn"
              onClick={() => setMode("email")}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-green-50 border border-green-200 text-[#075200] font-semibold text-sm hover:bg-green-100 hover:border-green-300 transition-all duration-200 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <T en="Continue with Email" ta="மின்னஞ்சல் மூலம் தொடரவும்" />
            </button>

            {/* Legal */}
            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              <T
                en="By signing in, you agree to our Terms of Service and Privacy Policy."
                ta="உள்நுழைவதன் மூலம், நிபந்தனைகளுக்கு ஒப்புக்கொள்கிறீர்கள்."
              />
            </p>
          </>
        )}

        {mode === "email" && (
          <>
            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <T en="Back" ta="பின்செல்" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              <T en="Enter your email" ta="உங்கள் மின்னஞ்சலை உள்ளிடவும்" />
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              <T en="We'll send you a magic link to sign in instantly." ta="உடனடியாக உள்நுழைய ஒரு இணைப்பு அனுப்புவோம்." />
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-600 mb-2">
                  <T en="Email address" ta="மின்னஞ்சல் முகவரி" />
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#075200]/40 focus:border-[#075200] transition-all"
                />
              </div>
              <button
                id="send-magic-link-btn"
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#075200] to-[#116d03] text-white font-bold text-sm hover:from-[#116d03] hover:to-[#075200] transition-all duration-200 shadow-md shadow-green-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                    </svg>
                    <T en="Sending…" ta="அனுப்புகிறோம்…" />
                  </span>
                ) : (
                  <T en="Send Magic Link" ta="இணைப்பு அனுப்பு" />
                )}
              </button>
            </form>
          </>
        )}

        {mode === "sent" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-green-500">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              <T en="Check your inbox!" ta="உங்கள் inbox பாருங்கள்!" />
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              <T en="We sent a magic link to" ta="இணைப்பை அனுப்பினோம்:" />
            </p>
            <p className="text-sm font-semibold text-[#f97316] mb-6">{email}</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              <T
                en="Click the link in the email to sign in. The link expires in 60 minutes."
                ta="மின்னஞ்சலில் உள்ள இணைப்பை கிளிக் செய்யவும். இணைப்பு 60 நிமிடங்களில் காலாவதியாகும்."
              />
            </p>
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
            >
              <T en="Use a different email" ta="வேறு மின்னஞ்சல் பயன்படுத்து" />
            </button>
          </div>
        )}
      </div>


    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Subtle warm ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(249,115,22,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(220,38,38,0.04) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
