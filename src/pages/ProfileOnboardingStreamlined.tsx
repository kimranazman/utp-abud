import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { Check, Plus, Pencil, Trash2, ChevronDown, User, GraduationCap, Briefcase, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileVisibilitySelect, EducationLevelSelect } from '@/components/dropdowns';
import { Progress } from '@/components/ui/progress';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { VerificationModal } from '@/components/onboarding/VerificationModal';
import { cn } from '@/lib/utils';
import { dropdownService } from '@/services/dropdown.service';


const ProfileOnboardingStreamlined = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const autoSaveTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Form states
  const [personalData, setPersonalData] = useState({
    full_name: '',
    bio: '',
    location: '',
    profile_visibility: 'public' as 'public' | 'alumni_only' | 'private'
  });

  const [educationData, setEducationData] = useState<any[]>([]);
  const [addingEducation, setAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    programme_level: 'undergraduate',
    programme_name: '',
    graduation_year: new Date().getFullYear()
  });
  const [programmes, setProgrammes] = useState<string[]>([]);

  const [businessData, setBusinessData] = useState<any[]>([]);
  const [addingBusiness, setAddingBusiness] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    business_name: '',
    position: '',
    industry: '',
    location: '',
    website: '',
    description: ''
  });

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    personal: false,
    education: false,
    business: false
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [businessIntent, setBusinessIntent] = useState<string | null>(null);
  const [businessRelationship, setBusinessRelationship] = useState<'owner' | 'non-owner' | null>(null);

  // Load existing data on mount
  useEffect(() => {
    if (!loading && !user) {
      navigate('/abud/auth');
      return;
    }

    if (user) {
      loadExistingData();
    }
  }, [user, loading, navigate]);

  // Load programmes when education level changes
  useEffect(() => {
    const loadProgrammes = async () => {
      const progs = await dropdownService.getUTPProgrammes(newEducation.programme_level as 'undergraduate' | 'postgraduate');
      setProgrammes(progs);
    };
    loadProgrammes();
  }, [newEducation.programme_level]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        setPersonalData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          profile_visibility: profile.profile_visibility || 'public'
        });
        setBusinessIntent(profile.business_intent || null);

        // Set business relationship based on existing data
        if (profile.business_intent) {
          if (profile.business_intent === 'owner') {
            setBusinessRelationship('owner');
          } else {
            setBusinessRelationship('non-owner');
          }
        }

        // Check if already completed
        if (profile.profile_completed || profile.required_steps_completed) {
          navigate('/abud');
          return;
        }
      }

      // Load education
      const { data: education } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', user.id)
        .order('graduation_year', { ascending: false });

      if (education) {
        setEducationData(education);
      }

      // Load businesses
      const { data: businesses } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (businesses) {
        setBusinessData(businesses);
        // If user has businesses, they're an owner
        if (businesses.length > 0) {
          setBusinessRelationship('owner');
        }
      }

      // Don't call updateCompletionStatus here - let useEffect handle it
      // after state updates are complete
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateCompletionStatus = useCallback(() => {
    setCompletionStatus({
      personal: !!personalData.full_name,
      education: educationData.length > 0,
      business: businessData.length > 0 || !!businessIntent
    });
  }, [personalData.full_name, educationData.length, businessData.length, businessIntent]);

  useEffect(() => {
    updateCompletionStatus();
  }, [personalData.full_name, educationData.length, businessData.length, businessIntent]);

  // Auto-save personal data
  const savePersonalData = useCallback(
    debounce(async (data: typeof personalData) => {
      if (!user || !data.full_name) return;

      setIsSaving(true);
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            bio: data.bio,
            location: data.location,
            profile_visibility: data.profile_visibility,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving personal data:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [user]
  );

  // Handle personal data changes
  const handlePersonalChange = (field: string, value: string) => {
    const updated = { ...personalData, [field]: value };
    setPersonalData(updated);
    savePersonalData(updated);
  };

  // Add education
  const handleAddEducation = async () => {
    if (!user || !newEducation.programme_name) return;

    try {
      const { data, error } = await supabase
        .from('user_education')
        .insert({
          user_id: user.id,
          programme_level: newEducation.programme_level,
          programme_name: newEducation.programme_name,
          graduation_year: newEducation.graduation_year,
          is_primary: educationData.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      setEducationData([...educationData, data]);
      setNewEducation({
        programme_level: 'undergraduate',
        programme_name: '',
        graduation_year: new Date().getFullYear()
      });
      setAddingEducation(false);

      // Update profile with first education
      if (educationData.length === 0) {
        await supabase
          .from('profiles')
          .update({
            course: newEducation.programme_name,
            graduation_year: newEducation.graduation_year
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error adding education:', error);
      toast.error('Failed to add education');
    }
  };

  // Delete education
  const handleDeleteEducation = async (id: string) => {
    try {
      await supabase
        .from('user_education')
        .delete()
        .eq('id', id);

      setEducationData(educationData.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error('Failed to delete education');
    }
  };

  // Add business
  const handleAddBusiness = async () => {
    if (!user || !newBusiness.business_name || !newBusiness.position) return;

    try {
      const { data, error } = await supabase
        .from('user_businesses')
        .insert({
          user_id: user.id,
          business_name: newBusiness.business_name,
          position: newBusiness.position,
          industry: newBusiness.industry || null,
          location: newBusiness.location || null,
          website: newBusiness.website || null,
          description: newBusiness.description || null,
          ownership_type: 'founder',
          current_business: true
        })
        .select()
        .single();

      if (error) throw error;

      setBusinessData([...businessData, data]);
      setNewBusiness({
        business_name: '',
        position: '',
        industry: '',
        location: '',
        website: '',
        description: ''
      });
      setAddingBusiness(false);
    } catch (error) {
      console.error('Error adding business:', error);
      toast.error('Failed to add business');
    }
  };

  // Delete business
  const handleDeleteBusiness = async (id: string) => {
    try {
      await supabase
        .from('user_businesses')
        .delete()
        .eq('id', id);

      setBusinessData(businessData.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    }
  };

  // Handle business intent selection
  const handleBusinessIntentChange = async (intent: string) => {
    setBusinessIntent(intent);

    // Save to database immediately
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({
            business_intent: intent,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        toast.success('Business preference saved');
      } catch (error) {
        console.error('Error saving business intent:', error);
        toast.error('Failed to save business preference');
      }
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    if (!user || !completionStatus.personal || !completionStatus.education || !completionStatus.business) {
      toast.error('Please complete all required sections');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          required_steps_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Add a small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowVerificationModal(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const isComplete = completionStatus.personal && completionStatus.education && completionStatus.business;
  const completionPercentage = Object.values(completionStatus).filter(Boolean).length * 33.33;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Set up your alumni profile</h1>
          <p className="text-gray-600">Provide basic information to connect with fellow UTP alumni</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Complete these 3 sections to access the alumni directory</p>
              <p className="text-blue-700 mt-1">You can add more details later from your profile dashboard</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Profile Setup Progress
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(completionPercentage)}% complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2 mb-3" />
          <p className="text-xs text-gray-500 text-center">
            {isComplete
              ? "All sections complete! You can now access the directory."
              : `Complete all sections to access the directory (${Object.values(completionStatus).filter(Boolean).length}/3 done)`
            }
          </p>
        </div>

        {/* Completion Status */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              completionStatus.personal ? "border-blue-600 bg-blue-600" : "border-gray-300"
            )}>
              {completionStatus.personal && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn(
              "text-sm",
              completionStatus.personal ? "text-gray-900" : "text-gray-500"
            )}>Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              completionStatus.education ? "border-blue-600 bg-blue-600" : "border-gray-300"
            )}>
              {completionStatus.education && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn(
              "text-sm",
              completionStatus.education ? "text-gray-900" : "text-gray-500"
            )}>Education</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              completionStatus.business ? "border-blue-600 bg-blue-600" : "border-gray-300"
            )}>
              {completionStatus.business && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn(
              "text-sm",
              completionStatus.business ? "text-gray-900" : "text-gray-500"
            )}>Business</span>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={personalData.full_name}
                onChange={(e) => handlePersonalChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Textarea
                value={personalData.bio}
                onChange={(e) => handlePersonalChange('bio', e.target.value)}
                placeholder="Tell alumni about yourself (optional)"
                className="w-full h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{personalData.bio.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <LocationCombobox
                  value={personalData.location}
                  onValueChange={(value) => handlePersonalChange('location', value)}
                  placeholder="Select your location..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                <ProfileVisibilitySelect
                  value={personalData.profile_visibility}
                  onValueChange={(value) => handlePersonalChange('profile_visibility', value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Education</h2>
            </div>
            {!addingEducation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingEducation(true)}
                className="text-gray-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Programme
              </Button>
            )}
          </div>

          {/* Education list */}
          {educationData.length > 0 && (
            <div className="space-y-2 mb-4">
              {educationData.map((edu) => (
                <div key={edu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{edu.programme_name}</div>
                    <div className="text-sm text-gray-600">
                      {edu.programme_level} • Class of {edu.graduation_year}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add education form */}
          {addingEducation && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <EducationLevelSelect
                    value={newEducation.programme_level}
                    onValueChange={(value) => setNewEducation({ ...newEducation, programme_level: value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <Select
                    value={String(newEducation.graduation_year)}
                    onValueChange={(value) => setNewEducation({ ...newEducation, graduation_year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 45 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <Select
                  value={newEducation.programme_name}
                  onValueChange={(value) => setNewEducation({ ...newEducation, programme_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programmes.map(prog => (
                      <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddEducation}
                  disabled={!newEducation.programme_name}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddingEducation(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {educationData.length === 0 && !addingEducation && (
            <p className="text-sm text-gray-500">Add at least one education programme</p>
          )}
        </div>

        {/* Business Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Business</h2>
            </div>
            {!addingBusiness && businessRelationship === 'owner' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingBusiness(true)}
                className="text-gray-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Business
              </Button>
            )}
          </div>

          {/* Business Relationship Selection */}
          {!businessRelationship && businessData.length === 0 && !businessIntent && (
            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium mb-3">Do you own or manage a business?</p>
              <div className="space-y-2">
                <button
                  onClick={() => setBusinessRelationship('owner')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Yes, I own or manage a business</div>
                  <div className="text-sm text-gray-600">I'll add my business details</div>
                </button>
                <button
                  onClick={() => setBusinessRelationship('non-owner')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">No, I don't own a business</div>
                  <div className="text-sm text-gray-600">I'm here for networking or other purposes</div>
                </button>
              </div>
            </div>
          )}

          {/* Non-owner Intent Selection */}
          {businessRelationship === 'non-owner' && (
            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium mb-3">What brings you to the alumni directory?</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleBusinessIntentChange('aspiring')}
                  className={cn(
                    "w-full text-left p-3 border rounded-lg transition-colors",
                    businessIntent === 'aspiring'
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="font-medium text-gray-900">I'm planning to start a business</div>
                  <div className="text-sm text-gray-600">Looking for inspiration and connections</div>
                </button>
                <button
                  onClick={() => handleBusinessIntentChange('networking')}
                  className={cn(
                    "w-full text-left p-3 border rounded-lg transition-colors",
                    businessIntent === 'networking'
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="font-medium text-gray-900">Networking and connections</div>
                  <div className="text-sm text-gray-600">Building professional relationships</div>
                </button>
                <button
                  onClick={() => handleBusinessIntentChange('team_member')}
                  className={cn(
                    "w-full text-left p-3 border rounded-lg transition-colors",
                    businessIntent === 'team_member'
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="font-medium text-gray-900">I work with an alumni business</div>
                  <div className="text-sm text-gray-600">Part of an alumni-owned company team</div>
                </button>
              </div>
              {businessIntent && (
                <button
                  onClick={() => {
                    setBusinessRelationship(null);
                    setBusinessIntent(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  Change selection
                </button>
              )}
            </div>
          )}

          {/* Business list */}
          {businessData.length > 0 && (
            <div className="space-y-2 mb-4">
              {businessData.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{biz.business_name}</div>
                    <div className="text-sm text-gray-600">
                      {biz.position} {biz.industry && `• ${biz.industry}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBusiness(biz.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add business form */}
          {addingBusiness && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newBusiness.business_name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, business_name: e.target.value })}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newBusiness.position}
                    onChange={(e) => setNewBusiness({ ...newBusiness, position: e.target.value })}
                    placeholder="Your role"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    value={newBusiness.industry}
                    onChange={(e) => setNewBusiness({ ...newBusiness, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <LocationCombobox
                    value={newBusiness.location}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, location: value })}
                    placeholder="Select business location..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <Input
                  value={newBusiness.website}
                  onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                  placeholder="Brief description of the business"
                  className="h-20 resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddBusiness}
                  disabled={!newBusiness.business_name || !newBusiness.position}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddingBusiness(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {businessData.length === 0 && !addingBusiness && !businessIntent && (
            <p className="text-sm text-gray-500">Please select your business status above</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-6">
          <Button
            className="w-full"
            size="lg"
            disabled={!isComplete}
            onClick={handleComplete}
          >
            Continue to Directory
          </Button>
          {!isComplete && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Complete all sections to continue
            </p>
          )}
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-white border rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
            Saving...
          </div>
        )}

        {/* Verification Modal */}
        <VerificationModal
          open={showVerificationModal}
          onOpenChange={setShowVerificationModal}
        />
      </div>
    </div>
  );
};

export default ProfileOnboardingStreamlined;