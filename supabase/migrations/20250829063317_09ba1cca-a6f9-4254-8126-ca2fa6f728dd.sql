-- Insert comprehensive seed data for Malaysian alumni
WITH new_users AS (
  INSERT INTO profiles (
    user_id, email, full_name, course, graduation_year, bio, profile_visibility, 
    is_verified, profile_completed, avatar_url, tags, created_at, updated_at
  ) VALUES 
    (gen_random_uuid(), 'ariff.wan@demo.com', 'Wan Ariff bin Zulkifli', 'Mechanical Engineering', 2023, 'Automotive systems engineer specializing in hybrid vehicle technology and sustainable mobility solutions.', 'public', true, true, 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '6 months', now()),
    (gen_random_uuid(), 'lisa.chan@demo.com', 'Lisa Chan Mei Xuan', 'Computer Science', 2022, 'DevOps engineer and cloud architecture specialist. Passionate about automation and scalable infrastructure.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '10 months', now()),
    (gen_random_uuid(), 'zakwan.ahmad@demo.com', 'Ahmad Zakwan bin Abdullah', 'Civil Engineering', 2021, 'Structural engineer working on high-rise developments and earthquake-resistant design methodologies.', 'public', true, true, 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '18 months', now()),
    (gen_random_uuid(), 'siti.mariam@demo.com', 'Siti Mariam binti Hassan', 'Chemical Engineering', 2020, 'Environmental consultant specializing in industrial waste management and green technology implementation.', 'public', true, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '2.5 years', now()),
    (gen_random_uuid(), 'ryan.goh@demo.com', 'Ryan Goh Wei Ming', 'Electrical Engineering', 2019, 'IoT solutions architect and smart city technology consultant. Leading digital transformation projects.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '3.5 years', now()),
    (gen_random_uuid(), 'ahmad.fariz@demo.com', 'Ahmad Fariz bin Mohamed', 'Software Engineering', 2018, 'Full-stack developer and tech startup founder. Building fintech solutions for Southeast Asia.', 'public', true, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '4 years', now()),
    (gen_random_uuid(), 'priya.devi@demo.com', 'Priya Devi a/p Subramaniam', 'Biomedical Engineering', 2017, 'Medical device researcher focusing on prosthetics and rehabilitation technology innovations.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face', ARRAY['test-user'], now() - interval '5 years', now())
  RETURNING user_id, email, full_name, graduation_year
),
user_data AS (
  SELECT * FROM new_users
)

-- Insert user roles for all new users
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT user_id, 'alumni', now() - interval '1 day'
FROM user_data;

-- Insert career history for seed users
INSERT INTO career_history (user_id, company_name, position, start_date, end_date, current_position, location, description, created_at, updated_at)
SELECT 
  u.user_id,
  CASE u.graduation_year
    WHEN 2023 THEN 'Proton Holdings'
    WHEN 2022 THEN 'Grab Malaysia'
    WHEN 2021 THEN 'KLCC Property Holdings'
    WHEN 2020 THEN 'Genting Green Power'
    WHEN 2019 THEN 'TM One'
    WHEN 2018 THEN 'MoneyLion Malaysia'
    WHEN 2017 THEN 'Siemens Healthineers'
  END as company_name,
  CASE u.graduation_year
    WHEN 2023 THEN 'Senior Automotive Engineer'
    WHEN 2022 THEN 'DevOps Lead Engineer'
    WHEN 2021 THEN 'Project Manager'
    WHEN 2020 THEN 'Environmental Engineering Consultant'
    WHEN 2019 THEN 'IoT Solutions Architect'
    WHEN 2018 THEN 'Technical Co-Founder'
    WHEN 2017 THEN 'Biomedical Research Engineer'
  END as position,
  (u.graduation_year + 1 || '-06-01')::date as start_date,
  NULL as end_date,
  true as current_position,
  CASE u.graduation_year
    WHEN 2023 THEN 'Shah Alam, Selangor'
    WHEN 2022 THEN 'Kuala Lumpur'
    WHEN 2021 THEN 'Kuala Lumpur'
    WHEN 2020 THEN 'Kuching, Sarawak'
    WHEN 2019 THEN 'Cyberjaya, Selangor'
    WHEN 2018 THEN 'Kuala Lumpur'
    WHEN 2017 THEN 'Petaling Jaya, Selangor'
  END as location,
  CASE u.graduation_year
    WHEN 2023 THEN 'Leading hybrid vehicle development projects and sustainable automotive technology research.'
    WHEN 2022 THEN 'Managing cloud infrastructure and deployment pipelines for Southeast Asia operations.'
    WHEN 2021 THEN 'Overseeing construction projects for high-rise developments in KL city center.'
    WHEN 2020 THEN 'Developing green technology solutions for renewable energy projects.'
    WHEN 2019 THEN 'Designing IoT systems for smart city initiatives and digital transformation.'
    WHEN 2018 THEN 'Building fintech products and leading product development for digital banking.'
    WHEN 2017 THEN 'Researching advanced prosthetics and rehabilitation technology solutions.'
  END as description,
  now() - interval '2 days',
  now()
FROM user_data u;

-- Insert user links for seed users
INSERT INTO user_links (user_id, platform, url, display_text, created_at, updated_at)
SELECT 
  u.user_id,
  'LinkedIn',
  'https://linkedin.com/in/' || lower(replace(replace(u.full_name, ' ', '-'), '.', '')) || '-' || u.graduation_year::text,
  u.full_name,
  now() - interval '1 day',
  now()
FROM user_data u;

-- Insert businesses for some users
INSERT INTO user_businesses (user_id, business_name, position, ownership_type, industry, description, website, start_date, current_business, created_at, updated_at)
SELECT 
  u.user_id,
  CASE u.graduation_year
    WHEN 2018 THEN 'FinTech Solutions Malaysia'
    WHEN 2019 THEN 'Smart City Consultancy'
    WHEN 2020 THEN 'GreenTech Environmental'
  END as business_name,
  CASE u.graduation_year
    WHEN 2018 THEN 'Co-Founder & CTO'
    WHEN 2019 THEN 'Founder & CEO'
    WHEN 2020 THEN 'Principal Consultant'
  END as position,
  CASE u.graduation_year
    WHEN 2018 THEN 'Co-founder'
    WHEN 2019 THEN 'Founder'
    WHEN 2020 THEN 'Owner'
  END as ownership_type,
  CASE u.graduation_year
    WHEN 2018 THEN 'Financial Technology'
    WHEN 2019 THEN 'Information Technology'
    WHEN 2020 THEN 'Environmental Services'
  END as industry,
  CASE u.graduation_year
    WHEN 2018 THEN 'Digital banking solutions and payment systems for emerging markets.'
    WHEN 2019 THEN 'IoT consulting and smart city technology implementation services.'
    WHEN 2020 THEN 'Environmental impact assessment and sustainable technology consulting.'
  END as description,
  CASE u.graduation_year
    WHEN 2018 THEN 'https://fintechsolutions.my'
    WHEN 2019 THEN 'https://smartcityconsultancy.com'
    WHEN 2020 THEN 'https://greentechenv.my'
  END as website,
  (u.graduation_year + 3 || '-01-01')::date as start_date,
  true as current_business,
  now() - interval '1 day',
  now()
FROM user_data u
WHERE u.graduation_year IN (2018, 2019, 2020);

-- Insert achievements for seed users
INSERT INTO achievements (user_id, title, description, organization, date_achieved, created_at, updated_at)
SELECT 
  u.user_id,
  CASE u.graduation_year
    WHEN 2023 THEN 'Young Engineer Award'
    WHEN 2022 THEN 'DevOps Excellence Recognition'
    WHEN 2021 THEN 'Project Management Certification'
    WHEN 2020 THEN 'Environmental Impact Award'
    WHEN 2019 THEN 'Innovation in IoT Award'
    WHEN 2018 THEN 'Entrepreneur of the Year'
    WHEN 2017 THEN 'Research Excellence Award'
  END as title,
  CASE u.graduation_year
    WHEN 2023 THEN 'Recognized for outstanding contribution to sustainable automotive technology development.'
    WHEN 2022 THEN 'Awarded for implementing best practices in DevOps and cloud architecture.'
    WHEN 2021 THEN 'Achieved PMP certification and recognized for project delivery excellence.'
    WHEN 2020 THEN 'Honored for developing innovative green technology solutions.'
    WHEN 2019 THEN 'Recognized for pioneering IoT solutions in smart city development.'
    WHEN 2018 THEN 'Awarded for successful fintech startup launch and innovation.'
    WHEN 2017 THEN 'Recognized for breakthrough research in biomedical engineering.'
  END as description,
  CASE u.graduation_year
    WHEN 2023 THEN 'Institution of Engineers Malaysia'
    WHEN 2022 THEN 'AWS Malaysia'
    WHEN 2021 THEN 'Project Management Institute'
    WHEN 2020 THEN 'Malaysian Green Technology Corporation'
    WHEN 2019 THEN 'Malaysia Digital Economy Corporation'
    WHEN 2018 THEN 'Malaysian Venture Capital Association'
    WHEN 2017 THEN 'IEEE Engineering in Medicine and Biology Society'
  END as organization,
  (u.graduation_year + 2 || '-11-15')::date as date_achieved,
  now() - interval '1 day',
  now()
FROM user_data u;