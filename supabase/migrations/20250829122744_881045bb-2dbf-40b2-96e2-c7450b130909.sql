-- Create seed alumni profiles without foreign key constraints
-- We'll use random UUIDs for user_id but won't link to auth.users

-- First, let's create a temporary table to hold our seed user IDs
CREATE TEMP TABLE temp_seed_users (
  user_id uuid DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  graduation_year integer,
  course text,
  birthday date,
  bio text,
  profile_visibility profile_visibility,
  current_company text,
  current_position text,
  location text
);

-- Insert seed user data
INSERT INTO temp_seed_users (full_name, email, graduation_year, course, birthday, bio, profile_visibility, current_company, current_position, location) VALUES
  ('Sarah Chen', 'sarah.chen@email.com', 2019, 'Computer Science', '1997-03-15', 'Software engineer passionate about AI and machine learning. Currently working on innovative solutions in the fintech space.', 'alumni_only', 'TechCorp', 'Senior Software Engineer', 'San Francisco, CA'),
  ('Ahmed Hassan', 'ahmed.hassan@email.com', 2020, 'Mechanical Engineering', '1998-07-22', 'Mechanical engineer specializing in renewable energy systems. Leading sustainable technology initiatives.', 'alumni_only', 'GreenEnergy Solutions', 'Lead Mechanical Engineer', 'Austin, TX'),
  ('Maria Rodriguez', 'maria.rodriguez@email.com', 2018, 'Business Administration', '1996-11-08', 'Marketing executive with expertise in digital transformation and brand strategy.', 'public', 'Digital Marketing Pro', 'Marketing Director', 'New York, NY'),
  ('James Wilson', 'james.wilson@email.com', 2021, 'Chemical Engineering', '1999-01-12', 'Process engineer working in pharmaceuticals, focused on drug development and manufacturing optimization.', 'alumni_only', 'PharmaTech Industries', 'Process Engineer', 'Boston, MA'),
  ('Priya Sharma', 'priya.sharma@email.com', 2017, 'Electrical Engineering', '1995-05-30', 'Electronics design engineer specializing in IoT devices and smart home technology.', 'public', 'SmartHome Technologies', 'Electronics Design Engineer', 'Austin, TX'),
  ('David Kim', 'david.kim@email.com', 2022, 'Data Science', '2000-09-18', 'Data scientist at a leading tech company, working on predictive analytics and recommendation systems.', 'alumni_only', 'DataVision Inc', 'Senior Data Scientist', 'San Francisco, CA'),
  ('Lisa Thompson', 'lisa.thompson@email.com', 2016, 'Civil Engineering', '1994-12-03', 'Structural engineer working on sustainable infrastructure projects and green building design.', 'alumni_only', 'Sustainable Infrastructure Co', 'Structural Engineer', 'Seattle, WA'),
  ('Michael Brown', 'michael.brown@email.com', 2019, 'Finance', '1997-04-25', 'Investment banker specializing in mergers and acquisitions. Passionate about emerging markets.', 'public', 'Global Finance Partners', 'Investment Banker', 'New York, NY'),
  ('Aisha Johnson', 'aisha.johnson@email.com', 2020, 'Biomedical Engineering', '1998-08-14', 'Biomedical researcher developing medical devices for diagnostic applications.', 'alumni_only', 'MedDevice Innovations', 'Biomedical Researcher', 'Boston, MA'),
  ('Carlos Garcia', 'carlos.garcia@email.com', 2018, 'Information Technology', '1996-02-07', 'IT consultant helping organizations with digital transformation and cybersecurity solutions.', 'alumni_only', 'CyberSecure Consulting', 'IT Security Consultant', 'Chicago, IL'),
  ('Emily Davis', 'emily.davis@email.com', 2021, 'Environmental Science', '1999-10-11', 'Environmental consultant working on climate change mitigation and sustainability projects.', 'public', 'EcoSolutions Group', 'Environmental Consultant', 'Seattle, WA'),
  ('Ryan Lee', 'ryan.lee@email.com', 2017, 'Aerospace Engineering', '1995-06-19', 'Aerospace engineer working on satellite technology and space exploration missions.', 'alumni_only', 'SpaceTech Corporation', 'Aerospace Engineer', 'Los Angeles, CA'),
  ('Fatima Ali', 'fatima.ali@email.com', 2022, 'Architecture', '2000-12-28', 'Architect specializing in sustainable design and urban planning for smart cities.', 'alumni_only', 'Urban Design Studio', 'Architect', 'Los Angeles, CA'),
  ('Thomas Anderson', 'thomas.anderson@email.com', 2019, 'Psychology', '1997-11-16', 'Clinical psychologist and researcher focusing on mental health technology and digital therapy solutions.', 'public', 'MindHealth Technologies', 'Clinical Psychologist', 'Chicago, IL'),
  ('Nina Patel', 'nina.patel@email.com', 2020, 'International Relations', '1998-03-09', 'Diplomat and policy analyst working on international trade agreements and economic development.', 'alumni_only', 'International Trade Council', 'Policy Analyst', 'Washington, DC');

-- Now disable the foreign key constraint temporarily and insert profiles
ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;

-- Insert the profiles
INSERT INTO profiles (user_id, email, full_name, graduation_year, course, birthday, bio, profile_visibility, is_verified, profile_completed, tags)
SELECT user_id, email, full_name, graduation_year, course, birthday, bio, profile_visibility, true, true, ARRAY['seed-accounts']
FROM temp_seed_users;

-- Re-enable the foreign key constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add career history for seed profiles
INSERT INTO career_history (user_id, company_name, position, start_date, current_position, description, location) 
SELECT 
  ts.user_id,
  ts.current_company,
  ts.current_position,
  '2022-01-01',
  true,
  'Current role focused on innovative solutions and industry leadership.',
  ts.location
FROM temp_seed_users ts;

-- Add LinkedIn links for all seed profiles
INSERT INTO user_links (user_id, platform, url) 
SELECT user_id, 'LinkedIn', 'https://linkedin.com/in/' || LOWER(REPLACE(full_name, ' ', '-'))
FROM temp_seed_users;

-- Add GitHub links for tech profiles
INSERT INTO user_links (user_id, platform, url) 
SELECT user_id, 'GitHub', 'https://github.com/' || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 1), ' ', '')) || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 2), ' ', ''))
FROM temp_seed_users
WHERE full_name IN ('Sarah Chen', 'David Kim', 'Priya Sharma', 'Carlos Garcia');

-- Add Twitter links for some profiles
INSERT INTO user_links (user_id, platform, url) 
SELECT user_id, 'Twitter', 'https://twitter.com/' || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 1), ' ', '')) || LOWER(REPLACE(SPLIT_PART(full_name, ' ', 2), ' ', ''))
FROM temp_seed_users
WHERE full_name IN ('Maria Rodriguez', 'Michael Brown', 'Emily Davis', 'Thomas Anderson');

-- Add some achievements for select profiles
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
FROM temp_seed_users
WHERE full_name IN ('Sarah Chen', 'Ahmed Hassan', 'Maria Rodriguez', 'David Kim', 'Emily Davis');

-- Add some business entries for entrepreneurial alumni
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
FROM temp_seed_users
WHERE full_name IN ('Sarah Chen', 'Maria Rodriguez', 'Carlos Garcia');