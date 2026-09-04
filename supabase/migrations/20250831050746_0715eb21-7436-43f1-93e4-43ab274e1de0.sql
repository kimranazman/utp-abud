-- Restore comprehensive seed data for the alumni network

-- First, let's insert sample profiles (keeping existing ones)
INSERT INTO public.profiles (user_id, email, full_name, course, graduation_year, bio, location, location_city, location_state, location_country, is_verified, profile_completed, profile_visibility, birthday) VALUES
('12345678-1234-1234-1234-123456789001', 'sarah.chen@example.com', 'Sarah Chen', 'Computer Science', 2018, 'Full-stack developer passionate about fintech and blockchain solutions. Love hiking and photography in my spare time.', 'san-francisco-ca', 'San Francisco', 'California', 'United States', true, true, 'public', '1996-03-15'),
('12345678-1234-1234-1234-123456789002', 'michael.okonkwo@example.com', 'Michael Okonkwo', 'Business Administration', 2016, 'Entrepreneur and business consultant specializing in African market expansion. Founded three successful startups.', 'lagos-nigeria', 'Lagos', '', 'Nigeria', true, true, 'alumni_only', '1994-07-22'),
('12345678-1234-1234-1234-123456789003', 'emma.rodriguez@example.com', 'Emma Rodriguez', 'Marketing', 2019, 'Digital marketing strategist helping brands tell their stories. Former agency exec, now freelance consultant.', 'barcelona-spain', 'Barcelona', '', 'Spain', true, true, 'public', '1997-11-08'),
('12345678-1234-1234-1234-123456789004', 'david.kim@example.com', 'David Kim', 'Engineering', 2017, 'Senior software engineer at a major tech company. Open source contributor and mentor to aspiring developers.', 'seoul-south-korea', 'Seoul', '', 'South Korea', true, true, 'alumni_only', '1995-01-30'),
('12345678-1234-1234-1234-123456789005', 'priya.sharma@example.com', 'Priya Sharma', 'Data Science', 2020, 'Data scientist working on AI/ML solutions for healthcare. PhD candidate researching predictive models for medical diagnostics.', 'mumbai-india', 'Mumbai', '', 'India', true, true, 'public', '1998-05-14'),
('12345678-1234-1234-1234-123456789006', 'james.anderson@example.com', 'James Anderson', 'Finance', 2015, 'Investment banker turned sustainable finance advocate. Helping startups secure green funding.', 'london-uk', 'London', '', 'United Kingdom', true, true, 'alumni_only', '1993-09-12'),
('12345678-1234-1234-1234-123456789007', 'maria.santos@example.com', 'Maria Santos', 'Design', 2018, 'UX/UI designer passionate about accessible design. Working on inclusive digital experiences for all users.', 'sao-paulo-brazil', 'São Paulo', '', 'Brazil', true, true, 'public', '1996-12-03'),
('12345678-1234-1234-1234-123456789008', 'alex.thompson@example.com', 'Alex Thompson', 'Environmental Science', 2019, 'Climate researcher and environmental consultant. Leading sustainability initiatives for major corporations.', 'vancouver-canada', 'Vancouver', 'British Columbia', 'Canada', true, true, 'alumni_only', '1997-04-18'),
('12345678-1234-1234-1234-123456789009', 'fatima.hassan@example.com', 'Fatima Hassan', 'International Relations', 2016, 'Diplomat and policy researcher focused on Middle East affairs. Working with international development organizations.', 'dubai-uae', 'Dubai', '', 'United Arab Emirates', true, true, 'public', '1994-08-25'),
('12345678-1234-1234-1234-123456789010', 'ryan.murphy@example.com', 'Ryan Murphy', 'Media Studies', 2021, 'Content creator and digital storyteller. Building educational content about technology and society.', 'dublin-ireland', 'Dublin', '', 'Ireland', true, true, 'alumni_only', '1999-02-10');

