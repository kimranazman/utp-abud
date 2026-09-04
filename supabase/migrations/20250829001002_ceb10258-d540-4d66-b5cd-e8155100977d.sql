-- Add missing foreign key constraints for business_team_members table
-- Only add the ones that don't exist yet

-- Check if user_id foreign key exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'business_team_members_user_id_fkey'
        AND table_name = 'business_team_members'
    ) THEN
        ALTER TABLE public.business_team_members 
        ADD CONSTRAINT business_team_members_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if added_by foreign key exists, if not add it  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'business_team_members_added_by_fkey'
        AND table_name = 'business_team_members'
    ) THEN
        ALTER TABLE public.business_team_members 
        ADD CONSTRAINT business_team_members_added_by_fkey 
        FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;