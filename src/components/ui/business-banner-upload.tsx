import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { uploadImageWithSizes, deleteImageFromStorage } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface BusinessBannerUploadProps {
  businessId: string;
  currentBannerUrl?: string | null;
  onBannerUpdated?: (bannerUrl: string | null, thumbnailUrl: string | null) => void;
  className?: string;
  autoSave?: boolean; // If false, only uploads to storage without updating database
}

export function BusinessBannerUpload({
  businessId,
  currentBannerUrl,
  onBannerUpdated,
  className,
  autoSave = true
}: BusinessBannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentBannerUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (10MB max for banners)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Only delete old banner if autoSave is enabled
      if (autoSave && currentBannerUrl) {
        await deleteImageFromStorage(currentBannerUrl);
      }

      // Upload new banner with auto-generated sizes
      const { mediumUrl, thumbnailUrl } = await uploadImageWithSizes(
        file,
        `business-banners/${businessId}`,
        'banner'
      );

      // Only update database if autoSave is enabled
      if (autoSave) {
        const { error: updateError } = await supabase
          .from('user_businesses')
          .update({
            banner_url: mediumUrl,
            banner_thumbnail_url: thumbnailUrl,
          })
          .eq('id', businessId);

        if (updateError) throw updateError;

        toast.success('Banner updated successfully!');
      } else {
        toast.success('Banner uploaded. Click Save to apply changes.');
      }

      if (onBannerUpdated) {
        onBannerUpdated(mediumUrl, thumbnailUrl);
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner. Please try again.');
      setPreview(currentBannerUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!currentBannerUrl) return;

    setIsUploading(true);

    try {
      // Only delete from storage and database if autoSave is enabled
      if (autoSave) {
        await deleteImageFromStorage(currentBannerUrl);

        const { error: updateError } = await supabase
          .from('user_businesses')
          .update({
            banner_url: null,
            banner_thumbnail_url: null,
          })
          .eq('id', businessId);

        if (updateError) throw updateError;

        toast.success('Banner removed successfully!');
      } else {
        toast.success('Banner removed. Click Save to apply changes.');
      }

      setPreview(null);

      if (onBannerUpdated) {
        onBannerUpdated(null, null);
      }
    } catch (error) {
      console.error('Error removing banner:', error);
      toast.error('Failed to remove banner. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Business Banner</label>
        <p className="text-xs text-muted-foreground">
          Recommended size: 1920x640px (3:1 aspect ratio). Max 10MB.
        </p>
      </div>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          preview ? "h-48 md:h-64" : "h-32"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Business banner"
              className="w-full h-full object-cover"
            />
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveBanner}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isDragging ? "Drop image here" : "Click or drag to upload banner"}
            </span>
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
      />
    </div>
  );
}