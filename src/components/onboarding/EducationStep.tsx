import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, GraduationCap, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { EducationSkeleton } from './ProfileSectionSkeletons';

// UTP Official Programmes
const UTP_PROGRAMMES = {
  undergraduate: [
    'Bachelor of Engineering (Honours)',
    'Bachelor of Business Management / Computing (Honours)',
    'Bachelor of Integrated Engineering with Honours',
    'Bachelor of Chemical Engineering with Honours',
    'Bachelor of Civil Engineering with Honours',
    'Bachelor of Computer Engineering with Honours',
    'Bachelor of Electrical and Electronics Engineering with Honours',
    'Bachelor in Business Management (Hons)',
    'Bachelor of Computer Science (Hons)',
    'Bachelor of Information Systems (Hons)',
    'Bachelor of Materials Engineering with Honours',
    'Bachelor of Information Technology (Hons)',
    'Bachelor of Mechanical Engineering with Honours',
    'Bachelor of Science (Honours)',
    'Bachelor of Science (Hons) in Applied Chemistry',
    'Bachelor of Science (Hons) in Petroleum Geoscience',
    'Bachelor of Petroleum Engineering with Honours',
  ],
  postgraduate: [
    'MSc in Chemical Engineering',
    'PhD in Chemical Engineering',
    'MSc in Data Science (ODL)',
    'MBA in Energy Management',
    'MBA in Energy Management (ODL)',
    'MSc in Civil Engineering',
    'PhD in Civil Engineering',
    'MSc in Applied Computing',
    'MSc in Electrical & Electronics Engineering',
    'PhD in Electrical & Electronics Engineering',
    'MSc in Information Technology',
    'PhD in Information Technology',
    'MSc in Asset Management & Maintenance',
    'MSc in Asset Management & Maintenance (ODL)',
    'MSc in Corrosion Engineering',
    'MSc in Information Systems',
    'PhD in Information Systems',
    'MSc in Drilling Engineering',
    'MSc in Mechanical Engineering',
    'PhD in Mechanical Engineering',
    'MSc in Petroleum Engineering',
    'PhD in Petroleum Engineering',
    'MSc in Petroleum Geoscience',
    'PhD in Petroleum Geoscience',
    'MSc in Electronics Systems Engineering',
    'MSc in Electronic Systems Engineering (ODL)',
    'MSc in Industrial Environmental Engineering',
    'Master of Science',
    'MSc in Offshore Engineering',
    'MSc in Offshore Engineering (ODL)',
    'MPhil in Management',
    'PhD in Management',
    'MPhil in Social Science and Humanities',
    'PhD in Social Science and Humanities',
    'MSc in Process Integration',
    'MSc in Process Integration (ODL)',
    'MSc in Process Safety',
    'MSc in Process Safety (ODL)',
  ]
};

const educationSchema = z.object({
  programme_level: z.enum(['undergraduate', 'postgraduate']),
  programme_name: z.string().min(1, 'Please select a programme'),
  graduation_year: z.number().min(1980).max(new Date().getFullYear() + 10),
});

interface EducationEntry {
  id?: string;
  programme_level: 'undergraduate' | 'postgraduate';
  programme_name: string;
  graduation_year: number;
  is_primary: boolean;
}

