-- Fix foreign key relationships for business_team_members table
ALTER TABLE public.business_team_members 
ADD CONSTRAINT business_team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.business_team_members 
ADD CONSTRAINT business_team_members_added_by_fkey 
FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Also add foreign key for business_id to ensure data integrity
ALTER TABLE public.business_team_members 
ADD CONSTRAINT business_team_members_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.user_businesses(id) ON DELETE CASCADE;