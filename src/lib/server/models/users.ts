import { db, supabaseAdmin } from "$lib/db/server";
import { profiles } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

/**
 * Get user profile by ID
 * @param id - User UUID (from auth.users)
 * @returns Profile or null if not found
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  // Try Drizzle ORM first
  if (db) {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.warn(
        "Drizzle getProfileById failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        console.error("Supabase getProfileById failed:", error);
        return null;
      }

      return data as Profile | null;
    } catch (error) {
      console.error("Error getting profile by ID:", error);
      return null;
    }
  }

  console.warn(
    "Database connection not available - getProfileById returning null"
  );
  return null;
}

/**
 * Get user profile by email
 * @param email - User email
 * @returns Profile or null if not found
 */
export async function getProfileByEmail(
  email: string
): Promise<Profile | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new user profile
 * @param data - Profile data
 * @returns Created profile
 */
export async function createProfile(data: NewProfile): Promise<Profile> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db.insert(profiles).values(data).returning();
  return result[0];
}

/**
 * Update user profile
 * @param id - User UUID
 * @param data - Partial profile data to update
 * @returns Updated profile or null if not found
 */
export async function updateProfile(
  id: string,
  data: Partial<Omit<Profile, "id" | "createdAt">>
): Promise<Profile | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Get all user profiles (Admin only)
 * @returns Array of all profiles
 */
export async function getAllProfiles(): Promise<Profile[]> {
  // Try Drizzle ORM first
  if (db) {
    try {
      return await db.select().from(profiles);
    } catch (error) {
      console.warn(
        "Drizzle getAllProfiles failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").select("*");

      if (error) {
        console.error("Supabase getAllProfiles failed:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting all profiles:", error);
      return [];
    }
  }

  console.warn(
    "Database connection not available - returning empty profiles array"
  );
  return [];
}

/**
 * Check if a user is an admin.
 * @param userId - The ID of the user to check.
 * @returns True if the user is an admin, false otherwise.
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  // Try Drizzle ORM first
  if (db) {
    try {
      const profile = await getProfileById(userId);
      return profile?.role === "admin";
    } catch (error) {
      console.warn(
        "Drizzle admin check failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Supabase admin check failed:", error);
        return false;
      }

      return profile?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  return false;
}

/**
 * Update user role (Admin only)
 * @param id - User UUID
 * @param role - New role ('user' or 'admin')
 * @returns Updated profile or null if not found
 */
export async function updateUserRole(
  id: string,
  role: "user" | "admin"
): Promise<Profile | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .update(profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return result[0] || null;
}
