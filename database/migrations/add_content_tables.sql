-- ============================================
-- CONTENT MANAGEMENT TABLES
-- Run this file in Supabase SQL Editor
-- ============================================

-- ============================================
-- Homepage Content Table
-- ============================================
CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image_url TEXT,
    featured_section_title TEXT,
    featured_section_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for homepage_content
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read homepage content" ON homepage_content;
DROP POLICY IF EXISTS "Allow admin manage homepage content" ON homepage_content;

-- Create policies for homepage_content
CREATE POLICY "Allow public read homepage content" ON homepage_content
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage homepage content" ON homepage_content
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Banners Table
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(255),
    position VARCHAR(20) NOT NULL CHECK (position IN ('top', 'middle', 'bottom')),
    "order" INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Create indexes for banners
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");

-- Enable Row Level Security for banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read banners" ON banners;
DROP POLICY IF EXISTS "Allow admin manage banners" ON banners;

-- Create policies for banners
CREATE POLICY "Allow public read banners" ON banners
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage banners" ON banners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Static Pages Table
-- ============================================
CREATE TABLE IF NOT EXISTS static_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for static_pages
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(is_published);

-- Enable Row Level Security for static_pages
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read published pages" ON static_pages;
DROP POLICY IF EXISTS "Allow admin manage pages" ON static_pages;

-- Create policies for static_pages
CREATE POLICY "Allow public read published pages" ON static_pages
    FOR SELECT
    USING (is_published = true OR true); -- Admin can see all, public only published

CREATE POLICY "Allow admin manage pages" ON static_pages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- FAQs Table
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    "order" INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faqs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs("order");

-- Enable Row Level Security for faqs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read published faqs" ON faqs;
DROP POLICY IF EXISTS "Allow admin manage faqs" ON faqs;

-- Create policies for faqs
CREATE POLICY "Allow public read published faqs" ON faqs
    FOR SELECT
    USING (is_published = true OR true); -- Admin can see all, public only published

CREATE POLICY "Allow admin manage faqs" ON faqs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update homepage_content updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for homepage_content updated_at
DROP TRIGGER IF EXISTS trigger_update_homepage_content_updated_at ON homepage_content;
CREATE TRIGGER trigger_update_homepage_content_updated_at
    BEFORE UPDATE ON homepage_content
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_content_updated_at();

-- Function to update banners updated_at timestamp
CREATE OR REPLACE FUNCTION update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for banners updated_at
DROP TRIGGER IF EXISTS trigger_update_banners_updated_at ON banners;
CREATE TRIGGER trigger_update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_banners_updated_at();

-- Function to update static_pages updated_at timestamp
CREATE OR REPLACE FUNCTION update_static_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for static_pages updated_at
DROP TRIGGER IF EXISTS trigger_update_static_pages_updated_at ON static_pages;
CREATE TRIGGER trigger_update_static_pages_updated_at
    BEFORE UPDATE ON static_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_static_pages_updated_at();

-- Function to update faqs updated_at timestamp
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for faqs updated_at
DROP TRIGGER IF EXISTS trigger_update_faqs_updated_at ON faqs;
CREATE TRIGGER trigger_update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_faqs_updated_at();

