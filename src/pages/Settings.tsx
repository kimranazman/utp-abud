import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProfileVisibilitySelect } from '@/components/dropdowns';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Shield, Trash2, User, Bell, Mail, MapPin, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileVisibility = async (visibility: 'public' | 'alumni_only' | 'private') => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_visibility: visibility })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, profile_visibility: visibility });
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySetting = async (field: string, value: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, [field]: value });
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete user account (this will cascade to profile and other data)
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) throw error;

      toast.success('Account deleted successfully');
      await signOut();
      navigate('/abud');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and privacy preferences</p>
          </div>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5" />
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Profile Completion</Label>
              <p className="text-sm text-muted-foreground">
                {profile?.profile_completed ? 'Complete' : 'Incomplete'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your profile</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <ProfileVisibilitySelect
                value={profile?.profile_visibility || 'alumni_only'}
                onValueChange={updateProfileVisibility}
                disabled={saving}
                placeholder="Select visibility"
              />
              <p className="text-xs text-muted-foreground">
                {profile?.profile_visibility === 'public' && 'Your profile is visible to everyone'}
                {profile?.profile_visibility === 'alumni_only' && 'Your profile is visible to verified alumni only'}
                {profile?.profile_visibility === 'private' && 'Your profile is private and only visible to you'}
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Field-Level Privacy</Label>
                <p className="text-xs text-muted-foreground mb-4">
                  Control which fields are visible to other alumni
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Hide Email Address</Label>
                    <p className="text-xs text-muted-foreground">
                      Your email won't be visible to other alumni
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile?.hide_email ?? false}
                  onCheckedChange={(checked) => updatePrivacySetting('hide_email', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Hide Location</Label>
                    <p className="text-xs text-muted-foreground">
                      Your city/state/country won't appear in directory or profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile?.hide_location ?? false}
                  onCheckedChange={(checked) => updatePrivacySetting('hide_location', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Hide Graduation Year</Label>
                    <p className="text-xs text-muted-foreground">
                      Your graduation year won't appear in directory or profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile?.hide_graduation_year ?? false}
                  onCheckedChange={(checked) => updatePrivacySetting('hide_graduation_year', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Hide Businesses</Label>
                    <p className="text-xs text-muted-foreground">
                      Your businesses won't appear in business directory
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile?.hide_businesses ?? false}
                  onCheckedChange={(checked) => updatePrivacySetting('hide_businesses', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your profile and connections
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Directory Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new alumni join the directory
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile information</li>
                      <li>Career history and achievements</li>
                      <li>Business listings</li>
                      <li>All uploaded images and documents</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, delete my account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;