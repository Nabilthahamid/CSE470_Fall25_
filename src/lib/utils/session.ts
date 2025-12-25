// UTILS: Session management
import { SignJWT, jwtVerify } from 'jose';
import { SUPABASE_JWT_SECRET } from '$env/static/private';
import type { AuthUser } from '$lib/models/User';

const JWT_SECRET = SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface SessionToken {
	userId: string;
	email: string;
	role?: 'user' | 'admin';
	name?: string;
	iat?: number;
	exp?: number;
}

/**
 * Create a session token
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
	const payload: SessionToken = {
		userId: user.id,
		email: user.email,
		role: user.role || 'user',
		name: user.user_metadata?.name
	};

	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secret);

	return token;
}

/**
 * Verify a session token
 */
export async function verifySessionToken(token: string): Promise<SessionToken | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload as SessionToken;
	} catch (error) {
		return null;
	}
}

