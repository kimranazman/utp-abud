import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Search, ArrowRight } from 'lucide-react';

const Directory = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Alumni Directory</h1>
        <p className="text-muted-foreground text-lg">
          Connect with UTP alumni worldwide and discover amazing businesses
        </p>
      </div>

      {/* Main Directory Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alumni Directory Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Alumni Directory</CardTitle>
                <CardDescription>Find and connect with fellow UTP graduates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Search through thousands of alumni profiles, filter by graduation year, 
                course, location, and industry. Connect directly with alumni for networking 
                and mentorship opportunities.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Search by Course</Badge>
              <Badge variant="secondary">Filter by Year</Badge>
              <Badge variant="secondary">Location-based</Badge>
              <Badge variant="secondary">Industry Filter</Badge>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => navigate('/abud/directory/alumni')}
                className="w-full gap-2"
              >
                <Search className="h-4 w-4" />
                Browse Alumni
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Directory Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Business Directory</CardTitle>
                <CardDescription>Discover alumni-owned businesses and opportunities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Explore businesses founded and led by UTP alumni. Find services, 
                partnerships, career opportunities, and investment prospects within 
                our alumni network.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">By Industry</Badge>
              <Badge variant="secondary">Company Size</Badge>
              <Badge variant="secondary">Service Type</Badge>
              <Badge variant="secondary">Location</Badge>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => navigate('/abud/directory/business')}
                variant="outline"
                className="w-full gap-2"
              >
                <Building2 className="h-4 w-4" />
                Browse Businesses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Directory;