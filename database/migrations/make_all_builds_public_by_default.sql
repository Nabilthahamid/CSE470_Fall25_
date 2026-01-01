-- Migration: Make all builds public by default
-- This migration changes the default value of is_public to true and updates all existing builds

-- Step 1: Update all existing builds to be public
UPDATE pc_builds 
SET is_public = true 
WHERE is_public IS NULL OR is_public = false;

-- Step 2: Change the default value for new builds
ALTER TABLE pc_builds 
ALTER COLUMN is_public SET DEFAULT true;

-- Step 3: Set any NULL values to true (just in case)
UPDATE pc_builds 
SET is_public = true 
WHERE is_public IS NULL;

