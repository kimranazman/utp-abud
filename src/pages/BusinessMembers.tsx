import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Search, Shield, Trash2, User, Crown, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const BusinessMembers = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [businessOwner, setBusinessOwner] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberIsAdmin, setNewMemberIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (businessId && user) {
      fetchBusinessAndMembers();
    }
  }, [businessId, user]);

  const fetchBusinessAndMembers = async () => {
    try {
      setLoading(true);

      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;

      // Check authorization
      const isOwner = businessData.user_id === user?.id;
      let isTeamAdmin = false;

      if (!isOwner) {
        const { data: teamData } = await supabase
          .from('business_team_members')
          .select('is_business_admin')
          .eq('business_id', businessId)
          .eq('user_id', user?.id)
          .eq('is_business_admin', true)
          .maybeSingle();

        isTeamAdmin = !!teamData;
      }

      const authorized = isOwner || isTeamAdmin;
      setIsAuthorized(authorized);

      if (!authorized) {
        toast({
          title: "Access denied",
          description: "You don't have permission to manage this business.",
          variant: "destructive",
        });
        navigate(`/abud/business/${businessId}`);
        return;
      }

      setBusiness(businessData);
      await fetchBusinessOwner(businessData.user_id);
      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error loading business",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/abud/business/${businessId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessOwner = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, course, graduation_year, bio')
        .eq('user_id', ownerId)
        .eq('is_verified', true)
        .single();

      if (error) throw error;
      setBusinessOwner(data);
    } catch (error: any) {
      console.error('Error fetching business owner:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('business_team_members')
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            email,
            course,
            graduation_year,
            bio
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error loading team members",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const searchAlumni = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, course, graduation_year')
        .eq('is_verified', true)
        .or(`full_name.ilike.%${query}%, email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      // Filter out existing team members and business owner
      const existingMemberIds = new Set([
        business?.user_id,
        ...teamMembers.map(member => member.user_id)
      ]);

      const filteredResults = (data || []).filter(
        profile => !existingMemberIds.has(profile.user_id)
      );

      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching alumni:', error);
    }
  };

  const addTeamMember = async () => {
    if (!selectedAlumni || !newMemberRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an alumni and enter their role.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('business_team_members')
        .insert({
          business_id: businessId,
          user_id: selectedAlumni.user_id,
          role: newMemberRole.trim(),
          is_business_admin: newMemberIsAdmin,
          added_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Team member added",
        description: `${selectedAlumni.full_name} has been added to the team.`,
      });

      setShowAddDialog(false);
      setSelectedAlumni(null);
      setNewMemberRole('');
      setNewMemberIsAdmin(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error adding team member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleMemberAdmin = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('business_team_members')
        .update({ is_business_admin: !currentStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Permissions updated",
        description: `Business admin access ${!currentStatus ? 'granted' : 'removed'}.`,
      });

      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error updating permissions",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Team member removed",
        description: `${memberName} has been removed from the team.`,
      });

      fetchBusinessOwner(business.user_id);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
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
            You don't have permission to manage this business.
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
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" asChild>
          <Link to={`/abud/business/${businessId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Business
          </Link>
        </Button>
      </div>

      {/* Business Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Manage Team Members</CardTitle>
              <CardDescription>{business.business_name}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="mb-6">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Search for verified alumni to add to your business team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Alumni Search */}
            <div className="space-y-2">
              <Label>Search Alumni</Label>
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    {selectedAlumni ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedAlumni.full_name}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        Search for alumni...
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search alumni..."
                      value={searchQuery}
                      onValueChange={(value) => {
                        setSearchQuery(value);
                        searchAlumni(value);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No alumni found.</CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((alumni) => (
                          <CommandItem
                            key={alumni.user_id}
                            value={alumni.user_id}
                            onSelect={() => {
                              setSelectedAlumni(alumni);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={alumni.avatar_thumbnail_url || alumni.avatar_url || ""} alt={alumni.full_name} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(alumni.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{alumni.full_name}</p>
                                <p className="text-sm text-muted-foreground truncate">{alumni.email}</p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Role Input */}
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position</Label>
              <Input
                id="role"
                placeholder="e.g., Marketing Manager, Developer, etc."
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              />
            </div>

            {/* Admin Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                checked={newMemberIsAdmin}
                onCheckedChange={(checked) => setNewMemberIsAdmin(checked === true)}
              />
              <Label htmlFor="admin" className="text-sm">
                Grant business admin privileges (can edit business and manage team)
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedAlumni(null);
                  setNewMemberRole('');
                  setNewMemberIsAdmin(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={addTeamMember}>Add Member</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({(businessOwner ? 1 : 0) + teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!businessOwner && teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-4">
                Add alumni to your business team to collaborate and grow together.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Business Owner */}
              {businessOwner && (
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link to={`/abud/profile/${businessOwner.user_id}`}>
                        <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                          <AvatarImage src={businessOwner.avatar_thumbnail_url || businessOwner.avatar_url || ""} alt={businessOwner.full_name} />
                          <AvatarFallback>
                            {getInitials(businessOwner.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/abud/profile/${businessOwner.user_id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {businessOwner.full_name}
                          </Link>
                          <div title="Business Owner">
                            <Crown className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Business Owner</p>
                        <div className="flex gap-2">
                          {businessOwner.course && (
                            <Badge variant="secondary" className="text-xs">
                              {businessOwner.course}
                            </Badge>
                          )}
                          {businessOwner.graduation_year && (
                            <Badge variant="outline" className="text-xs">
                              {businessOwner.graduation_year}
                            </Badge>
                          )}
                          <Badge variant="default" className="text-xs">
                            Owner
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cannot be removed
                    </div>
                  </div>
                </Card>
              )}

              {/* Team Members */}
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link to={`/abud/profile/${member.user_id}`}>
                        <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                          <AvatarImage src={member.profiles.avatar_thumbnail_url || member.profiles.avatar_url || ""} alt={member.profiles.full_name} />
                          <AvatarFallback>
                            {getInitials(member.profiles.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/abud/profile/${member.user_id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {member.profiles.full_name}
                          </Link>
                          {member.is_business_admin && (
                            <div title="Business Admin">
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <div className="flex gap-2">
                          {member.profiles.course && (
                            <Badge variant="secondary" className="text-xs">
                              {member.profiles.course}
                            </Badge>
                          )}
                          {member.profiles.graduation_year && (
                            <Badge variant="outline" className="text-xs">
                              {member.profiles.graduation_year}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMemberAdmin(member.id, member.is_business_admin)}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        {member.is_business_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMember(member.id, member.profiles.full_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMembers;