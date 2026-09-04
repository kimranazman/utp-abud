-- Fix the security definer view by removing SECURITY DEFINER from contribution_analytics view
DROP VIEW IF EXISTS public.contribution_analytics;

-- Recreate the contribution_analytics view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.contribution_analytics AS
SELECT 
  p.user_id,
  p.full_name,
  p.course,
  p.graduation_year,
  COUNT(c.id) as total_contributions,
  COUNT(CASE WHEN c.contribution_type = 'monetary' THEN 1 END) as monetary_contributions,
  COUNT(CASE WHEN c.contribution_type = 'non_monetary' THEN 1 END) as non_monetary_contributions,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' AND c.value_private = false THEN c.value_amount END), 0) as total_monetary_public,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' AND c.value_private = false THEN c.value_amount END), 0) as total_non_monetary_public,
  COALESCE(SUM(CASE WHEN c.value_private = false THEN c.value_amount END), 0) as total_contribution_value_public,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' THEN c.value_amount END), 0) as total_monetary_all,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' THEN c.value_amount END), 0) as total_non_monetary_all,
  COALESCE(SUM(c.value_amount), 0) as total_contribution_value_all
FROM public.profiles p
LEFT JOIN public.contributions c ON p.user_id = c.user_id
WHERE p.is_verified = true
GROUP BY p.user_id, p.full_name, p.course, p.graduation_year;