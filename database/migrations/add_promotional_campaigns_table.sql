-- ============================================
-- PROMOTIONAL CAMPAIGNS TABLE
-- Run this file in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('flash_sale', 'limited_time', 'buy_x_get_y', 'seasonal', 'other')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    discount_id UUID,
    products JSONB DEFAULT '[]'::jsonb,
    buy_x_get_y_config JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_date >= start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_type ON promotional_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_dates ON promotional_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_discount_id ON promotional_campaigns(discount_id);

-- Enable Row Level Security
ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read campaigns" ON promotional_campaigns;
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON promotional_campaigns;

-- Create policies
CREATE POLICY "Allow public read campaigns" ON promotional_campaigns
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage campaigns" ON promotional_campaigns
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotional_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_promotional_campaigns_updated_at ON promotional_campaigns;
CREATE TRIGGER trigger_update_promotional_campaigns_updated_at
    BEFORE UPDATE ON promotional_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_campaigns_updated_at();

