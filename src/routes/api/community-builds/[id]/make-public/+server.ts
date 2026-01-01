// API: Make a build public (admin or owner only)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdmin } from '$lib/config/supabase';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ locals, params }) => {
	try {
		requireAuth(locals.user);

		const buildId = params.id;
		if (!buildId) {
			return json({ error: 'Build ID is required' }, { status: 400 });
		}

		// Use admin client to bypass RLS
		const supabaseAdmin = getSupabaseAdmin();

		// First check if build exists and user owns it or is admin
		const { data: build, error: fetchError } = await supabaseAdmin
			.from('pc_builds')
			.select('user_id')
			.eq('id', buildId)
			.single();

		if (fetchError || !build) {
			return json({ error: 'Build not found' }, { status: 404 });
		}

		// Check if user owns the build or is admin
		if (build.user_id !== locals.user.id && locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Update build to be public
		const { data: updatedBuild, error: updateError } = await supabaseAdmin
			.from('pc_builds')
			.update({ is_public: true })
			.eq('id', buildId)
			.select()
			.single();

		if (updateError) {
			console.error('Error making build public:', updateError);
			return json({ error: updateError.message }, { status: 500 });
		}

		return json({ 
			build: updatedBuild, 
			message: 'Build is now public and will appear on the community page!' 
		});
	} catch (error: any) {
		console.error('Make build public error:', error);
		return json({ error: error.message || 'Failed to make build public' }, { status: 500 });
	}
};

