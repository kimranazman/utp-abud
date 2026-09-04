-- Create seed alumni profiles with related data
-- Generate 15 diverse alumni profiles
INSERT INTO profiles (user_id, email, full_name, graduation_year, course, birthday, bio, profile_visibility, is_verified, profile_completed, tags) VALUES
  (gen_random_uuid(), 'sarah.chen@email.com', 'Sarah Chen', 2019, 'Computer Science', '1997-03-15', 'Software engineer passionate about AI and machine learning. Currently working on innovative solutions in the fintech space.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'ahmed.hassan@email.com', 'Ahmed Hassan', 2020, 'Mechanical Engineering', '1998-07-22', 'Mechanical engineer specializing in renewable energy systems. Leading sustainable technology initiatives.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'maria.rodriguez@email.com', 'Maria Rodriguez', 2018, 'Business Administration', '1996-11-08', 'Marketing executive with expertise in digital transformation and brand strategy.', 'public', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'james.wilson@email.com', 'James Wilson', 2021, 'Chemical Engineering', '1999-01-12', 'Process engineer working in pharmaceuticals, focused on drug development and manufacturing optimization.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'priya.sharma@email.com', 'Priya Sharma', 2017, 'Electrical Engineering', '1995-05-30', 'Electronics design engineer specializing in IoT devices and smart home technology.', 'public', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'david.kim@email.com', 'David Kim', 2022, 'Data Science', '2000-09-18', 'Data scientist at a leading tech company, working on predictive analytics and recommendation systems.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'lisa.thompson@email.com', 'Lisa Thompson', 2016, 'Civil Engineering', '1994-12-03', 'Structural engineer working on sustainable infrastructure projects and green building design.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'michael.brown@email.com', 'Michael Brown', 2019, 'Finance', '1997-04-25', 'Investment banker specializing in mergers and acquisitions. Passionate about emerging markets.', 'public', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'aisha.johnson@email.com', 'Aisha Johnson', 2020, 'Biomedical Engineering', '1998-08-14', 'Biomedical researcher developing medical devices for diagnostic applications.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'carlos.garcia@email.com', 'Carlos Garcia', 2018, 'Information Technology', '1996-02-07', 'IT consultant helping organizations with digital transformation and cybersecurity solutions.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'emily.davis@email.com', 'Emily Davis', 2021, 'Environmental Science', '1999-10-11', 'Environmental consultant working on climate change mitigation and sustainability projects.', 'public', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'ryan.lee@email.com', 'Ryan Lee', 2017, 'Aerospace Engineering', '1995-06-19', 'Aerospace engineer working on satellite technology and space exploration missions.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'fatima.ali@email.com', 'Fatima Ali', 2022, 'Architecture', '2000-12-28', 'Architect specializing in sustainable design and urban planning for smart cities.', 'alumni_only', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'thomas.anderson@email.com', 'Thomas Anderson', 2019, 'Psychology', '1997-11-16', 'Clinical psychologist and researcher focusing on mental health technology and digital therapy solutions.', 'public', true, true, ARRAY['seed-accounts']),
  (gen_random_uuid(), 'nina.patel@email.com', 'Nina Patel', 2020, 'International Relations', '1998-03-09', 'Diplomat and policy analyst working on international trade agreements and economic development.', 'alumni_only', true, true, ARRAY['seed-accounts']);

-- Add career history for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO career_history (user_id, company_name, position, start_date, end_date, current_position, description, location) 
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'TechCorp'
    WHEN full_name = 'Ahmed Hassan' THEN 'GreenEnergy Solutions'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Pro'
    WHEN full_name = 'James Wilson' THEN 'PharmaTech Industries'
    WHEN full_name = 'Priya Sharma' THEN 'SmartHome Technologies'
    WHEN full_name = 'David Kim' THEN 'DataVision Inc'
    WHEN full_name = 'Lisa Thompson' THEN 'Sustainable Infrastructure Co'
    WHEN full_name = 'Michael Brown' THEN 'Global Finance Partners'
    WHEN full_name = 'Aisha Johnson' THEN 'MedDevice Innovations'
    WHEN full_name = 'Carlos Garcia' THEN 'CyberSecure Consulting'
    WHEN full_name = 'Emily Davis' THEN 'EcoSolutions Group'
    WHEN full_name = 'Ryan Lee' THEN 'SpaceTech Corporation'
    WHEN full_name = 'Fatima Ali' THEN 'Urban Design Studio'
    WHEN full_name = 'Thomas Anderson' THEN 'MindHealth Technologies'
    WHEN full_name = 'Nina Patel' THEN 'International Trade Council'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Senior Software Engineer'
    WHEN full_name = 'Ahmed Hassan' THEN 'Lead Mechanical Engineer'
    WHEN full_name = 'Maria Rodriguez' THEN 'Marketing Director'
    WHEN full_name = 'James Wilson' THEN 'Process Engineer'
    WHEN full_name = 'Priya Sharma' THEN 'Electronics Design Engineer'
    WHEN full_name = 'David Kim' THEN 'Senior Data Scientist'
    WHEN full_name = 'Lisa Thompson' THEN 'Structural Engineer'
    WHEN full_name = 'Michael Brown' THEN 'Investment Banker'
    WHEN full_name = 'Aisha Johnson' THEN 'Biomedical Researcher'
    WHEN full_name = 'Carlos Garcia' THEN 'IT Security Consultant'
    WHEN full_name = 'Emily Davis' THEN 'Environmental Consultant'
    WHEN full_name = 'Ryan Lee' THEN 'Aerospace Engineer'
    WHEN full_name = 'Fatima Ali' THEN 'Architect'
    WHEN full_name = 'Thomas Anderson' THEN 'Clinical Psychologist'
    WHEN full_name = 'Nina Patel' THEN 'Policy Analyst'
  END,
  '2022-01-01',
  NULL,
  true,
  'Current role focused on innovative solutions and industry leadership.',
  CASE 
    WHEN full_name IN ('Sarah Chen', 'David Kim') THEN 'San Francisco, CA'
    WHEN full_name IN ('Ahmed Hassan', 'Priya Sharma') THEN 'Austin, TX'
    WHEN full_name IN ('Maria Rodriguez', 'Michael Brown') THEN 'New York, NY'
    WHEN full_name IN ('James Wilson', 'Aisha Johnson') THEN 'Boston, MA'
    WHEN full_name IN ('Lisa Thompson', 'Emily Davis') THEN 'Seattle, WA'
    WHEN full_name IN ('Carlos Garcia', 'Thomas Anderson') THEN 'Chicago, IL'
    WHEN full_name IN ('Ryan Lee', 'Fatima Ali') THEN 'Los Angeles, CA'
    ELSE 'Washington, DC'
  END
