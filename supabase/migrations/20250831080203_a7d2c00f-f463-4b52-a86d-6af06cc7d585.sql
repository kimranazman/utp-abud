-- Update seed education data to match UTP's actual programmes
-- First, clear existing seed education data and replace with realistic UTP programmes

-- Delete existing education data for seed profiles
DELETE FROM user_education 
WHERE user_id IN (SELECT user_id FROM profiles WHERE is_seed_data = true);

-- Add realistic UTP programmes for seed profiles
DO $$ 
DECLARE
    profile_record RECORD;
    utp_programmes TEXT[][] := ARRAY[
        ['undergraduate', 'Bachelor of Computer Science with Honours'],
        ['undergraduate', 'Bachelor of Chemical Engineering with Honours'],
        ['undergraduate', 'Bachelor of Petroleum Engineering with Honours'],
        ['undergraduate', 'Bachelor of Electrical and Electronic Engineering with Honours'],
        ['undergraduate', 'Bachelor of Mechanical Engineering with Honours'],
        ['undergraduate', 'Bachelor of Civil Engineering with Honours'],
        ['undergraduate', 'Bachelor of Information Technology with Honours'],
        ['undergraduate', 'Bachelor of Business Administration with Honours'],
        ['postgraduate', 'Master of Science in Information Technology'],
        ['postgraduate', 'Master of Engineering in Petroleum Engineering'],
        ['postgraduate', 'Master of Business Administration'],
        ['postgraduate', 'Master of Science in Chemical Engineering'],
        ['postgraduate', 'Doctor of Philosophy in Engineering'],
        ['postgraduate', 'Master of Technology Management']
    ];
    counter INT := 1;
BEGIN
    -- Add UTP education data for each seed profile
    FOR profile_record IN 
        SELECT user_id, full_name, course, graduation_year 
        FROM profiles 
        WHERE is_seed_data = true 
        ORDER BY created_at
    LOOP
        -- Add primary UTP education
        INSERT INTO user_education (
            user_id, 
            programme_level, 
            programme_name, 
            graduation_year, 
            is_primary
        ) VALUES (
            profile_record.user_id,
            utp_programmes[counter][1],
            utp_programmes[counter][2],
            profile_record.graduation_year,
            true
        );
        
        -- Add undergraduate degree for postgraduate students
        IF utp_programmes[counter][1] = 'postgraduate' THEN
            INSERT INTO user_education (
                user_id, 
                programme_level, 
                programme_name, 
                graduation_year, 
                is_primary
            ) VALUES (
                profile_record.user_id,
                'undergraduate',
                CASE counter % 7
                    WHEN 1 THEN 'Bachelor of Computer Science with Honours'
                    WHEN 2 THEN 'Bachelor of Chemical Engineering with Honours'
                    WHEN 3 THEN 'Bachelor of Electrical and Electronic Engineering with Honours'
                    WHEN 4 THEN 'Bachelor of Mechanical Engineering with Honours'
                    WHEN 5 THEN 'Bachelor of Information Technology with Honours'
                    WHEN 6 THEN 'Bachelor of Business Administration with Honours'
                    ELSE 'Bachelor of Petroleum Engineering with Honours'
                END,
                profile_record.graduation_year - CASE 
                    WHEN utp_programmes[counter][2] LIKE '%Doctor%' THEN 6
                    ELSE 3
                END,
                false
            );
        END IF;
        
        counter := counter + 1;
        IF counter > array_length(utp_programmes, 1) THEN
            counter := 1;
        END IF;
    END LOOP;
    
    -- Update profiles table to reflect the correct courses
    UPDATE profiles SET course = ue.programme_name
    FROM user_education ue 
    WHERE profiles.user_id = ue.user_id 
    AND profiles.is_seed_data = true 
    AND ue.is_primary = true;
    
    RAISE NOTICE 'Updated seed data with realistic UTP programmes';
END $$;