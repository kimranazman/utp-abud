-- Add comprehensive seed data with correct lowercase values
-- Add education data with correct programme_level values
INSERT INTO public.user_education (
  user_id, programme_level, programme_name, graduation_year, is_primary
) 
SELECT 
  p.user_id,
  CASE 
    WHEN p.course LIKE 'Master%' THEN 'postgraduate'
    WHEN p.course LIKE 'Bachelor%' THEN 'undergraduate'
    ELSE 'undergraduate'
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
 'Managed regional marketing campaigns for Google Ads and Analytics products across 8 countries.'),

-- Marcus Johnson - Software Engineer  
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'TechFlow Solutions', 'Co-founder & CTO', '2022-01-01', NULL, true, 'Austin, Texas, USA',
 'Co-founded B2B SaaS platform for supply chain optimization. Leading engineering team of 12 developers.'),
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'Atlassian', 'Senior Software Engineer', '2020-08-01', '2021-12-31', false, 'Austin, Texas, USA',
 'Developed microservices architecture for Jira and Confluence products. Improved system performance by 40%.'),

-- Roberto Silva - Renewable Energy Engineer
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Energia Verde Ltda', 'Founder & CEO', '2020-01-01', NULL, true, 'São Paulo, Brazil',
 'Founded renewable energy company. Deployed 500MW of solar capacity across Latin America.'),
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Petrobras', 'Renewable Energy Engineer', '2018-08-01', '2019-12-31', false, 'Rio de Janeiro, Brazil',
 'Led transition strategy from fossil fuels to renewable energy. Managed $100M wind power projects.');