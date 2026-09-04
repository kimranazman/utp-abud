import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  course?: string;
  graduation_year?: number;
}

interface StartChatDialogProps {
  onStartChat: (participantId: string) => void;
  trigger?: React.ReactNode;
}

export const StartChatDialog = ({ onStartChat, trigger }: StartChatDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all users except current user
  const fetchProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_public_profiles', { 
          search_term: '', 
          limit_count: 100 
        });

      if (error) throw error;
      // Filter out current user from results
      const filteredData = (data || []).filter(profile => profile.user_id !== user.id);
      setProfiles(filteredData);
      setFilteredProfiles(filteredData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Failed to Load Users",
        description: "Unable to load the user list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile =>
        profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.course?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  // Fetch profiles when dialog opens
  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open, user]);

  const handleStartChat = async (participantId: string) => {
    setOpen(false);
    onStartChat(participantId);
    setSearchQuery('');
  };

  const defaultTrigger = (
    <Button size="icon" variant="ghost" className="w-8 h-8">
      <Plus className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for alumni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users available'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProfiles.map((profile) => (
                  <Button
                    key={profile.user_id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                    onClick={() => handleStartChat(profile.user_id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                        <AvatarFallback>
                          {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{profile.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {profile.course && (
                            <span className="truncate">{profile.course}</span>
                          )}
                          {profile.graduation_year && (
                            <Badge variant="outline" className="text-xs">
                              {profile.graduation_year}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};