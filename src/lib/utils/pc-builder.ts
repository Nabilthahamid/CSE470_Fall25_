// UTILITY: PC Builder helper functions
import { supabase } from '$lib/config/supabase';
import type { ComponentCategory } from '$lib/models/PCBuild';

/**
 * Get all component categories
 */
export async function getAllCategories(): Promise<ComponentCategory[]> {
	try {
		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.order('display_order', { ascending: true });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch component categories: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<ComponentCategory | null> {
	try {
		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch component category: ${error.message}`);
		}
		return data;
	} catch (error) {
		return null;
	}
}

