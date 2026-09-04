
DO $$
DECLARE
    r record;
BEGIN
    -- Remove ALL existing FKs from business_services to user_businesses
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.business_services'::regclass 
          AND confrelid = 'public.user_businesses'::regclass
    LOOP
        EXECUTE format('ALTER TABLE public.business_services DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;

    -- Add single canonical FK with Supabase/Postgres naming and cascade behavior
    ALTER TABLE public.business_services
    ADD CONSTRAINT business_services_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES public.user_businesses(id) ON DELETE CASCADE;

END $$;

-- Verify there is exactly one FK per table back to user_businesses
SELECT 
    src.relname AS table_name,
    COUNT(*) AS fk_count,
    array_agg(con.conname) AS fk_names
FROM pg_constraint con
JOIN pg_class src ON src.oid = con.conrelid
JOIN pg_namespace nsrc ON nsrc.oid = src.relnamespace AND nsrc.nspname = 'public'
JOIN pg_class tgt ON tgt.oid = con.confrelid
JOIN pg_namespace ntgt ON ntgt.oid = tgt.relnamespace AND ntgt.nspname = 'public'
WHERE con.contype = 'f'
  AND tgt.relname = 'user_businesses'
  AND src.relname IN (
        'business_category_mapping',
        'business_services',
        'business_gallery',
        'business_contact',
        'business_achievements',
        'business_metrics'
    )
GROUP BY src.relname
ORDER BY src.relname;
