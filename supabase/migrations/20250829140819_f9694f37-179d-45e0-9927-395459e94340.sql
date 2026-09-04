-- Add location fields to profiles and businesses
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE user_businesses ADD COLUMN IF NOT EXISTS location text;

-- Create business_locations table for multiple locations per business
CREATE TABLE IF NOT EXISTS business_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  location_name text NOT NULL,
  address text,
  city text,
  state text,
  country text DEFAULT 'United States',
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on business_locations
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for business_locations
CREATE POLICY "Business owners can manage their locations" 
ON business_locations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_locations.business_id 
    AND ub.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::user_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_locations.business_id 
    AND ub.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users can view locations of accessible businesses" 
ON business_locations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_locations.business_id 
    AND ub.user_id = auth.uid()
  ) OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_businesses ub
    JOIN profiles p ON p.user_id = ub.user_id
    WHERE ub.id = business_locations.business_id 
    AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
    AND p.is_verified = true
  )) OR 
  has_role(auth.uid(), 'admin'::user_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_business_locations_updated_at
BEFORE UPDATE ON business_locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update profiles with locations
UPDATE profiles SET location = 
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'San Francisco, CA'
    WHEN full_name = 'Ahmed Hassan' THEN 'Austin, TX'
    WHEN full_name = 'Maria Rodriguez' THEN 'New York, NY'
    WHEN full_name = 'James Wilson' THEN 'Boston, MA'
    WHEN full_name = 'Priya Sharma' THEN 'Austin, TX'
    WHEN full_name = 'David Kim' THEN 'San Francisco, CA'
    WHEN full_name = 'Lisa Thompson' THEN 'Seattle, WA'
    WHEN full_name = 'Michael Brown' THEN 'New York, NY'
    WHEN full_name = 'Aisha Johnson' THEN 'Boston, MA'
    WHEN full_name = 'Carlos Garcia' THEN 'Chicago, IL'
    WHEN full_name = 'Emily Davis' THEN 'Seattle, WA'
    WHEN full_name = 'Ryan Lee' THEN 'Los Angeles, CA'
    WHEN full_name = 'Fatima Ali' THEN 'Los Angeles, CA'
    WHEN full_name = 'Thomas Anderson' THEN 'Chicago, IL'
    WHEN full_name = 'Nina Patel' THEN 'Washington, DC'
  END
WHERE 'seed-accounts' = ANY(tags);

-- Update businesses with primary locations
UPDATE user_businesses SET location = 
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'San Francisco, CA'
    WHEN business_name = 'GreenTech Innovations' THEN 'Austin, TX'
    WHEN business_name = 'Digital Growth Agency' THEN 'New York, NY'
    WHEN business_name = 'SmartHome Pro' THEN 'Austin, TX'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'New York, NY'
    WHEN business_name = 'SecureNet Solutions' THEN 'Chicago, IL'
    WHEN business_name = 'Sustainable Design Studio' THEN 'Los Angeles, CA'
    WHEN business_name = 'MindCare Technologies' THEN 'Chicago, IL'
    WHEN business_name = 'TechStart Accelerator' THEN 'San Francisco, CA'
    WHEN business_name = 'E-commerce Boost' THEN 'New York, NY'
    WHEN business_name = 'Investment Analytics Pro' THEN 'New York, NY'
  END
WHERE EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = user_businesses.user_id 
  AND 'seed-accounts' = ANY(p.tags)
);

-- Add multiple locations for some businesses
WITH business_data AS (
  SELECT ub.id as business_id, ub.business_name 
  FROM user_businesses ub
  JOIN profiles p ON p.user_id = ub.user_id
  WHERE 'seed-accounts' = ANY(p.tags)
)
INSERT INTO business_locations (business_id, location_name, city, state, country, is_primary)
SELECT 
  business_id,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'Headquarters'
    WHEN business_name = 'GreenTech Innovations' THEN 'Main Office'
    WHEN business_name = 'Digital Growth Agency' THEN 'NYC Headquarters'
    WHEN business_name = 'SmartHome Pro' THEN 'Austin Office'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'Manhattan Office'
    WHEN business_name = 'SecureNet Solutions' THEN 'Chicago HQ'
    WHEN business_name = 'Sustainable Design Studio' THEN 'LA Studio'
    WHEN business_name = 'MindCare Technologies' THEN 'Chicago Office'
  END,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'San Francisco'
    WHEN business_name = 'GreenTech Innovations' THEN 'Austin'
    WHEN business_name = 'Digital Growth Agency' THEN 'New York'
    WHEN business_name = 'SmartHome Pro' THEN 'Austin'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'New York'
    WHEN business_name = 'SecureNet Solutions' THEN 'Chicago'
    WHEN business_name = 'Sustainable Design Studio' THEN 'Los Angeles'
    WHEN business_name = 'MindCare Technologies' THEN 'Chicago'
  END,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'CA'
    WHEN business_name = 'GreenTech Innovations' THEN 'TX'
    WHEN business_name = 'Digital Growth Agency' THEN 'NY'
    WHEN business_name = 'SmartHome Pro' THEN 'TX'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'NY'
    WHEN business_name = 'SecureNet Solutions' THEN 'IL'
    WHEN business_name = 'Sustainable Design Studio' THEN 'CA'
    WHEN business_name = 'MindCare Technologies' THEN 'IL'
  END,
  'United States',
  true
FROM business_data
WHERE business_name IN ('AI Solutions Hub', 'GreenTech Innovations', 'Digital Growth Agency', 'SmartHome Pro', 'FinanceFirst Consulting', 'SecureNet Solutions', 'Sustainable Design Studio', 'MindCare Technologies');

-- Add secondary locations for some multi-location businesses
WITH business_data AS (
  SELECT ub.id as business_id, ub.business_name 
  FROM user_businesses ub
  JOIN profiles p ON p.user_id = ub.user_id
  WHERE 'seed-accounts' = ANY(p.tags)
)
INSERT INTO business_locations (business_id, location_name, city, state, country, is_primary)
SELECT 
  business_id,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'Seattle Branch'
    WHEN business_name = 'Digital Growth Agency' THEN 'Miami Office'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'Boston Branch'
    WHEN business_name = 'SecureNet Solutions' THEN 'Dallas Office'
  END,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'Seattle'
    WHEN business_name = 'Digital Growth Agency' THEN 'Miami'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'Boston'
    WHEN business_name = 'SecureNet Solutions' THEN 'Dallas'
  END,
  CASE 
    WHEN business_name = 'AI Solutions Hub' THEN 'WA'
    WHEN business_name = 'Digital Growth Agency' THEN 'FL'
    WHEN business_name = 'FinanceFirst Consulting' THEN 'MA'
    WHEN business_name = 'SecureNet Solutions' THEN 'TX'
  END,
  'United States',
  false
FROM business_data
WHERE business_name IN ('AI Solutions Hub', 'Digital Growth Agency', 'FinanceFirst Consulting', 'SecureNet Solutions');