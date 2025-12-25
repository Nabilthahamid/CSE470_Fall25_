// SERVICE: Custom authentication business logic
import { supabase } from '$lib/config/supabase';
import { hashPassword, comparePassword } from '$lib/utils/password';
import { createSessionToken, verifySessionToken } from '$lib/utils/session';
import type { LoginDTO, RegisterDTO, AuthUser, AuthSession } from '$lib/models/User';
import { AppError } from '$lib/utils/errors';

export class AuthService {
	/**
	 * Register a new user
	 */
	async register(data: RegisterDTO): Promise<AuthSession> {
		// Validate email format
		if (!this.isValidEmail(data.email)) {
			throw new AppError('Invalid email format', 400);
		}

		// Validate password strength
		if (!this.isValidPassword(data.password)) {
			throw new AppError('Password must be at least 6 characters', 400);
		}

		// Validate name
		if (!data.name || data.name.trim().length < 2) {
			throw new AppError('Name must be at least 2 characters', 400);
		}

		// Normalize email (trim and lowercase)
		const normalizedEmail = data.email.trim().toLowerCase();

		// Check if user already exists
		const { data: existingUser, error: checkError } = await supabase
			.from('users')
			.select('id')
			.eq('email', normalizedEmail)
			.maybeSingle();

		if (checkError) {
			throw new AppError(`Database error: ${checkError.message}`, 500);
		}

		if (existingUser) {
			throw new AppError('User with this email already exists', 400);
		}

		// Hash password
		const passwordHash = await hashPassword(data.password);

		// Create user in database (store normalized email)
		const { data: newUser, error } = await supabase
			.from('users')
			.insert({
				email: normalizedEmail,
				name: data.name.trim(),
				password_hash: passwordHash
			})
			.select()
			.single();

		if (error) {
			throw new AppError(`Failed to create user: ${error.message}`, 500);
		}

		// Create session token
		const authUser: AuthUser = {
			id: newUser.id,
			email: newUser.email,
			role: newUser.role || 'user',
			user_metadata: {
				name: newUser.name
			}
		};

		const token = await createSessionToken(authUser);

		return {
			access_token: token,
			refresh_token: token, // For simplicity, using same token
			expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
			user: authUser
		};
	}

	/**
	 * Login user - matches password from database
	 */
	async login(data: LoginDTO): Promise<AuthSession> {
		if (!this.isValidEmail(data.email)) {
			throw new AppError('Invalid email format', 400);
		}

		if (!data.password || data.password.length < 1) {
			throw new AppError('Password is required', 400);
		}

		// Normalize email (trim and lowercase)
		const normalizedEmail = data.email.trim().toLowerCase();

		// Get user from database (use maybeSingle to handle not found gracefully)
		const { data: user, error } = await supabase
			.from('users')
			.select('id, email, name, password_hash, role')
			.eq('email', normalizedEmail)
			.maybeSingle();

		if (error) {
			throw new AppError(`Database error: ${error.message}`, 500);
		}

		if (!user) {
			throw new AppError('Invalid email or password', 401);
		}

		// Match password
		const isPasswordValid = await comparePassword(data.password, user.password_hash);

		if (!isPasswordValid) {
			throw new AppError('Invalid email or password', 401);
		}

		// Create session token
		const authUser: AuthUser = {
			id: user.id,
			email: user.email,
			role: user.role || 'user',
			user_metadata: {
				name: user.name
			}
		};

		const token = await createSessionToken(authUser);

		return {
			access_token: token,
			refresh_token: token,
			expires_in: 7 * 24 * 60 * 60, // 7 days
			user: authUser
		};
	}

	/**
	 * Logout user (just clears session on client side)
	 */
	async logout(): Promise<void> {
		// Session is managed via cookies, so logout is handled by clearing cookies
		return Promise.resolve();
	}

	/**
	 * Get current user from token
	 */
	async getCurrentUser(token: string | null): Promise<AuthUser | null> {
		if (!token) {
			return null;
		}

		const decoded = await verifySessionToken(token);

		if (!decoded) {
			return null;
		}

		// Verify user still exists in database
		const { data: user } = await supabase
			.from('users')
			.select('id, email, name, role')
			.eq('id', decoded.userId)
			.single();

		if (!user) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role || 'user',
			user_metadata: {
				name: user.name
			}
		};
	}

	/**
	 * Validate email format
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Validate password strength
	 */
	private isValidPassword(password: string): boolean {
		return password.length >= 6;
	}
}

// Export singleton instance
export const authService = new AuthService();
