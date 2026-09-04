import { ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ZoomSliderProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function ZoomSlider({
  value,
  onValueChange,
  min = 1,
  max = 5,
  className
}: ZoomSliderProps) {
  return (
    <div className={cn("flex items-center gap-3 border rounded-lg px-3 py-2", className)}>
      <ZoomOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Slider
        value={[value]}
        onValueChange={(values) => onValueChange(values[0])}
        min={min}
        max={max}
        step={1}
        className="w-24"
      />
      <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  )
}

// Helper to get grid columns based on zoom level
export function getGridColumnsClass(zoomLevel: number): string {
  switch (zoomLevel) {
    case 1:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    case 2:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    case 4:
      return 'grid-cols-1 md:grid-cols-2'
    case 5:
      return 'grid-cols-1'
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }
}

// Helper to determine what details to show based on zoom level
export function getZoomDetails(zoomLevel: number) {
  return {
    showBio: zoomLevel >= 3,
    showLinks: zoomLevel >= 4,
    showFullDetails: zoomLevel >= 5,
    avatarSize: zoomLevel <= 2 ? 'sm' : zoomLevel <= 3 ? 'md' : 'lg',
    cardPadding: zoomLevel <= 2 ? 'compact' : zoomLevel <= 3 ? 'normal' : 'spacious'
  }
}
