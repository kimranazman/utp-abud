-- Fix Security Definer Views by recreating them without SECURITY DEFINER
-- Views inherit RLS policies from their underlying tables

-- Drop and recreate contribution_analytics view without SECURITY DEFINER
DROP VIEW IF EXISTS public.contribution_analytics;

CREATE VIEW public.contribution_analytics AS
SELECT 
  p.user_id,
  p.full_name,
  p.course,
  p.graduation_year,
  count(c.id) AS total_contributions,
  count(
    CASE
      WHEN c.contribution_type = 'monetary'::text THEN 1
      ELSE NULL::integer
    END) AS monetary_contributions,
  count(
    CASE
      WHEN c.contribution_type = 'non_monetary'::text THEN 1
      ELSE NULL::integer
    END) AS non_monetary_contributions,
  COALESCE(sum(
    CASE
      WHEN c.contribution_type = 'monetary'::text AND c.value_private = false THEN c.value_amount
      ELSE NULL::numeric
    END), 0::numeric) AS total_monetary_public,
  COALESCE(sum(
    CASE
      WHEN c.contribution_type = 'non_monetary'::text AND c.value_private = false THEN c.value_amount
      ELSE NULL::numeric
    END), 0::numeric) AS total_non_monetary_public,
  COALESCE(sum(
    CASE
      WHEN c.value_private = false THEN c.value_amount
      ELSE NULL::numeric
    END), 0::numeric) AS total_contribution_value_public,
  COALESCE(sum(
    CASE
      WHEN c.contribution_type = 'monetary'::text THEN c.value_amount
      ELSE NULL::numeric
    END), 0::numeric) AS total_monetary_all,
  COALESCE(sum(
    CASE
      WHEN c.contribution_type = 'non_monetary'::text THEN c.value_amount
      ELSE NULL::numeric
    END), 0::numeric) AS total_non_monetary_all,
  COALESCE(sum(c.value_amount), 0::numeric) AS total_contribution_value_all
FROM profiles p
LEFT JOIN contributions c ON p.user_id = c.user_id
WHERE p.is_verified = true
GROUP BY p.user_id, p.full_name, p.course, p.graduation_year;

-- Drop and recreate development_status view without SECURITY DEFINER
DROP VIEW IF EXISTS public.development_status;

CREATE VIEW public.development_status AS
SELECT 
  is_development_mode() AS is_enabled,
  (SELECT count(*)::integer FROM profiles WHERE is_seed_data = true) AS seed_profiles_count,
  (SELECT count(*)::integer FROM profiles WHERE is_seed_data = false OR is_seed_data IS NULL) AS real_profiles_count;