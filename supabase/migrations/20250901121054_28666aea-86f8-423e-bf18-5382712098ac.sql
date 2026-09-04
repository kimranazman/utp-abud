-- Fix duplicate foreign key relationship issue with correct syntax
-- Check and remove duplicate constraints on business_category_mapping

-- Check existing constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'business_category_mapping' 
  AND table_schema = 'public' 
  AND constraint_type = 'FOREIGN KEY';

-- Drop any existing business_id foreign key constraints that might conflict
ALTER TABLE public.business_category_mapping
DROP CONSTRAINT IF EXISTS business_category_mapping_business_id_fkey;

-- Drop the constraint we just added if it exists
ALTER TABLE public.business_category_mapping
DROP CONSTRAINT IF EXISTS fk_business_category_mapping_business_id;

-- Re-add the single, properly named constraint
ALTER TABLE public.business_category_mapping
ADD CONSTRAINT fk_business_category_mapping_business_id
FOREIGN KEY (business_id)
REFERENCES public.user_businesses(id)
ON DELETE CASCADE;