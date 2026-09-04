-- Grant alumni role to the current admin user
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'alumni'::user_role
FROM public.user_roles 
WHERE role = 'admin'::user_role
ON CONFLICT (user_id, role) DO NOTHING;