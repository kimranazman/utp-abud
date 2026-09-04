-- Create diverse seed users for demonstration
-- These users will have is_seed_data = true

-- Insert seed profiles
INSERT INTO public.profiles (
  user_id, email, full_name, course, graduation_year, location, location_city, 
  location_state, location_country, bio, profile_visibility, is_verified, 
  profile_completed, is_seed_data, avatar_url, tags
) VALUES 
-- Sarah Chen - Marketing Professional
(gen_random_uuid(), 'sarah.chen.demo@email.com', 'Sarah Chen', 'Master of Business Administration', 2019, 
 'Singapore', 'Singapore', NULL, 'Singapore', 
 'Digital marketing strategist specializing in Southeast Asian markets with 8+ years of experience in brand development and growth marketing.',
 'public'::profile_visibility, true, true, true, 
 'https://images.unsplash.com/photo-1494790108755-2616b612b5fc?w=200&h=200&fit=crop&crop=face',
 ARRAY['Marketing', 'Strategy', 'Digital Transformation']),

-- Marcus Johnson - Software Engineer  
(gen_random_uuid(), 'marcus.j.demo@email.com', 'Marcus Johnson', 'Bachelor of Computer Science', 2020,
 'Austin, Texas, USA', 'Austin', 'Texas', 'United States',
 'Full-stack developer and startup co-founder passionate about building scalable web applications and mentoring junior developers.',
 'public'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
 ARRAY['Software Development', 'Startups', 'Web Technologies']),

-- Priya Sharma - Finance Expert
(gen_random_uuid(), 'priya.sharma.demo@email.com', 'Priya Sharma', 'Master of Finance', 2018,
 'Mumbai, India', 'Mumbai', 'Maharashtra', 'India',
 'Investment advisor with expertise in emerging markets and sustainable finance. CFA charterholder with 10+ years in financial services.',
 'alumni_only'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
 ARRAY['Finance', 'Investment', 'ESG']),

-- Dr. Ahmed Hassan - Healthcare Professional
(gen_random_uuid(), 'ahmed.hassan.demo@email.com', 'Dr. Ahmed Hassan', 'Master of Public Health', 2017,
 'Dubai, UAE', 'Dubai', NULL, 'United Arab Emirates',
 'Public health specialist focusing on healthcare systems optimization and digital health transformation across the Middle East.',
 'public'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
 ARRAY['Healthcare', 'Public Health', 'Digital Health']),

-- Elena Rodriguez - Creative Director
(gen_random_uuid(), 'elena.rodriguez.demo@email.com', 'Elena Rodriguez', 'Master of Fine Arts', 2021,
 'Barcelona, Spain', 'Barcelona', 'Catalonia', 'Spain',
 'Creative director with expertise in brand storytelling and sustainable design. Leading creative campaigns for international brands.',
 'public'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
 ARRAY['Creative Direction', 'Branding', 'Sustainability']),

-- James Wilson - Environmental Consultant
(gen_random_uuid(), 'james.wilson.demo@email.com', 'James Wilson', 'Master of Environmental Science', 2019,
 'Vancouver, Canada', 'Vancouver', 'British Columbia', 'Canada',
 'Environmental consultant specializing in corporate sustainability strategies and climate risk assessment for Fortune 500 companies.',
 'alumni_only'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
 ARRAY['Environment', 'Sustainability', 'Climate']),

-- Lisa Kim - Data Scientist
(gen_random_uuid(), 'lisa.kim.demo@email.com', 'Lisa Kim', 'Master of Data Science', 2020,
 'Seoul, South Korea', 'Seoul', NULL, 'South Korea',
 'Data scientist and AI researcher working on machine learning solutions for fintech and e-commerce platforms.',
 'public'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
 ARRAY['Data Science', 'AI', 'Machine Learning']),

-- Roberto Silva - Renewable Energy Engineer
(gen_random_uuid(), 'roberto.silva.demo@email.com', 'Roberto Silva', 'Master of Engineering', 2018,
 'São Paulo, Brazil', 'São Paulo', 'São Paulo', 'Brazil',
 'Renewable energy engineer leading solar and wind power projects across Latin America. Passionate about sustainable development.',
 'public'::profile_visibility, true, true, true,
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
 ARRAY['Renewable Energy', 'Engineering', 'Sustainability']);