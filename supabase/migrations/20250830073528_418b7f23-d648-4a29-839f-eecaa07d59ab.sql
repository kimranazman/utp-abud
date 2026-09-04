-- Drop the problematic policies and recreate them properly
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own participation records" 
ON public.conversation_participants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view other participants in conversations they're part of"
ON public.conversation_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to new conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::user_role));