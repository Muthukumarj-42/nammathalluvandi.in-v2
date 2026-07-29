"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { isDbConfigured } from "@/lib/supabase";

const USE_TEMPORARY_PHONE_LOGIN = false;

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

  const [mode, setMode] = useState<"choose" | "email" | "otp">("choose");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
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

  // ── Send Email OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isDbConfigured) {
      setError("Supabase is not connected yet. Please set up your environment variables.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    });

    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setMode("otp");
    }
  };

  // ── Verify Email OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
      } else if (data.session) {
        window.location.href = redirect;
      } else {
        setError("Verification succeeded, but session could not be established.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
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
          <Link href="/">
            <h1 className="font-display text-2xl font-black uppercase italic tracking-wide select-none cursor-pointer">
              <span className="text-gray-900">NAMMA</span>
              <span className="text-[#F97316]">THALLUVANDI.IN</span>
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
        <Link href="/" className="max-w-full overflow-hidden">
          <h1 className="font-brand-logo font-display text-lg sm:text-xl md:text-2xl font-black uppercase italic tracking-wide select-none cursor-pointer whitespace-nowrap">
            <span className="text-gray-900">NAMMA</span>
            <span className="text-[#F97316]">THALLUVANDI.IN</span>
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
              <T en="We'll send you a 6-digit verification code to sign in." ta="உள்நுழைய உங்கள் மின்னஞ்சலுக்கு 6-இலக்க சரிபார்ப்புக் குறியீட்டை அனுப்புவோம்." />
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
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
                id="send-otp-btn"
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
                    <T en="Sending OTP…" ta="OTP அனுப்புகிறோம்…" />
                  </span>
                ) : (
                  <T en="Send OTP Code" ta="OTP குறியீடு அனுப்பு" />
                )}
              </button>
            </form>
          </>
        )}

        {mode === "otp" && (
          <>
            <button
              onClick={() => { setMode("email"); setError(""); setOtp(""); }}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <T en="Back" ta="பின்செல்" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              <T en="Enter OTP code" ta="OTP குறியீட்டை உள்ளிடவும்" />
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              <T en="We sent a 6-digit code to" ta="இதற்கு 6-இலக்க குறியீட்டை அனுப்பியுள்ளோம்:" />{" "}
              <span className="font-semibold text-[#f97316]">{email}</span>
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-gray-600 mb-2">
                  <T en="6-Digit OTP Code" ta="6-இலக்க OTP குறியீடு" />
                </label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm font-semibold tracking-[0.2em] text-center focus:outline-none focus:ring-2 focus:ring-[#075200]/40 focus:border-[#075200] transition-all"
                />
              </div>
              <button
                id="verify-otp-btn"
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#075200] to-[#116d03] text-white font-bold text-sm hover:from-[#116d03] hover:to-[#075200] transition-all duration-200 shadow-md shadow-green-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                    </svg>
                    <T en="Verifying OTP…" ta="OTP சரிபார்க்கிறது…" />
                  </span>
                ) : (
                  <T en="Verify & Sign In" ta="சரிபார்த்து உள்நுழையவும்" />
                )}
              </button>
            </form>
          </>
        )}
      </div>


    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4 relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 items-stretch relative z-10 md:h-[calc(100vh-160px)] md:overflow-hidden">
        {/* LEFT COLUMN - Benefits */}
        <div className="flex-1 w-full order-2 md:order-1 md:h-full md:overflow-y-auto scrollbar-none pr-4 pb-12">
          {/* SECTION 1 — HEADER */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              <T en="FOR CART OWNERS" ta="வண்டி உரிமையாளர்களுக்கு" />
            </p>
            <h1 className="font-display text-lg md:text-xl font-bold text-on-surface mb-3 leading-tight">
              <T
                en="List Your Cart & Earn."
                ta="உங்கள் வண்டியைப் பட்டியலிட்டு வாடகைக்கு விடுங்கள்"
              />
            </h1>
            <p className="text-sm text-on-surface-variant mb-6">
              <T
                en="Free to list. Zero commission. 300+ renters waiting — Tamil Nadu, Kerala and Andhra Pradesh."
                ta="இலவசப் பதிவு. பூஜ்ஜிய கமிஷன். 300+ வாடகைதாரர்கள் தயார் நிலையில் உள்ளனர் — தமிழ்நாடு, கேரளா மற்றும் ஆந்திரா."
              />
            </p>
          </div>

          {/* SECTION 2 — STATS BAR */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* Card 1 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 text-center">
              <p className="font-display text-xl md:text-2xl font-bold text-primary">300+</p>
              <p className="text-xs text-on-surface-variant mt-1">
                <T en="Cart Renters" ta="வாடகைதாரர்கள்" />
              </p>
              <p className="text-xs text-on-surface-variant/60">
                <T en="in 50 days" ta="50 நாட்களில்" />
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 text-center">
              <p className="font-display text-xl md:text-2xl font-bold text-primary">20+</p>
              <p className="text-xs text-on-surface-variant mt-1">
                <T en="Successful Rentals" ta="வெற்றிகரமான வாடகைகள்" />
              </p>
              <p className="text-xs text-on-surface-variant/60">
                <T en="around Coimbatore" ta="கோவை சுற்றுவட்டாரத்தில்" />
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 text-center">
              <p className="font-display text-xl md:text-2xl font-bold text-primary">₹0</p>
              <p className="text-xs text-on-surface-variant mt-1">
                <T en="Commission" ta="கமிஷன்" />
              </p>
              <p className="text-xs text-on-surface-variant/60">
                <T en="free to list" ta="இலவசப் பதிவு" />
              </p>
            </div>
          </div>

          {/* SECTION 3 — PRESENT BENEFITS */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <p className="text-sm font-semibold text-on-surface">
              <T en="Benefits of Listing on NTV" ta="நம்ம தள்ளுவண்டியில் பதிவிடுவதன் நன்மைகள்" />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Card 1 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">📍</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="300+ Renters Waiting" ta="300+ வாடகைதாரர்கள் தயார்" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Active renters from TN, Kerala & Andhra searching for your cart."
                    ta="தமிழகம், கேரளா மற்றும் ஆந்திராவிலிருந்து வண்டியைத் தேடும் வாடிக்கையாளர்கள்."
                  />
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">🆓</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="Free to List" ta="இலவசப் பதிவு" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Zero listing fee and zero commission. List today at no cost."
                    ta="பதிவுக் கட்டணம் மற்றும் கமிஷன் இல்லை. இன்றே இலவசமாகப் பதியுங்கள்."
                  />
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">✅</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="Verified Listing" ta="சரிபார்க்கப்பட்ட பதிவு" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Carts are verified by NTV before going live to build trust."
                    ta="வண்டிகள் நேரலையில் செல்வதற்கு முன் NTV-ஆல் சரிபார்க்கப்படும்."
                  />
                </p>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">📱</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="Enquiries on WhatsApp" ta="வாட்ஸ்அப்பில் விசாரணைகள்" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Inquiries and renter details sent directly to your WhatsApp."
                    ta="வாடிக்கையாளர் விவரங்கள் நேரடியாக உங்கள் வாட்ஸ்அப்பிற்கு வரும்."
                  />
                </p>
              </div>
            </div>
            {/* Card 5 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">💰</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="Easy Rent Collection" ta="சுலபமான வாடகை வசூல்" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Confirm advance rent before handover. No payment chasing."
                    ta="முன்பணம் மற்றும் வாடகை ஒப்படைப்பிற்கு முன்பே உறுதிசெய்யப்படும்."
                  />
                </p>
              </div>
            </div>
            {/* Card 6 */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex gap-3 items-start hover:border-primary/30 transition">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">📸</span>
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-0.5">
                  <T en="Professional Listing" ta="தொழில்முறைப் பட்டியல்" />
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <T
                    en="Listed like a premium e-commerce product with photos & specs."
                    ta="புகைப்படங்கள், விவரங்களுடன் ஒரு ஆன்லைன் தயாரிப்பைப் போல் பதியப்படும்."
                  />
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4 — COMING SOON */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <p className="text-sm font-semibold text-on-surface">
              <T en="Coming Soon" ta="வரவிருப்பவை" />
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden mb-6">
            {/* Item 1 */}
            <div className="flex items-start gap-3 p-3 border-b border-outline-variant/10 last:border-b-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
                <T en="Soon" ta="விரைவில்" />
              </span>
              <div>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  <T en="Deposit Escrow Protection" ta="முன்பண பாதுகாப்புப் பெட்டகம்" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T
                    en="Security deposit held by NTV for cart protection."
                    ta="பாதுகாப்பு முன்பணம் NTV-ஆல் பாதுகாக்கப்படும்."
                  />
                </p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-start gap-3 p-3 border-b border-outline-variant/10 last:border-b-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
                <T en="Soon" ta="விரைவில்" />
              </span>
              <div>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  <T en="Digital Rental Agreement" ta="டிஜிட்டல் வாடகை ஒப்பந்தம்" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T
                    en="Auto-generated legal rental contract per booking."
                    ta="தானாக உருவாக்கப்படும் சட்டப்பூர்வ வாடகை ஒப்பந்தம்."
                  />
                </p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-start gap-3 p-3 border-b border-outline-variant/10 last:border-b-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
                <T en="Soon" ta="விரைவில்" />
              </span>
              <div>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  <T en="Renter Rating System" ta="வாடகைதாரர் மதிப்பீட்டு முறை" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T
                    en="Flagged bad renters to keep you protected."
                    ta="பயனர்களின் மதிப்பீடுகள் உங்களை பாதுகாக்கும்."
                  />
                </p>
              </div>
            </div>
            {/* Item 4 */}
            <div className="flex items-start gap-3 p-3 border-b border-outline-variant/10 last:border-b-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
                <T en="Soon" ta="விரைவில்" />
              </span>
              <div>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  <T en="Pre/Post Photo Proof" ta="புகைப்பட சேதக் கட்டுப்பாடு" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T
                    en="Damage photo documentation for fair deposit deductions."
                    ta="புகைப்பட ஆதாரங்களுடன் சேதங்கள் கணக்கிடப்படும்."
                  />
                </p>
              </div>
            </div>
            {/* Item 5 */}
            <div className="flex items-start gap-3 p-3 border-b border-outline-variant/10 last:border-b-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
                <T en="Soon" ta="விரைவில்" />
              </span>
              <div>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  <T en="Earnings Dashboard" ta="வருவாய் கண்காணிப்பு" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T
                    en="Track your rental income and inquiries in one dashboard."
                    ta="வருவாய் மற்றும் விசாரணைகளை ஒரே இடத்தில் கண்காணிக்கலாம்."
                  />
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5 — TESTIMONIAL */}
          <div className="bg-primary/5 rounded-2xl p-4 border-l-4 border-primary mb-6">
            <p className="text-sm italic text-on-surface leading-relaxed mb-3">
              <T
                en="&quot;My cart was idle. I listed it on NTV — got an enquiry within a single week.&quot;"
                ta="&quot;என் வண்டி idle-ஆ இருந்துச்சு. NTV-ல list பண்ணினேன் — ஒரே வாரத்துல enquiry வந்துச்சு.&quot;"
              />
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                N
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">D. Nagaraj</p>
                <p className="text-xs text-on-surface-variant">
                  <T en="NTV001 · Ondipudur · 30+ years" ta="NTV001 · ஒண்டிப்புதூர் · 30+ ஆண்டுகள் அனுபவம்" />
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 6 — TRUST PILLS */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface rounded-full px-3 py-1.5 border border-outline-variant/20">
              📋 <T en="Udyam Registered" ta="உத்யம் பதிவு பெற்றது" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface rounded-full px-3 py-1.5 border border-outline-variant/20">
              🔍 <T en="Google #1 Ranked" ta="கூகுளில் #1 இடம்" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sign in card */}
        <div className="w-full md:w-[400px] md:sticky md:top-0 order-1 md:order-2 shrink-0 self-start pb-8">
          <p className="text-sm text-on-surface-variant text-center mb-3">
            <T en="Sign in to list your cart →" ta="உங்கள் cart list பண்ண sign in பண்ணுங்க →" />
          </p>
          <Suspense fallback={
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
