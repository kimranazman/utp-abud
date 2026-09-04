-- Fix security warnings from the linter

-- Fix Function Search Path Mutable warnings by setting search_path
CREATE OR REPLACE FUNCTION public.is_development_mode()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (value->>'enabled')::boolean 
     FROM public.app_config 
     WHERE key = 'development_mode'), 
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.toggle_development_mode(enabled BOOLEAN)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.app_config 
  SET value = jsonb_build_object('enabled', enabled),
      updated_at = now()
  WHERE key = 'development_mode';
$$;