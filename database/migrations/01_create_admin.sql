-- This is just for reference - you still need to sign up through the app
-- because Supabase Auth handles password hashing and email verification

-- After creating admin@shop.com through the signup flow,
-- you can verify the user exists with:
SELECT email, created_at FROM auth.users WHERE email = 'admin@shop.com';

-- Optional: Update user metadata
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@shop.com';