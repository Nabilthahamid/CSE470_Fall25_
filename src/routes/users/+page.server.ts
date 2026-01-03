// CONTROLLER: Server-side request handling and data loading
import { UserModel } from '$lib/models/UserModel';
import { handleError } from '$lib/utils/errors';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const usersModels = await UserModel.getAll();
		const users = usersModels.map(u => u.toJSON());
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

