// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  Save,
  Info,
  Package,
  Image,
  Phone,
  Award,
  BarChart3,
  Plus,
  Trash2,
  Upload,
  X,
  Globe,
  Mail,
  MessageSquare,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Eye,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatCourseName } from '@/lib/courseUtils';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { locations } from '@/data/locations';
import { CategorySelector } from '@/components/business/CategorySelector';
import {
  BusinessSizeSelect,
  EmployeeCountSelect,
  PriceRangeSelect,
  OwnershipTypeSelect,
  ContactTypeSelect,
  MetricTypeSelect,
  MetricPeriodSelect
} from '@/components/dropdowns';
import { METRIC_TYPE_OPTIONS, METRIC_PERIOD_OPTIONS, METRIC_UNIT_OPTIONS, CONTACT_TYPE_OPTIONS } from '@/constants/dropdowns';
import { BusinessLogoUpload } from '@/components/ui/business-logo-upload';
import { BusinessBannerUpload } from '@/components/ui/business-banner-upload';
import { ImageUpload } from '@/components/ui/image-upload';
import BusinessLinksTab from '@/components/business/BusinessLinksTab';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Schema for the main business information
const businessInfoSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  position: z.string().min(1, "Position is required"),
  ownership_type: z.string().optional(),
  location: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  current_business: z.boolean().default(false),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  employee_count_range: z.string().optional(),
  year_established: z.number().optional(),
  business_registration_number: z.string().optional(),
  tags: z.array(z.string()).optional(),
  industry: z.string().optional(),
  business_size: z.string().optional(),
});

// Save indicator component
type SaveState = 'idle' | 'saving' | 'saved';

