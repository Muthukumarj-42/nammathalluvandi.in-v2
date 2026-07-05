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
  status: "pending" | "approved" | "rejected";
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
      try {
        // 1. Load or create profile
        let { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profError || !prof) {
          // New user — create profile + assign BUYER role
          const { data: newProf } = await supabase
            .from("profiles")
            .upsert({
              id: authUser.id,
              email: authUser.email ?? "",
              name:
                authUser.user_metadata?.full_name ??
                authUser.user_metadata?.name ??
                authUser.email?.split("@")[0] ??
                "User",
              avatar: authUser.user_metadata?.avatar_url ?? null,
              provider: authUser.app_metadata?.provider ?? "email",
              status: "active",
            })
            .select()
            .single();

          prof = newProf;

          // Assign BUYER role by default
          const { data: buyerRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "BUYER")
            .single();

          if (buyerRole) {
            await supabase
              .from("user_roles")
              .upsert({ user_id: authUser.id, role_id: buyerRole.id });
          }
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

        // 3. If vendor, load vendor profile
        if (roleNames.includes("VENDOR")) {
          const { data: vProf } = await supabase
            .from("vendor_profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();
          if (vProf) setVendorProfile(vProf as VendorProfile);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
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
  const isVendor = roles.includes("VENDOR");
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
