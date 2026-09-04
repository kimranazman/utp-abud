-- Add user_deletion event type to security_audit_log
-- This improves audit clarity for admin user deletion actions

-- Drop existing constraint
ALTER TABLE public.security_audit_log
DROP CONSTRAINT IF EXISTS security_audit_log_event_type_check;

-- Add new constraint with user_deletion included
ALTER TABLE public.security_audit_log
ADD CONSTRAINT security_audit_log_event_type_check
CHECK (event_type IN ('admin_access', 'role_change', 'policy_violation', 'suspicious_activity', 'user_deletion'));

-- Add comment for documentation
COMMENT ON TABLE public.security_audit_log IS
'Audit trail for security-sensitive operations including admin access, role changes, user deletions, and policy violations';
