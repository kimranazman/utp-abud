-- Drop the problematic view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.contribution_analytics;

-- Create the view without security definer (it will use the querying user's permissions)
CREATE VIEW public.contribution_analytics AS
SELECT 
  p.user_id,
  p.full_name,
  p.graduation_year,
  p.course,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' THEN c.value_amount ELSE 0 END), 0) as total_monetary,
  COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' THEN c.value_amount ELSE 0 END), 0) as total_non_monetary,
  COALESCE(SUM(c.value_amount), 0) as total_contribution_value,
  COUNT(c.id) as total_contributions,
  COUNT(CASE WHEN c.contribution_type = 'monetary' THEN 1 END) as monetary_contributions,
  COUNT(CASE WHEN c.contribution_type = 'non_monetary' THEN 1 END) as non_monetary_contributions
FROM public.profiles p
LEFT JOIN public.contributions c ON p.user_id = c.user_id
WHERE p.is_verified = true
GROUP BY p.user_id, p.full_name, p.graduation_year, p.course
ORDER BY total_contribution_value DESC;

-- Add RLS policy for the analytics view (admins only)
ALTER VIEW public.contribution_analytics SET (security_invoker = true);

-- Create RLS policy for admins to access contribution analytics
CREATE POLICY "Admins can view contribution analytics" 
ON public.profiles
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));