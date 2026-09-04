-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view other participants in conversations they're part of" ON public.conversation_participants;

-- Create a security definer function to check if user is in conversation
CREATE OR REPLACE FUNCTION public.user_in_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

-- Create new policy using the function
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants 
FOR SELECT 
USING (public.user_in_conversation(conversation_id, auth.uid()));