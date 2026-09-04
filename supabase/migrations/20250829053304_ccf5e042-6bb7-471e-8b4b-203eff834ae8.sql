-- Seed Data for Alumni Directory MVP
-- This creates realistic test data that can be easily removed later

-- First, let's insert some seed users into auth.users (simulating what would happen during signup)
-- Note: In production, these would be created through the normal signup flow

-- Create seed profiles with diverse backgrounds
INSERT INTO public.profiles (
  user_id, email, full_name, course, graduation_year, bio, profile_visibility, 
  is_verified, profile_completed, avatar_url, created_at, updated_at
) VALUES 
  -- 2024 Graduates
  (gen_random_uuid(), 'ahmad.hassan@example.com', 'Ahmad Hassan bin Mohamad', 'Chemical Engineering', 2024, 'Passionate chemical engineer specializing in sustainable processes and green technology. Currently working on renewable energy projects.', 'public', true, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', now() - interval '3 months', now()),
  (gen_random_uuid(), 'sarah.lim@example.com', 'Sarah Lim Wei Ting', 'Computer Science', 2024, 'Full-stack developer and UI/UX enthusiast. Love creating intuitive digital experiences that solve real-world problems.', 'public', true, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=400&h=400&fit=crop&crop=face', now() - interval '2 months', now()),
  (gen_random_uuid(), 'rajesh.kumar@example.com', 'Rajesh Kumar a/l Subramaniam', 'Electrical Engineering', 2024, 'Electronics engineer focusing on IoT and smart systems. Passionate about bridging the gap between hardware and software.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', now() - interval '4 months', now()),
  
  -- 2023 Graduates  
  (gen_random_uuid(), 'nurul.aisyah@example.com', 'Nurul Aisyah binti Abdullah', 'Civil Engineering', 2023, 'Infrastructure development specialist with focus on sustainable urban planning. Working on smart city initiatives in Kuala Lumpur.', 'public', true, true, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', now() - interval '8 months', now()),
  (gen_random_uuid(), 'kevin.wong@example.com', 'Kevin Wong Kai Ming', 'Mechanical Engineering', 2023, 'Robotics engineer and automation specialist. Currently developing manufacturing solutions for Industry 4.0.', 'public', true, true, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face', now() - interval '7 months', now()),
  (gen_random_uuid(), 'farah.zainal@example.com', 'Farah Zainal binti Abidin', 'Computer Science', 2023, 'Data scientist and machine learning engineer. Specializing in healthcare analytics and predictive modeling.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face', now() - interval '9 months', now()),
  
  -- 2022 Graduates
  (gen_random_uuid(), 'daniel.tan@example.com', 'Daniel Tan Wei Jie', 'Chemical Engineering', 2022, 'Process optimization engineer in petrochemical industry. Leading digital transformation initiatives at multinational corporation.', 'public', true, true, 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face', now() - interval '1 year', now()),
  (gen_random_uuid(), 'priya.nair@example.com', 'Priya Nair a/p Ramakrishan', 'Electrical Engineering', 2022, 'Power systems engineer working on renewable energy integration. Passionate about sustainable energy solutions.', 'public', true, true, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face', now() - interval '14 months', now()),
  (gen_random_uuid(), 'azman.ibrahim@example.com', 'Azman Ibrahim bin Hassan', 'Civil Engineering', 2022, 'Structural engineer specializing in earthquake-resistant design. Currently pursuing PhD in structural dynamics.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', now() - interval '13 months', now()),
  
  -- 2021 Graduates
  (gen_random_uuid(), 'melissa.chua@example.com', 'Melissa Chua Hui Min', 'Computer Science', 2021, 'Senior software engineer and tech lead. Building scalable cloud solutions and mentoring junior developers.', 'public', true, true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', now() - interval '2 years', now()),
  (gen_random_uuid(), 'hafiz.rahman@example.com', 'Hafiz Rahman bin Abdul Malik', 'Mechanical Engineering', 2021, 'Automotive engineer working on electric vehicle development. Focus on battery technology and charging infrastructure.', 'public', true, true, 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face', now() - interval '20 months', now()),
  (gen_random_uuid(), 'jenny.lee@example.com', 'Jenny Lee Mei Ling', 'Chemical Engineering', 2021, 'Environmental engineer focusing on waste management and circular economy. Founded a startup in waste-to-energy solutions.', 'public', true, true, 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face', now() - interval '22 months', now()),
  
  -- 2020 Graduates
  (gen_random_uuid(), 'muhammad.ali@example.com', 'Muhammad Ali bin Omar', 'Electrical Engineering', 2020, 'Senior electrical engineer and project manager. Leading smart grid implementation projects across Southeast Asia.', 'public', true, true, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', now() - interval '3 years', now()),
  (gen_random_uuid(), 'isabel.santos@example.com', 'Isabel Santos', 'Civil Engineering', 2020, 'Transportation engineer specializing in sustainable mobility solutions. Working on MRT expansion projects.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face', now() - interval '2.5 years', now()),
  
  -- 2019 Graduates
  (gen_random_uuid(), 'alex.chen@example.com', 'Alex Chen Yong Wei', 'Computer Science', 2019, 'Tech entrepreneur and founder. Built multiple successful SaaS products serving SMEs across Asia-Pacific region.', 'public', true, true, 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face', now() - interval '4 years', now()),
  (gen_random_uuid(), 'aminah.razak@example.com', 'Aminah Razak binti Ismail', 'Mechanical Engineering', 2019, 'Manufacturing engineer and Six Sigma Black Belt. Leading operational excellence initiatives in aerospace industry.', 'public', true, true, 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face', now() - interval '4.5 years', now()),
  
  -- 2018 Graduates
  (gen_random_uuid(), 'david.loh@example.com', 'David Loh Chee Keong', 'Chemical Engineering', 2018, 'Senior process engineer and technical consultant. Helping companies optimize their chemical processes and reduce environmental impact.', 'public', true, true, 'https://images.unsplash.com/photo-1522075469751-3847ae2c9116?w=400&h=400&fit=crop&crop=face', now() - interval '5 years', now()),
  (gen_random_uuid(), 'kavitha.muthu@example.com', 'Kavitha Muthu a/p Selvam', 'Electrical Engineering', 2018, 'Principal engineer and innovation lead. Driving R&D initiatives in semiconductor and electronics manufacturing.', 'alumni_only', true, true, 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face', now() - interval '5.5 years', now());