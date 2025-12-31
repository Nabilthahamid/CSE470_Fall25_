-- Migration: Add checkout/profile fields to users table
-- Run this in Supabase SQL Editor

-- Add checkout fields if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_address'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_address TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_city'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_postal_code'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_postal_code VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'customer_country'
    ) THEN
        ALTER TABLE users ADD COLUMN customer_country VARCHAR(100) DEFAULT 'Bangladesh';
    END IF;
END $$;

