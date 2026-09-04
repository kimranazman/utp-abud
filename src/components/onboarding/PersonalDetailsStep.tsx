import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { locations } from '@/data/locations';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProfileVisibilitySelect } from '@/components/dropdowns';

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  birthday: z.date().optional(),
  location: z.string().optional(),
  profile_visibility: z.enum(['public', 'alumni_only', 'private']),
});

interface PersonalDetailsStepProps {
  profile: any;
  onComplete: () => void;
}

// Courses removed - now handled by EducationStep

const PersonalDetailsStep = ({ profile, onComplete }: PersonalDetailsStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      birthday: profile?.birthday ? new Date(profile.birthday) : undefined,
      location: profile?.location || '',
      profile_visibility: profile?.profile_visibility || 'alumni_only',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

      // First fetch the existing profile to preserve completion status
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('required_steps_completed, profile_completed')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          bio: values.bio,
          birthday: values.birthday?.toISOString().split('T')[0],
          ...locationData,
          profile_visibility: values.profile_visibility,
          // Preserve the completion status fields
          required_steps_completed: existingProfile?.required_steps_completed,
          profile_completed: existingProfile?.profile_completed,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Personal details saved",
        description: "Your personal information has been updated.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error saving details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center gap-4">
          <FormLabel>Profile Picture</FormLabel>
          <AvatarUpload 
            currentAvatarUrl={profile?.avatar_url}
            currentThumbnailUrl={profile?.avatar_thumbnail_url}
            className="mx-auto" 
          />
          <p className="text-sm text-muted-foreground text-center">
            Upload a profile picture to help others recognize you
          </p>
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell other alumni about yourself..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Education section removed - now handled by separate EducationStep */}

        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Birthday (Optional)</FormLabel>
              <FormControl>
                <ModernDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  minYear={1940}
                  maxYear={new Date().getFullYear()}
                  placeholder="Pick your birthday"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  placeholder="Select your location..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profile_visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Visibility</FormLabel>
              <FormControl>
                <ProfileVisibilitySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose who can see your profile"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Personal Details"}
        </Button>
      </form>
    </Form>
  );
};

export default PersonalDetailsStep;