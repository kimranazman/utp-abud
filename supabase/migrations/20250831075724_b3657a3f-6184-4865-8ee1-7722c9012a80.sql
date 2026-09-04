-- Enhanced seed data with complete profile information
-- This will add education, career history, achievements, and social links for existing seed profiles

DO $$ 
DECLARE
    profile_record RECORD;
    counter INT := 1;
BEGIN
    -- Add comprehensive data for each seed profile
    FOR profile_record IN 
        SELECT user_id, full_name, course, graduation_year 
        FROM profiles 
        WHERE is_seed_data = true 
        ORDER BY created_at
    LOOP
        -- Add primary education if not exists
        INSERT INTO user_education (
            user_id, 
            programme_level, 
            programme_name, 
            graduation_year, 
            is_primary
        ) 
        SELECT 
            profile_record.user_id,
            CASE 
                WHEN profile_record.course LIKE 'Bachelor%' THEN 'undergraduate'
                ELSE 'postgraduate'
            END,
            profile_record.course,
            profile_record.graduation_year,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM user_education WHERE user_id = profile_record.user_id
        );
        
        -- Add career history if not exists
        INSERT INTO career_history (user_id, position, company_name, start_date, current_position, location, description)
        SELECT 
            profile_record.user_id,
            CASE counter % 8
                WHEN 1 THEN 'Senior Software Engineer'
                WHEN 2 THEN 'Public Health Director'
                WHEN 3 THEN 'Creative Director'
                WHEN 4 THEN 'Environmental Consultant'
                WHEN 5 THEN 'Data Scientist'
                WHEN 6 THEN 'Investment Manager'
                WHEN 7 THEN 'Project Engineer'
                ELSE 'Marketing Director'
            END,
            CASE counter % 8
                WHEN 1 THEN 'Tech Innovations Inc.'
                WHEN 2 THEN 'Global Health Solutions'
                WHEN 3 THEN 'Design Studio Barcelona'
                WHEN 4 THEN 'EcoStrategy Partners'
                WHEN 5 THEN 'AI Analytics Corp'
                WHEN 6 THEN 'Emerging Markets Capital'
                WHEN 7 THEN 'Solar Energy Solutions'
                ELSE 'Digital Growth Agency'
            END,
            CURRENT_DATE - INTERVAL '3 years',
            true,
            CASE counter % 8
                WHEN 1 THEN 'New York, USA'
                WHEN 2 THEN 'London, UK'
                WHEN 3 THEN 'Barcelona, Spain'
                WHEN 4 THEN 'Vancouver, Canada'
                WHEN 5 THEN 'Seoul, South Korea'
                WHEN 6 THEN 'Mumbai, India'
                WHEN 7 THEN 'São Paulo, Brazil'
                ELSE 'Singapore'
            END,
            'Leading innovative projects and driving strategic initiatives in a dynamic work environment.'
        WHERE NOT EXISTS (
            SELECT 1 FROM career_history WHERE user_id = profile_record.user_id
        );
        
        -- Add achievements if not exists
        INSERT INTO achievements (user_id, title, organization, date_achieved, description)
        SELECT 
            profile_record.user_id,
            CASE counter % 8
                WHEN 1 THEN 'Outstanding Graduate Award'
                WHEN 2 THEN 'Innovation in Public Health'
                WHEN 3 THEN 'Best Creative Campaign'
                WHEN 4 THEN 'Environmental Leadership Award'
                WHEN 5 THEN 'AI Research Excellence'
                WHEN 6 THEN 'Young Finance Professional'
                WHEN 7 THEN 'Renewable Energy Innovation'
                ELSE 'Digital Marketing Excellence'
            END,
            CASE counter % 8
                WHEN 1 THEN 'University Excellence Program'
                WHEN 2 THEN 'WHO Recognition Program'
                WHEN 3 THEN 'European Design Awards'
                WHEN 4 THEN 'Green Business Council'
                WHEN 5 THEN 'International Data Science Society'
                WHEN 6 THEN 'CFA Institute'
                WHEN 7 THEN 'Latin America Engineering Society'
                ELSE 'Asia Pacific Marketing Awards'
            END,
            CURRENT_DATE - INTERVAL '1 year',
            'Recognized for exceptional performance and significant contributions to the field.'
        WHERE NOT EXISTS (
            SELECT 1 FROM achievements WHERE user_id = profile_record.user_id
        );
        
        -- Add social links if not exists
        INSERT INTO user_links (user_id, platform, url, display_text)
        SELECT 
            profile_record.user_id,
            'LinkedIn',
            'https://linkedin.com/in/' || LOWER(REPLACE(profile_record.full_name, ' ', '-')),
            profile_record.full_name || ' - LinkedIn'
        WHERE NOT EXISTS (
            SELECT 1 FROM user_links WHERE user_id = profile_record.user_id
        );
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Enhanced seed data has been added successfully';
END $$;