-- Insert user education data
INSERT INTO public.user_education (user_id, programme_level, programme_name, graduation_year, is_primary) VALUES
('12345678-1234-1234-1234-123456789001', 'Bachelor', 'Bachelor of Science in Computer Science', 2018, true),
('12345678-1234-1234-1234-123456789002', 'Master', 'Master of Business Administration', 2016, true),
('12345678-1234-1234-1234-123456789003', 'Bachelor', 'Bachelor of Arts in Marketing', 2019, true),
('12345678-1234-1234-1234-123456789004', 'Bachelor', 'Bachelor of Engineering', 2017, true),
('12345678-1234-1234-1234-123456789005', 'Master', 'Master of Science in Data Science', 2020, true),
('12345678-1234-1234-1234-123456789006', 'Bachelor', 'Bachelor of Science in Finance', 2015, true),
('12345678-1234-1234-1234-123456789007', 'Bachelor', 'Bachelor of Fine Arts in Design', 2018, true),
('12345678-1234-1234-1234-123456789008', 'Master', 'Master of Science in Environmental Science', 2019, true),
('12345678-1234-1234-1234-123456789009', 'Master', 'Master of Arts in International Relations', 2016, true),
('12345678-1234-1234-1234-123456789010', 'Bachelor', 'Bachelor of Arts in Media Studies', 2021, true);

-- Insert user businesses
INSERT INTO public.user_businesses (user_id, business_name, description, industry, position, ownership_type, location, website, current_business, start_date) VALUES
('12345678-1234-1234-1234-123456789001', 'TechFlow Solutions', 'Full-service software development company specializing in fintech applications', 'Technology', 'Co-Founder & CTO', 'Co-founder', 'San Francisco, CA', 'https://techflow.dev', true, '2020-01-15'),
('12345678-1234-1234-1234-123456789002', 'AfroVentures', 'Investment firm focused on African startups and emerging markets', 'Investment', 'Managing Partner', 'Founder', 'Lagos, Nigeria', 'https://afroventures.com', true, '2018-03-01'),
('12345678-1234-1234-1234-123456789003', 'Creative Catalyst Agency', 'Digital marketing agency helping brands scale through storytelling', 'Marketing', 'Creative Director', 'Founder', 'Barcelona, Spain', 'https://creativecatalyst.es', true, '2021-06-01'),
('12345678-1234-1234-1234-123456789004', 'DevMentor Platform', 'Online platform connecting experienced developers with newcomers', 'Education Technology', 'Founder & Lead Developer', 'Founder', 'Seoul, South Korea', 'https://devmentor.kr', true, '2019-09-01'),
('12345678-1234-1234-1234-123456789005', 'HealthPredict AI', 'AI-powered healthcare diagnostics and predictive analytics', 'Healthcare Technology', 'Chief Data Scientist', 'Co-founder', 'Mumbai, India', 'https://healthpredict.ai', true, '2022-01-01'),
('12345678-1234-1234-1234-123456789006', 'GreenCapital Partners', 'Sustainable investment firm focusing on clean energy and green tech', 'Finance', 'Investment Director', 'Partner', 'London, UK', 'https://greencapital.co.uk', true, '2017-05-01'),
('12345678-1234-1234-1234-123456789007', 'Inclusive Design Studio', 'Design consultancy specializing in accessibility and inclusive experiences', 'Design', 'Principal Designer', 'Founder', 'São Paulo, Brazil', 'https://inclusivedesign.com.br', true, '2020-08-01'),
('12345678-1234-1234-1234-123456789008', 'EcoConsult Global', 'Environmental consulting firm helping corporations achieve sustainability goals', 'Environmental Consulting', 'Senior Consultant', 'Co-founder', 'Vancouver, Canada', 'https://ecoconsult.ca', true, '2021-02-01'),
('12345678-1234-1234-1234-123456789009', 'Bridge Diplomacy', 'International relations consultancy specializing in Middle East policy', 'Consulting', 'Managing Director', 'Founder', 'Dubai, UAE', 'https://bridgediplomacy.ae', true, '2019-04-01'),
('12345678-1234-1234-1234-123456789010', 'StoryTech Media', 'Digital content production focused on technology education and awareness', 'Media', 'Content Director', 'Founder', 'Dublin, Ireland', 'https://storytech.ie', true, '2022-07-01');

