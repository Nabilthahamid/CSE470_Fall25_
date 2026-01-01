-- Migration: Add Community Build Features
-- This migration adds tables and columns for community build sharing, likes, comments, ratings

-- ============================================
-- Step 1: Add community fields to pc_builds table
-- ============================================
ALTER TABLE pc_builds 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS use_case VARCHAR(100), -- e.g., 'gaming', 'workstation', 'streaming', 'editing'
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of tags
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false, -- Admin can feature builds
ADD COLUMN IF NOT EXISTS image_url TEXT; -- Optional build image

-- Create indexes for community features
CREATE INDEX IF NOT EXISTS idx_pc_builds_is_public ON pc_builds(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_pc_builds_likes_count ON pc_builds(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_pc_builds_views_count ON pc_builds(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_pc_builds_average_rating ON pc_builds(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_pc_builds_use_case ON pc_builds(use_case);
CREATE INDEX IF NOT EXISTS idx_pc_builds_featured ON pc_builds(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_pc_builds_created_at_public ON pc_builds(created_at DESC) WHERE is_public = true;

-- ============================================
-- Step 2: Build Likes Table
-- ============================================
CREATE TABLE IF NOT EXISTS build_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(build_id, user_id) -- One like per user per build
);

CREATE INDEX IF NOT EXISTS idx_build_likes_build_id ON build_likes(build_id);
CREATE INDEX IF NOT EXISTS idx_build_likes_user_id ON build_likes(user_id);

-- ============================================
-- Step 3: Build Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS build_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_comments_build_id ON build_comments(build_id);
CREATE INDEX IF NOT EXISTS idx_build_comments_user_id ON build_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_build_comments_created_at ON build_comments(created_at DESC);

-- Add updated_at trigger for build_comments
CREATE OR REPLACE FUNCTION update_build_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_build_comments_updated_at
    BEFORE UPDATE ON build_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_build_comments_updated_at();

-- ============================================
-- Step 4: Build Ratings Table
-- ============================================
CREATE TABLE IF NOT EXISTS build_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(build_id, user_id) -- One rating per user per build
);

CREATE INDEX IF NOT EXISTS idx_build_ratings_build_id ON build_ratings(build_id);
CREATE INDEX IF NOT EXISTS idx_build_ratings_user_id ON build_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_build_ratings_rating ON build_ratings(rating);

-- Add updated_at trigger for build_ratings
CREATE TRIGGER update_build_ratings_updated_at
    BEFORE UPDATE ON build_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_build_comments_updated_at();

-- ============================================
-- Step 5: Function to update build likes count
-- ============================================
CREATE OR REPLACE FUNCTION update_build_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE pc_builds 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.build_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pc_builds 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.build_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_build_likes_count_trigger
    AFTER INSERT OR DELETE ON build_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_build_likes_count();

-- ============================================
-- Step 6: Function to update build ratings
-- ============================================
CREATE OR REPLACE FUNCTION update_build_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
    total_ratings INTEGER;
BEGIN
    -- Calculate average rating and count
    SELECT 
        COALESCE(AVG(rating)::DECIMAL(3, 2), 0),
        COUNT(*)
    INTO avg_rating, total_ratings
    FROM build_ratings
    WHERE build_id = COALESCE(NEW.build_id, OLD.build_id);
    
    -- Update build stats
    UPDATE pc_builds 
    SET 
        average_rating = avg_rating,
        ratings_count = total_ratings
    WHERE id = COALESCE(NEW.build_id, OLD.build_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_build_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON build_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_build_rating_stats();

-- ============================================
-- Step 7: Function to increment build views
-- ============================================
CREATE OR REPLACE FUNCTION increment_build_views(build_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE pc_builds 
    SET views_count = views_count + 1 
    WHERE id = build_uuid AND is_public = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 8: Row Level Security Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE build_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_ratings ENABLE ROW LEVEL SECURITY;

-- Build Likes Policies
DROP POLICY IF EXISTS "Anyone can view likes" ON build_likes;
DROP POLICY IF EXISTS "Users can like builds" ON build_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON build_likes;

CREATE POLICY "Anyone can view likes" ON build_likes
    FOR SELECT
    USING (true);

CREATE POLICY "Users can like builds" ON build_likes
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can unlike their own likes" ON build_likes
    FOR DELETE
    USING (true);

-- Build Comments Policies
DROP POLICY IF EXISTS "Anyone can view comments" ON build_comments;
DROP POLICY IF EXISTS "Users can create comments" ON build_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON build_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON build_comments;

CREATE POLICY "Anyone can view comments" ON build_comments
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create comments" ON build_comments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own comments" ON build_comments
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id')
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can delete own comments" ON build_comments
    FOR DELETE
    USING (true);

-- Build Ratings Policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON build_ratings;
DROP POLICY IF EXISTS "Users can rate builds" ON build_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON build_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON build_ratings;

CREATE POLICY "Anyone can view ratings" ON build_ratings
    FOR SELECT
    USING (true);

CREATE POLICY "Users can rate builds" ON build_ratings
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own ratings" ON build_ratings
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete own ratings" ON build_ratings
    FOR DELETE
    USING (true);

-- ============================================
-- Step 9: Update existing RLS for pc_builds
-- ============================================
-- Allow public read access to public builds
DROP POLICY IF EXISTS "Public can view public builds" ON pc_builds;

CREATE POLICY "Public can view public builds" ON pc_builds
    FOR SELECT
    USING (is_public = true OR user_id::text = COALESCE(current_setting('request.jwt.claims', true)::json->>'user_id', ''));

-- Allow users to update their own builds (including making them public)
DROP POLICY IF EXISTS "Users can update own builds" ON pc_builds;

CREATE POLICY "Users can update own builds" ON pc_builds
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

