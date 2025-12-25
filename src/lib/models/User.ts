// MODEL: User data structure and types
export interface User {
	id: string;
	email: string;
	name: string;
	password_hash: string;
	role: 'user' | 'admin';
	created_at?: string;
	updated_at?: string;
}

export interface CreateUserDTO {
	email: string;
	name: string;
}

export interface UpdateUserDTO {
	email?: string;
	name?: string;
}

export interface UserRepository {
	getAll(): Promise<User[]>;
	getById(id: string): Promise<User | null>;
	create(data: CreateUserDTO): Promise<User>;
	update(id: string, data: UpdateUserDTO): Promise<User>;
	delete(id: string): Promise<void>;
}

// MODEL: Authentication types
export interface AuthUser {
	id: string;
	email: string;
	role?: 'user' | 'admin';
	user_metadata?: {
		name?: string;
		[key: string]: any;
	};
}

export interface LoginDTO {
	email: string;
	password: string;
}

export interface RegisterDTO {
	email: string;
	password: string;
	name: string;
}

export interface AuthSession {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	user: AuthUser;
}

