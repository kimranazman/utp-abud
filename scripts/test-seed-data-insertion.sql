-- Test script to verify seed data can be inserted after fixing foreign key constraints
-- Run this after executing the fix_foreign_key_constraints migration

-- First, check if development mode is enabled
SELECT 
  'Development Mode Status' as check_type,
  public.is_development_mode() as is_enabled;

-- Check the profiles with seed data
SELECT 
  'Seed Profiles Count' as check_type,
  COUNT(*) as count
FROM profiles 
WHERE is_seed_data = true;

-- List seed profiles
SELECT 
  user_id,
  full_name,
  email,
  course,
  graduation_year,
  is_seed_data
FROM profiles 
WHERE is_seed_data = true
LIMIT 5;

-- Test inserting education data for a seed profile
DO $$ 
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a seed profile user_id
  SELECT user_id INTO test_user_id 
  FROM profiles 
  WHERE is_seed_data = true 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Try to insert education data
    INSERT INTO user_education (
      user_id, 
      programme_level, 
      programme_name, 
      graduation_year, 
      is_primary
    ) VALUES (
      test_user_id,
      'Masters',
      'Master of Science in Information Technology',
      2025,
      false
    ) ON CONFLICT (user_id, programme_name) DO NOTHING;
    
    RAISE NOTICE 'Successfully inserted test education data for user_id: %', test_user_id;
  ELSE
    RAISE NOTICE 'No seed profiles found to test with';
  END IF;
END $$;

-- Check if education data exists for seed profiles
SELECT 
  'Education Records for Seed Profiles' as check_type,
  COUNT(*) as count
FROM user_education ue
INNER JOIN profiles p ON ue.user_id = p.user_id
WHERE p.is_seed_data = true;

-- Check if career history exists for seed profiles
SELECT 
  'Career History for Seed Profiles' as check_type,
  COUNT(*) as count
FROM career_history ch
INNER JOIN profiles p ON ch.user_id = p.user_id
WHERE p.is_seed_data = true;

-- Check if achievements exist for seed profiles
SELECT 
  'Achievements for Seed Profiles' as check_type,
  COUNT(*) as count
FROM achievements a
INNER JOIN profiles p ON a.user_id = p.user_id
WHERE p.is_seed_data = true;

-- Check if businesses exist for seed profiles
SELECT 
  'Businesses for Seed Profiles' as check_type,
  COUNT(*) as count
FROM user_businesses ub
INNER JOIN profiles p ON ub.user_id = p.user_id
WHERE p.is_seed_data = true;

-- Verify foreign key constraints are now pointing to profiles table
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc2.table_name as references_table,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.table_constraints tc2 
  ON rc.unique_constraint_name = tc2.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('user_education', 'career_history', 'achievements', 'contributions', 'user_links', 'user_businesses')
ORDER BY tc.table_name, tc.constraint_name;