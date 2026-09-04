import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, ExternalLink, Globe, Linkedin, Github, Twitter, Facebook, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StartChatButton } from '@/components/chat/StartChatButton'
import { cn } from '@/lib/utils'
import { formatCourseName } from '@/lib/courseUtils'
import { LocationBadge } from '@/components/ui/location-badge'

interface AlumniCardProps {
  alumnus: any
  zoomLevel: number
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function AlumniCard({ alumnus, zoomLevel, isSelected, onSelect }: AlumniCardProps) {
  const handleCardClick = () => {
    onSelect?.(alumnus.user_id);
  };
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  const getCurrentPosition = (careerHistory: any[]) => {
    const current = careerHistory?.find(c => c.current_position)
    return current ? `${current.position} at ${current.company_name}` : 'Position not specified'
  }

  const getPlatformIcon = (platform: string) => {
    const iconMap: { [key: string]: any } = {
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      website: Globe,
      portfolio: ExternalLink,
    };

    const Icon = iconMap[platform.toLowerCase()] || ExternalLink;
    return <Icon className="h-3 w-3" />;
  };

  // Zoom level 1-2: Compact view (most zoomed out)
  if (zoomLevel <= 2) {
    return (
      <Card
        className={cn(
          "hover:shadow-md hover:border-utp-blue/30 transition-all cursor-pointer h-full",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-alumni-id={alumnus.user_id}
      >
        <div className="flex items-center gap-3 p-3">
          <Avatar className={cn("flex-shrink-0", zoomLevel === 1 ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarImage src={alumnus.avatar_thumbnail_url || alumnus.avatar_url || ""} alt={alumnus.full_name} />
            <AvatarFallback className="text-xs">
              {getInitials(alumnus.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{alumnus.full_name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {getCurrentPosition(alumnus.career_history)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {alumnus.graduation_year && (
              <Badge variant="outline" className="text-xs">
                {alumnus.graduation_year}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/abud/profile/${alumnus.user_id}`}>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Zoom level 3: Standard grid view (default)
  if (zoomLevel === 3) {
    return (
      <Card
        className={cn(
          "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-alumni-id={alumnus.user_id}
      >
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={alumnus.avatar_thumbnail_url || alumnus.avatar_url || ""} alt={alumnus.full_name} />
              <AvatarFallback className="text-sm">
                {getInitials(alumnus.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{alumnus.full_name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground truncate">
                {getCurrentPosition(alumnus.career_history)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-4 pb-4 pt-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {!alumnus.hide_graduation_year && alumnus.graduation_year && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {alumnus.graduation_year}
              </Badge>
            )}
            {alumnus.course && (
              <Badge variant="secondary" className="text-xs">
                <span className="truncate max-w-[140px] inline-block">
                  {formatCourseName(alumnus.course)}
                </span>
              </Badge>
            )}
            {!alumnus.hide_location && (
              <LocationBadge
                city={alumnus.location_city}
                state={alumnus.location_state}
                country={alumnus.location_country}
                directoryType="alumni"
                size="sm"
              />
            )}
          </div>

          {/* Bio snippet */}
          {alumnus.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {alumnus.bio}
            </p>
          )}

          <div className="flex-grow" />

          <div className="flex gap-2 mt-auto pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/abud/profile/${alumnus.user_id}`}>
                View Profile
              </Link>
            </Button>
            <StartChatButton
              targetUserId={alumnus.user_id}
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Zoom level 4: Detailed view with bio
  if (zoomLevel === 4) {
    return (
      <Card
        className={cn(
          "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onClick={handleCardClick}
        data-alumni-id={alumnus.user_id}
      >
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarImage src={alumnus.avatar_thumbnail_url || alumnus.avatar_url || ""} alt={alumnus.full_name} />
              <AvatarFallback className="text-lg">
                {getInitials(alumnus.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{alumnus.full_name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {getCurrentPosition(alumnus.career_history)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-5 pb-5 pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {alumnus.graduation_year && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {alumnus.graduation_year}
              </Badge>
            )}
            {alumnus.course && (
              <Badge variant="secondary" className="text-xs">
                <span className="truncate max-w-[200px] inline-block">
                  {formatCourseName(alumnus.course)}
                </span>
              </Badge>
            )}
            <LocationBadge
              city={alumnus.location_city}
              state={alumnus.location_state}
              country={alumnus.location_country}
              directoryType="alumni"
              size="default"
            />
          </div>

          {alumnus.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {alumnus.bio}
            </p>
          )}

          <div className="flex-grow" />

          <div className="flex gap-2 mt-auto pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/abud/profile/${alumnus.user_id}`}>
                View Profile
              </Link>
            </Button>
            <StartChatButton
              targetUserId={alumnus.user_id}
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Zoom level 5: Full detail view (most zoomed in)
  return (
    <Card
      className={cn(
        "hover:shadow-lg hover:border-utp-blue/30 transition-all cursor-pointer h-full flex flex-col",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={handleCardClick}
      data-alumni-id={alumnus.user_id}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={alumnus.avatar_thumbnail_url || alumnus.avatar_url || ""} alt={alumnus.full_name} />
            <AvatarFallback className="text-xl">
              {getInitials(alumnus.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{alumnus.full_name}</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              {getCurrentPosition(alumnus.career_history)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 pb-6 pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {alumnus.graduation_year && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {alumnus.graduation_year}
            </Badge>
          )}
          {alumnus.course && (
            <Badge variant="secondary">
              {formatCourseName(alumnus.course)}
            </Badge>
          )}
          <LocationBadge
            city={alumnus.location_city}
            state={alumnus.location_state}
            country={alumnus.location_country}
            directoryType="alumni"
            size="default"
          />
        </div>

        {alumnus.bio && (
          <p className="text-sm text-muted-foreground">
            {alumnus.bio}
          </p>
        )}

        {alumnus.user_links && alumnus.user_links.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Links</h4>
            <div className="flex flex-wrap gap-2">
              {alumnus.user_links.map((link: any) => (
                <Button
                  key={`${link.platform}-${link.url}`}
                  variant="outline"
                  size="sm"
                  aria-label={`Open ${link.platform} link`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(link.url, '_blank', 'noopener');
                  }}
                >
                  {getPlatformIcon(link.platform)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow" />

        <div className="flex gap-2 mt-auto pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/abud/profile/${alumnus.user_id}`}>
              View Profile
            </Link>
          </Button>
          <StartChatButton
            targetUserId={alumnus.user_id}
            variant="outline"
            className="flex-1"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        </div>
      </CardContent>
    </Card>
  )
}
