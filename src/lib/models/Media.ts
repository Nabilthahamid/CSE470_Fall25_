// MODEL: Media Library data structures
export interface MediaFile {
	id?: string;
	filename: string;
	original_filename: string;
	file_url: string;
	file_type: 'image' | 'video' | 'document' | 'other';
	file_size: number;
	mime_type: string;
	width?: number;
	height?: number;
	alt_text?: string;
	description?: string;
	folder?: string;
	usage_count: number;
	created_at?: string;
	updated_at?: string;
}

export interface MediaUsage {
	media_id: string;
	entity_type: 'product' | 'banner' | 'page' | 'other';
	entity_id: string;
	entity_name?: string;
}

export interface CreateMediaDTO {
	filename: string;
	original_filename: string;
	file_url: string;
	file_type: 'image' | 'video' | 'document' | 'other';
	file_size: number;
	mime_type: string;
	width?: number;
	height?: number;
	alt_text?: string;
	description?: string;
	folder?: string;
}

export interface UpdateMediaDTO {
	filename?: string;
	alt_text?: string;
	description?: string;
	folder?: string;
}

