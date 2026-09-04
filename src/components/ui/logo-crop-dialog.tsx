import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, ZoomIn, ZoomOut, RectangleHorizontal, Square, RectangleVertical } from 'lucide-react';
import { getCroppedImg, CropArea, compressImage } from '@/lib/imageUtils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Aspect ratio presets for logo cropping
const LOGO_ASPECT_RATIOS = [
  { label: 'Landscape', value: 16 / 9, icon: RectangleHorizontal },
  { label: 'Square', value: 1, icon: Square },
  { label: 'Portrait', value: 9 / 16, icon: RectangleVertical },
] as const;

interface LogoCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, aspectRatio: number) => void;
  title?: string;
}

export const LogoCropDialog: React.FC<LogoCropDialogProps> = ({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  title = 'Crop Logo',
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number>(1); // Default to square
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAspectRatioChange = (value: string) => {
    if (value) {
      const aspectRatio = parseFloat(value);
      setSelectedAspectRatio(aspectRatio);
      // Reset crop position when aspect ratio changes
      setCrop({ x: 0, y: 0 });
    }
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      // Get cropped image
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Compress the cropped image with logo-appropriate settings
      const file = new File([croppedBlob], 'cropped.webp', { type: 'image/webp' });
      const compressedBlob = await compressImage(file, {
        maxWidth: 600,  // Logos don't need to be huge
        maxHeight: 600,
        quality: 0.9,   // Higher quality for text clarity
        format: 'image/webp',
      });

      onCropComplete(compressedBlob, selectedAspectRatio);
      onOpenChange(false);

      // Reset state for next use
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setSelectedAspectRatio(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setSelectedAspectRatio(1);
    setCroppedAreaPixels(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Aspect ratio presets */}
        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={selectedAspectRatio.toString()}
            onValueChange={handleAspectRatioChange}
            className="justify-center"
          >
            {LOGO_ASPECT_RATIOS.map((preset) => (
              <ToggleGroupItem
                key={preset.label}
                value={preset.value.toString()}
                aria-label={preset.label}
                className="flex items-center gap-2 px-3"
              >
                <preset.icon className="h-4 w-4" />
                <span className="text-sm">{preset.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Cropper area */}
        <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={selectedAspectRatio}
            cropShape="rect"
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        {/* Zoom slider - range 1-5 for whitespace trimming */}
        <div className="flex items-center gap-3 px-2">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={1}
            max={5}
            step={0.1}
            onValueChange={([value]) => setZoom(value)}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Select aspect ratio, drag to reposition, and zoom to trim whitespace.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Crop & Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
