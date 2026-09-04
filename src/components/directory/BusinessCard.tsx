import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Users, Globe, Mail, ExternalLink, Calendar, Award, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LocationBadge } from '@/components/ui/location-badge'

interface BusinessCardProps {
  business: {
    id: string
    business_name: string
    position: string
    description?: string
    website?: string
    start_date?: string
    end_date?: string
    current_business?: boolean
    ownership_type?: string
    year_established?: number
    business_size?: string
    employee_count_range?: string
    logo_url?: string
    logo_thumbnail_url?: string
    featured_image_url?: string
    created_at: string
    location_city?: string
    location_state?: string
    location_country?: string
    profiles: {
      full_name: string
      avatar_url?: string
      avatar_thumbnail_url?: string
    }
    business_category_mapping?: Array<{
      category_id: string
      business_categories?: {
        name: string
      }
    }>
    business_services?: Array<{ id: string }>
    business_achievements?: Array<{ id: string }>
  }
  zoomLevel: number
  onCategoryClick: (categoryId: string) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function BusinessCard({ business, zoomLevel, onCategoryClick, isSelected, onSelect }: BusinessCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    onSelect?.(business.id);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  const formatBusinessPeriod = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = new Date(startDate).getFullYear()
    if (isCurrent) return `${start} - Present`
    if (endDate) return `${start} - ${new Date(endDate).getFullYear()}`
    return `Since ${start}`
  }

