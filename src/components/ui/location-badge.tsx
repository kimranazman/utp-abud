import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LocationBadgeProps {
  city?: string | null
  state?: string | null
  country?: string | null
  directoryType?: 'alumni' | 'business'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  truncateMaxWidth?: string
}

export function LocationBadge({
  city,
  state,
  country,
  directoryType = 'alumni',
  variant = 'outline',
  className,
  size = 'default',
  showIcon = true,
  truncateMaxWidth = 'max-w-[140px]'
}: LocationBadgeProps) {
  // Format location string
  const formatLocation = () => {
    if (!city && !country) return null

    const parts = []
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (country) parts.push(country)

    return parts.join(', ')
  }

  // Generate filter URL
  const getFilterUrl = () => {
    const location = formatLocation()
    if (!location) return `/abud/directory/${directoryType}`
    return `/abud/directory/${directoryType}?location=${encodeURIComponent(location)}`
  }

  const location = formatLocation()
  if (!location) return null

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base'
  }

  return (
    <Link
      to={getFilterUrl()}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex"
    >
      <Badge
        variant={variant}
        className={cn(
          'gap-1 hover:bg-accent transition-colors',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <MapPin className="h-3 w-3" />}
        <span className={cn('truncate inline-block', truncateMaxWidth)}>
          {location}
        </span>
      </Badge>
    </Link>
  )
}

/**
 * Helper function to extract location props from an object with location fields
 */
export function getLocationProps(obj: any): Pick<LocationBadgeProps, 'city' | 'state' | 'country'> {
  return {
    city: obj?.location_city,
    state: obj?.location_state,
    country: obj?.location_country
  }
}
