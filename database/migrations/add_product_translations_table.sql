-- ============================================
-- PRODUCT TRANSLATIONS TABLE
-- Stores AI-generated translations for products
-- ============================================

CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL, -- 'en', 'bn', etc.
    translated_name TEXT,
    translated_description TEXT,
    translated_specifications TEXT,
    translated_features TEXT, -- JSON array of translated features
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language);
CREATE INDEX IF NOT EXISTS idx_product_translations_product_language ON product_translations(product_id, language);

-- Enable RLS
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read, admin write
DROP POLICY IF EXISTS "Allow public read translations" ON product_translations;
DROP POLICY IF EXISTS "Allow admin write translations" ON product_translations;

CREATE POLICY "Allow public read translations" ON product_translations
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin write translations" ON product_translations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_product_translations_timestamp ON product_translations;
CREATE TRIGGER update_product_translations_timestamp
    BEFORE UPDATE ON product_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_product_translations_updated_at();

