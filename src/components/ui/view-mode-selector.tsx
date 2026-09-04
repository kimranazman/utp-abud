import { Grid2X2, LayoutGrid, Rows3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewMode = 'compact' | 'grid' | 'detail'

interface ViewModeSelectorProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
  className?: string
}

const viewModes = [
  { value: 'compact' as const, icon: Rows3, label: 'Compact' },
  { value: 'grid' as const, icon: Grid2X2, label: 'Grid' },
  { value: 'detail' as const, icon: LayoutGrid, label: 'Detail' },
]

export function ViewModeSelector({ value, onValueChange, className }: ViewModeSelectorProps) {
  return (
    <div className={cn("flex items-center border rounded-lg p-1", className)}>
      {viewModes.map((mode) => (
        <Button
          key={mode.value}
          variant={value === mode.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onValueChange(mode.value)}
          className={cn(
            "h-8 px-3 gap-2",
            value === mode.value 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
        >
          <mode.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{mode.label}</span>
        </Button>
      ))}
    </div>
  )
}