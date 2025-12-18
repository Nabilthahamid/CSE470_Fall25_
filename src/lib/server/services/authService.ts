import { supabaseAdmin } from "$lib/db/server";
import {
  getProfileById,
  getProfileByEmail,
  createProfile,
  updateProfile,
} from "../models/users";
import type { Profile } from "../models/users";

/**
 * Get or create user profile from Supabase auth user
 * @param userId - User UUID from auth.users
 * @param email - User email
 * @returns Profile
 */
export async function getOrCreateProfile(
  userId: string,
  email: string
): Promise<Profile> {
  let profile = await getProfileById(userId);

  if (!profile) {
    // Create new profile (id matches auth.users.id)
    profile = await createProfile({
      id: userId,
      email,
      fullName: null,
      avatarUrl: null,
    });
  }

  return profile;
}

/**
 * Get current user from session
 * @param session - Supabase session
 * @returns User profile or null
 */
export async function getCurrentUser(session: any): Promise<Profile | null> {
  if (!session?.user) return null;

  const userId = session.user.id;
  const email = session.user.email;

  if (!userId || !email) return null;

  return await getOrCreateProfile(userId, email);
}

/**
 * Verify user authentication
 * @param session - Supabase session
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 * @param session - Supabase session
 * @returns User profile
 * @throws Error if not authenticated
 */
export async function requireAuth(session: any): Promise<Profile> {
  if (!isAuthenticated(session)) {
    throw new Error("Authentication required");
  }

  const user = await getCurrentUser(session);
  if (!user) {
    throw new Error("User profile not found");
  }

  return user;
}
