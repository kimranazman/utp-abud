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

-- Step 5: Update RLS policies for affected tables to ensure consistency

-- Enable RLS on all related tables if not already enabled
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_businesses ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for viewing own data (if they don't exist)
-- user_education
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_education' 
    AND policyname = 'Users can view own education'
  ) THEN
    CREATE POLICY "Users can view own education" 
    ON user_education FOR SELECT 
    USING (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = user_education.user_id 
        AND (
          profiles.profile_visibility = 'public' 
          OR (profiles.is_seed_data = true AND public.is_development_mode())
        )
      )
    );
  END IF;
END $$;

-- Similar policies for other tables
DO $$ 
BEGIN
  -- Career history
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'career_history' 
    AND policyname = 'Users can view career history'
  ) THEN
    CREATE POLICY "Users can view career history" 
    ON career_history FOR SELECT 
    USING (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = career_history.user_id 
        AND (
          profiles.profile_visibility = 'public' 
          OR (profiles.is_seed_data = true AND public.is_development_mode())
        )
      )
    );
  END IF;

  -- Achievements
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'achievements' 
    AND policyname = 'Users can view achievements'
  ) THEN
    CREATE POLICY "Users can view achievements" 
    ON achievements FOR SELECT 
    USING (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = achievements.user_id 
        AND (
          profiles.profile_visibility = 'public' 
          OR (profiles.is_seed_data = true AND public.is_development_mode())
        )
      )
    );
  END IF;

  -- User links
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_links' 
    AND policyname = 'Users can view links'
  ) THEN
    CREATE POLICY "Users can view links" 
    ON user_links FOR SELECT 
    USING (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = user_links.user_id 
        AND (
          profiles.profile_visibility = 'public' 
          OR (profiles.is_seed_data = true AND public.is_development_mode())
        )
      )
    );
  END IF;

  -- User businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_businesses' 
    AND policyname = 'Users can view businesses'
  ) THEN
    CREATE POLICY "Users can view businesses" 
    ON user_businesses FOR SELECT 
    USING (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = user_businesses.user_id 
        AND (
          profiles.profile_visibility = 'public' 
          OR (profiles.is_seed_data = true AND public.is_development_mode())
        )
      )
    );
  END IF;
END $$;

-- Step 6: Add a comment to document this change
COMMENT ON TABLE user_education IS 'User education history - references profiles(user_id) instead of auth.users for proper data consistency';
COMMENT ON TABLE career_history IS 'User career history - references profiles(user_id) instead of auth.users for proper data consistency';
COMMENT ON TABLE achievements IS 'User achievements - references profiles(user_id) instead of auth.users for proper data consistency';
COMMENT ON TABLE contributions IS 'User contributions - references profiles(user_id) instead of auth.users for proper data consistency';
COMMENT ON TABLE user_links IS 'User social/professional links - references profiles(user_id) instead of auth.users for proper data consistency';
COMMENT ON TABLE user_businesses IS 'User businesses - references profiles(user_id) instead of auth.users for proper data consistency';