-- Mark all existing profiles as verified
UPDATE profiles SET is_verified = true WHERE is_verified = false;