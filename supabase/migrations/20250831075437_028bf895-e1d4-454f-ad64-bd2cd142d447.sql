-- Enhanced seed data with complete profile information
-- This will add education, career history, achievements, contributions, and social links for existing seed profiles

DO $$ 
DECLARE
    profile_record RECORD;
    career_positions TEXT[][] := ARRAY[
        ['Senior Software Engineer', 'Tech Innovations Inc.'],
        ['Public Health Director', 'Global Health Solutions'],
        ['Creative Director', 'Design Studio Barcelona'],
        ['Environmental Consultant', 'EcoStrategy Partners'],
        ['Data Scientist', 'AI Analytics Corp'],
        ['Investment Manager', 'Emerging Markets Capital'],
        ['Project Engineer', 'Solar Energy Solutions'],
        ['Marketing Director', 'Digital Growth Agency']
    ];
    achievement_data TEXT[][] := ARRAY[
        ['Outstanding Graduate Award', 'University Excellence Program'],
        ['Innovation in Public Health', 'WHO Recognition Program'],
        ['Best Creative Campaign', 'European Design Awards'],
        ['Environmental Leadership Award', 'Green Business Council'],
        ['AI Research Excellence', 'International Data Science Society'],
        ['Young Finance Professional', 'CFA Institute'],
        ['Renewable Energy Innovation', 'Latin America Engineering Society'],
        ['Digital Marketing Excellence', 'Asia Pacific Marketing Awards']
    ];
    social_links TEXT[][] := ARRAY[
        ['LinkedIn', 'https://linkedin.com/in/'],
        ['Twitter', 'https://twitter.com/'],
        ['GitHub', 'https://github.com/'],
        ['Portfolio', 'https://portfolio.'],
        ['Medium', 'https://medium.com/@'],
        ['Instagram', 'https://instagram.com/'],
        ['Website', 'https://www.'],
        ['YouTube', 'https://youtube.com/@']
    ];
    counter INT := 1;
    user_exists BOOLEAN;
BEGIN
    -- Add comprehensive data for each seed profile
    FOR profile_record IN 
        SELECT user_id, full_name, course, graduation_year 
        FROM profiles 
        WHERE is_seed_data = true 
        ORDER BY created_at
    LOOP
        -- Check if user_education already exists
        SELECT EXISTS(SELECT 1 FROM user_education WHERE user_id = profile_record.user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            -- Primary education (matches their course)
            INSERT INTO user_education (
                user_id, 
                programme_level, 
                programme_name, 
                graduation_year, 
                is_primary
            ) VALUES (
                profile_record.user_id,
                CASE 
                    WHEN profile_record.course LIKE 'Bachelor%' THEN 'Bachelors'
                    ELSE 'Masters'
                END,
                profile_record.course,
                profile_record.graduation_year,
                true
            );
            
            -- Additional undergraduate education for Master's degree holders
            IF profile_record.course LIKE 'Master%' THEN
                INSERT INTO user_education (
                    user_id, 
                    programme_level, 
                    programme_name, 
                    graduation_year, 
                    is_primary
                ) VALUES (
                    profile_record.user_id,
                    'Bachelors',
                    'Bachelor of Science',
                    profile_record.graduation_year - 2,
                    false
                );
            END IF;
        END IF;
        
        -- Check if career_history already exists
        SELECT EXISTS(SELECT 1 FROM career_history WHERE user_id = profile_record.user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            -- Current position
            INSERT INTO career_history (
                user_id,
                position,
                company_name,
                start_date,
                end_date,
                current_position,
                location,
                description
            ) VALUES (
                profile_record.user_id,
                career_positions[counter][1],
                career_positions[counter][2],
                CURRENT_DATE - INTERVAL '3 years',
                NULL,
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
            );
            
            -- Previous position
            INSERT INTO career_history (
                user_id,
                position,
                company_name,
                start_date,
                end_date,
                current_position,
                location,
                description
            ) VALUES (
                profile_record.user_id,
                'Mid-level ' || SPLIT_PART(career_positions[counter][1], ' ', 2) || ' ' || COALESCE(SPLIT_PART(career_positions[counter][1], ' ', 3), 'Specialist'),
                'Previous Innovations Corp',
                CURRENT_DATE - INTERVAL '5 years',
                CURRENT_DATE - INTERVAL '3 years',
                false,
                'Remote',
                'Gained valuable experience and developed foundational skills in the industry.'
            );
        END IF;
        
        -- Check if achievements already exist
        SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = profile_record.user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            -- Primary achievement
            INSERT INTO achievements (
                user_id,
                title,
                organization,
                date_achieved,
                description
            ) VALUES (
                profile_record.user_id,
                achievement_data[counter][1],
                achievement_data[counter][2],
                CURRENT_DATE - INTERVAL '1 year' * (counter % 3 + 1),
                'Recognized for exceptional performance and significant contributions to the field.'
            );
            
            -- Second achievement for variety
            IF counter % 2 = 0 THEN
                INSERT INTO achievements (
                    user_id,
                    title,
                    organization,
                    date_achieved,
                    description
                ) VALUES (
                    profile_record.user_id,
                    'Excellence in Leadership',
                    'Professional Development Institute',
                    CURRENT_DATE - INTERVAL '2 years',
                    'Demonstrated outstanding leadership capabilities and team management skills.'
                );
            END IF;
        END IF;
        
        -- Check if contributions already exist
        SELECT EXISTS(SELECT 1 FROM contributions WHERE user_id = profile_record.user_id) INTO user_exists;
        
        IF NOT user_exists AND counter % 2 = 0 THEN
            INSERT INTO contributions (
                user_id,
                organization_name,
                contribution_type,
                value_amount,
                currency,
                start_date,
                current_contribution,
                description,
                role
            ) VALUES (
                profile_record.user_id,
                'Community Development Foundation',
                'monetary',
                5000 + (counter * 1000),
                'USD',
                CURRENT_DATE - INTERVAL '2 years',
                true,
                'Supporting education and technology access in underserved communities.',
                'Board Member'
            );
        END IF;
        
        -- Check if social links already exist
        SELECT EXISTS(SELECT 1 FROM user_links WHERE user_id = profile_record.user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            -- Add LinkedIn profile
            INSERT INTO user_links (
                user_id,
                platform,
                url,
                display_text
            ) VALUES (
                profile_record.user_id,
                'LinkedIn',
                'https://linkedin.com/in/' || LOWER(REPLACE(profile_record.full_name, ' ', '-')),
                profile_record.full_name || ' - LinkedIn'
            );
            
            -- Add additional social link based on their field
            INSERT INTO user_links (
                user_id,
                platform,
                url,
                display_text
            ) VALUES (
                profile_record.user_id,
                social_links[counter][1],
                social_links[counter][2] || LOWER(REPLACE(profile_record.full_name, ' ', '')),
                COALESCE(SPLIT_PART(profile_record.full_name, ' ', 1), profile_record.full_name) || '''s ' || social_links[counter][1]
            );
        END IF;
        
        counter := counter + 1;
        IF counter > 8 THEN
            counter := 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Enhanced seed data has been added successfully for % profiles', counter - 1;
END $$;