import { z } from 'zod';
import type { Database } from '$lib/types';

/**
 * Model - Authentication Types and Schemas
 */

/**
 * UserProfile interface matching the database table
 */
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * User role type
 */
export type UserRole = 'user' | 'admin';

/**
 * Zod schema for login form validation
 */
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Zod schema for registration form validation
 */
export const registerSchema = z
	.object({
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export type RegisterInput = z.infer<typeof registerSchema>;

