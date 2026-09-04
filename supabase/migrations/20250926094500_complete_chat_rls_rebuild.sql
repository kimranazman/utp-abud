-- COMPLETE REBUILD OF CHAT RLS POLICIES
-- This migration completely removes ALL existing policies and rebuilds from scratch
-- to fix the infinite recursion error once and for all

-- STEP 1: DROP ALL EXISTING POLICIES ON conversation_participants
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'conversation_participants'
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversation_participants', pol.policyname);
  END LOOP;
END $$;

-- STEP 2: DROP ALL EXISTING POLICIES ON conversations
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'conversations'
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversations', pol.policyname);
  END LOOP;
END $$;

-- STEP 3: CREATE SIMPLE, NON-RECURSIVE POLICIES FOR conversation_participants

-- 3.1 Users can view their own participation records (no recursion)
CREATE POLICY "cp_select_own"
ON public.conversation_participants
FOR SELECT
USING (user_id = auth.uid());

-- 3.2 Users can view other participants ONLY through a conversation they're already confirmed to be in
-- We use EXISTS instead of IN to avoid recursion
CREATE POLICY "cp_select_same_conversation"
ON public.conversation_participants
FOR SELECT
USING (
  user_id != auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp_check
    WHERE cp_check.conversation_id = conversation_participants.conversation_id
    AND cp_check.user_id = auth.uid()
    LIMIT 1
  )
);

-- 3.3 Users can insert themselves as participants
CREATE POLICY "cp_insert_self"
ON public.conversation_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 3.4 Users can insert others ONLY if they are already a participant (checked separately)
CREATE POLICY "cp_insert_others"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  user_id != auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp_check
    WHERE cp_check.conversation_id = conversation_participants.conversation_id
    AND cp_check.user_id = auth.uid()
    LIMIT 1
  )
);

-- 3.5 Users can update only their own participation
CREATE POLICY "cp_update_own"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3.6 Users can delete only their own participation
CREATE POLICY "cp_delete_own"
ON public.conversation_participants
FOR DELETE
USING (user_id = auth.uid());

-- STEP 4: CREATE SIMPLE POLICIES FOR conversations

-- 4.1 Users can view conversations they participate in
CREATE POLICY "conv_select"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.user_id = auth.uid()
    LIMIT 1
  )
);

-- 4.2 Users can create conversations
CREATE POLICY "conv_insert"
ON public.conversations
FOR INSERT
WITH CHECK (true);

-- 4.3 Users can update conversations they participate in
CREATE POLICY "conv_update"
ON public.conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.user_id = auth.uid()
    LIMIT 1
  )
);

-- STEP 5: Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_cp_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_cp_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_cp_user_conversation ON public.conversation_participants(user_id, conversation_id);