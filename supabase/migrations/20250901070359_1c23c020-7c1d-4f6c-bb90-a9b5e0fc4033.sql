-- Create business_categories table for main categories
CREATE TABLE IF NOT EXISTS public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- icon name for UI (e.g., 'Zap' for Energy)
  color TEXT, -- hex color for category
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_subcategories table
CREATE TABLE IF NOT EXISTS public.business_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES business_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Create junction table for businesses to categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.business_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES business_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES business_subcategories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- mark primary category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, category_id, subcategory_id)
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add category reference to business_services
ALTER TABLE public.business_services
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS price_range TEXT, -- e.g., "$", "$$", "$$$", "$$$$"
ADD COLUMN IF NOT EXISTS delivery_method TEXT[]; -- ['online', 'onsite', 'hybrid']

-- Add enhanced business fields
ALTER TABLE public.user_businesses
ADD COLUMN IF NOT EXISTS business_size TEXT CHECK (business_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS employee_count_range TEXT CHECK (employee_count_range IN ('1-10', '11-50', '51-200', '201-500', '500+')),
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[]; -- for searchable tags

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_categories_slug ON business_categories(slug);
CREATE INDEX IF NOT EXISTS idx_business_subcategories_category ON business_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_business_subcategories_slug ON business_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_business_category_mapping_business ON business_category_mapping(business_id);
CREATE INDEX IF NOT EXISTS idx_business_category_mapping_category ON business_category_mapping(category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_business_services_category ON business_services(category_id);

-- Enable RLS
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies (everyone can read categories)
CREATE POLICY "Anyone can view business categories"
ON business_categories FOR SELECT USING (true);

CREATE POLICY "Anyone can view business subcategories"
ON business_subcategories FOR SELECT USING (true);

CREATE POLICY "Anyone can view category mappings"
ON business_category_mapping FOR SELECT USING (true);

CREATE POLICY "Anyone can view service categories"
ON service_categories FOR SELECT USING (true);

-- Business owners can manage their category mappings
CREATE POLICY "Business owners can manage their categories"
ON business_category_mapping FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_businesses
    WHERE user_businesses.id = business_category_mapping.business_id
    AND user_businesses.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_business_categories_updated_at
BEFORE UPDATE ON business_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_subcategories_updated_at
BEFORE UPDATE ON business_subcategories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON service_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert main business categories
INSERT INTO business_categories (name, slug, description, icon, color, display_order) VALUES
('Energy', 'energy', 'Energy, oil & gas, renewables, and utilities', 'Zap', '#10B981', 1),
('Technology', 'technology', 'Software, IT services, and digital innovation', 'Cpu', '#3B82F6', 2),
('Professional Services', 'professional-services', 'Consulting, legal, accounting, and business services', 'Briefcase', '#8B5CF6', 3),
('Manufacturing & Industrial', 'manufacturing', 'Manufacturing, production, and industrial services', 'Factory', '#F59E0B', 4),
('Healthcare & Life Sciences', 'healthcare', 'Medical services, biotech, and pharmaceuticals', 'Heart', '#EF4444', 5),
('Financial Services', 'financial', 'Banking, insurance, and financial solutions', 'DollarSign', '#14B8A6', 6),
('Real Estate & Construction', 'real-estate', 'Property, construction, and infrastructure', 'Building', '#F97316', 7),
('Education & Training', 'education', 'Educational services and professional development', 'GraduationCap', '#6366F1', 8),
('Food & Agriculture', 'food-agriculture', 'Food production, agriculture, and F&B services', 'Utensils', '#84CC16', 9),
('Transportation & Logistics', 'transportation', 'Logistics, shipping, and transportation services', 'Truck', '#06B6D4', 10),
('Media & Entertainment', 'media', 'Media, content, and entertainment services', 'Film', '#EC4899', 11),
('Retail & Consumer', 'retail', 'Retail, e-commerce, and consumer goods', 'ShoppingBag', '#F43F5E', 12);

-- Insert subcategories for Energy
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Oil & Gas - Upstream', 'oil-gas-upstream', 1 FROM business_categories WHERE slug = 'energy';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Oil & Gas - Downstream', 'oil-gas-downstream', 2 FROM business_categories WHERE slug = 'energy';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Renewable Energy', 'renewable-energy', 3 FROM business_categories WHERE slug = 'energy';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Power Generation', 'power-generation', 4 FROM business_categories WHERE slug = 'energy';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Energy Services & Consulting', 'energy-services', 5 FROM business_categories WHERE slug = 'energy';

-- Insert subcategories for Technology
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Software Development', 'software-development', 1 FROM business_categories WHERE slug = 'technology';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'IT Services & Consulting', 'it-services', 2 FROM business_categories WHERE slug = 'technology';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Cybersecurity', 'cybersecurity', 3 FROM business_categories WHERE slug = 'technology';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'AI & Machine Learning', 'ai-ml', 4 FROM business_categories WHERE slug = 'technology';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Fintech', 'fintech', 5 FROM business_categories WHERE slug = 'technology';

-- Insert subcategories for Professional Services
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Management Consulting', 'management-consulting', 1 FROM business_categories WHERE slug = 'professional-services';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Legal Services', 'legal-services', 2 FROM business_categories WHERE slug = 'professional-services';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Accounting & Tax', 'accounting-tax', 3 FROM business_categories WHERE slug = 'professional-services';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Human Resources', 'human-resources', 4 FROM business_categories WHERE slug = 'professional-services';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Marketing & Advertising', 'marketing-advertising', 5 FROM business_categories WHERE slug = 'professional-services';

-- Insert subcategories for Manufacturing
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Industrial Equipment', 'industrial-equipment', 1 FROM business_categories WHERE slug = 'manufacturing';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Automotive', 'automotive', 2 FROM business_categories WHERE slug = 'manufacturing';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Electronics', 'electronics', 3 FROM business_categories WHERE slug = 'manufacturing';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Chemicals & Materials', 'chemicals-materials', 4 FROM business_categories WHERE slug = 'manufacturing';
INSERT INTO business_subcategories (category_id, name, slug, display_order)
SELECT id, 'Textiles & Apparel', 'textiles-apparel', 5 FROM business_categories WHERE slug = 'manufacturing';

-- Insert service categories
INSERT INTO service_categories (name, slug, description, icon, display_order) VALUES
('Consulting', 'consulting', 'Strategic and operational consulting services', 'MessageSquare', 1),
('Development', 'development', 'Software and technical development services', 'Code', 2),
('Training & Education', 'training', 'Professional training and educational services', 'BookOpen', 3),
('Support & Maintenance', 'support', 'Ongoing support and maintenance services', 'HeadphonesIcon', 4),
('Products', 'products', 'Physical and digital products', 'Package', 5),
('Design & Creative', 'design', 'Design, branding, and creative services', 'Palette', 6),
('Marketing & Sales', 'marketing', 'Marketing, advertising, and sales services', 'TrendingUp', 7),
('Operations', 'operations', 'Operational and process improvement services', 'Settings', 8);

-- Migrate existing industry data to new category structure
DO $$
DECLARE
  business_record RECORD;
  category_id UUID;
  subcategory_id UUID;
BEGIN
  FOR business_record IN SELECT * FROM user_businesses WHERE industry IS NOT NULL
  LOOP
    -- Map old industry to new category
    CASE business_record.industry
      WHEN 'Technology' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'technology';
      WHEN 'Healthcare' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'healthcare';
      WHEN 'Finance' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'financial';
      WHEN 'Education' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'education';
      WHEN 'Manufacturing' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'manufacturing';
      WHEN 'Retail' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'retail';
      WHEN 'Real Estate' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'real-estate';
      WHEN 'Consulting' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'professional-services';
      WHEN 'Food & Beverage' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'food-agriculture';
      WHEN 'Transportation' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'transportation';
      WHEN 'Energy' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'energy';
      WHEN 'Construction' THEN
        SELECT id INTO category_id FROM business_categories WHERE slug = 'real-estate';
      ELSE
        CONTINUE; -- Skip if no mapping
    END CASE;

    -- Insert mapping if category was found
    IF category_id IS NOT NULL THEN
      INSERT INTO business_category_mapping (business_id, category_id, is_primary)
      VALUES (business_record.id, category_id, true)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;