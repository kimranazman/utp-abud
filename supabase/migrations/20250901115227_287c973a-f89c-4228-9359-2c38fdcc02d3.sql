-- Add foreign key constraints for business-related tables if missing
-- This migration is safe: it checks table and constraint existence first
-- Constraint naming: fk_[table]_business_id

-- Helper: add FK if table and column exist and constraint not present
DO $$
DECLARE
  rel RECORD;
BEGIN
  -- 1) business_gallery.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_gallery'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_gallery_business_id'
    ) THEN
      ALTER TABLE public.business_gallery
      ADD CONSTRAINT fk_business_gallery_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- 2) business_contact.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_contact'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_contact_business_id'
    ) THEN
      ALTER TABLE public.business_contact
      ADD CONSTRAINT fk_business_contact_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- 3) business_achievements.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_achievements'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_achievements_business_id'
    ) THEN
      ALTER TABLE public.business_achievements
      ADD CONSTRAINT fk_business_achievements_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- 4) business_metrics.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_metrics'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_metrics_business_id'
    ) THEN
      ALTER TABLE public.business_metrics
      ADD CONSTRAINT fk_business_metrics_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- 5) business_category_mapping.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_category_mapping'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_category_mapping_business_id'
    ) THEN
      ALTER TABLE public.business_category_mapping
      ADD CONSTRAINT fk_business_category_mapping_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- Additionally, add FKs for existing analogous tables to ensure joins work
  -- business_images.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_images'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_images_business_id'
    ) THEN
      ALTER TABLE public.business_images
      ADD CONSTRAINT fk_business_images_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- business_locations.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_locations'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_locations_business_id'
    ) THEN
      ALTER TABLE public.business_locations
      ADD CONSTRAINT fk_business_locations_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;

  -- business_services.business_id -> user_businesses(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'business_services'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_services_business_id'
    ) THEN
      ALTER TABLE public.business_services
      ADD CONSTRAINT fk_business_services_business_id
      FOREIGN KEY (business_id)
      REFERENCES public.user_businesses(id)
      ON DELETE CASCADE;
    END IF;
  END IF;
END $$;