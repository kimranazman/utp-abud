-- Fix programme_level values and add comprehensive seed data
-- Add education data for seed users with correct values
INSERT INTO public.user_education (
  user_id, programme_level, programme_name, graduation_year, is_primary
) 
SELECT 
  p.user_id,
  CASE 
    WHEN p.course LIKE 'Master%' THEN 'Master''s Degree'
    WHEN p.course LIKE 'Bachelor%' THEN 'Bachelor''s Degree'
    ELSE 'Bachelor''s Degree'
  END as programme_level,
  p.course as programme_name,
  p.graduation_year,
  true as is_primary
FROM public.profiles p 
WHERE p.is_seed_data = true;

-- Add career history for seed users
INSERT INTO public.career_history (
  user_id, company_name, position, start_date, end_date, current_position, location, description
) VALUES 
-- Sarah Chen - Marketing Professional
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'McKinsey & Company', 'Senior Marketing Consultant', '2021-03-01', NULL, true, 'Singapore',
 'Leading digital transformation initiatives for Southeast Asian clients, developing go-to-market strategies for tech startups.'),
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Google Asia Pacific', 'Marketing Manager', '2019-06-01', '2021-02-28', false, 'Singapore',
 'Managed regional marketing campaigns for Google Ads and Analytics products across 8 countries.');

-- Add user businesses for seed users
INSERT INTO public.user_businesses (
  user_id, business_name, position, description, industry, website, location, 
  current_business, start_date, ownership_type
) VALUES 
-- Sarah Chen's Consulting Business
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Chen Marketing Consultancy', 'Founder & Managing Director', 
 'Digital marketing strategy consultancy specializing in Southeast Asian market entry and growth acceleration for B2B SaaS companies.',
 'Management Consulting', 'https://chenmarketing.sg', 'Singapore', 
 true, '2023-01-01', 'Sole Proprietor'),

-- Marcus Johnson's Tech Startup
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'TechFlow Solutions', 'Co-founder & CTO', 
 'B2B SaaS platform for supply chain optimization using AI and machine learning. Serving Fortune 500 clients.',
 'Software Development', 'https://techflowsolutions.com', 'Austin, Texas, USA', 
 true, '2022-01-01', 'Co-founder'),

-- Roberto Silva's Energy Company
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Energia Verde Ltda', 'Founder & CEO', 
 'Renewable energy development and installation company. Deployed over 500MW of solar capacity across Latin America.',
 'Renewable Energy', 'https://energiaverde.com.br', 'São Paulo, Brazil', 
 true, '2020-01-01', 'Founder');