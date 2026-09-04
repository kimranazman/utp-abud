-- Add business reviews and metrics tables for enhanced business pages

-- Create business_reviews table for customer testimonials
CREATE TABLE IF NOT EXISTS public.business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  response_from_owner TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_metrics table for storing business statistics
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'employees', 'projects', 'clients', 'revenue_growth', etc.
  metric_value NUMERIC,
  metric_unit TEXT, -- 'count', 'percentage', 'currency', etc.
  metric_period TEXT, -- 'monthly', 'yearly', 'all_time', etc.
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, metric_type, metric_period)
);

-- Create business_achievements table
CREATE TABLE IF NOT EXISTS public.business_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE,
  icon_type TEXT, -- 'award', 'certificate', 'milestone', etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_gallery table for images
CREATE TABLE IF NOT EXISTS public.business_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_type TEXT, -- 'logo', 'cover', 'gallery', 'team', 'product', etc.
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_contact table for additional contact methods
CREATE TABLE IF NOT EXISTS public.business_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL, -- 'phone', 'email', 'whatsapp', 'telegram', etc.
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_reviewer_id ON business_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_business_metrics_business_id ON business_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_achievements_business_id ON business_achievements(business_id);
CREATE INDEX IF NOT EXISTS idx_business_gallery_business_id ON business_gallery(business_id);
CREATE INDEX IF NOT EXISTS idx_business_contact_business_id ON business_contact(business_id);

-- Enable RLS
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contact ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_reviews
CREATE POLICY "Anyone can view approved reviews" 
ON business_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON business_reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
ON business_reviews FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
ON business_reviews FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Business owners can respond to reviews
CREATE POLICY "Business owners can update review responses" 
ON business_reviews FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = business_reviews.business_id 
    AND user_businesses.user_id = auth.uid()
  )
);

-- RLS Policies for business_metrics
CREATE POLICY "Anyone can view public metrics" 
ON business_metrics FOR SELECT 
USING (is_public = true);

CREATE POLICY "Business owners can manage metrics" 
ON business_metrics FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = business_metrics.business_id 
    AND user_businesses.user_id = auth.uid()
  )
);

-- RLS Policies for business_achievements
CREATE POLICY "Anyone can view achievements" 
ON business_achievements FOR SELECT 
USING (true);

CREATE POLICY "Business owners can manage achievements" 
ON business_achievements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = business_achievements.business_id 
    AND user_businesses.user_id = auth.uid()
  )
);

-- RLS Policies for business_gallery
CREATE POLICY "Anyone can view gallery images" 
ON business_gallery FOR SELECT 
USING (true);

CREATE POLICY "Business owners can manage gallery" 
ON business_gallery FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = business_gallery.business_id 
    AND user_businesses.user_id = auth.uid()
  )
);

-- RLS Policies for business_contact
CREATE POLICY "Anyone can view public contact info" 
ON business_contact FOR SELECT 
USING (is_public = true);

CREATE POLICY "Business owners can manage contact info" 
ON business_contact FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = business_contact.business_id 
    AND user_businesses.user_id = auth.uid()
  )
);

-- Add some sample data for seed businesses (optional)
DO $$ 
DECLARE
  business_record RECORD;
BEGIN
  -- Add sample metrics for seed businesses
  FOR business_record IN 
    SELECT ub.id as business_id, ub.business_name 
    FROM user_businesses ub
    INNER JOIN profiles p ON ub.user_id = p.user_id
    WHERE p.is_seed_data = true
    LIMIT 3
  LOOP
    -- Add business metrics
    INSERT INTO business_metrics (business_id, metric_type, metric_value, metric_unit, metric_period, display_order)
    VALUES 
      (business_record.business_id, 'employees', 10 + floor(random() * 50), 'count', 'current', 1),
      (business_record.business_id, 'projects', 20 + floor(random() * 100), 'count', 'all_time', 2),
      (business_record.business_id, 'clients', 50 + floor(random() * 200), 'count', 'all_time', 3),
      (business_record.business_id, 'growth_rate', 100 + floor(random() * 200), 'percentage', 'yearly', 4)
    ON CONFLICT DO NOTHING;
    
    -- Add business achievements
    INSERT INTO business_achievements (business_id, title, description, icon_type, display_order)
    VALUES 
      (business_record.business_id, 'Industry Excellence Award', 'Recognized for outstanding service delivery', 'award', 1),
      (business_record.business_id, 'ISO 9001:2015 Certified', 'International quality management certification', 'certificate', 2),
      (business_record.business_id, '100+ Projects Milestone', 'Successfully completed over 100 client projects', 'milestone', 3)
    ON CONFLICT DO NOTHING;
    
    -- Add sample reviews
    INSERT INTO business_reviews (business_id, reviewer_id, rating, title, content, is_verified_purchase)
    SELECT 
      business_record.business_id,
      p.user_id,
      4 + floor(random() * 2)::int,
      'Excellent Service',
      'Professional team with great expertise. Delivered beyond expectations.',
      true
    FROM profiles p
    WHERE p.is_seed_data = true 
    AND p.user_id != (SELECT user_id FROM user_businesses WHERE id = business_record.business_id)
    LIMIT 2
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;