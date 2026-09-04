-- Add tags column to profiles table
ALTER TABLE profiles ADD COLUMN tags text[];

-- Update existing seed data profiles to include test-user tag
UPDATE profiles 
SET tags = ARRAY['test-user']
WHERE email LIKE '%@demo.com' 
   OR full_name IN (
     'Wan Ariff bin Zulkifli', 
     'Lisa Chan Mei Xuan', 
     'Ahmad Zakwan bin Abdullah', 
     'Siti Mariam binti Hassan', 
     'Ryan Goh Wei Ming'
   );

-- Also update any future seed data in the same migration file
UPDATE profiles 
SET tags = ARRAY['test-user']
WHERE profile_completed = true 
  AND is_verified = true 
  AND created_at >= now() - interval '1 day';