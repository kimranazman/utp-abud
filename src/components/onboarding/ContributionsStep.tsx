import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencySelect, ContributionTypeSelect } from '@/components/dropdowns';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { Plus, Trash2, Heart, DollarSign, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ContributionsSkeleton } from './ProfileSectionSkeletons';

const contributionSchema = z.object({
  organization_name: z.string().min(1, 'Organization name is required'),
  role: z.string().optional(),
  description: z.string().optional(),
  contribution_type: z.enum(['monetary', 'non_monetary']),
  value_amount: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('USD'),
  value_private: z.boolean().default(false),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  current_contribution: z.boolean().default(false),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionsStepProps {
  onComplete: () => void;
  initialData?: any[];
  isDataLoading?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

const ContributionsStep = ({ onComplete, initialData = [], isDataLoading = false, onDataUpdate }: ContributionsStepProps) => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      organization_name: '',
      role: '',
      description: '',
      contribution_type: 'non_monetary',
      value_amount: 0,
      currency: 'USD',
      value_private: false,
      current_contribution: false,
    },
  });

  // Initialize with prefetched data
  useEffect(() => {
    if (initialData) {
      setContributions(initialData);
    }
  }, [initialData]);

  // Helper to update both local state and parent
  const updateContributions = (newContributions: any[]) => {
    setContributions(newContributions);
    if (onDataUpdate) {
      onDataUpdate(newContributions);
    }
  };

  const onSubmit = async (data: ContributionFormData) => {
    if (!user) return;

    try {
      const contributionData = {
        user_id: user.id,
        organization_name: data.organization_name,
        role: data.role,
        description: data.description,
        contribution_type: data.contribution_type,
        value_amount: data.value_amount,
        currency: data.currency,
        value_private: data.value_private,
        start_date: data.start_date?.toISOString().split('T')[0],
        end_date: data.current_contribution ? null : data.end_date?.toISOString().split('T')[0],
        current_contribution: data.current_contribution,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('contributions')
          .update(contributionData)
          .eq('id', isEditing);

        if (error) throw error;

        // Fetch updated contributions after edit
        const { data: updatedData, error: fetchError } = await supabase
          .from('contributions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (fetchError) throw fetchError;
        updateContributions(updatedData || []);

        toast.success('Contribution updated successfully!');
      } else {
        const { error } = await supabase
          .from('contributions')
          .insert([contributionData]);

        if (error) throw error;

        // Fetch the newly created entry to get its ID
        const { data: newEntry, error: fetchError } = await supabase
          .from('contributions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) throw fetchError;
        updateContributions([newEntry, ...contributions]);

        toast.success('Contribution added successfully!');
      }

      form.reset();
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving contribution:', error);
      toast.error('Failed to save contribution');
    }
  };

  const handleEdit = (contribution: any) => {
    setIsEditing(contribution.id);
    form.reset({
      organization_name: contribution.organization_name,
      role: contribution.role || '',
      description: contribution.description || '',
      contribution_type: contribution.contribution_type || 'non_monetary',
      value_amount: contribution.value_amount || 0,
      currency: contribution.currency || 'USD',
      value_private: contribution.value_private || false,
      start_date: contribution.start_date ? new Date(contribution.start_date) : undefined,
      end_date: contribution.end_date ? new Date(contribution.end_date) : undefined,
      current_contribution: contribution.current_contribution || false,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state by removing the deleted entry
      updateContributions(contributions.filter(contribution => contribution.id !== id));
      toast.success('Contribution deleted successfully!');
    } catch (error) {
      console.error('Error deleting contribution:', error);
      toast.error('Failed to delete contribution');
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    form.reset();
  };

  const contributionType = form.watch('contribution_type');
  const currentContribution = form.watch('current_contribution');
  const valuePrivate = form.watch('value_private');

  // Calculate totals (only count non-private values for user's own view)
  const totalMonetary = contributions
    .filter(c => c.contribution_type === 'monetary' && !c.value_private)
    .reduce((sum, c) => sum + (parseFloat(c.value_amount) || 0), 0);
  
  const totalNonMonetary = contributions
    .filter(c => c.contribution_type === 'non_monetary' && !c.value_private)
    .reduce((sum, c) => sum + (parseFloat(c.value_amount) || 0), 0);

  const totalValue = totalMonetary + totalNonMonetary;
  const [showSummary, setShowSummary] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Show skeleton during initial loading
  if (isDataLoading) {
    return <ContributionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Collapsible */}
      {contributions.length > 0 && (
        <Collapsible open={showSummary} onOpenChange={setShowSummary}>
          <Card className="border-muted">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <CardTitle className="text-sm">Contribution Summary</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {contributions.length} total · ${totalValue.toLocaleString()}
                    </Badge>
                  </div>
                  {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Monetary</span>
                      <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">${totalMonetary.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {contributions.filter(c => c.contribution_type === 'monetary').length} donation{contributions.filter(c => c.contribution_type === 'monetary').length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Non-Monetary</span>
                      <Heart className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">${totalNonMonetary.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {contributions.filter(c => c.contribution_type === 'non_monetary').length} contribution{contributions.filter(c => c.contribution_type === 'non_monetary').length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {isEditing ? 'Edit Contribution' : 'Add New Contribution'}
          </CardTitle>
          <CardDescription>
            Track your monetary donations and volunteer work contributions to the university and community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="organization_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization/Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., University Alumni Fund, Local Charity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contribution_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Type</FormLabel>
                      <FormControl>
                        <ContributionTypeSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="value_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {contributionType === 'monetary' ? 'Donation Amount' : 'Estimated Value'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <CurrencySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select currency"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value_private"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Private Value</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Hide amount from others
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Timeline Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <ModernDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            minYear={1950}
                            maxYear={new Date().getFullYear()}
                            placeholder="Pick a date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!currentContribution ? (
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <ModernDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              minYear={1950}
                              maxYear={new Date().getFullYear()}
                              placeholder="Pick a date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="flex items-end">
                      <div className="flex-1 pb-2">
                        <p className="text-sm text-muted-foreground">Ongoing contribution</p>
                        <p className="text-xs text-muted-foreground mt-1">No end date needed</p>
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="current_contribution"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="font-normal cursor-pointer">This is an ongoing contribution</FormLabel>
                        <p className="text-xs text-muted-foreground">I'm still contributing to this organization</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Details - Collapsible */}
              <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  {showOptionalFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>Additional Details (Optional)</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role/Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Volunteer, Board Member" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={contributionType === 'monetary'
                              ? "Describe the purpose or campaign for this donation..."
                              : "Describe your volunteer work, mentoring, or service contribution..."
                            }
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-2">
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {isEditing ? 'Update Contribution' : 'Add Contribution'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Contributions List */}
      {contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Contributions</CardTitle>
            <CardDescription>
              {contributions.length} contribution{contributions.length !== 1 ? 's' : ''} worth ${totalValue.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{contribution.organization_name}</h4>
                      <Badge variant={contribution.contribution_type === 'monetary' ? 'default' : 'secondary'}>
                        {contribution.contribution_type === 'monetary' ? 'Monetary' : 'Non-Monetary'}
                      </Badge>
                      {contribution.current_contribution && (
                        <Badge variant="outline">Ongoing</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {contribution.role && <span>{contribution.role}</span>}
                      {contribution.value_amount > 0 && !contribution.value_private && (
                        <span className="font-medium text-foreground">
                          ${parseFloat(contribution.value_amount).toLocaleString()} {contribution.currency}
                        </span>
                      )}
                      {contribution.value_amount > 0 && contribution.value_private && (
                        <Badge variant="outline" className="text-xs">
                          Value Hidden
                        </Badge>
                      )}
                      {contribution.start_date && (
                        <span>
                          {format(new Date(contribution.start_date), 'MMM yyyy')}
                          {contribution.end_date && ` - ${format(new Date(contribution.end_date), 'MMM yyyy')}`}
                        </span>
                      )}
                    </div>
                    {contribution.description && (
                      <p className="text-sm text-muted-foreground mt-1">{contribution.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contribution)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contribution.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onComplete} className="gap-2">
          <Plus className="h-4 w-4" />
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ContributionsStep;
