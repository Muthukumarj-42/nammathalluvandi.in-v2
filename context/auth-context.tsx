"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";
import { isDbConfigured } from "@/lib/supabase";

export const USE_TEMPORARY_PHONE_LOGIN = false;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "BUYER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: string;
  status: "active" | "suspended";
  created_at: string;
}

export interface VendorProfile {
  id: string;
  shop_name: string | null;
  business_category: string | null;
  phone?: string | null;
  // New intake fields (redesigned /vendor/register form)
  full_name?: string | null;
  whatsapp_number?: string | null;
  profile_photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area?: string | null;
  district?: string | null;
  cart_count?: string | null;
  status: "pending" | "approved" | "pending_review" | "rejected";
  unique_code?: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  vendorProfile: VendorProfile | null;
  roles: UserRole[];
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isBuyer: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  vendorProfile: null,
  roles: [],
  loading: true,
  hasRole: () => false,
  isAdmin: false,
  isVendor: false,
  isBuyer: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Create client lazily to avoid SSR crashes when env vars are not set
  const supabase = useMemo(() => createClient(), []);

  // ── Load profile + roles for a given user ──────────────────────────────────
  const loadUserData = useCallback(
    async (authUser: User) => {
      setLoading(true);
      try {
        // 1. Load or create profile
        let { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profError || !prof) {
          // Wait 500ms for the database trigger to complete creating the profile
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retriedProf, error: retryError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (retryError || !retriedProf) {
            console.error("Profile trigger did not complete. Error:", retryError);
            throw new Error(retryError?.message || "Profile not created");
          }
          prof = retriedProf;
        }

        if (prof) setProfile(prof as UserProfile);

        // 2. Load roles
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("roles(name)")
          .eq("user_id", authUser.id);

        let roleNames: UserRole[] = [];
        if (userRoles) {
          roleNames = userRoles
            .map((r: any) => r.roles?.name)
            .filter(Boolean) as UserRole[];
        }

        // FOR TESTING: Force +91 88382 92849 to have ADMIN role
        // REMOVE_BEFORE_GMAIL_ADOPTION
        const phone = authUser.phone || authUser.user_metadata?.phone;
        if (phone === "+918838292849" || phone === "+91 88382 92849" || phone === "8838292849") {
          if (!roleNames.includes("ADMIN")) {
            roleNames.push("ADMIN");
          }
        }

        setRoles(roleNames);

        // 3. Load vendor profile directly to be robust
        const { data: vProf } = await supabase
          .from("vendor_profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();
        if (vProf) {
          setVendorProfile(vProf as VendorProfile);
        } else {
          setVendorProfile(null);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // ── Refresh (callable from components) ────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user);
  }, [user, loadUserData]);

  // ── Initial session + auth state listener ─────────────────────────────────
  useEffect(() => {
    if (USE_TEMPORARY_PHONE_LOGIN) {
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
      };
      const forcedPhone = getCookie("forced_user_phone");
      if (forcedPhone === "8838292849" || forcedPhone === "+918838292849" || forcedPhone === "918838292849") {
        const mockUser = {
          id: "a1111111-1111-1111-1111-111111111111",
          email: "muthuadmin@nammathalluvandi.in",
          phone: forcedPhone,
          aud: "authenticated",
          role: "authenticated",
          app_metadata: { provider: "email" },
          user_metadata: { phone: forcedPhone, full_name: "Muthu Admin" },
          created_at: new Date().toISOString(),
        } as any;

        const mockProfile: UserProfile = {
          id: "a1111111-1111-1111-1111-111111111111",
          email: "muthuadmin@nammathalluvandi.in",
          name: "Muthu Admin",
          avatar: null,
          provider: "email",
          status: "active",
          created_at: new Date().toISOString(),
        };

        const mockVendorProfile = {
          id: "a1111111-1111-1111-1111-111111111111",
          shop_name: "Muthu Carts",
          business_category: "fast_food",
          status: "approved",
        };

        setUser(mockUser);
        setProfile(mockProfile);
        setVendorProfile(mockVendorProfile as VendorProfile);
        setRoles(["ADMIN", "VENDOR"]);
        setLoading(false);
        return;
      }
    }

    if (!isDbConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadUserData(s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadUserData(s.user);
      } else {
        setProfile(null);
        setVendorProfile(null);
        setRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (USE_TEMPORARY_PHONE_LOGIN) {
      document.cookie = "forced_user_phone=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setVendorProfile(null);
    setRoles([]);
  }, [supabase]);

  // ── Derived booleans ───────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role: UserRole) => roles.includes(role),
    [roles]
  );
  // FOR TESTING: Force phone number to be ADMIN.
  // REMOVE_BEFORE_GMAIL_ADOPTION
  const userPhone = user?.phone || user?.user_metadata?.phone;
  const isForcedAdmin = userPhone === "+918838292849" || userPhone === "+91 88382 92849" || userPhone === "8838292849";
  const isAdmin = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN") || isForcedAdmin;
  const isVendor = roles.includes("VENDOR") || vendorProfile !== null;
  const isBuyer = roles.includes("BUYER");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        vendorProfile,
        roles,
        loading,
        hasRole,
        isAdmin,
        isVendor,
        isBuyer,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
