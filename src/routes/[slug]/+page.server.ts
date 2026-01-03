// CONTROLLER: Dynamic static page route
import type { PageServerLoad } from './$types';
import { getPageBySlug } from '$lib/utils/content';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }: { params: { slug: string } }) => {
	try {
		const page = await getPageBySlug(params.slug);
		
		if (!page) {
			throw error(404, 'Page not found');
		}

		if (!page.is_published) {
			throw error(404, 'Page not found');
		}

		return {
			page
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw err;
		}
		throw error(500, 'Failed to load page');
	}
};

