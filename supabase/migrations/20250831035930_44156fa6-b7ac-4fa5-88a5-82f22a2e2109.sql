-- Migrate existing course data to user_education table
INSERT INTO public.user_education (user_id, programme_level, programme_name, graduation_year, is_primary)
SELECT 
  user_id,
  CASE 
    WHEN course ILIKE '%bachelor%' OR course ILIKE '%degree%' THEN 'undergraduate'
    ELSE 'postgraduate'
  END as programme_level,
  course as programme_name,
  graduation_year,
  true as is_primary
FROM public.profiles 
WHERE course IS NOT NULL 
AND course != '' 
AND graduation_year IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.user_education ue 
  WHERE ue.user_id = profiles.user_id
);