const SaveIndicator = ({ state }: { state: SaveState }) => {
  if (state === 'idle') return null;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      {state === 'saving' && (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
    </div>
  );
};

const BusinessEditEnhanced = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewBusiness = !businessId || businessId === 'new';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);
  const [teamMemberToRemove, setTeamMemberToRemove] = useState<string | null>(null);
  
  // Category selections
  const [categorySelections, setCategorySelections] = useState<any[]>([]);
  
  // Services state
  const [services, setServices] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  
  // Contact methods state
  const [contactMethods, setContactMethods] = useState<any[]>([]);
  
  // Achievements state
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Metrics state
  const [metrics, setMetrics] = useState<any[]>([]);
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [selectedAlumniForTeam, setSelectedAlumniForTeam] = useState<any>(null);
  const [teamMemberRole, setTeamMemberRole] = useState('');
  const [teamMemberIsAdmin, setTeamMemberIsAdmin] = useState(false);

  // Track dirty state for each tab
  const [servicesDirty, setServicesDirty] = useState(false);
  const [contactDirty, setContactDirty] = useState(false);
  const [achievementsDirty, setAchievementsDirty] = useState(false);
  const [metricsDirty, setMetricsDirty] = useState(false);
  const [teamDirty, setTeamDirty] = useState(false);
  const [imageDirty, setImageDirty] = useState(false);

  // Staged image URLs (for non-auto-save mode)
  const [stagedLogoUrl, setStagedLogoUrl] = useState<string | null>(null);
  const [stagedLogoThumbnailUrl, setStagedLogoThumbnailUrl] = useState<string | null>(null);
  const [stagedBannerUrl, setStagedBannerUrl] = useState<string | null>(null);
  const [stagedBannerThumbnailUrl, setStagedBannerThumbnailUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof businessInfoSchema>>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      business_name: '',
      position: '',
      ownership_type: '',
      location: '',
      current_business: false,
      description: '',
      website: '',
      employee_count_range: '',
      year_established: undefined,
      business_registration_number: '',
      tags: [],
      industry: '',
      business_size: ''
    },
  });

  useEffect(() => {
    if (isNewBusiness) {
      // New business creation mode
      setLoading(false);
      setIsAuthorized(true);
      setBusiness({ user_id: user?.id });
    } else if (businessId && user) {
      fetchBusinessData();
    }
  }, [businessId, user, isNewBusiness]);

  // Browser navigation guard - warn on close/refresh with unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = form.formState.isDirty || servicesDirty || contactDirty || achievementsDirty || metricsDirty || teamDirty || imageDirty;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty, servicesDirty, contactDirty, achievementsDirty, metricsDirty, teamDirty]);

  // Keyboard shortcut for save (Ctrl/Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form.formState.isDirty, servicesDirty, contactDirty, achievementsDirty, metricsDirty, teamDirty, imageDirty]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);

      // 1) Fetch the base business row first (no embeds) to avoid RLS/relationship ambiguity
      const { data: businessRow, error: baseError } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('id', businessId!)
        .maybeSingle();

      if (baseError) throw baseError;
      if (!businessRow) throw new Error('Business not found');

      // 2) Authorization: owner, team admin, or platform admin
      const isOwner = businessRow.user_id === user?.id;
      let isTeamAdmin = false;
      let isAdmin = false;

      if (!isOwner) {
        const { data: teamData } = await supabase
          .from('business_team_members')
          .select('is_business_admin')
          .eq('business_id', businessId!)
          .eq('user_id', user?.id as string)
          .eq('is_business_admin', true)
          .maybeSingle();

        isTeamAdmin = !!teamData;
      }

      if (!isOwner && !isTeamAdmin) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id as string);
        isAdmin = Array.isArray(roles) && roles.some(r => r.role === 'admin');
      }

      const authorized = isOwner || isTeamAdmin || isAdmin;
      setIsAuthorized(authorized);

      if (!authorized) {
        toast.error("You don't have permission to edit this business.");
        navigate(`/abud/business/${businessId}`);
        return;
      }

      // 3) With auth confirmed, set the base business and form
      setBusiness(businessRow);
      form.reset({
        business_name: businessRow.business_name || '',
        position: businessRow.position || '',
        ownership_type: businessRow.ownership_type || '',
        location: businessRow.location || '',
        start_date: businessRow.start_date ? new Date(businessRow.start_date) : undefined,
        end_date: businessRow.end_date ? new Date(businessRow.end_date) : undefined,
        current_business: businessRow.current_business || false,
        description: businessRow.description || '',
        website: businessRow.website || '',
        employee_count_range: businessRow.employee_count_range || '',
        year_established: businessRow.year_established || undefined,
        business_registration_number: businessRow.business_registration_number || '',
        tags: businessRow.tags || [],
        industry: businessRow.industry || '',
        business_size: businessRow.business_size || ''
      });

      // 4) Fetch related collections in parallel (only existing relations)
      const [serviceCatsRes, categoriesRes, servicesRes, imagesRes, metricsRes, contactsRes, achievementsRes] = await Promise.all([
        supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('business_category_mapping')
          .select('id, category_id, subcategory_id, is_primary')
          .eq('business_id', businessId!),
        supabase
          .from('business_services')
          .select('id, service_name, description, display_order, category_id, price_range, delivery_method')
          .eq('business_id', businessId!)
          .order('display_order'),
        supabase
          .from('business_images')
          .select('id, image_url, caption, thumbnail_url, display_order')
          .eq('business_id', businessId!)
          .order('display_order'),
        // Optional: metrics table may not exist in some environments
        supabase
          .from('business_metrics')
          .select('id, metric_type, metric_value, metric_unit, metric_period, display_order, is_public')
          .eq('business_id', businessId!)
          .order('display_order'),
        supabase
          .from('business_contact')
          .select('*')
          .eq('business_id', businessId!)
          .order('is_primary', { ascending: false }),
        supabase
          .from('business_achievements')
          .select('*')
          .eq('business_id', businessId!)
          .order('display_order')
      ]);

      // Fetch team members
      const { data: teamData } = await supabase
        .from('business_team_members')
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            course,
            graduation_year,
            avatar_url
          )
        `)
        .eq('business_id', businessId!);

      setServiceCategories(serviceCatsRes.data || []);
      setCategorySelections(categoriesRes.data || []);
      setServices(servicesRes.data || []);
      setGalleryImages(imagesRes.data || []);
      setMetrics(metricsRes.data || []);
      setTeamMembers(teamData || []);
      setContactMethods(contactsRes.data || []);
      setAchievements(achievementsRes.data || []);

    } catch (error: any) {
      console.error('Error fetching business:', error);
      toast.error(error.message || 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitInfo = async (values: z.infer<typeof businessInfoSchema>) => {
    if (!user) return;

    setSaving(true);
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

      const businessData = {
        business_name: values.business_name,
        position: values.position,
        ownership_type: values.ownership_type,
        ...locationData,
        start_date: values.start_date?.toISOString().split('T')[0],
        end_date: values.end_date?.toISOString().split('T')[0],
        current_business: values.current_business,
        description: values.description,
        website: values.website,
        employee_count_range: values.employee_count_range || null,
        year_established: values.year_established,
        business_registration_number: values.business_registration_number,
        tags: values.tags,
        industry: values.industry,
        business_size: values.business_size || null
      };

      if (isNewBusiness) {
        // Create new business
        const { data: newBusiness, error: createError } = await supabase
          .from('user_businesses')
          .insert({
            ...businessData,
            user_id: user.id
          })
          .select()
          .single();

        if (createError) throw createError;

        // Insert category mappings for new business
        if (categorySelections.length > 0) {
          const mappings = categorySelections.map(selection => ({
            business_id: newBusiness.id,
            category_id: selection.category_id,
            subcategory_id: selection.subcategory_id,
            is_primary: selection.is_primary
          }));

          const { error: mappingError } = await supabase
            .from('business_category_mapping')
            .insert(mappings);

          if (mappingError) throw mappingError;
        }

        toast.success('Business created successfully');
        // Navigate to the edit page for the newly created business
        navigate(`/abud/business/${newBusiness.id}/edit`);
      } else {
        // Update existing business
        let updateData: any = { ...businessData };

        // Include staged images if they were changed
        if (imageDirty) {
          updateData.logo_url = stagedLogoUrl || business?.logo_url;
          updateData.logo_thumbnail_url = stagedLogoThumbnailUrl || business?.logo_thumbnail_url;
          updateData.banner_url = stagedBannerUrl || business?.banner_url;
          updateData.banner_thumbnail_url = stagedBannerThumbnailUrl || business?.banner_thumbnail_url;

          // Delete old images from storage if they were replaced
          const { deleteImageFromStorage } = await import('@/lib/imageUtils');

          if (stagedLogoUrl && business?.logo_url && stagedLogoUrl !== business.logo_url) {
            await deleteImageFromStorage(business.logo_url);
          }
          if (stagedLogoThumbnailUrl && business?.logo_thumbnail_url && stagedLogoThumbnailUrl !== business.logo_thumbnail_url) {
            await deleteImageFromStorage(business.logo_thumbnail_url);
          }
          if (stagedBannerUrl && business?.banner_url && stagedBannerUrl !== business.banner_url) {
            await deleteImageFromStorage(business.banner_url);
          }
          if (stagedBannerThumbnailUrl && business?.banner_thumbnail_url && stagedBannerThumbnailUrl !== business.banner_thumbnail_url) {
            await deleteImageFromStorage(business.banner_thumbnail_url);
          }
        }

        const { error: updateError } = await supabase
          .from('user_businesses')
          .update(updateData)
          .eq('id', businessId);

        if (updateError) throw updateError;

        // Update category mappings
        // First delete existing mappings
        await supabase
          .from('business_category_mapping')
          .delete()
          .eq('business_id', businessId);

        // Then insert new mappings
        if (categorySelections.length > 0) {
          const mappings = categorySelections.map(selection => ({
            business_id: businessId,
            category_id: selection.category_id,
            subcategory_id: selection.subcategory_id,
            is_primary: selection.is_primary
          }));

          const { error: mappingError } = await supabase
            .from('business_category_mapping')
            .insert(mappings);

          if (mappingError) throw mappingError;
        }

        // Reset staged images and imageDirty flag after successful save
        if (imageDirty) {
          setStagedLogoUrl(null);
          setStagedLogoThumbnailUrl(null);
          setStagedBannerUrl(null);
          setStagedBannerThumbnailUrl(null);
          setImageDirty(false);
        }

        toast.success('Business information updated successfully');
        // Reset form dirty state after successful save
        form.reset(form.getValues());
      }
    } catch (error: any) {
      toast.error(isNewBusiness ? 'Failed to create business' : 'Failed to update business information');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save services tab
  const saveServices = async () => {
    if (!servicesDirty || !businessId) return;
    for (const service of services) {
      if (service.id) {
        const { error } = await supabase
          .from('business_services')
          .update({
            service_name: service.service_name,
            description: service.description,
            category_id: service.category_id,
            price_range: service.price_range,
            display_order: service.display_order
          })
          .eq('id', service.id);
        if (error) throw error;
      }
    }
    setServicesDirty(false);
  };

  // Save contact tab
  const saveContacts = async () => {
    if (!contactDirty || !businessId) return;
    for (const contact of contactMethods) {
      if (contact.id) {
        const { error } = await supabase
          .from('business_contact')
          .update({
            contact_type: contact.contact_type,
            contact_value: contact.contact_value,
            is_primary: contact.is_primary,
            is_public: contact.is_public
          })
          .eq('id', contact.id);
        if (error) throw error;
      }
    }
    setContactDirty(false);
  };

  // Save achievements tab
  const saveAchievements = async () => {
    if (!achievementsDirty || !businessId) return;
    for (const achievement of achievements) {
      if (achievement.id) {
        const { error } = await supabase
          .from('business_achievements')
          .update({
            title: achievement.title,
            description: achievement.description,
            icon_type: achievement.icon_type
          })
          .eq('id', achievement.id);
        if (error) throw error;
      }
    }
    setAchievementsDirty(false);
  };

  // Save metrics tab
  const saveMetrics = async () => {
    if (!metricsDirty || !businessId) return;
    for (const metric of metrics) {
      if (metric.id) {
        const { error } = await supabase
          .from('business_metrics')
          .update({
            metric_type: metric.metric_type,
            metric_value: metric.metric_value,
            metric_unit: metric.metric_unit,
            metric_period: metric.metric_period
          })
          .eq('id', metric.id);
        if (error) throw error;
      }
    }
    setMetricsDirty(false);
  };

  // Save team tab
  const saveTeam = async () => {
    if (!teamDirty || !businessId) return;
    for (const member of teamMembers) {
      if (member.id) {
        const { error } = await supabase
          .from('business_team_members')
          .update({
            role: member.role,
            is_business_admin: member.is_business_admin
          })
          .eq('id', member.id);
        if (error) throw error;
      }
    }
    setTeamDirty(false);
  };

  // Master save function that saves ALL dirty tabs
  const handleSave = async () => {
    // Collect all tabs that need saving
    const tabsToSave: Array<{ name: string; fn: () => Promise<void> }> = [];

    if (form.formState.isDirty) {
      tabsToSave.push({ name: 'Info', fn: async () => form.handleSubmit(onSubmitInfo)() });
    }
    if (servicesDirty) {
      tabsToSave.push({ name: 'Services', fn: saveServices });
    }
    if (contactDirty) {
      tabsToSave.push({ name: 'Contact', fn: saveContacts });
    }
    if (achievementsDirty) {
      tabsToSave.push({ name: 'Achievements', fn: saveAchievements });
    }
    if (metricsDirty) {
      tabsToSave.push({ name: 'Metrics', fn: saveMetrics });
    }
    if (teamDirty) {
      tabsToSave.push({ name: 'Team', fn: saveTeam });
    }

    if (tabsToSave.length === 0) {
      toast.info('No changes to save');
      return;
    }

    // Save all tabs
    setSaving(true);
    let savedCount = 0;
    let failedTabs: string[] = [];

    for (const tab of tabsToSave) {
      try {
        await tab.fn();
        savedCount++;
      } catch (error) {
        failedTabs.push(tab.name);
        console.error(`Failed to save ${tab.name}:`, error);
      }
    }

    setSaving(false);

    // Show summary
    if (failedTabs.length === 0) {
      if (tabsToSave.length === 1) {
        toast.success(`${tabsToSave[0].name} saved successfully`);
      } else {
        toast.success(`All changes saved (${savedCount} tabs)`);
      }
    } else if (savedCount > 0) {
      toast.warning(`${savedCount} tabs saved, but ${failedTabs.join(', ')} failed`);
    } else {
      toast.error('Failed to save changes');
    }
  };


  // Add new service
  const addService = async () => {
    const newService = {
      business_id: businessId,
      service_name: 'New Service',
      description: '',
      display_order: services.length
    };

    try {
      const { data, error } = await supabase
        .from('business_services')
        .insert(newService)
        .select()
        .single();

      if (error) throw error;
      setServices([...services, data]);
      toast.success('Service added');
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  // Update service locally (marks as dirty)
  const updateService = (serviceId: string, updates: any) => {
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, ...updates } : s
    ));
    setServicesDirty(true);
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      setServices(services.filter(s => s.id !== serviceId));
      toast.success('Service deleted');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  // Helper function to format contact URLs for preview/testing
  const formatContactUrl = (type: string, value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '#';

    switch(type) {
      case 'whatsapp':
        // Remove all non-digits for WhatsApp
        const digitsOnly = trimmedValue.replace(/[^\d]/g, '');
        return `https://wa.me/${digitsOnly}`;
      case 'telegram':
        // Support username (with or without @) or phone number
        if (trimmedValue.startsWith('@')) {
          return `https://t.me/${trimmedValue.substring(1)}`;
        } else if (trimmedValue.match(/^[a-zA-Z0-9_]+$/)) {
          // Looks like a username without @
          return `https://t.me/${trimmedValue}`;
        } else {
          // Assume it's a phone number
          const phoneDigits = trimmedValue.replace(/[^\d]/g, '');
          return `https://t.me/+${phoneDigits}`;
        }
      case 'phone':
        return `tel:${trimmedValue}`;
      case 'email':
        return `mailto:${trimmedValue}`;
      case 'linkedin':
        // Handle both full URLs and usernames
        if (trimmedValue.includes('linkedin.com')) {
          return trimmedValue.match(/^https?:\/\//) ? trimmedValue : `https://${trimmedValue}`;
        }
        return `https://linkedin.com/in/${trimmedValue}`;
      case 'website':
        // Add https:// if no protocol specified
        return trimmedValue.match(/^https?:\/\//) ? trimmedValue : `https://${trimmedValue}`;
      default:
        return trimmedValue;
    }
  };

  // Helper function to get placeholder text for contact inputs
  const getContactPlaceholder = (type: string): string => {
    switch(type) {
      case 'whatsapp':
        return '60123456789 (include country code without +)';
      case 'telegram':
        return '@username or 60123456789';
      case 'phone':
        return '+60 12-345 6789';
      case 'email':
        return 'contact@business.com';
      case 'linkedin':
        return 'company-name or full URL';
      case 'website':
        return 'www.example.com';
      default:
        return 'Enter contact details';
    }
  };

  // Helper function to get format hint text
  const getContactHint = (type: string): string => {
    switch(type) {
      case 'whatsapp':
        return 'Include country code (e.g., 60 for Malaysia). Do not include + sign';
      case 'telegram':
        return 'Username with @ or phone with country code';
      case 'phone':
        return 'Include country code with +';
      case 'email':
        return 'Valid email address';
      case 'linkedin':
        return 'LinkedIn username or full profile URL';
      case 'website':
        return 'Full website URL';
      default:
        return '';
    }
  };

  // Add contact method
  const addContactMethod = async () => {
    // Default to phone type, set as primary only if no contacts exist yet
    const newContact = {
      business_id: businessId,
      contact_type: 'phone',
      contact_value: '',
      is_primary: contactMethods.length === 0, // Only set primary if it's the first contact
      is_public: true
    };

    try {
      const { data, error } = await supabase
        .from('business_contact')
        .insert(newContact)
        .select()
        .single();

      if (error) throw error;
      setContactMethods([...contactMethods, data]);
      toast.success('Contact method added');
    } catch (error: any) {
      console.error('Error adding contact method:', error);
      if (error.code === '23505') {
        if (error.message.includes('contact_value_unique')) {
          toast.error('This contact already exists');
        } else {
          toast.error('A primary contact of this type already exists');
        }
      } else {
        toast.error('Failed to add contact method');
      }
    }
  };

  // Update contact method locally (marks as dirty)
  const updateContactMethod = (contactId: string, updates: Partial<any>) => {
    const contact = contactMethods.find(c => c.id === contactId);
    if (!contact) return;

    // Update local state
    // If setting as primary, unset other primary contacts of the same type locally
    setContactMethods(contactMethods.map(c => {
      if (c.id === contactId) {
        return { ...c, ...updates };
      } else if (updates.is_primary && c.contact_type === contact.contact_type && c.is_primary) {
        return { ...c, is_primary: false };
      }
      return c;
    }));
    setContactDirty(true);
  };

  // Delete contact method
  const deleteContactMethod = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('business_contact')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContactMethods(contactMethods.filter(c => c.id !== contactId));
      toast.success('Contact deleted');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  // Add achievement
  const addAchievement = async () => {
    const newAchievement = {
      business_id: businessId,
      title: 'New Achievement',
      description: '',
      icon_type: 'award',
      display_order: achievements.length
    };

    try {
      const { data, error } = await supabase
        .from('business_achievements')
        .insert(newAchievement)
        .select()
        .single();

      if (error) throw error;
      setAchievements([...achievements, data]);
      toast.success('Achievement added');
    } catch (error) {
      toast.error('Failed to add achievement');
    }
  };

  // Update achievement locally (marks as dirty)
  const updateAchievement = (achievementId: string, updates: any) => {
    setAchievements(achievements.map(a =>
      a.id === achievementId ? { ...a, ...updates } : a
    ));
    setAchievementsDirty(true);
  };

  // Delete achievement
  const deleteAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from('business_achievements')
        .delete()
        .eq('id', achievementId);

      if (error) throw error;

      setAchievements(achievements.filter(a => a.id !== achievementId));
      toast.success('Achievement deleted');
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  // Helper function to find available metric combinations
  const getAvailableMetricCombination = () => {
    // Get all currently used combinations
    const usedCombinations = new Set(
      metrics.map(m => `${m.metric_type}:${m.metric_period}`)
    );

    // Try to find an available combination
    for (const type of METRIC_TYPE_OPTIONS) {
      for (const period of METRIC_PERIOD_OPTIONS) {
        const combination = `${type.value}:${period.value}`;
        if (!usedCombinations.has(combination)) {
          return {
            metric_type: type.value,
            metric_period: period.value,
            metric_unit: type.value === 'revenue' ? 'currency' :
                        type.value === 'satisfaction' ? 'rating' : 'count'
          };
        }
      }
    }
    return null; // All combinations used
  };

  // Helper function to check if a metric combination is available (excluding a specific metric ID)
  const isMetricCombinationAvailable = (metricType: string, metricPeriod: string, excludeMetricId?: string) => {
    return !metrics.some(m =>
      m.id !== excludeMetricId &&
      m.metric_type === metricType &&
      m.metric_period === metricPeriod
    );
  };

  // Add metric with smart defaults
  const addMetric = async () => {
    // Find an available combination
    const availableCombination = getAvailableMetricCombination();

    if (!availableCombination) {
      toast.error('All metric combinations are in use. Please delete an existing metric to add a new one.');
      return;
    }

    const newMetric = {
      business_id: businessId,
      metric_type: availableCombination.metric_type,
      metric_value: 0,
      metric_unit: availableCombination.metric_unit,
      metric_period: availableCombination.metric_period,
      is_public: true,
      display_order: metrics.length
    };

    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .insert(newMetric)
        .select()
        .single();

      if (error) throw error;
      setMetrics([...metrics, data]);
      toast.success('Metric added successfully');
    } catch (error: any) {
      console.error('Error adding metric:', error);
      // Better error handling for unique constraint violations
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        toast.error('This metric combination already exists. Please delete an existing metric first.');
      } else {
        toast.error('Failed to add metric');
      }
    }
  };

  // Update metric locally with validation (marks as dirty)
  const updateMetric = (metricId: string, field: string, value: any) => {
    // Find the metric to validate
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return;

    // Check for duplicate combinations when updating metric_type or metric_period
    if (field === 'metric_type' || field === 'metric_period') {
      const newType = field === 'metric_type' ? value : metric.metric_type;
      const newPeriod = field === 'metric_period' ? value : metric.metric_period;

      // Check if this combination already exists (excluding current metric)
      if (!isMetricCombinationAvailable(newType, newPeriod, metricId)) {
        toast.error(`A metric with type "${newType}" and period "${newPeriod}" already exists. Please choose a different combination.`);
        return;
      }
    }

    // Validation for metric values
    if (field === 'metric_value') {
      const unit = metric.metric_unit || 'count';

      // Validate based on unit type
      if (unit === 'percentage' && (value < 0 || value > 100)) {
        toast.error('Percentage values must be between 0 and 100');
        return;
      }
      if (unit === 'rating' && (value < 1 || value > 5)) {
        toast.error('Rating values must be between 1 and 5');
        return;
      }
      if (value < 0) {
        toast.error('Values cannot be negative');
        return;
      }
    }

    // Update local state
    setMetrics(metrics.map(m =>
      m.id === metricId ? { ...m, [field]: value } : m
    ));
    setMetricsDirty(true);
  };

  // Delete metric
  const deleteMetric = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('business_metrics')
        .delete()
        .eq('id', metricId);

      if (error) throw error;

      setMetrics(metrics.filter(m => m.id !== metricId));
      toast.success('Metric deleted successfully');
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('Failed to delete metric');
    }
  };

  // Search for alumni to add as team members
  const searchAlumni = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Only search for profiles that are not seed data (real authenticated users)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, course, graduation_year, avatar_url')
        .or(`full_name.ilike.%${query}%,course.ilike.%${query}%`)
        .eq('is_seed_data', false) // Only real authenticated users
        .limit(10);

      if (error) throw error;
      
      // Filter out already added members
      const existingMemberIds = teamMembers.map(m => m.user_id);
      const filteredResults = data?.filter(p => 
        p.user_id !== business?.user_id && // Not the owner
        !existingMemberIds.includes(p.user_id) // Not already a member
      ) || [];
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching alumni:', error);
      setSearchResults([]);
    }
  };

  // Add team member
  const addTeamMember = async (alumniProfile: any, role: string, isAdmin: boolean) => {
    try {
      // The database foreign key constraint will automatically verify the user exists
      const { data, error } = await supabase
        .from('business_team_members')
        .insert({
          business_id: businessId,
          user_id: alumniProfile.user_id,
          role: role,
          is_business_admin: isAdmin,
          added_by: user?.id
        })
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            course,
            graduation_year,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      
      setTeamMembers([...teamMembers, data]);
      setSearchQuery('');
      setSearchResults([]);
      toast.success('Team member added successfully');
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add team member');
    }
  };

  // Remove team member
  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('business_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };

  // Update team member locally (marks as dirty)
  const updateTeamMember = (memberId: string, updates: any) => {
    setTeamMembers(teamMembers.map(m =>
      m.id === memberId ? { ...m, ...updates } : m
    ));
    setTeamDirty(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !business) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            You don't have permission to edit this business.
          </p>
          <Button asChild>
            <Link to={`/abud/business/${businessId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          {!isNewBusiness ? (
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link to="/abud/business/edit">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link to="/abud/business/edit">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
          )}
          <div className="ml-6">
            <h1 className="text-2xl font-bold">
              {isNewBusiness ? 'Create New Business' : `Edit ${business?.business_name || 'Business'}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNewBusiness ? 'Fill in your business information to create your listing' : 'Update your business information and manage services'}
            </p>
          </div>
        </div>
        {!isNewBusiness && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/abud/business/${businessId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Business
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={isNewBusiness ? "grid grid-cols-1 w-full max-w-xs bg-muted p-1 rounded-lg" : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full gap-1 bg-muted p-1 rounded-lg"}>
          <TabsTrigger value="info" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
            <Info className="h-4 w-4" />
            Info
            {(form.formState.isDirty || imageDirty) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
            )}
          </TabsTrigger>
          {!isNewBusiness && (
            <>
              <TabsTrigger value="services" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <Package className="h-4 w-4" />
                Services
                {servicesDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <ExternalLink className="h-4 w-4" />
                Links
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <Phone className="h-4 w-4" />
                Contact
                {contactDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <Award className="h-4 w-4" />
                Awards
                {achievementsDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                Metrics
                {metricsDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2 relative data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <Users className="h-4 w-4" />
                Team
                {teamDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Business Information Tab */}
        <TabsContent value="info" className="space-y-8 mt-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-accent">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-accent rounded-full" />
                <CardTitle className="text-xl font-semibold">Business Information</CardTitle>
                {form.formState.isDirty && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Unsaved changes</span>
                  </div>
                )}
              </div>
              <CardDescription>
                Basic information about your business. Click "Save Changes" button to save your changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInfo)} className="space-y-8">
                  {/* Business Logo */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium">Business Logo</h3>
                    <BusinessLogoUpload
                      businessId={businessId || ''}
                      currentLogoUrl={stagedLogoUrl || business?.logo_url}
                      currentThumbnailUrl={stagedLogoThumbnailUrl || business?.logo_thumbnail_url}
                      autoSave={false}
                      onUploadComplete={(logoUrl, thumbnailUrl) => {
                        setStagedLogoUrl(logoUrl);
                        setStagedLogoThumbnailUrl(thumbnailUrl);
                        setImageDirty(true);
                      }}
                    />
                  </div>

                  <Separator />

                  {/* Business Banner */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium">Business Banner</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add a cover image to make your business profile stand out
                      </p>
                    </div>
                    <BusinessBannerUpload
                      businessId={businessId || ''}
                      currentBannerUrl={stagedBannerUrl || business?.banner_url}
                      autoSave={false}
                      onBannerUpdated={(bannerUrl, thumbnailUrl) => {
                        setStagedBannerUrl(bannerUrl);
                        setStagedBannerThumbnailUrl(thumbnailUrl);
                        setImageDirty(true);
                      }}
                    />
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Basic Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter business name" {...field} />
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
                            <FormLabel>Your Position *</FormLabel>
                            <FormControl>
                              <Input placeholder="CEO, Founder, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownership_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ownership Type</FormLabel>
                            <FormControl>
                              <OwnershipTypeSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select ownership type"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="year_established"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Established</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 2020" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Business Categories */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Business Categories</h3>
                    <CategorySelector
                      selections={categorySelections}
                      onSelectionsChange={setCategorySelections}
                      allowMultiple={true}
                      required={false}
                    />
                  </div>

                  <Separator />

                  {/* Business Details */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Business Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your business..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a brief description of what your business does
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="employee_count_range"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee Count</FormLabel>
                            <FormControl>
                              <EmployeeCountSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select range"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Size</FormLabel>
                            <FormControl>
                              <BusinessSizeSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select size"
                              />
                            </FormControl>
                            <FormDescription>
                              Classification of your business scale
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Location and Contact */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Location & Contact</h3>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <LocationCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select business location..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input 
                                type="url" 
                                placeholder="https://example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_registration_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Business registration number" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Official business registration number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Operating Period */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Operating Period</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                placeholder="Select start date"
                                minYear={1900}
                                maxYear={new Date().getFullYear()}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              When did you start this business?
                            </FormDescription>
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
                                disabled={form.watch('current_business')}
                                placeholder="Select end date"
                                minYear={1900}
                                maxYear={new Date().getFullYear()}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {form.watch('current_business') ? 'Not applicable for current business' : 'When did you leave this business?'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="current_business"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Currently operating this business
                            </FormLabel>
                            <FormDescription>
                              Check this if you're still actively running this business
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    {/* Save button moved to floating position */}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Services</h2>
              <p className="text-muted-foreground mt-1">
                Manage the services your business offers
              </p>
            </div>
            <Button onClick={addService} variant="accent" size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {services.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 hover:border-accent/50 transition-all duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-accent/10 p-4 mb-4">
                  <Package className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Start building your service catalog by adding your first service
                </p>
                <Button onClick={addService} variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-accent/50 hover:border-l-accent">
                  <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                              <Input
                                value={service.service_name}
                                onChange={(e) => {
                                  updateService(service.id, { service_name: e.target.value });
                                }}
                                placeholder="Service name"
                                className="font-medium"
                              />
                              <Textarea
                                value={service.description || ''}
                                onChange={(e) => {
                                  updateService(service.id, { description: e.target.value });
                                }}
                                placeholder="Service description"
                                className="min-h-[80px]"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Select
                                  value={service.category_id || undefined}
                                  onValueChange={(value) => updateService(service.id, { category_id: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {serviceCategories.map(cat => (
                                      <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <Select
                                  value={service.price_range || undefined}
                                  onValueChange={(value) => updateService(service.id, { price_range: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Price range" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="$">$ - Budget</SelectItem>
                                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                                    <SelectItem value="$$$">$$$ - Premium</SelectItem>
                                    <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Input
                                  type="number"
                                  value={service.display_order || index}
                                  onChange={(e) => updateService(service.id, { display_order: parseInt(e.target.value) })}
                                  placeholder="Order"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteService(service.id)}
                              className="ml-2 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Links</CardTitle>
              <CardDescription>
                Add links to your business's online presence and social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessLinksTab businessId={businessId || ''} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Contact Methods</h2>
              <p className="text-muted-foreground mt-1">
                Add multiple ways for people to contact your business
              </p>
            </div>
            <Button onClick={addContactMethod} variant="accent" size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {contactMethods.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 hover:border-accent/50 transition-all duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-accent/10 p-4 mb-4">
                  <Phone className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No contact methods yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Make it easy for customers to reach you by adding contact methods
                </p>
                <Button onClick={addContactMethod} variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contactMethods.map(contact => (
                <Card key={contact.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-accent/50 hover:border-l-accent">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_auto] gap-4 items-start">
                      {/* Contact Type Dropdown */}
                      <Select
                        value={contact.contact_type}
                        onValueChange={(value) => {
                          updateContactMethod(contact.id, { contact_type: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_TYPE_OPTIONS.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Contact Value Input */}
                      <div className="space-y-1">
                        <Input
                          value={contact.contact_value}
                          placeholder={getContactPlaceholder(contact.contact_type)}
                          onChange={(e) => {
                            updateContactMethod(contact.id, { contact_value: e.target.value });
                          }}
                        />
                        {getContactHint(contact.contact_type) && (
                          <p className="text-xs text-muted-foreground">
                            {getContactHint(contact.contact_type)}
                          </p>
                        )}
                      </div>

                      {/* Actions and Options */}
                      <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                        {contact.contact_value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = formatContactUrl(contact.contact_type, contact.contact_value);
                              if (url !== '#') {
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className="gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Test
                          </Button>
                        )}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={contact.is_primary}
                            onCheckedChange={(checked) => {
                              updateContactMethod(contact.id, { is_primary: checked });
                            }}
                            id={`primary-${contact.id}`}
                          />
                          <label htmlFor={`primary-${contact.id}`} className="text-sm font-medium cursor-pointer">
                            Primary
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={contact.is_public}
                            onCheckedChange={(checked) => {
                              updateContactMethod(contact.id, { is_public: checked });
                            }}
                            id={`public-${contact.id}`}
                          />
                          <label htmlFor={`public-${contact.id}`} className="text-sm font-medium cursor-pointer">
                            Public
                          </label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteContactMethod(contact.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Achievements & Awards</h2>
              <p className="text-muted-foreground mt-1">
                Showcase your business accomplishments and milestones
              </p>
            </div>
            <Button onClick={addAchievement} variant="accent" size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>

          {achievements.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 hover:border-accent/50 transition-all duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-accent/10 p-4 mb-4">
                  <Award className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Highlight your awards, certifications, and milestones to build credibility
                </p>
                <Button onClick={addAchievement} variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Achievement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {achievements.map(achievement => (
                <Card key={achievement.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-accent/50 hover:border-l-accent">
                  <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Select
                              value={achievement.icon_type || 'award'}
                              onValueChange={(value) => updateAchievement(achievement.id, { icon_type: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="award">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Award
                                  </div>
                                </SelectItem>
                                <SelectItem value="certificate">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Certificate
                                  </div>
                                </SelectItem>
                                <SelectItem value="milestone">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Milestone
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={achievement.title}
                                onChange={(e) => {
                                  updateAchievement(achievement.id, { title: e.target.value });
                                }}
                                placeholder="Achievement title"
                                className="font-medium"
                              />
                              <Textarea
                                value={achievement.description || ''}
                                onChange={(e) => {
                                  updateAchievement(achievement.id, { description: e.target.value });
                                }}
                                placeholder="Description"
                                className="min-h-[60px]"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAchievementToDelete(achievement.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Business Metrics</h2>
              <p className="text-muted-foreground mt-1">
                Track and display key business statistics (each metric type can only be used once per time period)
              </p>
            </div>
            <Button onClick={addMetric} variant="accent" size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
            </Button>
          </div>

          {metrics.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 hover:border-accent/50 transition-all duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-accent/10 p-4 mb-4">
                  <BarChart3 className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No metrics yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Add key performance metrics to showcase your business growth and success
                </p>
                <Button onClick={addMetric} variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Metric
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics.map(metric => (
                <Card key={metric.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-accent/50 hover:border-l-accent">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <Select
                            value={metric.metric_type}
                            onValueChange={(value) => updateMetric(metric.id, 'metric_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Metric type" />
                            </SelectTrigger>
                            <SelectContent>
                              {METRIC_TYPE_OPTIONS.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              type="number"
                              value={metric.metric_value || ''}
                              onChange={(e) => {
                                updateMetric(metric.id, 'metric_value', parseFloat(e.target.value) || 0);
                              }}
                              placeholder="Value"
                            />
                            <Select
                              value={metric.metric_unit || 'count'}
                              onValueChange={(value) => updateMetric(metric.id, 'metric_unit', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {METRIC_UNIT_OPTIONS.map(unit => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <Select
                              value={metric.metric_period || 'current'}
                              onValueChange={(value) => updateMetric(metric.id, 'metric_period', value)}
                              className="flex-1"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Period" />
                              </SelectTrigger>
                              <SelectContent>
                                {METRIC_PERIOD_OPTIONS.map(period => (
                                  <SelectItem key={period.value} value={period.value}>
                                    {period.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2 ml-4">
                              <Checkbox
                                checked={metric.is_public}
                                onCheckedChange={(checked) => updateMetric(metric.id, 'is_public', checked)}
                                id={`public-${metric.id}`}
                              />
                              <label htmlFor={`public-${metric.id}`} className="text-sm font-medium">
                                Public
                              </label>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMetric(metric.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your business team and their roles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Team Member Section */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Add Team Member</h4>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="Search for alumni by name or course..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchAlumni(e.target.value);
                      }}
                      className="pr-10"
                    />
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg bg-background">
                      {searchResults.map((alumni) => (
                        <div key={alumni.user_id} className="p-3 border-b last:border-b-0 hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={alumni.avatar_url} />
                                <AvatarFallback>
                                  {alumni.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{alumni.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCourseName(alumni.course)} • Class of {alumni.graduation_year}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAlumniForTeam(alumni);
                                setTeamMemberRole('');
                                setTeamMemberIsAdmin(false);
                                setShowTeamMemberDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Current Team Members</h4>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No team members added yet</p>
                    <p className="text-sm">Search and add alumni to your team</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.profiles?.avatar_url} />
                                <AvatarFallback>
                                  {member.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{member.profiles?.full_name}</p>
                                  {member.is_business_admin && (
                                    <Badge variant="default" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <Input
                                    value={member.role || ''}
                                    onChange={(e) => {
                                      updateTeamMember(member.id, { role: e.target.value });
                                    }}
                                    placeholder="Enter role"
                                    className="h-7 text-sm max-w-[200px]"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {formatCourseName(member.profiles?.course)} • {member.profiles?.graduation_year}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={member.is_business_admin || false}
                                onCheckedChange={(checked) => 
                                  updateTeamMember(member.id, { is_business_admin: checked })
                                }
                              />
                              <label className="text-sm mr-2">Admin</label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTeamMemberToRemove(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions for this business
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <h3 className="font-semibold text-sm mb-2">Delete this business</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a business, there is no going back. All data associated with this business will be permanently removed.
                </p>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Business
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Business</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>This action cannot be undone. This will permanently delete:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Business profile and information</li>
                          <li>All services and categories</li>
                          <li>Contact methods and social links</li>
                          <li>Team members and their roles</li>
                          <li>Achievements and awards</li>
                          <li>Business metrics and analytics</li>
                          <li>Uploaded images and gallery</li>
                          <li>Customer reviews and ratings</li>
                        </ul>
                        <div className="mt-4">
                          <p className="font-semibold mb-2">
                            Type <span className="text-destructive">{business?.business_name}</span> to confirm:
                          </p>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Enter business name"
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setDeleteConfirmation('');
                          setShowDeleteDialog(false);
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteConfirmation !== business?.business_name || isDeleting}
                        onClick={async () => {
                          setIsDeleting(true);
                          try {
                            const { error } = await supabase
                              .from('user_businesses')
                              .delete()
                              .eq('id', businessId);

                            if (error) throw error;

                            toast.success('Business deleted successfully');
                            navigate('/abud/business/edit');
                          } catch (error) {
                            console.error('Error deleting business:', error);
                            toast.error('Failed to delete business');
                            setIsDeleting(false);
                            setShowDeleteDialog(false);
                            setDeleteConfirmation('');
                          }
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Business'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievement Delete Confirmation */}
      <AlertDialog open={!!achievementToDelete} onOpenChange={(open) => !open && setAchievementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this achievement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (achievementToDelete) {
                  deleteAchievement(achievementToDelete);
                  setAchievementToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Team Member Remove Confirmation */}
      <AlertDialog open={!!teamMemberToRemove} onOpenChange={(open) => !open && setTeamMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member from the business? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (teamMemberToRemove) {
                  removeTeamMember(teamMemberToRemove);
                  setTeamMemberToRemove(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Team Member Role Dialog */}
      <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Enter the role and permissions for {selectedAlumniForTeam?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input
                placeholder="e.g., Developer, Designer, Manager"
                value={teamMemberRole}
                onChange={(e) => setTeamMemberRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && teamMemberRole.trim()) {
                    addTeamMember(selectedAlumniForTeam, teamMemberRole, teamMemberIsAdmin);
                    setShowTeamMemberDialog(false);
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin-privileges"
                checked={teamMemberIsAdmin}
                onCheckedChange={(checked) => setTeamMemberIsAdmin(checked as boolean)}
              />
              <label
                htmlFor="admin-privileges"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Give admin privileges for this business
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTeamMemberDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (teamMemberRole.trim()) {
                  addTeamMember(selectedAlumniForTeam, teamMemberRole, teamMemberIsAdmin);
                  setShowTeamMemberDialog(false);
                }
              }}
              disabled={!teamMemberRole.trim()}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {(form.formState.isDirty || servicesDirty || contactDirty || achievementsDirty || metricsDirty || teamDirty || imageDirty) && (
          <div className="text-sm text-amber-700 bg-amber-50 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-amber-300 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Unsaved changes</span>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          variant="accent"
          className="shadow-xl hover:shadow-2xl transition-all duration-200"
          title="Save all unsaved changes across all tabs"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BusinessEditEnhanced;