-- Insert career history
INSERT INTO public.career_history (user_id, company_name, position, description, location, start_date, end_date, current_position) VALUES
('12345678-1234-1234-1234-123456789001', 'Meta', 'Senior Software Engineer', 'Led development of payment processing systems for Meta Pay', 'Menlo Park, CA', '2018-06-01', '2019-12-31', false),
('12345678-1234-1234-1234-123456789002', 'McKinsey & Company', 'Business Analyst', 'Conducted market research and strategy consulting for Fortune 500 companies', 'Lagos, Nigeria', '2016-08-01', '2018-02-28', false),
('12345678-1234-1234-1234-123456789003', 'Ogilvy Barcelona', 'Account Manager', 'Managed digital campaigns for major European brands', 'Barcelona, Spain', '2019-09-01', '2021-05-31', false),
('12345678-1234-1234-1234-123456789004', 'Samsung Electronics', 'Software Developer', 'Developed mobile applications and IoT solutions', 'Seoul, South Korea', '2017-07-01', '2019-08-31', false),
('12345678-1234-1234-1234-123456789005', 'Tata Consultancy Services', 'Data Analyst', 'Built predictive models for financial services clients', 'Mumbai, India', '2020-09-01', '2021-12-31', false);

-- Insert achievements
INSERT INTO public.achievements (user_id, title, description, organization, date_achieved) VALUES
('12345678-1234-1234-1234-123456789001', 'Forbes 30 Under 30', 'Recognized for innovation in fintech software development', 'Forbes', '2022-01-15'),
('12345678-1234-1234-1234-123456789002', 'Young African Entrepreneur Award', 'Outstanding contribution to African startup ecosystem', 'African Development Bank', '2020-11-20'),
('12345678-1234-1234-1234-123456789003', 'Cannes Lions Bronze', 'Creative excellence in digital marketing campaign', 'Cannes Lions', '2022-06-25'),
('12345678-1234-1234-1234-123456789004', 'Google Developer Expert', 'Recognition for contributions to Android development community', 'Google', '2021-03-10'),
('12345678-1234-1234-1234-123456789005', 'Women in AI Leadership Award', 'Advancing AI research in healthcare applications', 'Women in AI', '2023-03-08');

-- Insert contributions
INSERT INTO public.contributions (user_id, organization_name, role, description, contribution_type, value_amount, currency, start_date, end_date, current_contribution, value_private) VALUES
('12345678-1234-1234-1234-123456789001', 'Code.org', 'Volunteer Instructor', 'Teaching programming to underserved youth', 'non_monetary', 0, 'USD', '2020-01-01', NULL, true, false),
('12345678-1234-1234-1234-123456789002', 'African Education Foundation', 'Board Member', 'Strategic oversight and fundraising for educational initiatives', 'monetary', 50000, 'USD', '2019-01-01', NULL, true, true),
('12345678-1234-1234-1234-123456789003', 'Médecins Sans Frontières', 'Pro Bono Marketing', 'Digital marketing campaigns for humanitarian causes', 'non_monetary', 25000, 'EUR', '2021-01-01', NULL, true, false),
('12345678-1234-1234-1234-123456789004', 'Korean Red Cross', 'Disaster Relief Volunteer', 'Emergency response and technology support', 'non_monetary', 0, 'KRW', '2018-01-01', NULL, true, false),
('12345678-1234-1234-1234-123456789005', 'Girls Who Code India', 'Mentor', 'Mentoring young women entering tech careers', 'non_monetary', 0, 'INR', '2021-01-01', NULL, true, false);

-- Insert user links
INSERT INTO public.user_links (user_id, platform, url, display_text) VALUES
('12345678-1234-1234-1234-123456789001', 'LinkedIn', 'https://linkedin.com/in/sarahchen', 'Sarah Chen'),
('12345678-1234-1234-1234-123456789001', 'GitHub', 'https://github.com/sarahchen', 'sarahchen'),
('12345678-1234-1234-1234-123456789002', 'LinkedIn', 'https://linkedin.com/in/michaelokonkwo', 'Michael Okonkwo'),
('12345678-1234-1234-1234-123456789002', 'Twitter', 'https://twitter.com/michaelokonkwo', '@michaelokonkwo'),
('12345678-1234-1234-1234-123456789003', 'LinkedIn', 'https://linkedin.com/in/emmarodriguez', 'Emma Rodriguez'),
('12345678-1234-1234-1234-123456789003', 'Instagram', 'https://instagram.com/emma.creative', '@emma.creative'),
('12345678-1234-1234-1234-123456789004', 'LinkedIn', 'https://linkedin.com/in/davidkim', 'David Kim'),
('12345678-1234-1234-1234-123456789004', 'GitHub', 'https://github.com/davidkim', 'davidkim'),
('12345678-1234-1234-1234-123456789005', 'LinkedIn', 'https://linkedin.com/in/priyasharma', 'Priya Sharma'),
('12345678-1234-1234-1234-123456789005', 'Research Gate', 'https://researchgate.net/profile/priya-sharma', 'Priya Sharma');

