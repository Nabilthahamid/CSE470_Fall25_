// CONTROLLER: Authentication controller
import { redirect } from '@sveltejs/kit';
import { BaseController } from '../BaseController';
import { UserModel } from '$lib/models/UserModel';

export class AuthController extends BaseController {
	/**
	 * Load login page (redirect if already logged in)
	 */
	loadLoginPage() {
		// Redirect if already logged in
		if (this.getUser()) {
			const redirectPath = this.getUser()!.role === 'admin' ? '/admin' : '/';
			throw redirect(302, redirectPath);
		}
		return {};
	}

	/**
	 * Handle login action
	 */
	async login() {
		const formData = await this.getFormData();
		const email = (formData.get('email')?.toString() || '').trim();
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return {
				error: 'Email and password are required',
				email
			};
		}

		try {
			const session = await UserModel.login({ email, password });
			
			// Set session cookie
			this.event.cookies.set('session_token', session.access_token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect based on user role
			const redirectPath = session.user.role === 'admin' ? '/admin' : '/';
			throw redirect(302, redirectPath);
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error && typeof error === 'object' && 'status' in error && (error as any).status === 302) {
				throw error;
			}

			const { message } = this.handleError(error);
			return {
				error: message,
				email
			};
		}
	}

	/**
	 * Handle logout action
	 */
	async logout() {
		// Delete session cookie
		this.event.cookies.delete('session_token', { path: '/' });
		throw redirect(302, '/auth/login');
	}

	/**
	 * Handle registration
	 */
	async register() {
		const formData = await this.getFormData();
		const name = formData.get('name')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!name || !email || !password) {
			return {
				error: 'Name, email, and password are required',
				name,
				email
			};
		}

		try {
			const session = await UserModel.register({ name, email, password });
			
			// Set session cookie
			this.event.cookies.set('session_token', session.access_token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect based on user role
			const redirectPath = session.user.role === 'admin' ? '/admin' : '/';
			throw redirect(302, redirectPath);
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error && typeof error === 'object' && 'status' in error && (error as any).status === 302) {
				throw error;
			}

			const { message } = this.handleError(error);
			return {
				error: message,
				name,
				email
			};
		}
	}
}

