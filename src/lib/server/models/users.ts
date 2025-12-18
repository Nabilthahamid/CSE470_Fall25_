import { db } from "$lib/db/server";
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
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return result[0] || null;
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
