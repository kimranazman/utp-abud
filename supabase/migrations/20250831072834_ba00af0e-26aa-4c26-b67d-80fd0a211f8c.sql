-- Clean up orphaned data before fixing foreign key constraints
-- Remove records that reference non-existent users in profiles table

-- Step 1: Identify and remove orphaned records
DELETE FROM user_education 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM career_history 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM achievements 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM contributions 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM user_links 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM user_businesses 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

-- Step 2: Drop existing foreign key constraints that reference auth.users directly
DO $$ 
BEGIN
  -- Drop constraints if they exist
  ALTER TABLE user_education DROP CONSTRAINT IF EXISTS user_education_user_id_fkey;
  ALTER TABLE career_history DROP CONSTRAINT IF EXISTS career_history_user_id_fkey;
  ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;
  ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_user_id_fkey;
  ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_added_by_fkey;
  ALTER TABLE user_links DROP CONSTRAINT IF EXISTS user_links_user_id_fkey;
  ALTER TABLE user_businesses DROP CONSTRAINT IF EXISTS user_businesses_user_id_fkey;
END $$;

-- Step 3: Add new foreign key constraints that reference profiles(user_id)
ALTER TABLE user_education 
ADD CONSTRAINT user_education_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE career_history 
ADD CONSTRAINT career_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE achievements 
ADD CONSTRAINT achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE contributions 
ADD CONSTRAINT contributions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE contributions 
ADD CONSTRAINT contributions_added_by_fkey 
FOREIGN KEY (added_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

ALTER TABLE user_links 
ADD CONSTRAINT user_links_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE user_businesses 
ADD CONSTRAINT user_businesses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Step 4: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_career_history_user_id ON career_history(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_added_by ON contributions(added_by);
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_businesses_user_id ON user_businesses(user_id);