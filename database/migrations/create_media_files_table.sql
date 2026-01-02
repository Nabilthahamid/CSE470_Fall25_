-- Migration: Create media_files and media_usage tables
-- Description: Creates tables for managing media library files and tracking their usage

-- Create media_files table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'other')),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    description TEXT,
    folder VARCHAR(255),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_folder ON media_files(folder);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_usage_count ON media_files(usage_count);

-- Create media_usage table to track which entities use which media files
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('product', 'banner', 'page', 'other')),
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(media_id, entity_type, entity_id)
);

-- Create indexes for media_usage
CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_entity ON media_usage(entity_type, entity_id);

-- Enable Row Level Security (RLS)
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_files
-- Allow all users to view media files (public read access)
DROP POLICY IF EXISTS "Public can view media files" ON media_files;
CREATE POLICY "Public can view media files" ON media_files
    FOR SELECT
    USING (true);

-- Note: Insert/Update/Delete operations use admin client which bypasses RLS
-- So we don't need policies for those operations

-- RLS Policies for media_usage
-- Allow all users to view media usage (public read access)
DROP POLICY IF EXISTS "Public can view media usage" ON media_usage;
CREATE POLICY "Public can view media usage" ON media_usage
    FOR SELECT
    USING (true);

-- Note: Insert/Delete operations use admin client which bypasses RLS
-- So we don't need policies for those operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_update_media_files_updated_at ON media_files;
CREATE TRIGGER trigger_update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_media_files_updated_at();

-- Add comments to tables
COMMENT ON TABLE media_files IS 'Stores metadata about uploaded media files (images, videos, documents)';
COMMENT ON TABLE media_usage IS 'Tracks which entities (products, banners, pages) use which media files';

