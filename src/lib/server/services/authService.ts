import { supabaseAdmin } from "$lib/server/db/supabase";
import { supabaseClient } from "$lib/server/db/supabase-client";
import type { UserProfile, UserRole } from "$lib/server/models/auth";
import { loginSchema, registerSchema } from "$lib/server/models/auth";

/**
 * Auth Service - Business Logic Layer
 * Handles all authentication and user-related operations
 */
export class AuthService {
  /**
   * Login a user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Object with success status, user, session, and error message if any
   */
  static async login(email: string, password: string) {
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Register a new user
   * @param email - User email
   * @param password - User password
   * @param confirmPassword - Password confirmation
   * @returns Object with success status, user, session, and error message if any
   */
  static async register(
    email: string,
    password: string,
    confirmPassword: string
  ) {
    // Validate input
    const validation = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Get user profile by user ID
   * @param userId - The user ID
   * @returns Profile if found, null otherwise
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user role by user ID
   * @param userId - The user ID
   * @returns User role ('user' or 'admin'), or null if not found
   */
  static async getUserRole(userId: string): Promise<UserRole | null> {
    const profile = await this.getUserProfile(userId);
    if (!profile || !profile.role) {
      return null;
    }
    return profile.role as UserRole;
  }

  /**
   * Sign out the current user
   */
  static async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

  /**
   * Get session from access token
   */
  static async getSessionFromToken(accessToken: string) {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return user;
  }
}