  // Zoom level 1-2: Compact view
  if (zoomLevel <= 2) {
    return (
      <Card
        className={cn(
          "hover:shadow-md hover:border-utp-blue/30 transition-all cursor-pointer h-full",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-business-id={business.id}
      >
        <div className="flex items-center gap-3 p-3">
          <div className={cn(
            "bg-utp-blue/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0",
            zoomLevel === 1 ? "h-8 w-8" : "h-10 w-10"
          )}>
            {business.logo_thumbnail_url || business.logo_url ? (
              <img
                src={business.logo_thumbnail_url || business.logo_url}
                alt={`${business.business_name} logo`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Building2 className={cn("text-utp-blue", zoomLevel === 1 ? "h-4 w-4" : "h-5 w-5")} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{business.business_name}</h3>
            <p className="text-xs text-muted-foreground truncate">{business.profiles.full_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {business.business_category_mapping?.slice(0, 1).map((mapping) => (
              <Badge
                key={mapping.category_id}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onCategoryClick(mapping.category_id)
                }}
              >
                {mapping.business_categories?.name}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/abud/business/${business.id}`)
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Zoom level 3: Standard grid view
  if (zoomLevel === 3) {
    return (
      <Card
        className={cn(
          "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-business-id={business.id}
      >
        <CardHeader className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 bg-utp-blue/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {business.logo_thumbnail_url || business.logo_url ? (
                <img
                  src={business.logo_thumbnail_url || business.logo_url}
                  alt={`${business.business_name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6 text-utp-blue" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{business.business_name}</CardTitle>
              <CardDescription className="text-xs truncate">
                {business.position} • {business.profiles.full_name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-4 pb-4 pt-0">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {business.business_category_mapping?.slice(0, 2).map((mapping) => (
              <Badge
                key={mapping.category_id}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation()
                  onCategoryClick(mapping.category_id)
                }}
              >
                {mapping.business_categories?.name}
              </Badge>
            ))}
            {business.current_business && (
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Active
              </Badge>
            )}
            <LocationBadge
              city={business.location_city}
              state={business.location_state}
              country={business.location_country}
              directoryType="business"
              size="sm"
            />
          </div>

          <div className="flex-grow" />

          <div className="flex items-center gap-3 pt-3 border-t">
            <Avatar className="h-8 w-8">
              <AvatarImage src={business.profiles.avatar_thumbnail_url || business.profiles.avatar_url || ""} />
              <AvatarFallback className="text-xs">{getInitials(business.profiles.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{business.profiles.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{business.position}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/abud/business/${business.id}`)
              }}
            >
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Zoom level 4: Detailed view
  if (zoomLevel === 4) {
    return (
      <Card
        className={cn(
          "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-business-id={business.id}
      >
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-utp-blue/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {business.logo_thumbnail_url || business.logo_url ? (
                <img
                  src={business.logo_thumbnail_url || business.logo_url}
                  alt={`${business.business_name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-utp-blue" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{business.business_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                {business.position} • {business.profiles.full_name}
              </CardDescription>
              {business.year_established && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Est. {business.year_established}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-5 pb-5 pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {business.business_category_mapping?.slice(0, 3).map((mapping) => (
              <Badge
                key={mapping.category_id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation()
                  onCategoryClick(mapping.category_id)
                }}
              >
                {mapping.business_categories?.name}
              </Badge>
            ))}
            {business.ownership_type && (
              <Badge variant="outline">{business.ownership_type}</Badge>
            )}
            {business.current_business && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Active
              </Badge>
            )}
            <LocationBadge
              city={business.location_city}
              state={business.location_state}
              country={business.location_country}
              directoryType="business"
              size="default"
            />
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {business.description}
            </p>
          )}

          <div className="flex-grow" />

          <div className="flex items-center gap-3 pt-3 border-t">
            <Avatar className="h-10 w-10">
              <AvatarImage src={business.profiles.avatar_thumbnail_url || business.profiles.avatar_url || ""} />
              <AvatarFallback className="text-sm">{getInitials(business.profiles.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{business.profiles.full_name}</p>
              <p className="text-xs text-muted-foreground">{business.position}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/abud/business/${business.id}`)
              }}
            >
              View Business
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Zoom level 5: Full detail view
  return (
    <Card
      className={cn(
        "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={handleCardClick}
      data-business-id={business.id}
    >
      {business.featured_image_url && (
        <div className="h-48 overflow-hidden rounded-t-lg">
          <img
            src={business.featured_image_url}
            alt={business.business_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 bg-utp-blue/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {business.logo_thumbnail_url || business.logo_url ? (
              <img
                src={business.logo_thumbnail_url || business.logo_url}
                alt={`${business.business_name} logo`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Building2 className="h-10 w-10 text-utp-blue" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{business.business_name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {business.position} • {business.profiles.full_name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 pb-6 pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {business.business_category_mapping?.slice(0, 3).map((mapping) => (
            <Badge
              key={mapping.category_id}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={(e) => {
                e.stopPropagation()
                onCategoryClick(mapping.category_id)
              }}
            >
              {mapping.business_categories?.name}
            </Badge>
          ))}
          {business.ownership_type && (
            <Badge variant="outline">{business.ownership_type}</Badge>
          )}
          {business.current_business && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Active
            </Badge>
          )}
          <LocationBadge
            city={business.location_city}
            state={business.location_state}
            country={business.location_country}
            directoryType="business"
            size="default"
          />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {business.business_services && business.business_services.length > 0 && (
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {business.business_services.length} Services
            </span>
          )}
          {business.business_achievements && business.business_achievements.length > 0 && (
            <span className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              {business.business_achievements.length} Achievements
            </span>
          )}
        </div>

        {business.start_date && (
          <p className="text-sm text-muted-foreground">
            {formatBusinessPeriod(business.start_date, business.end_date ?? null, business.current_business ?? false)}
          </p>
        )}

        {business.description && (
          <p className="text-sm text-muted-foreground">
            {business.description}
          </p>
        )}

        {business.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {business.website}
            </a>
          </div>
        )}

        <div className="flex-grow" />

        <div className="border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={business.profiles.avatar_thumbnail_url || business.profiles.avatar_url || ""} />
              <AvatarFallback className="text-sm">{getInitials(business.profiles.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{business.profiles.full_name}</p>
              <p className="text-xs text-muted-foreground">{business.position}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="gap-2"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/abud/business/${business.id}`)
            }}
          >
            <Building2 className="h-4 w-4" />
            View Business
          </Button>
          {business.website && (
            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={business.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Visit
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
