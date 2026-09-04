-- Fix business team members foreign key relationship
-- Add foreign key constraint from business_team_members.user_id to profiles.user_id
ALTER TABLE business_team_members 
ADD CONSTRAINT fk_business_team_members_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing display_order column to business_services
ALTER TABLE business_services 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing business_services to have incremental display_order
WITH numbered_services AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at) as rn
  FROM business_services
)
UPDATE business_services 
SET display_order = numbered_services.rn
FROM numbered_services 
WHERE business_services.id = numbered_services.id;