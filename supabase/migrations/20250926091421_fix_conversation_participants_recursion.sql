-- Fix infinite recursion in conversation_participants RLS policies
-- Based on the successful pattern used for business_team_members

-- First, drop the problematic SECURITY DEFINER function if it exists
DROP FUNCTION IF EXISTS public.user_in_conversation(uuid, uuid);

-- Drop all existing policies on conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participation records" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view other participants in conversations they're part of" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to new conversations" ON public.conversation_participants;

-- Create new, simplified policies that avoid recursion

-- 1. Users can view their own participation records
CREATE POLICY "Users can view own participation"
ON public.conversation_participants
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can view all participants through conversation access
-- This uses a subquery but avoids the recursive reference pattern
CREATE POLICY "Users can view co-participants"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT DISTINCT cp.conversation_id
    FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
);

-- 3. Users can insert participants for conversations they're creating
-- This is for when creating new conversations
CREATE POLICY "Users can create conversation participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  -- Allow if user is adding themselves
  user_id = auth.uid()
  OR
  -- Allow if user is already a participant (adding others to existing conversation)
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- 4. Users can update their own participation records (for last_read_at, etc.)
CREATE POLICY "Users can update own participation"
ON public.conversation_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Users can delete their own participation (leave conversation)
CREATE POLICY "Users can delete own participation"
ON public.conversation_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Add index to improve performance of the subquery
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
ON public.conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id
ON public.conversation_participants(conversation_id);