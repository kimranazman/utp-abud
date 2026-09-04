import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Calendar, MapPin, Globe, Users, Eye, Edit } from 'lucide-react';

const BusinessEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const fetchBusinesses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          *,
          business_category_mapping(
            category_id,
            business_categories(
              id,
              name,
              slug,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error fetching businesses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-utp-blue/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Building2 className="h-6 w-6 text-utp-blue" />
            </div>
            <p className="text-muted-foreground">Loading your businesses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-utp-blue/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-utp-blue" />
            </div>
            <h1 className="text-3xl font-bold">My Businesses</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Manage your business listings and information
          </p>
        </div>
        <Button onClick={() => navigate('/abud/business/new')} className="bg-utp-blue hover:bg-utp-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-utp-blue/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-utp-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              You haven't added any businesses yet. Start by adding your first business listing.
            </p>
            <Button onClick={() => navigate('/abud/business/new')} className="bg-utp-blue hover:bg-utp-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Business
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg hover:border-utp-blue/30 transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-utp-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {business.logo_url || business.logo_thumbnail_url ? (
                      <img
                        src={business.logo_thumbnail_url || business.logo_url}
                        alt={`${business.business_name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-utp-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1">{business.business_name}</CardTitle>
                    <CardDescription className="text-sm">{business.position}</CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {business.business_category_mapping?.slice(0, 2).map((mapping: any) => (
                        <Badge key={mapping.category_id} variant="secondary" className="text-xs">
                          {mapping.business_categories?.name}
                        </Badge>
                      ))}
                      {business.current_business && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/abud/business/${business.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/abud/business/${business.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {business.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {business.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{business.location}</span>
                    </div>
                  )}
                  {business.year_established && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Est. {business.year_established}</span>
                    </div>
                  )}
                  {business.employee_count_range && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{business.employee_count_range}</span>
                    </div>
                  )}
                </div>

                {business.website && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-utp-blue hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {business.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessEdit;