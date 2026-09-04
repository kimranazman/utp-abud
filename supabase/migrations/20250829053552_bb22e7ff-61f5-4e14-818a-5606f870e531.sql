-- Add contributions to showcase community involvement
INSERT INTO contributions (user_id, organization_name, role, contribution_type, value_amount, currency, value_private, description, start_date, current_contribution, created_at, updated_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.graduation_year >= 2022 THEN 'University Engineering Scholarship Fund'
    WHEN p.graduation_year = 2021 THEN 'Alumni Mentorship Program'
    WHEN p.graduation_year = 2020 THEN 'Engineering Faculty Development Fund'
    WHEN p.graduation_year = 2019 THEN 'Student Innovation Lab'
    ELSE 'Industry Partnership Initiative'
  END as organization_name,
  CASE 
    WHEN p.graduation_year >= 2022 THEN 'Scholarship Sponsor'
    WHEN p.graduation_year = 2021 THEN 'Senior Mentor'
    WHEN p.graduation_year = 2020 THEN 'Advisory Board Member'
    WHEN p.graduation_year = 2019 THEN 'Guest Lecturer'
    ELSE 'Industry Liaison'
  END as role,
  CASE 
    WHEN p.graduation_year IN (2022, 2020, 2018) THEN 'monetary'
    ELSE 'non_monetary'
  END as contribution_type,
  CASE 
    WHEN p.graduation_year = 2022 THEN 15000
    WHEN p.graduation_year = 2020 THEN 25000
    WHEN p.graduation_year = 2018 THEN 50000
    ELSE 5000
  END as value_amount,
  'MYR' as currency,
  CASE 
    WHEN p.graduation_year IN (2018, 2019) THEN true
    ELSE false
  END as value_private,
  CASE 
    WHEN p.graduation_year >= 2022 THEN 'Annual scholarship fund to support underprivileged engineering students with academic excellence.'
    WHEN p.graduation_year = 2021 THEN 'Mentoring fresh graduates and final year students in career development and industry readiness.'
    WHEN p.graduation_year = 2020 THEN 'Contributing to faculty development through equipment funding and research collaboration.'
    WHEN p.graduation_year = 2019 THEN 'Regular guest lectures on industry trends and entrepreneurship for engineering students.'
    ELSE 'Facilitating internship programs and industry exposure for engineering students.'
  END as description,
  (p.graduation_year + 2 || '-03-01')::date as start_date,
  true as current_contribution,
  now() - interval '3 days',
  now()
FROM profiles p 
WHERE p.profile_completed = true AND p.is_verified = true AND p.graduation_year <= 2022;

-- Create some additional profile entries with realistic Malaysian alumni data
INSERT INTO profiles (
  user_id, email, full_name, course, graduation_year, bio, profile_visibility, 
  is_verified, profile_completed, avatar_url, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'ariff.wan@demo.com', 'Wan Ariff bin Zulkifli', 'Mechanical Engineering', 2023, 'Automotive systems engineer specializing in hybrid vehicle technology and sustainable mobility solutions.', 'public', true, true, 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face', now() - interval '6 months', now()),
  (gen_random_uuid(), 'lisa.chan@demo.com', 'Lisa Chan Mei Xuan', 'Computer Science', 2022, 'DevOps engineer and cloud architecture specialist. Passionate about automation and scalable infrastructure.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face', now() - interval '10 months', now()),
  (gen_random_uuid(), 'zakwan.ahmad@demo.com', 'Ahmad Zakwan bin Abdullah', 'Civil Engineering', 2021, 'Structural engineer working on high-rise developments and earthquake-resistant design methodologies.', 'public', true, true, 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face', now() - interval '18 months', now()),
  (gen_random_uuid(), 'siti.mariam@demo.com', 'Siti Mariam binti Hassan', 'Chemical Engineering', 2020, 'Environmental consultant specializing in industrial waste management and green technology implementation.', 'public', true, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=400&h=400&fit=crop&crop=face', now() - interval '2.5 years', now()),
  (gen_random_uuid(), 'ryan.goh@demo.com', 'Ryan Goh Wei Ming', 'Electrical Engineering', 2019, 'IoT solutions architect and smart city technology consultant. Leading digital transformation projects.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', now() - interval '3.5 years', now());