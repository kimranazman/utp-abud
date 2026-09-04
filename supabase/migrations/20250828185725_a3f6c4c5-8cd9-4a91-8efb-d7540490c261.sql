-- Grant admin role to Khairul Imran bin Azman
UPDATE user_roles 
SET role = 'admin'::user_role 
WHERE user_id = '5fb94b57-ae72-4808-9462-35446f22818e';

-- Also mark the profile as verified since they're now an admin
UPDATE profiles 
SET is_verified = true 
WHERE user_id = '5fb94b57-ae72-4808-9462-35446f22818e';