-- Insert user roles (alumni role for all, admin for some)
INSERT INTO public.user_roles (user_id, role) VALUES
('12345678-1234-1234-1234-123456789001', 'alumni'),
('12345678-1234-1234-1234-123456789002', 'alumni'),
('12345678-1234-1234-1234-123456789003', 'alumni'),
('12345678-1234-1234-1234-123456789004', 'alumni'),
('12345678-1234-1234-1234-123456789005', 'alumni'),
('12345678-1234-1234-1234-123456789006', 'alumni'),
('12345678-1234-1234-1234-123456789007', 'alumni'),
('12345678-1234-1234-1234-123456789008', 'alumni'),
('12345678-1234-1234-1234-123456789009', 'alumni'),
('12345678-1234-1234-1234-123456789010', 'alumni');

-- Create some conversations
INSERT INTO public.conversations (id, title, is_group, created_at, updated_at, last_message_at) VALUES
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', 'Fintech Collaboration', false, '2025-08-29 10:00:00', '2025-08-29 15:30:00', '2025-08-29 15:30:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', 'Alumni Startup Network', true, '2025-08-28 14:00:00', '2025-08-30 09:15:00', '2025-08-30 09:15:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e3', 'Sustainability Projects', false, '2025-08-27 16:00:00', '2025-08-30 11:20:00', '2025-08-30 11:20:00');

-- Add conversation participants
INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at, last_read_at) VALUES
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', '12345678-1234-1234-1234-123456789001', '2025-08-29 10:00:00', '2025-08-29 15:30:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', '12345678-1234-1234-1234-123456789002', '2025-08-29 10:00:00', '2025-08-29 15:25:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789001', '2025-08-28 14:00:00', '2025-08-30 09:15:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789002', '2025-08-28 14:00:00', '2025-08-30 09:10:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789004', '2025-08-28 14:00:00', '2025-08-30 09:00:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e3', '12345678-1234-1234-1234-123456789006', '2025-08-27 16:00:00', '2025-08-30 11:20:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e3', '12345678-1234-1234-1234-123456789008', '2025-08-27 16:00:00', '2025-08-30 11:15:00');

-- Add some messages
INSERT INTO public.messages (conversation_id, sender_id, content, message_type, created_at) VALUES
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', '12345678-1234-1234-1234-123456789001', 'Hi Michael! I saw your AfroVentures portfolio and I''m really impressed. I''d love to discuss potential collaboration opportunities between our fintech solutions and African markets.', 'text', '2025-08-29 10:05:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', '12345678-1234-1234-1234-123456789002', 'Sarah! Great to hear from you. I''ve been following TechFlow''s progress - your payment processing innovations could be exactly what we need for our portfolio companies. Let''s set up a call next week?', 'text', '2025-08-29 12:30:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e1', '12345678-1234-1234-1234-123456789001', 'Absolutely! I''m free Tuesday or Thursday afternoon. We''re particularly interested in mobile money integration and cross-border payments.', 'text', '2025-08-29 15:30:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789004', 'Hey everyone! I''m organizing a virtual meetup for alumni working on developer tools and platforms. Anyone interested in presenting or participating?', 'text', '2025-08-28 16:00:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789001', 'Count me in! DevMentor sounds like a great complement to what we''re building at TechFlow. Would love to share our developer onboarding insights.', 'text', '2025-08-29 08:15:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e2', '12345678-1234-1234-1234-123456789002', 'This could be valuable for our portfolio companies too. Many of them struggle with technical talent acquisition. Let me know the details!', 'text', '2025-08-30 09:15:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e3', '12345678-1234-1234-1234-123456789006', 'Alex, I''ve been thinking about the green tech accelerator program we discussed. GreenCapital is definitely interested in co-sponsoring. Your environmental impact assessment methodology could be game-changing.', 'text', '2025-08-27 18:30:00'),
('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e3', '12345678-1234-1234-1234-123456789008', 'James, that''s fantastic news! I''ve been refining the assessment framework and would love your input on the financial viability metrics. Should we schedule a deep dive session?', 'text', '2025-08-30 11:20:00');