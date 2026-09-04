-- Fix duplicate foreign key relationship issue
-- Remove any duplicate or conflicting foreign key constraints

-- First, check existing constraints on business_category_mapping
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'business_category_mapping' 
  AND table_schema = 'public' 
  AND constraint_type = 'FOREIGN KEY';

-- Drop any existing business_id foreign key constraints that might conflict
DROP CONSTRAINT IF EXISTS business_category_mapping_business_id_fkey ON public.business_category_mapping;

-- Ensure we only have one properly named foreign key constraint
ALTER TABLE public.business_category_mapping
DROP CONSTRAINT IF EXISTS fk_business_category_mapping_business_id;

-- Re-add the single, properly named constraint
ALTER TABLE public.business_category_mapping
ADD CONSTRAINT fk_business_category_mapping_business_id
FOREIGN KEY (business_id)
REFERENCES public.user_businesses(id)
ON DELETE CASCADE;