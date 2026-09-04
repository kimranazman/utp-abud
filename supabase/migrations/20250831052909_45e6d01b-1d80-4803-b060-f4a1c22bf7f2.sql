-- Create some sample businesses and activities for existing users
-- Get the real user IDs first, then create sample data

-- Insert businesses for existing verified users
INSERT INTO public.user_businesses (user_id, business_name, description, industry, position, ownership_type, location, website, current_business, start_date) 
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Investment Analytics Pro'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'AI Solutions Hub'
  END as business_name,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Advanced analytics platform for investment decision-making'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Artificial intelligence consulting and solutions for businesses'
  END as description,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'FinTech'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Technology'
  END as industry,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Founder & CEO'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Managing Director'
  END as position,
  'Founder' as ownership_type,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Singapore'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Kuala Lumpur, Malaysia'
  END as location,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'https://investment-analytics.com'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'https://aisolutionshub.com'
  END as website,
  true as current_business,
  CASE 
    WHEN full_name = 'Si Apps' THEN '2022-01-01'::date
    WHEN full_name = 'Khairul Imran bin Azman' THEN '2021-08-01'::date
  END as start_date
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
AND NOT EXISTS (
  SELECT 1 FROM user_businesses ub 
  WHERE ub.user_id = profiles.user_id 
  AND ub.business_name IN ('Investment Analytics Pro', 'AI Solutions Hub')
);

-- Insert education data for existing users
INSERT INTO public.user_education (user_id, programme_level, programme_name, graduation_year, is_primary)
SELECT 
  user_id,
  'undergraduate' as programme_level,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Bachelor of Science in Computer Science'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Bachelor of Engineering in Software Engineering'
  END as programme_name,
  CASE 
    WHEN full_name = 'Si Apps' THEN 2020
    WHEN full_name = 'Khairul Imran bin Azman' THEN 2018
  END as graduation_year,
  true as is_primary
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
AND NOT EXISTS (
  SELECT 1 FROM user_education ue 
  WHERE ue.user_id = profiles.user_id
);

-- Insert achievements for existing users
INSERT INTO public.achievements (user_id, title, description, organization, date_achieved)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Young Innovator Award'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Tech Leadership Excellence'
  END as title,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Recognition for innovative fintech solutions'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Outstanding leadership in AI technology development'
  END as description,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Singapore Tech Awards'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Malaysia Digital Innovation Awards'
  END as organization,
  CASE 
    WHEN full_name = 'Si Apps' THEN '2023-06-15'::date
    WHEN full_name = 'Khairul Imran bin Azman' THEN '2022-11-20'::date
  END as date_achieved
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
AND NOT EXISTS (
  SELECT 1 FROM achievements a 
  WHERE a.user_id = profiles.user_id
);

-- Insert some career history
INSERT INTO public.career_history (user_id, company_name, position, description, location, start_date, end_date, current_position)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'TechCorp Singapore'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Malaysia Tech Solutions'
  END as company_name,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Senior Software Engineer'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'AI Research Lead'
  END as position,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Led development of financial analytics platforms'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Spearheaded AI research and development initiatives'
  END as description,
  CASE 
    WHEN full_name = 'Si Apps' THEN 'Singapore'
    WHEN full_name = 'Khairul Imran bin Azman' THEN 'Kuala Lumpur, Malaysia'
  END as location,
  CASE 
    WHEN full_name = 'Si Apps' THEN '2020-06-01'::date
    WHEN full_name = 'Khairul Imran bin Azman' THEN '2018-09-01'::date
  END as start_date,
  CASE 
    WHEN full_name = 'Si Apps' THEN '2021-12-31'::date
    WHEN full_name = 'Khairul Imran bin Azman' THEN '2021-07-31'::date
  END as end_date,
  false as current_position
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
AND NOT EXISTS (
  SELECT 1 FROM career_history ch 
  WHERE ch.user_id = profiles.user_id
);

-- Insert user links
INSERT INTO public.user_links (user_id, platform, url, display_text)
SELECT user_id, 'LinkedIn', 'https://linkedin.com/in/' || LOWER(REPLACE(full_name, ' ', '')), full_name
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
AND NOT EXISTS (
  SELECT 1 FROM user_links ul 
  WHERE ul.user_id = profiles.user_id AND ul.platform = 'LinkedIn'
);

-- Create a sample conversation between the existing users
INSERT INTO public.conversations (id, title, is_group, created_at, updated_at, last_message_at) 
VALUES 
('conv-001-sample-chat', 'Alumni Collaboration', false, '2025-08-29 10:00:00', '2025-08-29 15:30:00', '2025-08-29 15:30:00')
ON CONFLICT (id) DO NOTHING;

-- Add conversation participants (both existing users)
INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at, last_read_at)
SELECT 'conv-001-sample-chat', user_id, '2025-08-29 10:00:00', '2025-08-29 15:30:00'
FROM profiles 
WHERE full_name IN ('Si Apps', 'Khairul Imran bin Azman')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Add some sample messages
INSERT INTO public.messages (conversation_id, sender_id, content, message_type, created_at)
SELECT 
  'conv-001-sample-chat',
  (SELECT user_id FROM profiles WHERE full_name = 'Si Apps' LIMIT 1),
  'Hi Khairul! I noticed we both work in the tech space. Would love to explore potential collaboration opportunities between our companies.',
  'text',
  '2025-08-29 10:05:00'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 'conv-001-sample-chat'
);

INSERT INTO public.messages (conversation_id, sender_id, content, message_type, created_at)
SELECT 
  'conv-001-sample-chat',
  (SELECT user_id FROM profiles WHERE full_name = 'Khairul Imran bin Azman' LIMIT 1),
  'Absolutely! AI Solutions Hub is always interested in fintech partnerships. Your analytics platform could complement our AI capabilities perfectly.',
  'text',
  '2025-08-29 12:30:00'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 'conv-001-sample-chat' AND content LIKE 'Absolutely!%'
);

INSERT INTO public.messages (conversation_id, sender_id, content, message_type, created_at)
SELECT 
  'conv-001-sample-chat',
  (SELECT user_id FROM profiles WHERE full_name = 'Si Apps' LIMIT 1),
  'Great! Let''s set up a call next week to discuss this further. I think there''s real potential for a strategic partnership here.',
  'text',
  '2025-08-29 15:30:00'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 'conv-001-sample-chat' AND content LIKE 'Great! Let''s set up%'
);