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

-- Add achievements for seed users
INSERT INTO public.achievements (
  user_id, title, organization, description, date_achieved
) VALUES 
-- Sarah Chen achievements
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Top 40 Under 40 Marketing Leaders', 'Marketing Association of Singapore', 
 'Recognized for outstanding contribution to digital marketing innovation in Southeast Asia', '2023-06-15'),
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Google Partner Premier Award', 'Google', 
 'Achieved highest tier Google Partner status for exceptional campaign performance', '2022-12-01'),

-- Marcus Johnson achievements
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'Austin Tech Entrepreneur of the Year', 'Austin Chamber of Commerce', 
 'Recognized for building innovative B2B SaaS platform with significant market impact', '2023-09-20'),
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'AWS Advanced Technical Partner', 'Amazon Web Services', 
 'Certified for architecting complex cloud infrastructure solutions', '2022-08-10'),

-- Roberto Silva achievements
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Green Energy Innovation Award', 'Brazilian Ministry of Energy', 
 'Recognized for pioneering solar energy deployment in rural communities', '2023-04-22'),
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Sustainable Business Leader', 'Latin America Clean Energy Council', 
 'Honored for outstanding contribution to renewable energy sector development', '2022-11-18');