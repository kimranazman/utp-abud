import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Code2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DevelopmentModeToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ seedCount: 0, realCount: 0 });

  useEffect(() => {
    checkDevelopmentMode();
  }, []);

  const checkDevelopmentMode = async () => {
    try {
      // Get config data
      const { data: configData } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'development_mode')
        .maybeSingle();
      
      const isEnabled = (configData?.value as any)?.enabled || false;
      setIsEnabled(isEnabled);
      
      // Get counts manually
      const { count: seedCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_seed_data', true);
        
      const { count: realCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('is_seed_data', true);
        
      setStats({
        seedCount: seedCount || 0,
        realCount: realCount || 0
      });
    } catch (error) {
      console.error('Error checking development mode:', error);
      console.log('Stack trace:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const toggleDevelopmentMode = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      // Update app_config directly
      const { error } = await supabase
        .from('app_config')
        .update({ 
          value: { enabled },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'development_mode');

      if (error) throw error;

      setIsEnabled(enabled);
      toast.success(`Development mode ${enabled ? 'enabled' : 'disabled'}`);
      
      // Refresh the page to apply RLS policy changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error toggling development mode:', error);
      toast.error(error.message || 'Failed to toggle development mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Development Mode
            </CardTitle>
            <CardDescription>
              Show seed data without authentication requirements
            </CardDescription>
          </div>
          <Badge variant={isEnabled ? 'default' : 'secondary'}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="development-mode"
            checked={isEnabled}
            onCheckedChange={toggleDevelopmentMode}
            disabled={loading}
          />
          <Label htmlFor="development-mode">
            Enable development mode
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{stats.seedCount} seed profiles</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{stats.realCount} real profiles</span>
          </div>
        </div>

        {isEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Development mode is active. Seed profiles are now visible in the alumni directory 
              without authentication. Remember to disable this before production deployment.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};