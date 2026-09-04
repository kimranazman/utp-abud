-- Clean up orphaned data and add foreign key constraints safely
-- Step 1: Remove orphaned business_locations entries
DELETE FROM public.business_locations 
WHERE business_id NOT IN (SELECT id FROM public.user_businesses);

-- Step 2: Remove orphaned business_images entries (if any)
DELETE FROM public.business_images 
WHERE business_id NOT IN (SELECT id FROM public.user_businesses);

-- Step 3: Remove orphaned business_services entries (if any)
DELETE FROM public.business_services 
WHERE business_id NOT IN (SELECT id FROM public.user_businesses);

-- Step 4: Remove orphaned business_category_mapping entries (if any)
DELETE FROM public.business_category_mapping 
WHERE business_id NOT IN (SELECT id FROM public.user_businesses);

-- Step 5: Now safely add foreign key constraints
-- business_images.business_id -> user_businesses(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_images_business_id'
  ) THEN
    ALTER TABLE public.business_images
    ADD CONSTRAINT fk_business_images_business_id
    FOREIGN KEY (business_id)
    REFERENCES public.user_businesses(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- business_locations.business_id -> user_businesses(id)  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_locations_business_id'
  ) THEN
    ALTER TABLE public.business_locations
    ADD CONSTRAINT fk_business_locations_business_id
    FOREIGN KEY (business_id)
    REFERENCES public.user_businesses(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- business_services.business_id -> user_businesses(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_services_business_id'
  ) THEN
    ALTER TABLE public.business_services
    ADD CONSTRAINT fk_business_services_business_id
    FOREIGN KEY (business_id)
    REFERENCES public.user_businesses(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- business_category_mapping.business_id -> user_businesses(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_category_mapping_business_id'
  ) THEN
    ALTER TABLE public.business_category_mapping
    ADD CONSTRAINT fk_business_category_mapping_business_id
    FOREIGN KEY (business_id)
    REFERENCES public.user_businesses(id)
    ON DELETE CASCADE;
  END IF;
END $$;