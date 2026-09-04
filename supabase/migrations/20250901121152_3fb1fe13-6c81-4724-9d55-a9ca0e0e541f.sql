-- Ensure no orphaned mappings exist
DELETE FROM public.business_category_mapping bcm
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_businesses ub WHERE ub.id = bcm.business_id
);

-- Drop ALL FKs from business_category_mapping that point to user_businesses
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class src ON src.oid = c.conrelid
    JOIN pg_class tgt ON tgt.oid = c.confrelid
    JOIN pg_namespace nsrc ON nsrc.oid = src.relnamespace
    JOIN pg_namespace ntgt ON ntgt.oid = tgt.relnamespace
    WHERE nsrc.nspname = 'public'
      AND ntgt.nspname = 'public'
      AND src.relname = 'business_category_mapping'
      AND tgt.relname = 'user_businesses'
  LOOP
    EXECUTE format('ALTER TABLE public.business_category_mapping DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- Add the single canonical FK
ALTER TABLE public.business_category_mapping
ADD CONSTRAINT fk_business_category_mapping_business_id
FOREIGN KEY (business_id)
REFERENCES public.user_businesses(id)
ON DELETE CASCADE;