interface EducationStepProps {
  onComplete: () => void;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const EducationStep = ({ onComplete, initialData = [], isDataLoading = false, onDataUpdate }: EducationStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'undergraduate' | 'postgraduate'>('undergraduate');

  // Initialize with prefetched data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setEducationEntries(initialData.map(entry => ({
        id: entry.id,
        programme_level: entry.programme_level as 'undergraduate' | 'postgraduate',
        programme_name: entry.programme_name,
        graduation_year: entry.graduation_year,
        is_primary: entry.is_primary,
      })));
    }
  }, [initialData]);

  // Helper to update both local state and parent
  const updateEducationEntries = (newEntries: EducationEntry[]) => {
    setEducationEntries(newEntries);
    if (onDataUpdate) {
      onDataUpdate(newEntries);
    }
  };

  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      programme_level: 'undergraduate',
      programme_name: '',
      graduation_year: new Date().getFullYear(),
    },
  });

  const filteredProgrammes = UTP_PROGRAMMES[selectedLevel].filter(programme =>
    programme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update form value when selectedLevel changes
  useEffect(() => {
    form.setValue('programme_level', selectedLevel);
  }, [selectedLevel, form]);

  const addEducation = async (values: z.infer<typeof educationSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Check if any existing entry is already marked as primary
      const hasPrimary = educationEntries.some(e => e.is_primary);

      const newEntry: EducationEntry = {
        programme_level: values.programme_level,
        programme_name: values.programme_name,
        graduation_year: values.graduation_year,
        is_primary: !hasPrimary, // Only set as primary if no other entry is primary
      };

      // Save to database immediately
      const { data, error } = await supabase
        .from('user_education')
        .insert({
          user_id: user.id,
          programme_level: newEntry.programme_level,
          programme_name: newEntry.programme_name,
          graduation_year: newEntry.graduation_year,
          is_primary: newEntry.is_primary,
        })
        .select()
        .single();

      if (error) {
        // Handle the specific 409 conflict error
        if (error.code === '23505' || error.message?.includes('duplicate') || error.code === '409') {
          throw new Error('You can only have one primary education programme. Please ensure only one programme is marked as primary.');
        }
        throw error;
      }

      // Update local state with the saved entry (including ID)
      updateEducationEntries([...educationEntries, { ...newEntry, id: data.id }]);

      // Update profile if this is the primary education
      if (newEntry.is_primary) {
        // First fetch existing profile to preserve completion status
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('required_steps_completed, profile_completed')
          .eq('user_id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({
            course: newEntry.programme_name,
            graduation_year: newEntry.graduation_year,
            // Preserve completion status
            required_steps_completed: existingProfile?.required_steps_completed,
            profile_completed: existingProfile?.profile_completed,
          })
          .eq('user_id', user.id);
      }

      form.reset({
        programme_level: selectedLevel,
        programme_name: '',
        graduation_year: new Date().getFullYear(),
      });
      setSearchQuery('');

      toast({
        title: "Programme added",
        description: "Your education has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error adding programme",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeEducation = async (index: number) => {
    if (!user) return;

    const entryToRemove = educationEntries[index];
    
    try {
      // Delete from database if it has an ID
      if (entryToRemove.id) {
        const { error } = await supabase
          .from('user_education')
          .delete()
          .eq('id', entryToRemove.id);

        if (error) {
          // Handle specific error cases
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            throw new Error('Cannot delete this education entry due to a constraint conflict. Please ensure only one programme is marked as primary.');
          }
          throw error;
        }
      }

      const updatedEntries = educationEntries.filter((_, i) => i !== index);
      
      // If we removed the primary entry and there are other entries, make the first one primary
      if (entryToRemove.is_primary && updatedEntries.length > 0) {
        updatedEntries[0].is_primary = true;
        
        // Update the new primary in database and profile
        if (updatedEntries[0].id) {
          await supabase
            .from('user_education')
            .update({ is_primary: true })
            .eq('id', updatedEntries[0].id);

          // Fetch existing profile to preserve completion status
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('required_steps_completed, profile_completed')
            .eq('user_id', user.id)
            .single();

          await supabase
            .from('profiles')
            .update({
              course: updatedEntries[0].programme_name,
              graduation_year: updatedEntries[0].graduation_year,
              // Preserve completion status
              required_steps_completed: existingProfile?.required_steps_completed,
              profile_completed: existingProfile?.profile_completed,
            })
            .eq('user_id', user.id);
        }
      }

      updateEducationEntries(updatedEntries);

      toast({
        title: "Programme removed",
        description: "The education entry has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error removing programme",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const setPrimary = async (index: number) => {
    if (!user) return;

    try {
      const newPrimaryEntry = educationEntries[index];

      // First update local state to ensure only one is primary
      const updatedEntries = educationEntries.map((entry, i) => ({
        ...entry,
        is_primary: i === index,
      }));
      updateEducationEntries(updatedEntries);

      // Update all entries in database
      const promises = educationEntries.map((entry, i) => {
        if (entry.id) {
          return supabase
            .from('user_education')
            .update({ is_primary: i === index })
            .eq('id', entry.id);
        }
        return Promise.resolve();
      });

      const results = await Promise.all(promises);

      // Check for any errors in the updates
      const hasError = results.some(result => result && 'error' in result && result.error);
      if (hasError) {
        // Revert local state if database update failed
        setEducationEntries(educationEntries);
        const errorResult = results.find(result => result && 'error' in result && result.error);
        if (errorResult && 'error' in errorResult && errorResult.error) {
          if (errorResult.error.code === '23505' || errorResult.error.message?.includes('duplicate')) {
            throw new Error('Only one programme can be marked as primary. Please try again.');
          }
          throw errorResult.error;
        }
      }

      // Update profile with new primary education
      // First fetch existing profile to preserve completion status
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('required_steps_completed, profile_completed')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({
          course: newPrimaryEntry.programme_name,
          graduation_year: newPrimaryEntry.graduation_year,
          // Preserve completion status
          required_steps_completed: existingProfile?.required_steps_completed,
          profile_completed: existingProfile?.profile_completed,
        })
        .eq('user_id', user.id);

      toast({
        title: "Primary education updated",
        description: "Your primary education has been changed.",
      });
    } catch (error) {
      // Revert state on error
      setEducationEntries(educationEntries);
      toast({
        title: "Error updating primary education",
        description: error instanceof Error ? error.message : "Failed to update primary education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (educationEntries.length === 0) {
      toast({
        title: "At least one programme required",
        description: "Please add at least one programme to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      // Validate that only one entry is marked as primary
      const primaryEntries = educationEntries.filter(e => e.is_primary);
      if (primaryEntries.length === 0) {
        toast({
          title: "No primary education selected",
          description: "Please select one programme as your primary education.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (primaryEntries.length > 1) {
        toast({
          title: "Multiple primary educations detected",
          description: "Only one programme can be marked as primary. Please review your selections.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if entries already have IDs (already saved)
      const unsavedEntries = educationEntries.filter(entry => !entry.id);

      if (unsavedEntries.length > 0) {
        // Only insert entries that haven't been saved yet
        // Ensure only one entry has is_primary = true before inserting
        const entriesToInsert = unsavedEntries.map((entry, index) => {
          // If this is the only unsaved entry and no saved entries are primary, make it primary
          const shouldBePrimary = unsavedEntries.length === 1 &&
                                 educationEntries.filter(e => e.id && e.is_primary).length === 0;
          return {
            user_id: user.id,
            programme_level: entry.programme_level,
            programme_name: entry.programme_name,
            graduation_year: entry.graduation_year,
            is_primary: entry.is_primary || shouldBePrimary,
          };
        });

        const { error: insertError } = await supabase
          .from('user_education')
          .insert(entriesToInsert);

        if (insertError) {
          // Handle the specific 409 conflict error
          if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
            throw new Error('You can only have one primary education programme. Please ensure only one programme is marked as primary.');
          }
          throw insertError;
        }
      }

      // Update the profile with the primary programme info for backward compatibility
      const primaryEducation = educationEntries.find(e => e.is_primary);
      if (primaryEducation) {
        // Fetch existing profile to preserve completion status
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('required_steps_completed, profile_completed')
          .eq('user_id', user.id)
          .single();

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            course: primaryEducation.programme_name,
            graduation_year: primaryEducation.graduation_year,
            // Preserve completion status
            required_steps_completed: existingProfile?.required_steps_completed,
            profile_completed: existingProfile?.profile_completed,
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Education saved",
        description: "Your educational background has been updated.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error saving education",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <EducationSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Current Education Entries */}
      {educationEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Education
          </h3>
          {educationEntries.map((entry, index) => (
            <Card key={index} className={cn(
              "p-4",
              entry.is_primary && "ring-2 ring-primary"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={entry.programme_level === 'undergraduate' ? 'default' : 'secondary'}>
                      {entry.programme_level === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'}
                    </Badge>
                    {entry.is_primary && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                  </div>
                  <h4 className="font-medium">{entry.programme_name}</h4>
                  <p className="text-sm text-muted-foreground">Graduated: {entry.graduation_year}</p>
                </div>
                <div className="flex gap-2">
                  {!entry.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimary(index)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Education */}
      <Card>
        <CardHeader>
          <CardTitle>Add UTP Programme</CardTitle>
          <CardDescription>
            Select the official UTP programmes you studied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addEducation)} className="space-y-4">
              {/* Programme Level Tabs */}
              <Tabs value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as 'undergraduate' | 'postgraduate')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="undergraduate">Undergraduate</TabsTrigger>
                  <TabsTrigger value="postgraduate">Postgraduate</TabsTrigger>
                </TabsList>

                <TabsContent value="undergraduate" className="space-y-4">
                  {/* Content is managed by selectedLevel state */}
                </TabsContent>

                <TabsContent value="postgraduate" className="space-y-4">
                  {/* Content is managed by selectedLevel state */}
                </TabsContent>
              </Tabs>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programmes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Programme Selection */}
              <FormField
                control={form.control}
                name="programme_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programme</FormLabel>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {filteredProgrammes.map((programme) => (
                        <Card
                          key={programme}
                          className={cn(
                            "p-3 cursor-pointer border-2 transition-colors hover:bg-accent",
                            field.value === programme && "border-primary bg-accent"
                          )}
                          onClick={() => field.onChange(programme)}
                        >
                          <p className="text-sm font-medium">{programme}</p>
                        </Card>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Graduation Year */}
              <FormField
                control={form.control}
                name="graduation_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Add Programme"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || educationEntries.length === 0}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
};

export default EducationStep;