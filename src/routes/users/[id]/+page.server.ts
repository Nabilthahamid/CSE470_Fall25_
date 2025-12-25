// CONTROLLER: Server-side request handling for single user
import { userService } from '$lib/services/UserService';
import { handleError } from '$lib/utils/errors';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const user = await userService.getUserById(params.id);
		return {
			user
		};
	} catch (err) {
		const { message, statusCode } = handleError(err);
		throw error(statusCode, message);
	}
};

