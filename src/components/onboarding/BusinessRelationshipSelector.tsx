import { Building2, Rocket, Users, Briefcase } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface BusinessRelationshipSelectorProps {
  businessRelationship: 'owner' | 'non-owner' | null;
  nonOwnerIntent: 'aspiring' | 'networking' | 'team_member' | null;
  onBusinessRelationshipChange: (value: 'owner' | 'non-owner') => void;
  onNonOwnerIntentChange: (value: 'aspiring' | 'networking' | 'team_member') => void;
}

const BusinessRelationshipSelector = ({
  businessRelationship,
  nonOwnerIntent,
  onBusinessRelationshipChange,
  onNonOwnerIntentChange,
}: BusinessRelationshipSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Initial Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">What's your business status?</h3>
        <RadioGroup
          value={businessRelationship || ''}
          onValueChange={(value) => onBusinessRelationshipChange(value as 'owner' | 'non-owner')}
        >
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <Label htmlFor="owner" className="cursor-pointer flex items-start gap-3">
                <RadioGroupItem value="owner" id="owner" className="mt-1" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">I own or manage a business</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're a founder, co-founder, or in a leadership role at a business
                  </p>
                </div>
              </Label>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <Label htmlFor="non-owner" className="cursor-pointer flex items-start gap-3">
                <RadioGroupItem value="non-owner" id="non-owner" className="mt-1" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="font-medium">I don't own a business</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're interested in starting one, networking, or part of a team
                  </p>
                </div>
              </Label>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Non-Owner Options */}
      {businessRelationship === 'non-owner' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-semibold">Tell us more about your interests</h3>
          <RadioGroup
            value={nonOwnerIntent || ''}
            onValueChange={(value) => onNonOwnerIntentChange(value as 'aspiring' | 'networking' | 'team_member')}
          >
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <Label htmlFor="aspiring" className="cursor-pointer flex items-start gap-3">
                  <RadioGroupItem value="aspiring" id="aspiring" className="mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">I'm interested in starting one</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You're exploring entrepreneurship and want to learn from alumni businesses
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <Label htmlFor="networking" className="cursor-pointer flex items-start gap-3">
                  <RadioGroupItem value="networking" id="networking" className="mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">I only want to network</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You're here to connect with fellow alumni and expand your professional network
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <Label htmlFor="team_member" className="cursor-pointer flex items-start gap-3">
                  <RadioGroupItem value="team_member" id="team_member" className="mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-500" />
                      <span className="font-medium">I'm part of an Alumni Business team</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You work at or collaborate with a business owned by a fellow alumni
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default BusinessRelationshipSelector;