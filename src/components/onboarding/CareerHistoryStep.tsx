import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Building, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { locations } from '@/data/locations';
import { CareerHistorySkeleton } from './ProfileSectionSkeletons';

const careerSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date().optional(),
  current_position: z.boolean().default(false),
  description: z.string().optional(),
  location: z.string().optional(),
});

interface CareerHistoryStepProps {
  onComplete: () => void;
  profile?: any;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const CareerHistoryStep = ({ onComplete, profile, initialData = [], isDataLoading = false, onDataUpdate }: CareerHistoryStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [careerHistory, setCareerHistory] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<any>(null);

  const form = useForm<z.infer<typeof careerSchema>>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      company_name: '',
      position: '',
      current_position: false,
      description: '',
      location: '',
    },
  });

  // Initialize with prefetched data
  useEffect(() => {
    if (initialData) {
      setCareerHistory(initialData);
    }
  }, [initialData]);

  // Helper to update both local state and parent
  const updateCareerHistory = (newHistory: any[]) => {
    setCareerHistory(newHistory);
    if (onDataUpdate) {
      onDataUpdate(newHistory);
    }
  };

  const onSubmit = async (values: z.infer<typeof careerSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Parse location to get structured data
      let locationData: any = {
        location: values.location, // Keep for backward compatibility
      };

      if (values.location) {
        // Check if it's a predefined location
        const selectedLocation = locations.find(loc => loc.value === values.location);

        if (selectedLocation) {
          // Use structured data from predefined location
          locationData.location_city = selectedLocation.city;
          locationData.location_state = selectedLocation.state || null;
          locationData.location_country = selectedLocation.country;
        } else {
          // It's a custom location - try to parse it
          const parts = values.location.split(',').map(part => part.trim());
          if (parts.length === 1) {
            // Just city or country
            locationData.location_city = parts[0];
          } else if (parts.length === 2) {
            // City, Country format
            locationData.location_city = parts[0];
            locationData.location_country = parts[1];
          } else if (parts.length >= 3) {
            // City, State, Country format
            locationData.location_city = parts[0];
            locationData.location_state = parts[1];
            locationData.location_country = parts[parts.length - 1];
          }
        }
      }

      if (editingCareer) {
        // Update existing career entry
        const { error } = await supabase
          .from('career_history')
          .update({
            company_name: values.company_name,
            position: values.position,
            start_date: values.start_date.toISOString().split('T')[0],
            end_date: values.end_date?.toISOString().split('T')[0],
            current_position: values.current_position,
            description: values.description,
            ...locationData,
          })
          .eq('id', editingCareer.id);

        if (error) throw error;

        // Fetch the updated entry
        const { data: updatedEntry, error: fetchError } = await supabase
          .from('career_history')
          .select('*')
          .eq('id', editingCareer.id)
          .single();

        if (fetchError) throw fetchError;

        // Update local state
        updateCareerHistory(careerHistory.map(c => c.id === editingCareer.id ? updatedEntry : c));

        toast({
          title: "Career entry updated",
          description: "Your career history has been updated.",
        });
      } else {
        // Insert new career entry
        const { error } = await supabase
          .from('career_history')
          .insert({
            user_id: user.id,
            company_name: values.company_name,
            position: values.position,
            start_date: values.start_date.toISOString().split('T')[0],
            end_date: values.end_date?.toISOString().split('T')[0],
            current_position: values.current_position,
            description: values.description,
            ...locationData,
          });

        if (error) throw error;

        // Fetch the newly created entry to get its ID
        const { data: newEntry, error: fetchError } = await supabase
          .from('career_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) throw fetchError;

        // Update local state with the new entry
        updateCareerHistory([newEntry, ...careerHistory]);

        toast({
          title: "Career entry added",
          description: "Your career history has been updated.",
        });
      }

      form.reset();
      setShowForm(false);
      setEditingCareer(null);
    } catch (error: any) {
      toast({
        title: "Error adding career entry",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCareer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('career_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state by removing the deleted entry
      updateCareerHistory(careerHistory.filter(career => career.id !== id));

      toast({
        title: "Career entry deleted",
        description: "The career entry has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting career entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (career: any) => {
    form.reset({
      company_name: career.company_name || '',
      position: career.position || '',
      start_date: career.start_date ? new Date(career.start_date) : undefined,
      end_date: career.end_date ? new Date(career.end_date) : undefined,
      current_position: career.current_position || false,
      description: career.description || '',
      location: career.location || '',
    });
    setEditingCareer(career);
    setShowForm(true);
  };

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <CareerHistorySkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Add your professional experience to help other alumni find you based on companies and roles.
        </p>
      </div>

      {/* Existing Career History */}
      <div className="space-y-4">
        {careerHistory.map((career) => (
          <Card key={career.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{career.position}</CardTitle>
                    <p className="text-muted-foreground">{career.company_name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(career)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCareer(career.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(career.start_date), 'MMM yyyy')} - 
                  {career.current_position ? ' Present' : career.end_date ? format(new Date(career.end_date), 'MMM yyyy') : ' Present'}
                </p>
                {career.location && (
                  <p className="text-sm text-muted-foreground">{career.location}</p>
                )}
                {career.description && (
                  <p className="text-sm">{career.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Career Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingCareer ? 'Edit Career Experience' : 'Add Career Experience'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Google, Microsoft, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer, Manager, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <LocationCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select or enter location..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <ModernDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            minYear={1950}
                            maxYear={new Date().getFullYear()}
                            placeholder="Pick start date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <ModernDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            disabled={form.watch('current_position')}
                            minYear={1950}
                            maxYear={new Date().getFullYear()}
                            placeholder="Pick end date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="current_position"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue('end_date', undefined);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I currently work here</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your role and responsibilities..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? (editingCareer ? "Updating..." : "Adding...")
                      : (editingCareer ? "Update Career Experience" : "Add Career Experience")
                    }
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setEditingCareer(null);
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Career Experience
        </Button>
      )}

      <Button onClick={onComplete} className="w-full">
        Continue to Achievements
      </Button>
    </div>
  );
};

export default CareerHistoryStep;
