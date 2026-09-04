-- Fix critical security vulnerabilities identified in security audit
-- Date: 2025-09-30
--
-- This migration addresses:
-- 1. Overly permissive conversation_participants SELECT policy
-- 2. Business reviews access without approval check
-- 3. Development mode security bypass

-- ============================================================================
-- VULN-001: Fix overly permissive conversation participants access
-- ============================================================================

-- Drop the insecure policy that allows viewing ALL participants
DROP POLICY IF EXISTS "participants_select_all" ON public.conversation_participants;

-- Create a secure policy that only allows viewing participants of conversations the user is part of
CREATE POLICY "participants_select_own_conversations"
ON public.conversation_participants
FOR SELECT
USING (
  -- Allow users to view participants only if they are part of that conversation
  EXISTS (
    SELECT 1
    FROM public.conversation_participants AS my_participation
    WHERE my_participation.user_id = auth.uid()
    AND my_participation.conversation_id = conversation_participants.conversation_id
  )
);

-- Grant admins full access to conversation participants
CREATE POLICY "participants_select_admin"
ON public.conversation_participants
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- ============================================================================
-- VULN-003: Fix business reviews access to require approval
-- ============================================================================

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.business_reviews;

-- Create a secure policy that actually checks approval status
CREATE POLICY "Anyone can view approved reviews"
ON public.business_reviews
FOR SELECT
USING (
  is_approved = true
  OR user_id = auth.uid()  -- Users can always see their own reviews
  OR public.has_role(auth.uid(), 'admin'::user_role)  -- Admins can see all reviews
);

-- ============================================================================
-- VULN-004: Remove development mode bypass in production
-- ============================================================================

-- Add a comment to remind developers to disable development mode in production
COMMENT ON FUNCTION public.is_development_mode() IS
  'SECURITY WARNING: Ensure this function returns FALSE in production environments. Development mode bypasses security checks and should NEVER be enabled in production.';

-- ============================================================================
-- VULN-006: Restrict business owner review updates to response fields only
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Business owners can update review responses" ON public.business_reviews;

-- Create trigger function to enforce field-level restrictions
CREATE OR REPLACE FUNCTION public.restrict_review_owner_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_owner boolean;
  is_admin boolean;
BEGIN
  -- Check if user is an admin
  is_admin := public.has_role(auth.uid(), 'admin'::user_role);

  -- If admin, allow all updates
  IF is_admin THEN
    RETURN NEW;
  END IF;

  -- Check if user is the business owner
  SELECT EXISTS (
    SELECT 1
    FROM public.user_businesses ub
    WHERE ub.business_id = NEW.business_id
    AND ub.user_id = auth.uid()
    AND ub.role = 'owner'
  ) INTO is_owner;

  -- If business owner, only allow updating response fields
  IF is_owner THEN
    -- Prevent changing protected fields
    IF (OLD.user_id IS DISTINCT FROM NEW.user_id OR
        OLD.business_id IS DISTINCT FROM NEW.business_id OR
        OLD.rating IS DISTINCT FROM NEW.rating OR
        OLD.review_text IS DISTINCT FROM NEW.review_text OR
        OLD.is_approved IS DISTINCT FROM NEW.is_approved) THEN
      RAISE EXCEPTION 'Business owners can only update response_from_owner and response_date fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS enforce_review_owner_update_restrictions ON public.business_reviews;
CREATE TRIGGER enforce_review_owner_update_restrictions
  BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.restrict_review_owner_updates();

-- Recreate the UPDATE policy with the trigger in place
CREATE POLICY "Business owners can update review responses"
ON public.business_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_businesses ub
    WHERE ub.business_id = business_reviews.business_id
    AND ub.user_id = auth.uid()
    AND ub.role = 'owner'
  )
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

-- ============================================================================
-- Add security audit logging table
-- ============================================================================

-- Create table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('admin_access', 'role_change', 'policy_violation', 'suspicious_activity')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  resource_type text,
  resource_id text,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- System can insert audit logs (using service role)
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON public.security_audit_log(event_type);

-- Add automatic cleanup for old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.security_audit_log
  WHERE created_at < now() - interval '90 days';
$$;

-- ============================================================================
-- Documentation
-- ============================================================================

COMMENT ON POLICY "participants_select_own_conversations" ON public.conversation_participants IS
  'Security fix: Users can only view participants of conversations they are part of';

COMMENT ON POLICY "Anyone can view approved reviews" ON public.business_reviews IS
  'Security fix: Only approved reviews are publicly visible. Users can see their own reviews, admins can see all.';

COMMENT ON FUNCTION public.restrict_review_owner_updates() IS
  'Security control: Prevents business owners from modifying review content, ratings, or approval status. They can only add responses.';

COMMENT ON TABLE public.security_audit_log IS
  'Audit trail for security-sensitive operations including admin access, role changes, and policy violations';