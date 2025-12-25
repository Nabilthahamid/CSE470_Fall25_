import type { AuthUser } from '$lib/models/User';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: AuthUser | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};

