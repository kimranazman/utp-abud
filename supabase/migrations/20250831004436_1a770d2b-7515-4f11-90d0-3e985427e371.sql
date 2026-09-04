-- Update seed data to use structured location format and seed-user tags

-- First, update existing seed users to use 'seed-user' tag instead of 'test-user'
UPDATE profiles 
SET tags = ARRAY['seed-user']
WHERE tags && ARRAY['test-user'];

-- Update location fields for existing seed data profiles to use structured format
UPDATE profiles 
SET 
  location = CASE 
    WHEN email = 'ariff.wan@demo.com' THEN 'shah-alam-selangor-malaysia'
    WHEN email = 'lisa.chan@demo.com' THEN 'kuala-lumpur-malaysia'
    WHEN email = 'zakwan.ahmad@demo.com' THEN 'kuala-lumpur-malaysia'
    WHEN email = 'siti.mariam@demo.com' THEN 'kuching-sarawak-malaysia'
    WHEN email = 'ryan.goh@demo.com' THEN 'subang-jaya-selangor-malaysia'
    WHEN email = 'ahmad.fariz@demo.com' THEN 'kuala-lumpur-malaysia'
    WHEN email = 'priya.devi@demo.com' THEN 'petaling-jaya-selangor-malaysia'
  END,
  location_city = CASE 
    WHEN email = 'ariff.wan@demo.com' THEN 'Shah Alam'
    WHEN email = 'lisa.chan@demo.com' THEN 'Kuala Lumpur'
    WHEN email = 'zakwan.ahmad@demo.com' THEN 'Kuala Lumpur'
    WHEN email = 'siti.mariam@demo.com' THEN 'Kuching'
    WHEN email = 'ryan.goh@demo.com' THEN 'Subang Jaya'
    WHEN email = 'ahmad.fariz@demo.com' THEN 'Kuala Lumpur'
    WHEN email = 'priya.devi@demo.com' THEN 'Petaling Jaya'
  END,
  location_state = CASE 
    WHEN email = 'ariff.wan@demo.com' THEN 'Selangor'
    WHEN email = 'lisa.chan@demo.com' THEN 'Federal Territory'
    WHEN email = 'zakwan.ahmad@demo.com' THEN 'Federal Territory'
    WHEN email = 'siti.mariam@demo.com' THEN 'Sarawak'
    WHEN email = 'ryan.goh@demo.com' THEN 'Selangor'
    WHEN email = 'ahmad.fariz@demo.com' THEN 'Federal Territory'
    WHEN email = 'priya.devi@demo.com' THEN 'Selangor'
  END,
  location_country = 'Malaysia'
WHERE email IN (
  'ariff.wan@demo.com', 'lisa.chan@demo.com', 'zakwan.ahmad@demo.com', 
  'siti.mariam@demo.com', 'ryan.goh@demo.com', 'ahmad.fariz@demo.com', 
  'priya.devi@demo.com'
);

-- Update career history locations to use structured format
UPDATE career_history 
SET location = CASE 
  WHEN location = 'Shah Alam, Selangor' THEN 'shah-alam-selangor-malaysia'
  WHEN location = 'Kuala Lumpur' THEN 'kuala-lumpur-malaysia'
  WHEN location = 'Kuching, Sarawak' THEN 'kuching-sarawak-malaysia'
  WHEN location = 'Cyberjaya, Selangor' THEN 'subang-jaya-selangor-malaysia'
  WHEN location = 'Petaling Jaya, Selangor' THEN 'petaling-jaya-selangor-malaysia'
END
WHERE location IN (
  'Shah Alam, Selangor', 'Kuala Lumpur', 'Kuching, Sarawak', 
  'Cyberjaya, Selangor', 'Petaling Jaya, Selangor'
);

-- Update user_businesses locations to use structured format  
UPDATE user_businesses 
SET location = CASE 
  WHEN business_name = 'FinTech Solutions Malaysia' THEN 'kuala-lumpur-malaysia'
  WHEN business_name = 'Smart City Consultancy' THEN 'subang-jaya-selangor-malaysia'
  WHEN business_name = 'GreenTech Environmental' THEN 'kuching-sarawak-malaysia'
END
WHERE business_name IN ('FinTech Solutions Malaysia', 'Smart City Consultancy', 'GreenTech Environmental');