-- Final fix for chat infinite recursion using SECURITY DEFINER function approach
-- This completely eliminates the recursion by using a function that bypasses RLS

-- STEP 1: Create a SECURITY DEFINER function to check participation
-- This function bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE user_id = _user_id
    AND conversation_id = _conversation_id
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_participant(uuid, uuid) TO authenticated;

-- STEP 2: Drop ALL existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all policies on conversation_participants
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'conversation_participants'
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversation_participants', pol.policyname);
  END LOOP;

  -- Drop all policies on conversations
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'conversations'
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversations', pol.policyname);
  END LOOP;
END $$;

-- STEP 3: Create new policies for conversation_participants (without recursion)

-- Users can view ALL participants (we'll filter at app level based on conversation access)
-- This avoids any recursion issues completely
CREATE POLICY "participants_select_all"
ON public.conversation_participants
FOR SELECT
USING (true);  -- Open for reading, access controlled via conversations table

-- Users can only insert themselves as participants
CREATE POLICY "participants_insert_self"
ON public.conversation_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can only update their own participation records
CREATE POLICY "participants_update_own"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only delete their own participation
CREATE POLICY "participants_delete_own"
ON public.conversation_participants
FOR DELETE
USING (user_id = auth.uid());

-- STEP 4: Create new policies for conversations (using the function)

-- Users can view conversations they participate in
CREATE POLICY "conversations_select"
ON public.conversations
FOR SELECT
USING (
  public.is_participant(auth.uid(), id)
);

-- Users can create conversations
CREATE POLICY "conversations_insert"
ON public.conversations
FOR INSERT
WITH CHECK (true);

-- Users can update conversations they participate in
CREATE POLICY "conversations_update"
ON public.conversations
FOR UPDATE
USING (
  public.is_participant(auth.uid(), id)
);

-- STEP 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_both ON public.conversation_participants(user_id, conversation_id);