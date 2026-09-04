-- First, let's clean up orphaned profile records and then migrate existing data
-- Delete profile records that reference non-existent users
DELETE FROM public.profiles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- Now migrate existing course data to user_education table (only for valid users)
INSERT INTO public.user_education (user_id, programme_level, programme_name, graduation_year, is_primary)
SELECT 
  p.user_id,
  CASE 
    WHEN p.course ILIKE '%bachelor%' OR p.course ILIKE '%degree%' THEN 'undergraduate'
    ELSE 'postgraduate'
  END as programme_level,
  p.course as programme_name,
  p.graduation_year,
  true as is_primary
FROM public.profiles p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE p.course IS NOT NULL 
AND p.course != '' 
AND p.graduation_year IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.user_education ue 
  WHERE ue.user_id = p.user_id
);