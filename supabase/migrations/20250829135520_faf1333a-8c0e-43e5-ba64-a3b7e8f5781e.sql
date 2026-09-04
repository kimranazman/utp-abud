-- Add achievements for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO achievements (user_id, title, description, organization, date_achieved)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'AI Innovation Award'
    WHEN full_name = 'Ahmed Hassan' THEN 'Renewable Energy Excellence'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Leadership'
    WHEN full_name = 'James Wilson' THEN 'Pharmaceutical Innovation Award'
    WHEN full_name = 'Priya Sharma' THEN 'IoT Device Patent'
    WHEN full_name = 'David Kim' THEN 'Data Science Excellence'
    WHEN full_name = 'Lisa Thompson' THEN 'Sustainable Infrastructure Award'
    WHEN full_name = 'Michael Brown' THEN 'Investment Banking Excellence'
    WHEN full_name = 'Aisha Johnson' THEN 'Biomedical Research Grant'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity Innovation'
    WHEN full_name = 'Emily Davis' THEN 'Environmental Impact Award'
    WHEN full_name = 'Ryan Lee' THEN 'Aerospace Technology Patent'
    WHEN full_name = 'Fatima Ali' THEN 'Sustainable Architecture Award'
    WHEN full_name = 'Thomas Anderson' THEN 'Mental Health Technology Award'
    WHEN full_name = 'Nina Patel' THEN 'International Trade Excellence'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Recognized for developing innovative AI solutions in fintech'
    WHEN full_name = 'Ahmed Hassan' THEN 'Leading breakthrough in renewable energy efficiency'
    WHEN full_name = 'Maria Rodriguez' THEN 'Transforming digital marketing strategies across industries'
    WHEN full_name = 'James Wilson' THEN 'Revolutionary drug development process optimization'
    WHEN full_name = 'Priya Sharma' THEN 'Patent holder for innovative IoT home automation device'
    WHEN full_name = 'David Kim' THEN 'Advanced predictive analytics model development'
    WHEN full_name = 'Lisa Thompson' THEN 'Pioneering sustainable infrastructure design'
    WHEN full_name = 'Michael Brown' THEN 'Outstanding performance in emerging markets M&A'
    WHEN full_name = 'Aisha Johnson' THEN 'Securing major research grant for medical device innovation'
    WHEN full_name = 'Carlos Garcia' THEN 'Developing next-generation cybersecurity protocols'
    WHEN full_name = 'Emily Davis' THEN 'Leading climate change mitigation projects'
    WHEN full_name = 'Ryan Lee' THEN 'Patent for satellite communication technology'
    WHEN full_name = 'Fatima Ali' THEN 'Award-winning sustainable urban planning design'
    WHEN full_name = 'Thomas Anderson' THEN 'Pioneering digital therapy platform development'
    WHEN full_name = 'Nina Patel' THEN 'Excellence in international economic policy development'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Tech Innovation Society'
    WHEN full_name = 'Ahmed Hassan' THEN 'International Renewable Energy Association'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Marketing Institute'
    WHEN full_name = 'James Wilson' THEN 'Pharmaceutical Research Foundation'
    WHEN full_name = 'Priya Sharma' THEN 'IoT Innovation Council'
    WHEN full_name = 'David Kim' THEN 'Data Science Academy'
    WHEN full_name = 'Lisa Thompson' THEN 'Sustainable Engineering Society'
    WHEN full_name = 'Michael Brown' THEN 'Investment Banking Association'
    WHEN full_name = 'Aisha Johnson' THEN 'Biomedical Research Institute'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity Excellence Board'
    WHEN full_name = 'Emily Davis' THEN 'Environmental Leadership Council'
    WHEN full_name = 'Ryan Lee' THEN 'Aerospace Innovation Society'
    WHEN full_name = 'Fatima Ali' THEN 'Sustainable Architecture Institute'
    WHEN full_name = 'Thomas Anderson' THEN 'Mental Health Technology Association'
    WHEN full_name = 'Nina Patel' THEN 'International Trade Council'
  END,
  '2023-06-15'
FROM seed_users;

-- Add user links for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO user_links (user_id, platform, url, display_text)
SELECT 
  user_id,
  'LinkedIn',
  'https://linkedin.com/in/' || LOWER(REPLACE(full_name, ' ', '-')),
  full_name || ' - LinkedIn Profile'
