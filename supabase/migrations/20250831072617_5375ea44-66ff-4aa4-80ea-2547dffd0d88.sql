-- Fix foreign key constraints to reference profiles table instead of auth.users
-- This ensures proper data consistency and follows Supabase best practices

-- Step 1: Drop existing foreign key constraints that reference auth.users directly
-- Note: We need to find and drop constraints by name

-- For user_education table
DO $$ 
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'user_education'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE user_education DROP CONSTRAINT IF EXISTS user_education_user_id_fkey;
  END IF;
END $$;

-- For career_history table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'career_history'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE career_history DROP CONSTRAINT IF EXISTS career_history_user_id_fkey;
  END IF;
END $$;

-- For achievements table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'achievements'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;
  END IF;
END $$;

-- For contributions table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'contributions'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_user_id_fkey;
  END IF;
  
  -- Also handle added_by constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'contributions'
    AND constraint_name LIKE '%added_by%fkey%'
  ) THEN
    ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_added_by_fkey;
  END IF;
END $$;

-- For user_links table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'user_links'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE user_links DROP CONSTRAINT IF EXISTS user_links_user_id_fkey;
  END IF;
END $$;

-- For user_businesses table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'user_businesses'
    AND constraint_name LIKE '%user_id%fkey%'
  ) THEN
    ALTER TABLE user_businesses DROP CONSTRAINT IF EXISTS user_businesses_user_id_fkey;
  END IF;
END $$;

-- Step 2: Add new foreign key constraints that reference profiles(user_id)
-- These will cascade deletes from profiles table

-- user_education table
ALTER TABLE user_education 
ADD CONSTRAINT user_education_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- career_history table
ALTER TABLE career_history 
ADD CONSTRAINT career_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- achievements table
ALTER TABLE achievements 
ADD CONSTRAINT achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- contributions table
ALTER TABLE contributions 
ADD CONSTRAINT contributions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- For added_by, we reference profiles as well
ALTER TABLE contributions 
ADD CONSTRAINT contributions_added_by_fkey 
FOREIGN KEY (added_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- user_links table
ALTER TABLE user_links 
ADD CONSTRAINT user_links_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- user_businesses table
ALTER TABLE user_businesses 
ADD CONSTRAINT user_businesses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Step 3: Create indexes for better performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_career_history_user_id ON career_history(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_added_by ON contributions(added_by);
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_businesses_user_id ON user_businesses(user_id);

-- Step 4: Verify the constraints are properly set
DO $$ 
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
  JOIN information_schema.table_constraints tc2 
    ON rc.unique_constraint_name = tc2.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc2.table_name = 'profiles'
    AND tc2.table_schema = 'public';
    
  RAISE NOTICE 'Number of foreign keys now referencing profiles table: %', constraint_count;
END $$;