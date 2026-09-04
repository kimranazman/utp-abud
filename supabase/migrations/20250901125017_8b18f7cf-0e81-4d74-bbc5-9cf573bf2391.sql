-- Fix the inconsistent foreign key constraint name for business_services
-- Drop the old constraint and create a new one with the correct naming pattern

ALTER TABLE business_services 
DROP CONSTRAINT IF EXISTS business_services_business_id_fkey;

ALTER TABLE business_services 
ADD CONSTRAINT fk_business_services_business_id 
FOREIGN KEY (business_id) REFERENCES user_businesses(id) ON DELETE CASCADE;