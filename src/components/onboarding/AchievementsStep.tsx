import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { AchievementsSkeleton } from './ProfileSectionSkeletons';

const achievementSchema = z.object({
  title: z.string().min(1, "Achievement title is required"),
  description: z.string().optional(),
  date_achieved: z.date().optional(),
  organization: z.string().optional(),
});

interface AchievementsStepProps {
  onComplete: () => void;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const AchievementsStep = ({ onComplete, initialData = [], isDataLoading = false, onDataUpdate }: AchievementsStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      description: '',
      organization: '',
    },
  });

  // Initialize with prefetched data
  useEffect(() => {
    if (initialData) {
      setAchievements(initialData);
    }
  }, [initialData]);

  // Helper to update both local state and parent
  const updateAchievements = (newAchievements: any[]) => {
    setAchievements(newAchievements);
    if (onDataUpdate) {
      onDataUpdate(newAchievements);
    }
  };

  const onSubmit = async (values: z.infer<typeof achievementSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          title: values.title,
          description: values.description,
          date_achieved: values.date_achieved?.toISOString().split('T')[0],
          organization: values.organization,
        });

      if (error) throw error;

      // Fetch the newly created entry to get its ID
      const { data: newEntry, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the new entry
      updateAchievements([newEntry, ...achievements]);

      toast({
        title: "Achievement added",
        description: "Your achievement has been added to your profile.",
      });

      form.reset();
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error adding achievement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state by removing the deleted entry
      updateAchievements(achievements.filter(achievement => achievement.id !== id));

      toast({
        title: "Achievement deleted",
        description: "The achievement has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting achievement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <AchievementsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Share your accomplishments, awards, and recognitions to showcase your success.
        </p>
      </div>

      {/* Existing Achievements */}
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    {achievement.organization && (
                      <p className="text-muted-foreground">{achievement.organization}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAchievement(achievement.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {achievement.date_achieved && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(achievement.date_achieved), 'MMM yyyy')}
                  </p>
                )}
                {achievement.description && (
                  <p className="text-sm">{achievement.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Achievement Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievement Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Dean's List, Best Employee Award, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="University, Company, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_achieved"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Achieved (Optional)</FormLabel>
                      <FormControl>
                        <ModernDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minYear={1950}
                          maxYear={new Date().getFullYear()}
                          placeholder="Pick achievement date"
                        />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Describe the achievement and its significance..."
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
                    {isLoading ? "Adding..." : "Add Achievement"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
          Add Achievement
        </Button>
      )}

      <Button onClick={onComplete} className="w-full">
        Continue to Contributions
      </Button>
    </div>
  );
};

export default AchievementsStep;
