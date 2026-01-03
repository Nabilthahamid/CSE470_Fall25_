// CONTROLLER: Server-side request handling for single user
import { UserModel } from '$lib/models/UserModel';
import { handleError } from '$lib/utils/errors';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const userModel = await UserModel.getById(params.id);
		if (!userModel) {
			throw error(404, 'User not found');
		}
		return {
			user: userModel.toJSON()
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		const { message, statusCode } = handleError(err);
		throw error(statusCode, message);
	}
};

