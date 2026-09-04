import { ReactNode } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Map, PanelLeftClose, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface DirectoryLayoutProps {
  children: ReactNode;
  mapContent: ReactNode;
  storageKey?: string;
  defaultMapSize?: number;
  minListSize?: number;
  minMapSize?: number;
  className?: string;
  isMapOpen?: boolean;
  setIsMapOpen?: (open: boolean) => void;
  onMapOpen?: () => void;
}

export function DirectoryLayout({
  children,
  mapContent,
  storageKey = 'directory-map-collapsed',
  defaultMapSize = 40,
  minListSize = 30,
  minMapSize = 20,
  className,
  isMapOpen: controlledIsMapOpen,
  setIsMapOpen: controlledSetIsMapOpen,
  onMapOpen,
}: DirectoryLayoutProps) {
  const [isMapCollapsed, setIsMapCollapsed] = useLocalStorage(storageKey, false);
  const isMobile = useIsMobile();

  // Use controlled state if provided, otherwise internal state for drawer
  const isDrawerOpen = controlledIsMapOpen ?? false;
  const setDrawerOpen = controlledSetIsMapOpen ?? (() => {});

  const toggleMap = () => {
    setIsMapCollapsed(!isMapCollapsed);
  };

  const handleFabClick = () => {
    setDrawerOpen(true);
    onMapOpen?.();
  };

  // Mobile layout with FAB and drawer
  if (isMobile) {
    return (
      <div className={cn('h-full flex flex-col relative', className)}>
        {/* Full width list on mobile */}
        <div className="flex-1 min-h-0 overflow-auto pb-20">
          {children}
        </div>

        {/* Floating Action Button (FAB) */}
        <Button
          onClick={handleFabClick}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] z-40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-shadow"
          aria-label="Show map"
        >
          <Map className="h-6 w-6" />
        </Button>

        {/* Mobile drawer with map */}
        <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-[70vh] min-h-[300px]">
            <DrawerHeader className="flex flex-row items-center justify-between py-2 px-4">
              <DrawerTitle>Map View</DrawerTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(false)}
                className="h-11 w-11 p-0"
                aria-label="Close map"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerHeader>
            <div className="flex-1 min-h-[250px] px-2 pb-4">
              {mapContent}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Desktop layout with resizable panels
  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Split view layout */}
      <div className="min-h-[500px]" style={{ height: 'calc(100vh - 16rem)' }}>
        {isMapCollapsed ? (
          // Full width list when map is collapsed
          <div className="h-full overflow-auto">
            <div className="flex justify-end p-4 pb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMap}
                className="gap-2"
              >
                <Map className="h-4 w-4" />
                Show Map
              </Button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>
        ) : (
          // Resizable split view
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
            <ResizablePanel defaultSize={100 - defaultMapSize} minSize={minListSize}>
              <div className="h-full overflow-auto p-4">
                <div className="flex justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMap}
                    className="gap-2"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                    Hide Map
                  </Button>
                </div>
                {children}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={defaultMapSize} minSize={minMapSize}>
              <div className="h-full">
                {mapContent}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
