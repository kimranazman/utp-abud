-- Get existing profile user_ids to add roles and career data
-- First, add user roles for seed data (mark existing profiles as alumni)
WITH existing_profiles AS (
  SELECT user_id FROM profiles WHERE email LIKE '%@example.com' OR email = 'sire.imran@gmail.com'
)
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  user_id, 
  CASE 
    WHEN (SELECT email FROM profiles p WHERE p.user_id = existing_profiles.user_id) = 'sire.imran@gmail.com' THEN 'admin'::user_role
    ELSE 'alumni'::user_role
  END,
  now()
FROM existing_profiles
WHERE user_id NOT IN (SELECT user_id FROM user_roles);

-- Add comprehensive career history for diverse backgrounds
INSERT INTO career_history (user_id, company_name, position, start_date, end_date, current_position, location, description, created_at, updated_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.course = 'Chemical Engineering' AND p.graduation_year = 2024 THEN 'Petronas'
    WHEN p.course = 'Computer Science' AND p.graduation_year = 2024 THEN 'Shopee'
    WHEN p.course = 'Electrical Engineering' AND p.graduation_year = 2024 THEN 'Intel Malaysia'
    WHEN p.course = 'Civil Engineering' AND p.graduation_year = 2023 THEN 'Gamuda'
    WHEN p.course = 'Mechanical Engineering' AND p.graduation_year = 2023 THEN 'Proton'
    WHEN p.course = 'Computer Science' AND p.graduation_year = 2023 THEN 'Grab'
    WHEN p.course = 'Chemical Engineering' AND p.graduation_year = 2022 THEN 'BASF Malaysia'
    WHEN p.course = 'Electrical Engineering' AND p.graduation_year = 2022 THEN 'TNB'
    WHEN p.course = 'Civil Engineering' AND p.graduation_year = 2022 THEN 'IJM Corporation'
    WHEN p.course = 'Computer Science' AND p.graduation_year = 2021 THEN 'Genting'
    WHEN p.course = 'Mechanical Engineering' AND p.graduation_year = 2021 THEN 'Tesla'
    WHEN p.course = 'Chemical Engineering' AND p.graduation_year = 2021 THEN 'EcoSolutions Sdn Bhd'
    WHEN p.course = 'Electrical Engineering' AND p.graduation_year = 2020 THEN 'Siemens Malaysia'
    WHEN p.course = 'Civil Engineering' AND p.graduation_year = 2020 THEN 'Mass Rapid Transit Corporation'
    WHEN p.course = 'Computer Science' AND p.graduation_year = 2019 THEN 'TechVenture Solutions'
    WHEN p.course = 'Mechanical Engineering' AND p.graduation_year = 2019 THEN 'Airbus Malaysia'
    WHEN p.course = 'Chemical Engineering' AND p.graduation_year = 2018 THEN 'DuPont Malaysia'
    WHEN p.course = 'Electrical Engineering' AND p.graduation_year = 2018 THEN 'Infineon Technologies'
    ELSE 'Malaysian Corporation'
  END as company_name,
  CASE 
    WHEN p.course = 'Chemical Engineering' THEN 'Process Engineer'
    WHEN p.course = 'Computer Science' THEN 'Software Developer'
    WHEN p.course = 'Electrical Engineering' THEN 'Electronics Engineer'
    WHEN p.course = 'Civil Engineering' THEN 'Project Engineer'
    WHEN p.course = 'Mechanical Engineering' THEN 'Design Engineer'
    ELSE 'Engineer'
  END as position,
  (p.graduation_year || '-07-01')::date as start_date,
  CASE 
    WHEN p.graduation_year >= 2023 THEN NULL
    ELSE (p.graduation_year + 2 || '-06-30')::date
  END as end_date,
  CASE WHEN p.graduation_year >= 2023 THEN true ELSE false END as current_position,
  CASE 
    WHEN p.graduation_year >= 2022 THEN 'Kuala Lumpur, Malaysia'
    WHEN p.graduation_year = 2021 THEN 'Selangor, Malaysia'
    WHEN p.graduation_year = 2020 THEN 'Penang, Malaysia'
    ELSE 'Johor, Malaysia'
  END as location,
  CASE 
    WHEN p.course = 'Chemical Engineering' THEN 'Responsible for process optimization, safety protocols, and environmental compliance in chemical manufacturing operations.'
    WHEN p.course = 'Computer Science' THEN 'Developed web applications, implemented security features, and collaborated with cross-functional teams on product development.'
    WHEN p.course = 'Electrical Engineering' THEN 'Designed and tested electronic systems, managed power distribution projects, and ensured regulatory compliance.'
    WHEN p.course = 'Civil Engineering' THEN 'Managed construction projects, conducted structural analysis, and coordinated with stakeholders for timely delivery.'
    WHEN p.course = 'Mechanical Engineering' THEN 'Designed mechanical systems, performed thermal analysis, and improved manufacturing processes for efficiency.'
    ELSE 'Contributed to engineering projects and technical solutions.'
  END as description,
  now() - interval '1 month',
  now()
FROM profiles p 
WHERE p.profile_completed = true AND p.is_verified = true;