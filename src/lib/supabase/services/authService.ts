import { getSupabaseClient } from "../client";
import { User, Session } from "@supabase/supabase-js";

/**
 * Strict Authorized Admin User ID
 */
export const AUTHORIZED_ADMIN_USER_ID = "d09ac93f-2418-4505-865c-c3d1e3d239fa";

export type AdminRole = "super_admin" | "admin" | "editor" | "viewer";

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
  createdAt: string;
}

/**
 * Helper to check if a user ID is the authorized admin
 */
export function isAuthorizedAdminUser(userId?: string | null): boolean {
  return Boolean(userId && userId === AUTHORIZED_ADMIN_USER_ID);
}

/**
 * Sign in using Supabase Auth (Enforcing Authorized Admin User ID)
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { user: null, session: null, error: "Supabase client not initialized" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user || !isAuthorizedAdminUser(data.user.id)) {
      // Reject any non-authorized user ID immediately
      await supabase.auth.signOut();
      return {
        user: null,
        session: null,
        error: "Access Denied: Only the authorized administrator account is permitted to access the Aistronaut Admin Studio.",
      };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || "Failed to sign in" };
  }
}

/**
 * Sign out current admin user
 */
export async function signOutAdmin(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[Supabase Auth] Sign out error:", err);
  }
}

/**
 * Get current session and profile, verifying authorized admin user ID
 */
export async function getCurrentAdminSession(): Promise<{
  user: User | null;
  profile: AdminProfile | null;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, profile: null };

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return { user: null, profile: null };
    }

    // Verify authorized user ID
    if (!isAuthorizedAdminUser(session.user.id)) {
      await supabase.auth.signOut();
      return { user: null, profile: null };
    }

    const { data: profileRow } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const profile: AdminProfile = {
      id: session.user.id,
      email: session.user.email || "",
      role: (profileRow?.role as AdminRole) || "super_admin",
      displayName:
        profileRow?.display_name ||
        session.user.user_metadata?.full_name ||
        "Fenas",
      createdAt: profileRow?.created_at || new Date().toISOString(),
    };

    return { user: session.user, profile };
  } catch (err) {
    console.warn("[Supabase Auth] Session fetch error:", err);
    return { user: null, profile: null };
  }
}
