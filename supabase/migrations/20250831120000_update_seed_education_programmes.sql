-- Update seed data education to use correct UTP programme names

-- First, delete existing incorrect education data for seed users
DELETE FROM public.user_education 
WHERE user_id IN (
  '12345678-1234-1234-1234-123456789001',
  '12345678-1234-1234-1234-123456789002',
  '12345678-1234-1234-1234-123456789003',
  '12345678-1234-1234-1234-123456789004',
  '12345678-1234-1234-1234-123456789005',
  '12345678-1234-1234-1234-123456789006',
  '12345678-1234-1234-1234-123456789007',
  '12345678-1234-1234-1234-123456789008',
  '12345678-1234-1234-1234-123456789009',
  '12345678-1234-1234-1234-123456789010'
);

-- Insert corrected education data with proper UTP programme names
INSERT INTO public.user_education (user_id, programme_level, programme_name, graduation_year, is_primary) VALUES
-- Sarah Chen - Computer Science graduate
('12345678-1234-1234-1234-123456789001', 'undergraduate', 'Bachelor of Computer Science (Hons)', 2018, true),

-- Michael Okonkwo - Business graduate with MBA
('12345678-1234-1234-1234-123456789002', 'undergraduate', 'Bachelor in Business Management (Hons)', 2014, false),
('12345678-1234-1234-1234-123456789002', 'postgraduate', 'MBA in Energy Management', 2016, true),

-- Emma Rodriguez - Business Management graduate
('12345678-1234-1234-1234-123456789003', 'undergraduate', 'Bachelor in Business Management (Hons)', 2019, true),

-- David Kim - Computer Engineering graduate
('12345678-1234-1234-1234-123456789004', 'undergraduate', 'Bachelor of Computer Engineering with Honours', 2017, true),

-- Priya Sharma - IT undergrad with Data Science masters
('12345678-1234-1234-1234-123456789005', 'undergraduate', 'Bachelor of Information Technology (Hons)', 2018, false),
('12345678-1234-1234-1234-123456789005', 'postgraduate', 'MSc in Data Science (ODL)', 2020, true),

-- James Anderson - Business Management graduate
('12345678-1234-1234-1234-123456789006', 'undergraduate', 'Bachelor in Business Management (Hons)', 2015, true),

-- Maria Santos - Information Systems graduate (closest to Design)
('12345678-1234-1234-1234-123456789007', 'undergraduate', 'Bachelor of Information Systems (Hons)', 2018, true),

-- Alex Thompson - Chemical Engineering with Environmental focus
('12345678-1234-1234-1234-123456789008', 'undergraduate', 'Bachelor of Chemical Engineering with Honours', 2017, false),
('12345678-1234-1234-1234-123456789008', 'postgraduate', 'MSc in Industrial Environmental Engineering', 2019, true),

-- Fatima Hassan - Business undergrad with Management PhD
('12345678-1234-1234-1234-123456789009', 'undergraduate', 'Bachelor in Business Management (Hons)', 2012, false),
('12345678-1234-1234-1234-123456789009', 'postgraduate', 'PhD in Management', 2016, true),

-- Ryan Murphy - Business Management graduate (closest to Media Studies)
('12345678-1234-1234-1234-123456789010', 'undergraduate', 'Bachelor in Business Management (Hons)', 2021, true);

-- Also update the profiles table to reflect the primary programme
UPDATE public.profiles SET 
  course = 'Bachelor of Computer Science (Hons)',
  graduation_year = 2018
WHERE user_id = '12345678-1234-1234-1234-123456789001';

UPDATE public.profiles SET 
  course = 'MBA in Energy Management',
  graduation_year = 2016
WHERE user_id = '12345678-1234-1234-1234-123456789002';

UPDATE public.profiles SET 
  course = 'Bachelor in Business Management (Hons)',
  graduation_year = 2019
WHERE user_id = '12345678-1234-1234-1234-123456789003';

UPDATE public.profiles SET 
  course = 'Bachelor of Computer Engineering with Honours',
  graduation_year = 2017
WHERE user_id = '12345678-1234-1234-1234-123456789004';

UPDATE public.profiles SET 
  course = 'MSc in Data Science (ODL)',
  graduation_year = 2020
WHERE user_id = '12345678-1234-1234-1234-123456789005';

UPDATE public.profiles SET 
  course = 'Bachelor in Business Management (Hons)',
  graduation_year = 2015
WHERE user_id = '12345678-1234-1234-1234-123456789006';

UPDATE public.profiles SET 
  course = 'Bachelor of Information Systems (Hons)',
  graduation_year = 2018
WHERE user_id = '12345678-1234-1234-1234-123456789007';

UPDATE public.profiles SET 
  course = 'MSc in Industrial Environmental Engineering',
  graduation_year = 2019
WHERE user_id = '12345678-1234-1234-1234-123456789008';

UPDATE public.profiles SET 
  course = 'PhD in Management',
  graduation_year = 2016
WHERE user_id = '12345678-1234-1234-1234-123456789009';

UPDATE public.profiles SET 
  course = 'Bachelor in Business Management (Hons)',
  graduation_year = 2021
WHERE user_id = '12345678-1234-1234-1234-123456789010';