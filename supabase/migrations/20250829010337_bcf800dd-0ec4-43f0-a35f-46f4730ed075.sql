-- Add privacy option to contributions table
ALTER TABLE public.contributions 
ADD COLUMN value_private BOOLEAN DEFAULT false;

-- Create index for better performance on privacy queries
CREATE INDEX idx_contributions_privacy ON public.contributions(value_private);

-- Update the contribution analytics view to respect privacy settings
DROP VIEW IF EXISTS public.contribution_analytics;

CREATE VIEW public.contribution_analytics AS
SELECT 
  p.user_id,
  p.full_name,
  p.graduation_year,
  p.course,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' AND c.value_private = false THEN c.value_amount ELSE 0 END), 0) as total_monetary_public,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' AND c.value_private = false THEN c.value_amount ELSE 0 END), 0) as total_non_monetary_public,
  COALESCE(SUM(CASE WHEN c.value_private = false THEN c.value_amount ELSE 0 END), 0) as total_contribution_value_public,
  -- Include private totals for admin view (admins can see all)
  COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' THEN c.value_amount ELSE 0 END), 0) as total_monetary_all,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' THEN c.value_amount ELSE 0 END), 0) as total_non_monetary_all,
  COALESCE(SUM(c.value_amount), 0) as total_contribution_value_all,
  COUNT(c.id) as total_contributions,
  COUNT(CASE WHEN c.contribution_type = 'monetary' THEN 1 END) as monetary_contributions,
  COUNT(CASE WHEN c.contribution_type = 'non_monetary' THEN 1 END) as non_monetary_contributions
FROM public.profiles p
LEFT JOIN public.contributions c ON p.user_id = c.user_id
WHERE p.is_verified = true
GROUP BY p.user_id, p.full_name, p.graduation_year, p.course
ORDER BY total_contribution_value_all DESC;