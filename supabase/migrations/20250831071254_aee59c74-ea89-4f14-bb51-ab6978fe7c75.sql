-- Add social media links for seed users
INSERT INTO public.user_links (
  user_id, platform, url, display_text
) VALUES 
-- Sarah Chen links
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/sarah-chen-marketing', 'LinkedIn Profile'),
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Website', 'https://chenmarketing.sg', 'Chen Marketing Consultancy'),
((SELECT user_id FROM profiles WHERE email = 'sarah.chen.demo@email.com' LIMIT 1), 
 'Twitter', 'https://twitter.com/sarahchen_mktg', '@sarahchen_mktg'),

-- Marcus Johnson links
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/marcus-johnson-dev', 'LinkedIn Profile'),
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'GitHub', 'https://github.com/marcusjdev', 'GitHub Portfolio'),
((SELECT user_id FROM profiles WHERE email = 'marcus.j.demo@email.com' LIMIT 1), 
 'Website', 'https://techflowsolutions.com', 'TechFlow Solutions'),

-- Roberto Silva links
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/roberto-silva-energia', 'LinkedIn Profile'),
((SELECT user_id FROM profiles WHERE email = 'roberto.silva.demo@email.com' LIMIT 1), 
 'Website', 'https://energiaverde.com.br', 'Energia Verde'),

-- Priya Sharma links  
((SELECT user_id FROM profiles WHERE email = 'priya.sharma.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/priya-sharma-finance', 'LinkedIn Profile'),

-- Dr. Ahmed Hassan links
((SELECT user_id FROM profiles WHERE email = 'ahmed.hassan.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/dr-ahmed-hassan-health', 'LinkedIn Profile'),

-- Elena Rodriguez links
((SELECT user_id FROM profiles WHERE email = 'elena.rodriguez.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/elena-rodriguez-creative', 'LinkedIn Profile'),
((SELECT user_id FROM profiles WHERE email = 'elena.rodriguez.demo@email.com' LIMIT 1), 
 'Instagram', 'https://instagram.com/elenadesigns', 'Creative Portfolio'),

-- James Wilson links
((SELECT user_id FROM profiles WHERE email = 'james.wilson.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/james-wilson-sustainability', 'LinkedIn Profile'),

-- Lisa Kim links
((SELECT user_id FROM profiles WHERE email = 'lisa.kim.demo@email.com' LIMIT 1), 
 'LinkedIn', 'https://linkedin.com/in/lisa-kim-datascience', 'LinkedIn Profile'),
((SELECT user_id FROM profiles WHERE email = 'lisa.kim.demo@email.com' LIMIT 1), 
 'GitHub', 'https://github.com/lisakim-ai', 'Research Publications');