FROM seed_users;

-- Add some user links for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO user_links (user_id, platform, url) 
SELECT user_id, 'LinkedIn', 'https://linkedin.com/in/' || LOWER(REPLACE(full_name, ' ', '-'))
FROM seed_users
UNION ALL
SELECT user_id, 'GitHub', 'https://github.com/' || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 1), ' ', '')) || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 2), ' ', ''))
FROM seed_users
WHERE full_name IN ('Sarah Chen', 'David Kim', 'Priya Sharma', 'Carlos Garcia')
UNION ALL
SELECT user_id, 'Twitter', 'https://twitter.com/' || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 1), ' ', '')) || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 2), ' ', ''))
FROM seed_users
WHERE full_name IN ('Maria Rodriguez', 'Michael Brown', 'Emily Davis', 'Thomas Anderson');

-- Add some achievements for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO achievements (user_id, title, description, organization, date_achieved)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Outstanding Innovation Award'
    WHEN full_name = 'Ahmed Hassan' THEN 'Green Engineering Excellence'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Leadership Award'
    WHEN full_name = 'David Kim' THEN 'Data Science Innovation Prize'
    WHEN full_name = 'Emily Davis' THEN 'Environmental Impact Award'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Recognized for developing innovative AI solutions that improved user experience by 40%'
    WHEN full_name = 'Ahmed Hassan' THEN 'Award for designing sustainable energy systems that reduced carbon footprint by 30%'
    WHEN full_name = 'Maria Rodriguez' THEN 'Led digital transformation initiatives that increased brand engagement by 50%'
    WHEN full_name = 'David Kim' THEN 'Developed machine learning models that improved prediction accuracy by 35%'
    WHEN full_name = 'Emily Davis' THEN 'Implemented environmental solutions that helped organizations achieve carbon neutrality'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Tech Innovation Society'
    WHEN full_name = 'Ahmed Hassan' THEN 'Green Engineering Council'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Association'
    WHEN full_name = 'David Kim' THEN 'Data Science Institute'
    WHEN full_name = 'Emily Davis' THEN 'Environmental Protection Agency'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN '2023-06-15'
    WHEN full_name = 'Ahmed Hassan' THEN '2023-09-20'
    WHEN full_name = 'Maria Rodriguez' THEN '2023-03-10'
    WHEN full_name = 'David Kim' THEN '2023-11-05'
    WHEN full_name = 'Emily Davis' THEN '2023-08-12'
  END
FROM seed_users
WHERE full_name IN ('Sarah Chen', 'Ahmed Hassan', 'Maria Rodriguez', 'David Kim', 'Emily Davis');

-- Add some business entries for entrepreneurial alumni
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO user_businesses (user_id, business_name, position, ownership_type, start_date, current_business, description, industry, website)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'AI Solutions Startup'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Agency'
    WHEN full_name = 'Carlos Garcia' THEN 'CyberSafe Consulting'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Co-Founder & CTO'
    WHEN full_name = 'Maria Rodriguez' THEN 'Founder & CEO'
    WHEN full_name = 'Carlos Garcia' THEN 'Founder'
  END,
  'Founder',
  CASE 
    WHEN full_name = 'Sarah Chen' THEN '2023-01-15'
    WHEN full_name = 'Maria Rodriguez' THEN '2022-06-01'
    WHEN full_name = 'Carlos Garcia' THEN '2023-03-10'
  END,
  true,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Developing next-generation AI tools for small businesses'
    WHEN full_name = 'Maria Rodriguez' THEN 'Full-service digital marketing agency specializing in tech startups'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity consulting for mid-size enterprises'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Technology'
    WHEN full_name = 'Maria Rodriguez' THEN 'Marketing'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'https://aisolutions.startup.com'
    WHEN full_name = 'Maria Rodriguez' THEN 'https://digitalmarketingpro.com'
    WHEN full_name = 'Carlos Garcia' THEN 'https://cybersafeconsulting.com'
  END
FROM seed_users
WHERE full_name IN ('Sarah Chen', 'Maria Rodriguez', 'Carlos Garcia');