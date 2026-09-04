import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Camera, Pencil } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { validateImageFile } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';
import { ImageCropDialog } from './image-crop-dialog';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  isUploading?: boolean;
  className?: string;
  variant?: 'avatar' | 'logo' | 'banner' | 'gallery';
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  enableCrop?: boolean;
  cropAspectRatio?: number;
  cropShape?: 'rect' | 'round';
  onCroppedImageSelect?: (blob: Blob) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  isUploading = false,
  className,
  variant = 'banner',
  accept = 'image/*',
  maxSize = 5,
  disabled = false,
  enableCrop = false,
  cropAspectRatio = 1,
  cropShape = 'rect',
  onCroppedImageSelect,
}) => {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case 'avatar':
        return 'w-32 h-32 rounded-full';
      case 'logo':
        return 'w-40 h-40 rounded-lg';
      case 'banner':
        return 'w-full h-48 rounded-lg';
      case 'gallery':
        return 'w-full h-64 rounded-lg';
      default:
        return 'w-full h-48 rounded-lg';
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateImageFile(file);

    if (!validation.isValid) {
      toast({
        title: "Upload failed",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (enableCrop) {
      // Open crop dialog instead of immediate upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageForCrop(e.target?.result as string);
        setOriginalFile(file);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Original behavior: create preview and call onImageSelect
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  }, [onImageSelect, toast, enableCrop]);

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    // Create File from Blob for upload
    const croppedFile = new File([croppedBlob], originalFile?.name || 'cropped.webp', {
      type: 'image/webp',
    });

    // Show preview
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreview(previewUrl);

    // Call the appropriate callback
    if (onCroppedImageSelect) {
      onCroppedImageSelect(croppedBlob);
    } else {
      onImageSelect(croppedFile);
    }

    // Clean up
    setImageForCrop(null);
    setOriginalFile(null);
  }, [onImageSelect, onCroppedImageSelect, originalFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'border-2 border-dashed border-muted-foreground/25 transition-all duration-200 cursor-pointer overflow-hidden',
          'hover:border-primary/50 hover:bg-accent/50',
          dragOver && 'border-primary bg-accent/50',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'cursor-not-allowed',
          getVariantStyles()
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {displayImage ? (
          <div className="relative w-full h-full group">
            <img
              src={displayImage}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {/* Edit overlay for avatar variant */}
            {!disabled && !isUploading && variant === 'avatar' && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            {!disabled && !isUploading && onImageRemove && variant !== 'avatar' && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            ) : variant === 'avatar' ? (
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground mb-1">
              {isUploading
                ? 'Uploading...'
                : dragOver
                ? 'Drop image here'
                : 'Click to upload or drag & drop'
              }
            </p>
            {!isUploading && (
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to {maxSize}MB (auto-compressed)
              </p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {enableCrop && imageForCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageForCrop}
          aspectRatio={cropAspectRatio}
          cropShape={cropShape}
          onCropComplete={handleCropComplete}
          title={variant === 'avatar' ? 'Crop Profile Photo' : 'Crop Image'}
        />
      )}
    </div>
  );
};
