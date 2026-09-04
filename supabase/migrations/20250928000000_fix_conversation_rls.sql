-- Fix conversation RLS policies to handle the insert-select pattern better

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS conversations_select ON conversations;

-- Create a better SELECT policy that allows users to see conversations they participate in
CREATE POLICY conversations_select ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Ensure the INSERT policy is correct for authenticated users
DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Make sure participants can only insert themselves
DROP POLICY IF EXISTS participants_insert_self ON conversation_participants;
CREATE POLICY participants_insert_self ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to create conversation with participants atomically
CREATE OR REPLACE FUNCTION create_conversation_atomic(
  p_participant_id uuid,
  p_is_group boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_current_user_id uuid;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if conversation already exists
  SELECT cp1.conversation_id INTO v_conversation_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  INNER JOIN conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = v_current_user_id
    AND cp2.user_id = p_participant_id
    AND c.is_group = false
    AND cp1.user_id != cp2.user_id
  LIMIT 1;

  -- If conversation exists, return it
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (is_group)
  VALUES (p_is_group)
  RETURNING id INTO v_conversation_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (v_conversation_id, v_current_user_id),
    (v_conversation_id, p_participant_id);

  RETURN v_conversation_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create conversation: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_conversation_atomic TO authenticated;

-- Add comment to explain the function
COMMENT ON FUNCTION create_conversation_atomic IS 'Creates a conversation with participants atomically, avoiding RLS issues';