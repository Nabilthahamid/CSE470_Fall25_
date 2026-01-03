-- ============================================
-- EMAIL MARKETING TABLES
-- Run this file in Supabase SQL Editor
-- ============================================

-- ============================================
-- Email Newsletters Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL DEFAULT 'html' CHECK (content_type IN ('html', 'text')),
    recipient_type VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (recipient_type IN ('all', 'subscribers', 'customers', 'segment')),
    recipient_segment TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    recipient_count INTEGER DEFAULT 0 CHECK (recipient_count >= 0),
    opened_count INTEGER DEFAULT 0 CHECK (opened_count >= 0),
    clicked_count INTEGER DEFAULT 0 CHECK (clicked_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email_newsletters
CREATE INDEX IF NOT EXISTS idx_email_newsletters_status ON email_newsletters(status);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_recipient_type ON email_newsletters(recipient_type);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_scheduled_at ON email_newsletters(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_sent_at ON email_newsletters(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_created_at ON email_newsletters(created_at DESC);

-- Enable Row Level Security for email_newsletters
ALTER TABLE email_newsletters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read newsletters" ON email_newsletters;
DROP POLICY IF EXISTS "Allow admin manage newsletters" ON email_newsletters;

-- Create policies for email_newsletters
CREATE POLICY "Allow public read newsletters" ON email_newsletters
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage newsletters" ON email_newsletters
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Email Sequences Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trigger VARCHAR(50) NOT NULL CHECK (trigger IN ('welcome', 'abandoned_cart', 'order_confirmation', 'order_shipped', 'custom')),
    trigger_delay INTEGER DEFAULT 0 CHECK (trigger_delay >= 0), -- Hours after trigger
    emails JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of SequenceEmail objects
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email_sequences
CREATE INDEX IF NOT EXISTS idx_email_sequences_trigger ON email_sequences(trigger);
CREATE INDEX IF NOT EXISTS idx_email_sequences_active ON email_sequences(is_active);
CREATE INDEX IF NOT EXISTS idx_email_sequences_created_at ON email_sequences(created_at DESC);

-- Enable Row Level Security for email_sequences
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read sequences" ON email_sequences;
DROP POLICY IF EXISTS "Allow admin manage sequences" ON email_sequences;

-- Create policies for email_sequences
CREATE POLICY "Allow public read sequences" ON email_sequences
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage sequences" ON email_sequences
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Email Campaigns Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL DEFAULT 'html' CHECK (content_type IN ('html', 'text')),
    recipient_count INTEGER DEFAULT 0 NOT NULL CHECK (recipient_count >= 0),
    sent_count INTEGER DEFAULT 0 NOT NULL CHECK (sent_count >= 0),
    opened_count INTEGER DEFAULT 0 NOT NULL CHECK (opened_count >= 0),
    clicked_count INTEGER DEFAULT 0 NOT NULL CHECK (clicked_count >= 0),
    bounced_count INTEGER DEFAULT 0 NOT NULL CHECK (bounced_count >= 0),
    unsubscribed_count INTEGER DEFAULT 0 NOT NULL CHECK (unsubscribed_count >= 0),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_started_at ON email_campaigns(started_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_completed_at ON email_campaigns(completed_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);

-- Enable Row Level Security for email_campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON email_campaigns;

-- Create policies for email_campaigns
CREATE POLICY "Allow public read campaigns" ON email_campaigns
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage campaigns" ON email_campaigns
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update email_newsletters updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_newsletters updated_at
DROP TRIGGER IF EXISTS trigger_update_email_newsletters_updated_at ON email_newsletters;
CREATE TRIGGER trigger_update_email_newsletters_updated_at
    BEFORE UPDATE ON email_newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_email_newsletters_updated_at();

-- Function to update email_sequences updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_sequences updated_at
DROP TRIGGER IF EXISTS trigger_update_email_sequences_updated_at ON email_sequences;
CREATE TRIGGER trigger_update_email_sequences_updated_at
    BEFORE UPDATE ON email_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_email_sequences_updated_at();

-- Function to update email_campaigns updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_campaigns updated_at
DROP TRIGGER IF EXISTS trigger_update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER trigger_update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_email_campaigns_updated_at();

