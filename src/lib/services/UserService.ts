// SERVICE: Business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type { User, CreateUserDTO, UpdateUserDTO, UserRepository } from '$lib/models/User';

class UserRepositoryImpl implements UserRepository {
	async getAll(): Promise<User[]> {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch users: ${error.message}`);
		return data || [];
	}

	async getById(id: string): Promise<User | null> {
		const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw new Error(`Failed to fetch user: ${error.message}`);
		}
		return data;
	}

	async create(input: CreateUserDTO): Promise<User> {
		const { data, error } = await supabase.from('users').insert(input).select().single();

		if (error) throw new Error(`Failed to create user: ${error.message}`);
		return data;
	}

	async update(id: string, input: UpdateUserDTO): Promise<User> {
		const { data, error } = await supabase
			.from('users')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update user: ${error.message}`);
		return data;
	}

	async delete(id: string): Promise<void> {
		const { error } = await supabase.from('users').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete user: ${error.message}`);
	}
}

// SERVICE: Business logic layer
export class UserService {
	private repository: UserRepository;

	constructor(repository?: UserRepository) {
		this.repository = repository || new UserRepositoryImpl();
	}

	/**
	 * Get all users with business logic
	 */
	async getAllUsers(): Promise<User[]> {
		return await this.repository.getAll();
	}

	/**
	 * Get user by ID with validation
	 */
	async getUserById(id: string): Promise<User> {
		if (!id) throw new Error('User ID is required');

		const user = await this.repository.getById(id);
		if (!user) throw new Error('User not found');

		return user;
	}

	/**
	 * Create user with validation
	 */
	async createUser(input: CreateUserDTO): Promise<User> {
		// Business logic: Validate email format
		if (!this.isValidEmail(input.email)) {
			throw new Error('Invalid email format');
		}

		// Business logic: Validate name
		if (!input.name || input.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}

		return await this.repository.create(input);
	}

	/**
	 * Update user with validation
	 */
	async updateUser(id: string, input: UpdateUserDTO): Promise<User> {
		if (!id) throw new Error('User ID is required');

		if (input.email && !this.isValidEmail(input.email)) {
			throw new Error('Invalid email format');
		}

		if (input.name && input.name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters');
		}

		return await this.repository.update(id, input);
	}

	/**
	 * Delete user
	 */
	async deleteUser(id: string): Promise<void> {
		if (!id) throw new Error('User ID is required');
		await this.repository.delete(id);
	}

	/**
	 * Business logic: Email validation
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

// Export singleton instance
export const userService = new UserService();

