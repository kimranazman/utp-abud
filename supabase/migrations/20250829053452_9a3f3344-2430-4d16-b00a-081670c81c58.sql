-- Add achievements for existing profiles to showcase diverse accomplishments
INSERT INTO achievements (user_id, title, organization, date_achieved, description, created_at, updated_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.course = 'Chemical Engineering' THEN 'Professional Engineer (Ir.) Certification'
    WHEN p.course = 'Computer Science' THEN 'AWS Solutions Architect Professional'
    WHEN p.course = 'Electrical Engineering' THEN 'IEEE Senior Member'
    WHEN p.course = 'Civil Engineering' THEN 'Project Management Professional (PMP)'
    WHEN p.course = 'Mechanical Engineering' THEN 'Six Sigma Black Belt'
    ELSE 'Industry Excellence Award'
  END as title,
  CASE 
    WHEN p.course = 'Chemical Engineering' THEN 'Board of Engineers Malaysia'
    WHEN p.course = 'Computer Science' THEN 'Amazon Web Services'
    WHEN p.course = 'Electrical Engineering' THEN 'IEEE Malaysia'
    WHEN p.course = 'Civil Engineering' THEN 'Project Management Institute'
    WHEN p.course = 'Mechanical Engineering' THEN 'American Society for Quality'
    ELSE 'Professional Association'
  END as organization,
  (p.graduation_year + 3 || '-08-15')::date as date_achieved,
  CASE 
    WHEN p.course = 'Chemical Engineering' THEN 'Achieved professional engineer status after demonstrating expertise in process design and safety management.'
    WHEN p.course = 'Computer Science' THEN 'Certified in designing and deploying scalable, highly available systems on AWS cloud platform.'
    WHEN p.course = 'Electrical Engineering' THEN 'Recognized for significant contributions to electrical engineering profession and IEEE community.'
    WHEN p.course = 'Civil Engineering' THEN 'Demonstrated competency in project management methodologies and successful project delivery.'
    WHEN p.course = 'Mechanical Engineering' THEN 'Expertise in process improvement, statistical analysis, and quality management systems.'
    ELSE 'Recognition for outstanding contributions to the engineering field.'
  END as description,
  now() - interval '2 weeks',
  now()
FROM profiles p 
WHERE p.profile_completed = true AND p.is_verified = true AND p.graduation_year <= 2021;

-- Add professional links for networking
INSERT INTO user_links (user_id, platform, url, display_text, created_at, updated_at)
SELECT 
  p.user_id,
  'LinkedIn',
  'https://linkedin.com/in/' || lower(replace(replace(p.full_name, ' ', '-'), '.', '')),
  p.full_name,
  now() - interval '1 week',
  now()
FROM profiles p 
WHERE p.profile_completed = true AND p.is_verified = true;

-- Add some businesses for entrepreneurial alumni
INSERT INTO user_businesses (user_id, business_name, position, industry, ownership_type, description, start_date, current_business, website, created_at, updated_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.graduation_year = 2019 AND p.course = 'Computer Science' THEN 'TechVenture Solutions'
    WHEN p.graduation_year = 2021 AND p.course = 'Chemical Engineering' THEN 'EcoSolutions Sdn Bhd'
    WHEN p.graduation_year = 2020 AND p.course = 'Civil Engineering' THEN 'Smart Infrastructure Consultancy'
    WHEN p.graduation_year = 2018 AND p.course = 'Electrical Engineering' THEN 'GreenTech Innovations'
    ELSE NULL
  END as business_name,
  CASE 
    WHEN p.graduation_year = 2019 AND p.course = 'Computer Science' THEN 'Founder & CEO'
    WHEN p.graduation_year = 2021 AND p.course = 'Chemical Engineering' THEN 'Co-Founder & CTO'
    WHEN p.graduation_year = 2020 AND p.course = 'Civil Engineering' THEN 'Managing Director'
    WHEN p.graduation_year = 2018 AND p.course = 'Electrical Engineering' THEN 'Founder & Technical Lead'
    ELSE NULL
  END as position,
  CASE 
    WHEN p.graduation_year = 2019 AND p.course = 'Computer Science' THEN 'Technology'
    WHEN p.graduation_year = 2021 AND p.course = 'Chemical Engineering' THEN 'Environmental Technology'
    WHEN p.graduation_year = 2020 AND p.course = 'Civil Engineering' THEN 'Construction & Infrastructure'
    WHEN p.graduation_year = 2018 AND p.course = 'Electrical Engineering' THEN 'Renewable Energy'
    ELSE NULL
  END as industry,
  'Founder' as ownership_type,
  CASE 
    WHEN p.graduation_year = 2019 AND p.course = 'Computer Science' THEN 'SaaS platform helping SMEs digitize their operations with custom business solutions and analytics.'
    WHEN p.graduation_year = 2021 AND p.course = 'Chemical Engineering' THEN 'Developing innovative waste-to-energy solutions for industrial and municipal applications.'
    WHEN p.graduation_year = 2020 AND p.course = 'Civil Engineering' THEN 'Consulting firm specializing in smart city infrastructure and sustainable building design.'
    WHEN p.graduation_year = 2018 AND p.course = 'Electrical Engineering' THEN 'R&D company focusing on next-generation solar panel technology and energy storage systems.'
    ELSE NULL
  END as description,
  (p.graduation_year + 2 || '-01-01')::date as start_date,
  true as current_business,
  CASE 
    WHEN p.graduation_year = 2019 AND p.course = 'Computer Science' THEN 'https://techventure.solutions'
    WHEN p.graduation_year = 2021 AND p.course = 'Chemical Engineering' THEN 'https://ecosolutions.com.my'
    WHEN p.graduation_year = 2020 AND p.course = 'Civil Engineering' THEN 'https://smartinfra.com.my'
    WHEN p.graduation_year = 2018 AND p.course = 'Electrical Engineering' THEN 'https://greentech-innovations.com'
    ELSE NULL
  END as website,
  now() - interval '5 days',
  now()
FROM profiles p 
WHERE p.profile_completed = true AND p.is_verified = true 
  AND ((p.graduation_year = 2019 AND p.course = 'Computer Science') 
    OR (p.graduation_year = 2021 AND p.course = 'Chemical Engineering')
    OR (p.graduation_year = 2020 AND p.course = 'Civil Engineering')
    OR (p.graduation_year = 2018 AND p.course = 'Electrical Engineering'));