import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ExternalLink, Globe, Linkedin, Github, Twitter, Facebook, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const linkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Please enter a valid URL"),
  display_text: z.string().optional(),
});

interface BusinessLinksTabProps {
  businessId: string;
}

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'website', label: 'Company Website', icon: Globe },
  { value: 'portfolio', label: 'Portfolio', icon: ExternalLink },
  { value: 'other', label: 'Other', icon: ExternalLink },
];

const BusinessLinksTab = ({ businessId }: BusinessLinksTabProps) => {
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

  useEffect(() => {
    fetchLinks();
  }, [businessId]);

  const fetchLinks = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('business_links')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      toast.error("Error fetching links: " + error.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof linkSchema>) => {
    if (!businessId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('business_links')
        .insert({
          business_id: businessId,
          platform: values.platform,
          url: values.url,
          display_text: values.display_text,
        });

      if (error) throw error;

      toast.success("Link added successfully");
      form.reset();
      setShowForm(false);
      fetchLinks();
    } catch (error: any) {
      toast.error("Error adding link: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('business_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Link deleted successfully");
      fetchLinks();
    } catch (error: any) {
      toast.error("Error deleting link: " + error.message);
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Add links to your business's online presence and social media.
        </p>
      </div>

      {/* Existing Links */}
      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(link.platform)}
                  <div>
                    <CardTitle className="text-lg">
                      {link.display_text || getPlatformName(link.platform)}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm break-all">
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
                  className="text-red-500 hover:text-red-700"
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          placeholder="https://www.linkedin.com/company/yourcompany" 
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
    </div>
  );
};

export default BusinessLinksTab;
