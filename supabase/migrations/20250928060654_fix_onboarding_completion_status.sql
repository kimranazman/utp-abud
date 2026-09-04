-- Fix existing users who have completed all requirements but flag is false
UPDATE profiles p
SET
    required_steps_completed = true,
    updated_at = NOW()
WHERE
    p.full_name IS NOT NULL
    AND p.full_name != ''
    AND EXISTS (SELECT 1 FROM user_education WHERE user_id = p.user_id)
    AND EXISTS (SELECT 1 FROM user_businesses WHERE user_id = p.user_id)
    AND p.required_steps_completed = false;

-- Create a function to automatically check and update completion status
CREATE OR REPLACE FUNCTION check_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has completed all requirements
    IF EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = NEW.user_id
        AND p.full_name IS NOT NULL
        AND p.full_name != ''
        AND EXISTS (SELECT 1 FROM user_education WHERE user_id = p.user_id)
        AND EXISTS (SELECT 1 FROM user_businesses WHERE user_id = p.user_id)
        AND p.required_steps_completed = false
    ) THEN
        -- Update the profile to mark onboarding as completed
        UPDATE profiles
        SET required_steps_completed = true, updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-check completion when education or business entries are added
DROP TRIGGER IF EXISTS check_onboarding_on_education ON user_education;
CREATE TRIGGER check_onboarding_on_education
AFTER INSERT OR UPDATE ON user_education
FOR EACH ROW
EXECUTE FUNCTION check_onboarding_completion();

DROP TRIGGER IF EXISTS check_onboarding_on_business ON user_businesses;
CREATE TRIGGER check_onboarding_on_business
AFTER INSERT OR UPDATE ON user_businesses
FOR EACH ROW
EXECUTE FUNCTION check_onboarding_completion();

-- Also check when profile is updated (for full_name changes)
DROP TRIGGER IF EXISTS check_onboarding_on_profile ON profiles;
CREATE TRIGGER check_onboarding_on_profile
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.full_name IS NOT NULL AND NEW.full_name != '' AND OLD.full_name IS DISTINCT FROM NEW.full_name)
EXECUTE FUNCTION check_onboarding_completion();