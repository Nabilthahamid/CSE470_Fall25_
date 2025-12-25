// CONTROLLER: Server-side request handling and data loading
import { userService } from '$lib/services/UserService';
import { handleError } from '$lib/utils/errors';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const users = await userService.getAllUsers();
		return {
			users,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			users: [],
			error: message
		};
	}
};

