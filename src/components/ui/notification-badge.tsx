import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count?: number;
  showCount?: boolean;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationBadge({
  count = 0,
  showCount = true,
  className,
  position = 'top-right'
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const positionClasses = {
    'top-right': 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
    'top-left': 'top-0 left-0 -translate-y-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0 translate-y-1/2 translate-x-1/2',
    'bottom-left': 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={cn(
        "absolute flex items-center justify-center",
        positionClasses[position],
        className
      )}
    >
      {showCount ? (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {displayCount}
        </span>
      ) : (
        <span className="h-2 w-2 rounded-full bg-red-500" />
      )}
    </div>
  );
}