import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ExternalLink, Globe, Linkedin, Github, Twitter, Facebook, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinksSkeleton } from './ProfileSectionSkeletons';

const linkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Please enter a valid URL"),
  display_text: z.string().optional(),
});

interface LinksStepProps {
  onComplete: () => void;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'website', label: 'Personal Website', icon: Globe },
  { value: 'portfolio', label: 'Portfolio', icon: ExternalLink },
  { value: 'other', label: 'Other', icon: ExternalLink },
];

const LinksStep = ({ onComplete, initialData = [], isDataLoading = false, onDataUpdate }: LinksStepProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      platform: '',
      url: '',
      display_text: '',
    },
  });

  // Initialize with prefetched data
  useEffect(() => {
    if (initialData) {
      setLinks(initialData);
    }
  }, [initialData]);

  // Helper to update both local state and parent
  const updateLinks = (newLinks: any[]) => {
    setLinks(newLinks);
    if (onDataUpdate) {
      onDataUpdate(newLinks);
    }
  };

  const onSubmit = async (values: z.infer<typeof linkSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_links')
        .insert({
          user_id: user.id,
          platform: values.platform,
          url: values.url,
          display_text: values.display_text,
        });

      if (error) throw error;

      // Fetch the newly created entry to get its ID
      const { data: newEntry, error: fetchError } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the new entry
      updateLinks([newEntry, ...links]);

      toast({
        title: "Link added",
        description: "Your link has been added to your profile.",
      });

      form.reset();
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error adding link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state by removing the deleted entry
      updateLinks(links.filter(link => link.id !== id));

      toast({
        title: "Link deleted",
        description: "The link has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.value === platform);
    if (platformData) {
      const Icon = platformData.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <ExternalLink className="h-5 w-5" />;
  };

  const getPlatformName = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.value === platform);
    return platformData ? platformData.label : platform;
  };

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <LinksSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Share your online presence and make it easier for alumni to connect with you.
        </p>
      </div>

      {/* Existing Links */}
      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">
                      {link.display_text || getPlatformName(link.platform)}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm truncate">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {link.url}
                      </a>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLink(link.id)}
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Add Link Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLATFORMS.map((platform) => {
                            const Icon = platform.icon;
                            return (
                              <SelectItem key={platform.value} value={platform.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{platform.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://www.linkedin.com/in/yourprofile" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Text (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Custom text to display for this link" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Link"}
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
          Add Link
        </Button>
      )}

      <Button onClick={onComplete} className="w-full">
        Continue to Review
      </Button>
    </div>
  );
};

export default LinksStep;
