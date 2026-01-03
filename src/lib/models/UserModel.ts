// MODEL: User Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type { User, CreateUserDTO, UpdateUserDTO, LoginDTO, RegisterDTO, AuthUser, AuthSession } from './User';
import { hashPassword, comparePassword } from '$lib/utils/password';
import { createSessionToken } from '$lib/utils/session';

export class UserModel {
	// Data properties
	id: string;
	email: string;
	name: string;
	password_hash: string;
	role: 'user' | 'admin';
	customer_name?: string;
	customer_address?: string;
	customer_phone?: string;
	customer_city?: string;
	customer_postal_code?: string;
	customer_country?: string;
	created_at?: string;
	updated_at?: string;

	constructor(data: User) {
		this.id = data.id;
		this.email = data.email;
		this.name = data.name;
		this.password_hash = data.password_hash;
		this.role = data.role;
		this.customer_name = data.customer_name;
		this.customer_address = data.customer_address;
		this.customer_phone = data.customer_phone;
		this.customer_city = data.customer_city;
		this.customer_postal_code = data.customer_postal_code;
		this.customer_country = data.customer_country;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.isValidEmail(this.email)) {
			throw new Error('Invalid email format');
		}

		if (!this.name || this.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}
	}

	validateUpdate(input: UpdateUserDTO): void {
		if (input.email && !this.isValidEmail(input.email)) {
			throw new Error('Invalid email format');
		}

		if (input.name && input.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}
	}

	// BUSINESS LOGIC: Email validation
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// DATA ACCESS: Get all users (static method)
	static async getAll(): Promise<UserModel[]> {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch users: ${error.message}`);
		return (data || []).map(item => new UserModel(item as User));
	}

	// DATA ACCESS: Get user by ID (static method)
	static async getById(id: string): Promise<UserModel | null> {
		if (!id) throw new Error('User ID is required');

		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw new Error(`Failed to fetch user: ${error.message}`);
		}

		return data ? new UserModel(data as User) : null;
	}

	// DATA ACCESS: Create user (static method)
	static async create(input: CreateUserDTO): Promise<UserModel> {
		// BUSINESS LOGIC: Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			throw new Error('Invalid email format');
		}

		// BUSINESS LOGIC: Validate name
		if (!input.name || input.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}

		// DATA ACCESS: Insert into database
		const { data, error } = await supabase
			.from('users')
			.insert(input)
			.select()
			.single();

		if (error) throw new Error(`Failed to create user: ${error.message}`);
		
		return new UserModel(data as User);
	}

	// DATA ACCESS: Update user (instance method)
	async update(input: UpdateUserDTO): Promise<UserModel> {
		// BUSINESS LOGIC: Validate update
		this.validateUpdate(input);

		// DATA ACCESS: Update in database
		const { data, error } = await supabase
			.from('users')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', this.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update user: ${error.message}`);

		return new UserModel(data as User);
	}

	// DATA ACCESS: Delete user (instance method)
	async delete(): Promise<void> {
		const { error } = await supabase
			.from('users')
			.delete()
			.eq('id', this.id);

		if (error) throw new Error(`Failed to delete user: ${error.message}`);
	}

	// DATA ACCESS: Get user by email (static method)
	static async getByEmail(email: string): Promise<UserModel | null> {
		if (!email) throw new Error('Email is required');

		// Normalize email (trim and lowercase)
		const normalizedEmail = email.trim().toLowerCase();

		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', normalizedEmail)
			.maybeSingle();

		if (error) {
			throw new Error(`Failed to fetch user: ${error.message}`);
		}

		return data ? new UserModel(data as User) : null;
	}

	// BUSINESS LOGIC: Register new user (static method)
	static async register(data: RegisterDTO): Promise<AuthSession> {
		// BUSINESS LOGIC: Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.email)) {
			throw new Error('Invalid email format');
		}

		// BUSINESS LOGIC: Validate password strength
		if (!data.password || data.password.length < 6) {
			throw new Error('Password must be at least 6 characters');
		}

		// BUSINESS LOGIC: Validate name
		if (!data.name || data.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}

		// Normalize email (trim and lowercase)
		const normalizedEmail = data.email.trim().toLowerCase();

		// BUSINESS LOGIC: Check if user already exists
		const existingUser = await this.getByEmail(normalizedEmail);
		if (existingUser) {
			throw new Error('User with this email already exists');
		}

		// BUSINESS LOGIC: Hash password
		const passwordHash = await hashPassword(data.password);

		// DATA ACCESS: Create user in database
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
			throw new Error(`Failed to create user: ${error.message}`);
		}

		// BUSINESS LOGIC: Create session token
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

	// BUSINESS LOGIC: Login user (static method)
	static async login(data: LoginDTO): Promise<AuthSession> {
		// BUSINESS LOGIC: Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.email)) {
			throw new Error('Invalid email format');
		}

		if (!data.password || data.password.length < 1) {
			throw new Error('Password is required');
		}

		// Normalize email (trim and lowercase)
		const normalizedEmail = data.email.trim().toLowerCase();

		// DATA ACCESS: Get user from database
		const { data: user, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', normalizedEmail)
			.maybeSingle();

		if (error) {
			throw new Error(`Database error: ${error.message}`);
		}

		if (!user) {
			throw new Error('Invalid email or password');
		}

		// BUSINESS LOGIC: Verify password
		const isValidPassword = await comparePassword(data.password, user.password_hash);
		if (!isValidPassword) {
			throw new Error('Invalid email or password');
		}

		// BUSINESS LOGIC: Create session token
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
			refresh_token: token, // For simplicity, using same token
			expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
			user: authUser
		};
	}

	// Convert to plain object (for compatibility)
	toJSON(): User {
		return {
			id: this.id,
			email: this.email,
			name: this.name,
			password_hash: this.password_hash,
			role: this.role,
			customer_name: this.customer_name,
			customer_address: this.customer_address,
			customer_phone: this.customer_phone,
			customer_city: this.customer_city,
			customer_postal_code: this.customer_postal_code,
			customer_country: this.customer_country,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}
}

