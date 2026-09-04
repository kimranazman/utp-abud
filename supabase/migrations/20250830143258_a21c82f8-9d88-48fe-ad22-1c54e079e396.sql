-- Fix Security Definer View issue
-- The contribution_analytics view needs to be recreated without SECURITY DEFINER
-- Drop the existing view first
DROP VIEW IF EXISTS public.contribution_analytics;

-- Recreate the view without SECURITY DEFINER to fix the security issue
CREATE VIEW public.contribution_analytics AS
SELECT 
    p.user_id,
    p.full_name,
    p.course,
    p.graduation_year,
    -- Public totals (only non-private contributions)
    COALESCE(SUM(CASE WHEN c.value_private = false AND c.contribution_type = 'monetary' THEN c.value_amount ELSE 0 END), 0) as total_monetary_public,
    COALESCE(SUM(CASE WHEN c.value_private = false AND c.contribution_type = 'non_monetary' THEN c.value_amount ELSE 0 END), 0) as total_non_monetary_public,
    COALESCE(SUM(CASE WHEN c.value_private = false THEN c.value_amount ELSE 0 END), 0) as total_contribution_value_public,
    -- All totals (including private, but only visible to admins via RLS)
    COALESCE(SUM(CASE WHEN c.contribution_type = 'monetary' THEN c.value_amount ELSE 0 END), 0) as total_monetary_all,
    COALESCE(SUM(CASE WHEN c.contribution_type = 'non_monetary' THEN c.value_amount ELSE 0 END), 0) as total_non_monetary_all,
    COALESCE(SUM(c.value_amount), 0) as total_contribution_value_all,
    -- Contribution counts
    COUNT(c.id) as total_contributions,
    COUNT(CASE WHEN c.contribution_type = 'monetary' THEN 1 END) as monetary_contributions,
    COUNT(CASE WHEN c.contribution_type = 'non_monetary' THEN 1 END) as non_monetary_contributions
FROM profiles p
LEFT JOIN contributions c ON p.user_id = c.user_id
WHERE p.profile_visibility IN ('public', 'alumni_only')
GROUP BY p.user_id, p.full_name, p.course, p.graduation_year;

-- Enable RLS on the view
ALTER VIEW public.contribution_analytics SET (security_barrier = true);

-- Add RLS policies for the view
CREATE POLICY "Admins can view all contribution analytics" ON contribution_analytics
    FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Authenticated users can view public analytics" ON contribution_analytics 
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        (user_id = auth.uid() OR total_contribution_value_public > 0)
    );