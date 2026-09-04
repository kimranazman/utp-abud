-- Add comprehensive seed data for education, career, businesses, and achievements
-- First, let's add proper education data based on UTP structure

-- Add education data for seed users
INSERT INTO public.user_education (
  user_id, programme_level, programme_name, graduation_year, is_primary
) 
SELECT 
  p.user_id,
  CASE 
    WHEN p.course LIKE 'Master%' THEN 'Masters'
    WHEN p.course LIKE 'Bachelor%' THEN 'Bachelors'
    ELSE 'Bachelors'
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

-- Priya Sharma - Finance Expert
((SELECT user_id FROM profiles WHERE email = 'priya.sharma.demo@email.com' LIMIT 1), 
 'Goldman Sachs', 'Vice President - Investment Banking', '2022-01-01', NULL, true, 'Mumbai, India',
 'Leading M&A deals in renewable energy sector across Asia Pacific. Closed $2.5B in transactions.'),
((SELECT user_id FROM profiles WHERE email = 'priya.sharma.demo@email.com' LIMIT 1), 
 'J.P. Morgan', 'Associate Director', '2019-07-01', '2021-12-31', false, 'Mumbai, India',
 'Structured financing solutions for infrastructure projects. Managed portfolio worth $800M.'),

-- Dr. Ahmed Hassan - Healthcare Professional
((SELECT user_id FROM profiles WHERE email = 'ahmed.hassan.demo@email.com' LIMIT 1), 
 'Dubai Health Authority', 'Director of Digital Health', '2020-03-01', NULL, true, 'Dubai, UAE',
 'Spearheading UAE''s digital health transformation. Implemented AI-powered diagnostic systems across 15 hospitals.'),
((SELECT user_id FROM profiles WHERE email = 'ahmed.hassan.demo@email.com' LIMIT 1), 
 'WHO Regional Office', 'Public Health Specialist', '2017-09-01', '2020-02-29', false, 'Cairo, Egypt',
 'Coordinated regional health surveillance programs. Led COVID-19 response strategy development.'),

-- Elena Rodriguez - Creative Director
((SELECT user_id FROM profiles WHERE email = 'elena.rodriguez.demo@email.com' LIMIT 1), 
 'BBDO Barcelona', 'Executive Creative Director', '2023-01-01', NULL, true, 'Barcelona, Spain',
 'Leading creative campaigns for global brands including Pepsi, Mercedes-Benz. Won 3 Cannes Lions awards.'),
((SELECT user_id FROM profiles WHERE email = 'elena.rodriguez.demo@email.com' LIMIT 1), 
 'Publicis Groupe', 'Senior Art Director', '2021-06-01', '2022-12-31', false, 'Barcelona, Spain',
 'Created award-winning campaigns for sustainable fashion brands. Specialized in environmental storytelling.'),

-- James Wilson - Environmental Consultant
((SELECT user_id FROM profiles WHERE email = 'james.wilson.demo@email.com' LIMIT 1), 
 'EY Climate Change & Sustainability', 'Senior Manager', '2021-05-01', NULL, true, 'Vancouver, Canada',
 'Leading ESG consulting for Fortune 500 companies. Helped clients reduce carbon footprint by 30% on average.'),
((SELECT user_id FROM profiles WHERE email = 'james.wilson.demo@email.com' LIMIT 1), 
 'Environment and Climate Change Canada', 'Policy Analyst', '2019-03-01', '2021-04-30', false, 'Vancouver, Canada',
 'Developed federal climate policies. Contributed to Canada''s Net Zero by 2050 strategy.'),

-- Lisa Kim - Data Scientist
((SELECT user_id FROM profiles WHERE email = 'lisa.kim.demo@email.com' LIMIT 1), 
 'Samsung Research', 'Principal Data Scientist', '2022-06-01', NULL, true, 'Seoul, South Korea',
 'Leading AI research for next-generation mobile devices. Published 15 papers on machine learning optimization.'),
((SELECT user_id FROM profiles WHERE email = 'lisa.kim.demo@email.com' LIMIT 1), 
 'Naver Corporation', 'Senior Data Scientist', '2020-09-01', '2022-05-31', false, 'Seoul, South Korea',
 'Built recommendation engines for Naver Search and Shopping. Improved click-through rates by 25%.'),

-- Roberto Silva - Renewable Energy Engineer
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Energia Verde Ltda', 'Founder & CEO', '2020-01-01', NULL, true, 'São Paulo, Brazil',
 'Founded renewable energy company. Deployed 500MW of solar capacity across Latin America.'),
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Petrobras', 'Renewable Energy Engineer', '2018-08-01', '2019-12-31', false, 'Rio de Janeiro, Brazil',
 'Led transition strategy from fossil fuels to renewable energy. Managed $100M wind power projects.');