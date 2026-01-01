import { s as supabase } from "./supabase.js";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { A as AppError } from "./errors.js";
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
const SUPABASE_JWT_SECRET = "qtH+9Iy2mlXxyUzdypMzdL1pkMleLMjaxx0yPARe53Aq9NZeG+1UzYKGtRUmEP2zJmEcmA2Q1aOn+1WzaqO3cA==";
const JWT_SECRET = SUPABASE_JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);
async function createSessionToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || "user",
    name: user.user_metadata?.name
  };
  const token = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  return token;
}
async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
class AuthService {
  /**
   * Register a new user
   */
  async register(data) {
    if (!this.isValidEmail(data.email)) {
      throw new AppError("Invalid email format", 400);
    }
    if (!this.isValidPassword(data.password)) {
      throw new AppError("Password must be at least 6 characters", 400);
    }
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters", 400);
    }
    const normalizedEmail = data.email.trim().toLowerCase();
    const { data: existingUser, error: checkError } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (checkError) {
      throw new AppError(`Database error: ${checkError.message}`, 500);
    }
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }
    const passwordHash = await hashPassword(data.password);
    const { data: newUser, error } = await supabase.from("users").insert({
      email: normalizedEmail,
      name: data.name.trim(),
      password_hash: passwordHash
    }).select().single();
    if (error) {
      throw new AppError(`Failed to create user: ${error.message}`, 500);
    }
    const authUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role || "user",
      user_metadata: {
        name: newUser.name
      }
    };
    const token = await createSessionToken(authUser);
    return {
      access_token: token,
      refresh_token: token,
      // For simplicity, using same token
      expires_in: 7 * 24 * 60 * 60,
      // 7 days in seconds
      user: authUser
    };
  }
  /**
   * Login user - matches password from database
   */
  async login(data) {
    if (!this.isValidEmail(data.email)) {
      throw new AppError("Invalid email format", 400);
    }
    if (!data.password || data.password.length < 1) {
      throw new AppError("Password is required", 400);
    }
    const normalizedEmail = data.email.trim().toLowerCase();
    const { data: user, error } = await supabase.from("users").select("id, email, name, password_hash, role").eq("email", normalizedEmail).maybeSingle();
    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    const isPasswordValid = await comparePassword(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }
    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role || "user",
      user_metadata: {
        name: user.name
      }
    };
    const token = await createSessionToken(authUser);
    return {
      access_token: token,
      refresh_token: token,
      expires_in: 7 * 24 * 60 * 60,
      // 7 days
      user: authUser
    };
  }
  /**
   * Logout user (just clears session on client side)
   */
  async logout() {
    return Promise.resolve();
  }
  /**
   * Get current user from token
   */
  async getCurrentUser(token) {
    if (!token) {
      return null;
    }
    const decoded = await verifySessionToken(token);
    if (!decoded) {
      return null;
    }
    const { data: user, error } = await supabase.from("users").select("id, email, name, role").eq("id", decoded.userId).maybeSingle();
    if (error || !user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role || "user",
      user_metadata: {
        name: user.name
      }
    };
  }
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  /**
   * Validate password strength
   */
  isValidPassword(password) {
    return password.length >= 6;
  }
}
const authService = new AuthService();
export {
  authService as a
};
