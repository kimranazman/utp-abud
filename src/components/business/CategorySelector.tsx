import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategorySelection {
  category_id: string;
  subcategory_id?: string;
  is_primary: boolean;
}

interface CategorySelectorProps {
  businessId?: string;
  selections: CategorySelection[];
  onSelectionsChange: (selections: CategorySelection[]) => void;
  allowMultiple?: boolean;
  required?: boolean;
}

export function CategorySelector({
  businessId,
  selections,
  onSelectionsChange,
  allowMultiple = true,
  required = false
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  const handleAddCategory = () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // Check if this combination already exists
    const exists = selections.some(
      s => s.category_id === selectedCategory && 
           s.subcategory_id === (selectedSubcategory || null)
    );

    if (exists) {
      toast.error('This category combination is already added');
      return;
    }

    const newSelection: CategorySelection = {
      category_id: selectedCategory,
      subcategory_id: selectedSubcategory || undefined,
      is_primary: selections.length === 0 // First one is primary
    };

    if (!allowMultiple) {
      onSelectionsChange([newSelection]);
    } else {
      onSelectionsChange([...selections, newSelection]);
    }

    // Reset selections
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleRemoveCategory = (index: number) => {
    const newSelections = selections.filter((_, i) => i !== index);
    
    // If we removed the primary, make the first one primary
    if (selections[index].is_primary && newSelections.length > 0) {
      newSelections[0].is_primary = true;
    }
    
    onSelectionsChange(newSelections);
  };

  const handleSetPrimary = (index: number) => {
    const newSelections = selections.map((s, i) => ({
      ...s,
      is_primary: i === index
    }));
    onSelectionsChange(newSelections);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    return subcategories.find(s => s.id === subcategoryId)?.name || '';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#6B7280';
  };

  const renderIcon = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Business Categories {required && <span className="text-red-500">*</span>}</Label>
        
        {/* Category Selection */}
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span style={{ color: category.color }}>
                        {renderIcon(category.icon)}
                      </span>
                    )}
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategory && subcategories.length > 0 && (
            <Select value={selectedSubcategory} onValueChange={(val) => setSelectedSubcategory(val === '__none' ? '' : val)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select subcategory (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {subcategories.map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            onClick={handleAddCategory}
            disabled={!selectedCategory || (!allowMultiple && selections.length > 0)}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Categories */}
      {selections.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Selected Categories</Label>
          <div className="space-y-2">
            {selections.map((selection, index) => {
              const category = categories.find(c => c.id === selection.category_id);
              const subcategory = selection.subcategory_id ? 
                subcategories.find(s => s.id === selection.subcategory_id) : null;

              return (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                  <Badge 
                    variant={selection.is_primary ? "default" : "secondary"}
                    style={{
                      backgroundColor: selection.is_primary ? category?.color : undefined,
                      borderColor: category?.color
                    }}
                  >
                    {category?.name}
                    {subcategory && ` > ${subcategory.name}`}
                  </Badge>
                  
                  {selection.is_primary && (
                    <Badge variant="outline" className="text-xs">Primary</Badge>
                  )}
                  
                  <div className="flex-1" />
                  
                  {allowMultiple && selections.length > 1 && !selection.is_primary && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(index)}
                      className="text-xs"
                    >
                      Set as Primary
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveCategory(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {required && selections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Please select at least one category for your business
        </p>
      )}
    </div>
  );
}