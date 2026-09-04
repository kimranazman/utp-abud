import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BarChart3, Users, Building2, Globe, Calendar, Loader2 } from 'lucide-react';
import { useLandingStatsConfig, updateLandingStatsConfig, useLandingStats } from '@/hooks/useLandingStats';

export function LandingStatsConfig() {
  const queryClient = useQueryClient();
  const { data: config, isLoading: configLoading } = useLandingStatsConfig();
  const { data: liveStats, isLoading: liveStatsLoading } = useLandingStats();

  const [mode, setMode] = useState<'realtime' | 'hardcoded'>('realtime');
  const [hardcoded, setHardcoded] = useState({
    alumni: 5000,
    businesses: 200,
    countries: 50,
    years: 27
  });
  const [saving, setSaving] = useState(false);

  // Load current config
  useEffect(() => {
    if (config) {
      setMode(config.mode);
      setHardcoded(config.hardcoded);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLandingStatsConfig({ mode, hardcoded });
      queryClient.invalidateQueries({ queryKey: ['landing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['landing-stats-config'] });
      toast.success('Landing stats settings saved');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof hardcoded, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setHardcoded(prev => ({ ...prev, [field]: numValue }));
    }
  };

  if (configLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Landing Page Stats</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Landing Page Stats</h3>
        </div>
        <Badge variant={mode === 'realtime' ? 'default' : 'secondary'}>
          {mode === 'realtime' ? 'Real-time' : 'Marketing Values'}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure how stats are displayed on the public landing page.
      </p>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="stats-mode" className="text-base">Use Marketing Values</Label>
          <p className="text-sm text-muted-foreground">
            When enabled, shows hardcoded values instead of real database counts
          </p>
        </div>
        <Switch
          id="stats-mode"
          checked={mode === 'hardcoded'}
          onCheckedChange={(checked) => setMode(checked ? 'hardcoded' : 'realtime')}
        />
      </div>

      {/* Live Stats Display (for reference) */}
      {mode === 'hardcoded' && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Live Values (for reference)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liveStatsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading live stats...
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold">{liveStats?.alumni || 0}</p>
                  <p className="text-xs text-muted-foreground">Alumni</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{liveStats?.businesses || 0}</p>
                  <p className="text-xs text-muted-foreground">Businesses</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{liveStats?.countries || 0}</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{liveStats?.years || 27}</p>
                  <p className="text-xs text-muted-foreground">Years</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hardcoded Values Input */}
      <div className={`space-y-4 ${mode !== 'hardcoded' ? 'opacity-50 pointer-events-none' : ''}`}>
        <Label className="text-sm font-medium">Marketing Values</Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alumni" className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alumni Count
            </Label>
            <Input
              id="alumni"
              type="number"
              min="0"
              value={hardcoded.alumni}
              onChange={(e) => handleInputChange('alumni', e.target.value)}
              disabled={mode !== 'hardcoded'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businesses" className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Businesses Count
            </Label>
            <Input
              id="businesses"
              type="number"
              min="0"
              value={hardcoded.businesses}
              onChange={(e) => handleInputChange('businesses', e.target.value)}
              disabled={mode !== 'hardcoded'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries" className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Countries Count
            </Label>
            <Input
              id="countries"
              type="number"
              min="0"
              value={hardcoded.countries}
              onChange={(e) => handleInputChange('countries', e.target.value)}
              disabled={mode !== 'hardcoded'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years" className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Years of Heritage
            </Label>
            <Input
              id="years"
              type="number"
              min="0"
              value={hardcoded.years}
              onChange={(e) => handleInputChange('years', e.target.value)}
              disabled={mode !== 'hardcoded'}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