FROM seed_users
UNION ALL
SELECT 
  user_id,
  'GitHub',
  'https://github.com/' || LOWER(REPLACE(full_name, ' ', '')),
  full_name || ' - GitHub'
FROM seed_users 
WHERE full_name IN ('Sarah Chen', 'David Kim', 'Priya Sharma', 'Carlos Garcia')
UNION ALL
SELECT 
  user_id,
  'Portfolio',
  'https://' || LOWER(REPLACE(full_name, ' ', '')) || '.com',
  'Personal Portfolio'
FROM seed_users
WHERE full_name IN ('Fatima Ali', 'Lisa Thompson', 'Thomas Anderson');

-- Add contributions for seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO contributions (user_id, organization_name, role, description, contribution_type, value_amount, currency, start_date, current_contribution)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'University Alumni Association'
    WHEN full_name = 'Ahmed Hassan' THEN 'Environmental Education Foundation'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Literacy Program'
    WHEN full_name = 'James Wilson' THEN 'Medical Research Fund'
    WHEN full_name = 'Priya Sharma' THEN 'STEM Education Initiative'
    WHEN full_name = 'David Kim' THEN 'Data Science Scholarship Fund'
    WHEN full_name = 'Lisa Thompson' THEN 'Sustainable Development Foundation'
    WHEN full_name = 'Michael Brown' THEN 'Financial Literacy Program'
    WHEN full_name = 'Aisha Johnson' THEN 'Healthcare Innovation Fund'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity Education Foundation'
    WHEN full_name = 'Emily Davis' THEN 'Climate Action Network'
    WHEN full_name = 'Ryan Lee' THEN 'Space Education Outreach'
    WHEN full_name = 'Fatima Ali' THEN 'Urban Planning Institute'
    WHEN full_name = 'Thomas Anderson' THEN 'Mental Health Awareness Foundation'
    WHEN full_name = 'Nina Patel' THEN 'International Development Fund'
  END,
  CASE 
    WHEN full_name IN ('Sarah Chen', 'Michael Brown', 'David Kim') THEN 'Board Member'
    WHEN full_name IN ('Ahmed Hassan', 'Emily Davis', 'Nina Patel') THEN 'Advisory Committee'
    ELSE 'Volunteer Coordinator'
  END,
  'Active contributor supporting educational and professional development initiatives',
  CASE 
    WHEN full_name IN ('Michael Brown', 'Sarah Chen', 'James Wilson') THEN 'monetary'
    ELSE 'non_monetary'
  END,
  CASE 
    WHEN full_name = 'Michael Brown' THEN 25000
    WHEN full_name = 'Sarah Chen' THEN 15000
    WHEN full_name = 'James Wilson' THEN 10000
    ELSE 0
  END,
  'USD',
  '2023-01-01',
  true
FROM seed_users;

