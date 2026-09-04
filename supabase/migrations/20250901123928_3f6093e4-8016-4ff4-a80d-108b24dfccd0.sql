-- Verification query to confirm all business tables have exactly one FK to user_businesses
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
        'business_images',
        'business_locations',
        'business_team_members'
    )
GROUP BY src.relname
ORDER BY src.relname;