-- Enhanced seed data with complete profile information
-- This will add education, career history, achievements, and businesses for existing seed profiles

-- First, add education data for seed profiles
DO $$ 
DECLARE
    profile_record RECORD;
    education_programs TEXT[][] := ARRAY[
        ['Bachelors', 'Bachelor of Computer Science'],
        ['Masters', 'Master of Public Health'],
        ['Masters', 'Master of Fine Arts'],
        ['Masters', 'Master of Environmental Science'],
        ['Masters', 'Master of Data Science'],
        ['Masters', 'Master of Finance'],
        ['Masters', 'Master of Engineering'],
        ['Masters', 'Master of Business Administration'],
        ['Bachelors', 'Bachelor of Engineering'],
        ['Masters', 'Master of Information Technology']
    ];
    career_positions TEXT[][] := ARRAY[
        ['Senior Software Engineer', 'Tech Innovations Inc.'],
        ['Public Health Director', 'Global Health Solutions'],
        ['Creative Director', 'Design Studio Barcelona'],
        ['Environmental Consultant', 'EcoStrategy Partners'],
        ['Data Scientist', 'AI Analytics Corp'],
        ['Investment Manager', 'Emerging Markets Capital'],
        ['Project Engineer', 'Solar Energy Solutions'],
        ['Marketing Director', 'Digital Growth Agency'],
        ['Senior Developer', 'StartupTech'],
        ['Research Analyst', 'Innovation Labs']
    ];
    achievement_data TEXT[][] := ARRAY[
        ['Outstanding Graduate Award', 'University Excellence Program'],
        ['Innovation in Public Health', 'WHO Recognition Program'],
        ['Best Creative Campaign', 'European Design Awards'],
        ['Environmental Leadership Award', 'Green Business Council'],
        ['AI Research Excellence', 'International Data Science Society'],
        ['Young Finance Professional', 'CFA Institute'],
        ['Renewable Energy Innovation', 'Latin America Engineering Society'],
        ['Digital Marketing Excellence', 'Asia Pacific Marketing Awards'],
        ['Tech Leadership Award', 'Startup Accelerator Program'],
        ['Research Publication Award', 'Academic Excellence Society']
    ];
    counter INT := 1;
BEGIN
    -- Add education data for each seed profile
    FOR profile_record IN 
        SELECT user_id, course, graduation_year 
        FROM profiles 
        WHERE is_seed_data = true 
        ORDER BY created_at
    LOOP
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
        ) ON CONFLICT (user_id, programme_name) DO NOTHING;
        
        -- Additional education for some profiles
        IF counter % 3 = 0 THEN
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
            ) ON CONFLICT (user_id, programme_name) DO NOTHING;
        END IF;
        
        -- Add career history
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
            CASE WHEN counter % 2 = 0 THEN NULL ELSE CURRENT_DATE - INTERVAL '1 year' END,
            counter % 2 = 0,
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
        ) ON CONFLICT DO NOTHING;
        
        -- Add previous position for some profiles
        IF counter % 2 = 1 THEN
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
                'Junior ' || SPLIT_PART(career_positions[counter][1], ' ', 2) || ' ' || SPLIT_PART(career_positions[counter][1], ' ', 3),
                'Previous Company Ltd',
                CURRENT_DATE - INTERVAL '5 years',
                CURRENT_DATE - INTERVAL '3 years',
                false,
                'Remote',
                'Gained valuable experience and developed foundational skills in the industry.'
            ) ON CONFLICT DO NOTHING;
        END IF;
        
        -- Add achievements
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
        ) ON CONFLICT DO NOTHING;
        
        -- Add second achievement for some profiles
        IF counter % 3 = 0 THEN
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
            ) ON CONFLICT DO NOTHING;
        END IF;
        
        -- Add contributions for some profiles
        IF counter % 2 = 0 THEN
            INSERT INTO contributions (
                user_id,
                organization_name,
                contribution_type,
                value_amount,
                currency,
                start_date,
                end_date,
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
                NULL,
                true,
                'Supporting education and technology access in underserved communities.',
                'Board Member'
            ) ON CONFLICT DO NOTHING;
        END IF;
        
        counter := counter + 1;
        IF counter > 10 THEN
            counter := 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Enhanced seed data has been added successfully';
END $$;