-- Add businesses for some seed profiles
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO user_businesses (user_id, business_name, position, industry, ownership_type, description, website, start_date, current_business)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'AI Solutions Hub'
    WHEN full_name = 'Ahmed Hassan' THEN 'GreenTech Innovations'
    WHEN full_name = 'Maria Rodriguez' THEN 'Digital Growth Agency'
    WHEN full_name = 'Priya Sharma' THEN 'SmartHome Pro'
    WHEN full_name = 'Michael Brown' THEN 'FinanceFirst Consulting'
    WHEN full_name = 'Carlos Garcia' THEN 'SecureNet Solutions'
    WHEN full_name = 'Fatima Ali' THEN 'Sustainable Design Studio'
    WHEN full_name = 'Thomas Anderson' THEN 'MindCare Technologies'
  END,
  CASE 
    WHEN full_name IN ('Sarah Chen', 'Ahmed Hassan', 'Fatima Ali') THEN 'Founder & CEO'
    WHEN full_name IN ('Maria Rodriguez', 'Priya Sharma') THEN 'Co-Founder'
    WHEN full_name IN ('Michael Brown', 'Carlos Garcia') THEN 'Founder'
    WHEN full_name = 'Thomas Anderson' THEN 'Founder & CTO'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Technology'
    WHEN full_name = 'Ahmed Hassan' THEN 'Clean Energy'
    WHEN full_name = 'Maria Rodriguez' THEN 'Marketing & Advertising'
    WHEN full_name = 'Priya Sharma' THEN 'Home Automation'
    WHEN full_name = 'Michael Brown' THEN 'Financial Services'
    WHEN full_name = 'Carlos Garcia' THEN 'Cybersecurity'
    WHEN full_name = 'Fatima Ali' THEN 'Architecture & Design'
    WHEN full_name = 'Thomas Anderson' THEN 'Healthcare Technology'
  END,
  CASE 
    WHEN full_name IN ('Sarah Chen', 'Ahmed Hassan', 'Michael Brown', 'Carlos Garcia', 'Fatima Ali', 'Thomas Anderson') THEN 'Sole Proprietorship'
    WHEN full_name IN ('Maria Rodriguez', 'Priya Sharma') THEN 'Partnership'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'AI-powered business solutions and consulting services for enterprises looking to integrate artificial intelligence into their operations.'
    WHEN full_name = 'Ahmed Hassan' THEN 'Renewable energy consulting and sustainable technology solutions for commercial and residential clients.'
    WHEN full_name = 'Maria Rodriguez' THEN 'Full-service digital marketing agency specializing in brand transformation and online presence optimization.'
    WHEN full_name = 'Priya Sharma' THEN 'Smart home automation systems and IoT device integration for modern living spaces.'
    WHEN full_name = 'Michael Brown' THEN 'Financial advisory and investment consulting services for high-net-worth individuals and small businesses.'
    WHEN full_name = 'Carlos Garcia' THEN 'Comprehensive cybersecurity solutions and IT consulting for businesses of all sizes.'
    WHEN full_name = 'Fatima Ali' THEN 'Sustainable architecture and urban planning services focused on eco-friendly design principles.'
    WHEN full_name = 'Thomas Anderson' THEN 'Digital mental health platform providing therapy and wellness solutions through innovative technology.'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'https://aisolutionshub.com'
    WHEN full_name = 'Ahmed Hassan' THEN 'https://greentechinnovations.com'
    WHEN full_name = 'Maria Rodriguez' THEN 'https://digitalgrowthagency.com'
    WHEN full_name = 'Priya Sharma' THEN 'https://smarthomepro.com'
    WHEN full_name = 'Michael Brown' THEN 'https://financefirstconsulting.com'
    WHEN full_name = 'Carlos Garcia' THEN 'https://securenetsolutions.com'
    WHEN full_name = 'Fatima Ali' THEN 'https://sustainabledesignstudio.com'
    WHEN full_name = 'Thomas Anderson' THEN 'https://mindcaretech.com'
  END,
  '2021-03-01',
  true
FROM seed_users
WHERE full_name IN ('Sarah Chen', 'Ahmed Hassan', 'Maria Rodriguez', 'Priya Sharma', 'Michael Brown', 'Carlos Garcia', 'Fatima Ali', 'Thomas Anderson');

-- Add second businesses for some users
WITH seed_users AS (
  SELECT user_id, full_name FROM profiles WHERE 'seed-accounts' = ANY(tags)
)
INSERT INTO user_businesses (user_id, business_name, position, industry, ownership_type, description, website, start_date, end_date, current_business)
SELECT 
  user_id,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'TechStart Accelerator'
    WHEN full_name = 'Maria Rodriguez' THEN 'E-commerce Boost'
    WHEN full_name = 'Michael Brown' THEN 'Investment Analytics Pro'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Co-Founder'
    WHEN full_name = 'Maria Rodriguez' THEN 'Founder'
    WHEN full_name = 'Michael Brown' THEN 'Managing Partner'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Business Incubation'
    WHEN full_name = 'Maria Rodriguez' THEN 'E-commerce'
    WHEN full_name = 'Michael Brown' THEN 'Financial Technology'
  END,
  'Partnership',
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'Startup accelerator program helping early-stage tech companies scale and secure funding.'
    WHEN full_name = 'Maria Rodriguez' THEN 'E-commerce optimization platform helping online retailers increase sales and customer engagement.'
    WHEN full_name = 'Michael Brown' THEN 'Advanced analytics platform for investment portfolio management and risk assessment.'
  END,
  CASE 
    WHEN full_name = 'Sarah Chen' THEN 'https://techstartaccelerator.com'
    WHEN full_name = 'Maria Rodriguez' THEN 'https://ecommerceboost.com'
    WHEN full_name = 'Michael Brown' THEN 'https://investmentanalyticspro.com'
  END,
  '2019-06-01',
  '2023-12-31',
  false
FROM seed_users
WHERE full_name IN ('Sarah Chen', 'Maria Rodriguez', 'Michael Brown');