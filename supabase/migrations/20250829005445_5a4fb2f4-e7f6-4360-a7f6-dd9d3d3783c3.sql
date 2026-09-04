-- Add contribution type and value fields to contributions table
ALTER TABLE public.contributions 
ADD COLUMN contribution_type TEXT CHECK (contribution_type IN ('monetary', 'non_monetary')) DEFAULT 'non_monetary',
ADD COLUMN value_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN currency TEXT DEFAULT 'USD';

-- Create index for better performance on contribution queries
CREATE INDEX idx_contributions_type_value ON public.contributions(contribution_type, value_amount);
CREATE INDEX idx_contributions_user_value ON public.contributions(user_id, value_amount);

-- Create a view for contribution analytics
CREATE OR REPLACE VIEW public.contribution_analytics AS
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

-- Grant access to the analytics view
GRANT SELECT ON public.contribution_analytics TO authenticated;