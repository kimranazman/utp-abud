import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Building2, Plus, ExternalLink, AlertCircle, Trash2, Info, Search, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BusinessRelationshipSelector from './BusinessRelationshipSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BusinessesSkeleton } from './ProfileSectionSkeletons';

interface BusinessesStepProps {
  onComplete: () => void;
  profile?: any;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const businessSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const BusinessesStep = ({ onComplete, profile, initialData = [], isDataLoading = false, onDataUpdate }: BusinessesStepProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [businessRelationship, setBusinessRelationship] = useState<'owner' | 'non-owner' | null>(null);
  const [nonOwnerIntent, setNonOwnerIntent] = useState<'aspiring' | 'networking' | 'team_member' | null>(null);
  const [existingBusinesses, setExistingBusinesses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [teamMemberRole, setTeamMemberRole] = useState('');

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      business_name: '',
      position: '',
      industry: '',
      location: '',
      website: '',
      description: '',
    },
  });

  // Initialize with prefetched data and determine relationship
  useEffect(() => {
    if (initialData) {
      setBusinesses(initialData);

      // If user already has businesses, they're an owner
      if (initialData.length > 0) {
        setBusinessRelationship('owner');
      } else if (profile?.business_intent) {
        // Check saved business_intent for non-owners
        if (profile.business_intent === 'owner') {
          setBusinessRelationship('owner');
        } else {
          setBusinessRelationship('non-owner');
          setNonOwnerIntent(profile.business_intent);
        }
      }
    }
  }, [initialData, profile]);

  // Don't automatically show form anymore - wait for user selection
  useEffect(() => {
    if (businessRelationship === 'owner' && businesses.length === 0 && !isLoading) {
      setShowForm(true);
    }
  }, [businessRelationship, businesses, isLoading]);

  // Fetch existing businesses for team member selection
  useEffect(() => {
    if (nonOwnerIntent === 'team_member') {
      fetchExistingBusinesses();
    }
  }, [nonOwnerIntent]);

  // Helper to update both local state and parent
  const updateBusinesses = (newBusinesses: any[]) => {
    setBusinesses(newBusinesses);
    if (onDataUpdate) {
      onDataUpdate(newBusinesses);
    }
  };

  const fetchExistingBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_businesses')
        .select('*')
        .order('business_name');

      if (error) throw error;
      setExistingBusinesses(data || []);
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
    }
  };


  const onSubmit = async (data: BusinessFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const businessData = {
        ...data,
        user_id: user.id,
        ownership_type: 'founder',
        current_business: true,
      };

      if (editingBusiness) {
        const { error } = await supabase
          .from('user_businesses')
          .update(businessData)
          .eq('id', editingBusiness.id);

        if (error) throw error;

        toast({
          title: "Business updated!",
          description: "Your business information has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('user_businesses')
          .insert([businessData]);

        if (error) throw error;

        toast({
          title: "Business added!",
          description: "Your business has been added to your profile.",
        });
      }

      // Fetch the newly created/updated entry
      const { data: updatedBusinesses, error: fetchError } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      updateBusinesses(updatedBusinesses || []);

      form.reset();
      setShowForm(false);
      setEditingBusiness(null);
    } catch (error: any) {
      toast({
        title: "Error saving business",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (businessId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_businesses')
        .delete()
        .eq('id', businessId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state by removing the deleted business
      updateBusinesses(businesses.filter(business => business.id !== businessId));

      toast({
        title: "Business removed",
        description: "The business has been removed from your profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing business",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (business: any) => {
    // Populate form with existing business data
    form.reset({
      business_name: business.business_name || '',
      position: business.position || '',
      industry: business.industry || '',
      location: business.location || '',
      website: business.website || '',
      description: business.description || '',
    });
    setEditingBusiness(business);
    setShowForm(true);
  };

  const handleContinue = async () => {
    // Validate based on business relationship
    if (businessRelationship === 'owner' && businesses.length === 0) {
      toast({
        title: "Business information required",
        description: "Please add at least one business to continue.",
        variant: "destructive",
      });
      return;
    }

    if (businessRelationship === 'non-owner') {
      if (!nonOwnerIntent) {
        toast({
          title: "Please select an option",
          description: "Tell us more about your interests to continue.",
          variant: "destructive",
        });
        return;
      }

      // Save business intent to profile
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ business_intent: nonOwnerIntent })
          .eq('id', user?.id);

        if (error) throw error;

        // If team member, save the relationship
        if (nonOwnerIntent === 'team_member' && selectedBusiness && teamMemberRole) {
          const { error: teamError } = await supabase
            .from('business_team_members')
            .insert([{
              business_id: selectedBusiness.id,
              user_id: user?.id,
              role: teamMemberRole,
              is_business_admin: false,
              added_by: user?.id
            }]);

          if (teamError) throw teamError;
        }

        toast({
          title: "Profile updated",
          description: "Your business relationship has been saved.",
        });
      } catch (error: any) {
        toast({
          title: "Error saving profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    if (!businessRelationship) {
      toast({
        title: "Please make a selection",
        description: "Choose your business status to continue.",
        variant: "destructive",
      });
      return;
    }

    onComplete();
  };

  // Filter existing businesses based on search
  const filteredBusinesses = existingBusinesses.filter(b =>
    b.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <BusinessesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Business Relationship Selection */}
      {!businessRelationship && (
        <BusinessRelationshipSelector
          businessRelationship={businessRelationship}
          nonOwnerIntent={nonOwnerIntent}
          onBusinessRelationshipChange={setBusinessRelationship}
          onNonOwnerIntentChange={setNonOwnerIntent}
        />
      )}

      {/* Show different UI based on selection */}
      {businessRelationship === 'non-owner' && nonOwnerIntent === 'team_member' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Your Alumni Business</CardTitle>
            <p className="text-sm text-muted-foreground">
              Find and select the alumni business you're part of
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search for business */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Business list */}
            {filteredBusinesses.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredBusinesses.map((business) => (
                  <Card
                    key={business.id}
                    className={`cursor-pointer transition-colors ${
                      selectedBusiness?.id === business.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{business.business_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {business.industry} • {business.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchQuery && filteredBusinesses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No businesses found matching "{searchQuery}"
              </p>
            )}

            {/* Role input */}
            {selectedBusiness && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="role">Your Role at {selectedBusiness.business_name}</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  value={teamMemberRole}
                  onChange={(e) => setTeamMemberRole(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {businessRelationship === 'owner' && (
        /* Business Form */
        showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingBusiness ? 'Edit Business' : 'Add a Business'}
            </CardTitle>
            {!editingBusiness && businesses.length === 0 && (
              <div className="flex items-start gap-2 mt-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-600">
                  At least one business is required. This helps alumni discover and connect with your ventures.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Business Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Tech Solutions Sdn Bhd" {...field} />
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
                          <FormLabel>Your Position <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Founder, CEO, Co-founder" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Business Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Technology, Healthcare" {...field} />
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
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kuala Lumpur, Malaysia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your business..."
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
                    {editingBusiness ? 'Update Business' : 'Add Business'}
                  </Button>
                  {(showForm && businesses.length > 0) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingBusiness(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        )
      )}

      {/* Existing Businesses */}
      {businessRelationship === 'owner' && businesses.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Your Businesses ({businesses.length})</h3>
            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another
              </Button>
            )}
          </div>

          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{business.business_name}</CardTitle>
                      <p className="text-muted-foreground">
                        {business.position}
                        {business.industry && ` • ${business.industry}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(business)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(business.location || business.website || business.description) && (
                <CardContent>
                  <div className="space-y-2">
                    {business.location && (
                      <p className="text-sm text-muted-foreground">📍 {business.location}</p>
                    )}
                    {business.website && (
                      <p className="text-sm">
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {business.website}
                        </a>
                      </p>
                    )}
                    {business.description && (
                      <p className="text-sm text-muted-foreground">{business.description}</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Continue Button - show when selection is made */}
      {businessRelationship && (
        <Button
          onClick={handleContinue}
          className="w-full"
          disabled={
            (businessRelationship === 'owner' && businesses.length === 0) ||
            (businessRelationship === 'non-owner' && !nonOwnerIntent) ||
            (nonOwnerIntent === 'team_member' && (!selectedBusiness || !teamMemberRole))
          }
        >
          {businessRelationship === 'owner' && businesses.length === 0
            ? 'Add a Business to Continue'
            : businessRelationship === 'non-owner' && !nonOwnerIntent
            ? 'Select an Option to Continue'
            : nonOwnerIntent === 'team_member' && (!selectedBusiness || !teamMemberRole)
            ? 'Select Business and Enter Role to Continue'
            : 'Continue'
          }
        </Button>
      )}

      {/* Optional: Link to full business management - only show for owners */}
      {businessRelationship === 'owner' && (
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/abud/business/edit')}
            className="text-sm text-muted-foreground"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Advanced Business Management
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessesStep;