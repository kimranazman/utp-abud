import React, { useState } from 'react';
import { ImageUpload } from './image-upload';
import { LogoCropDialog } from './logo-crop-dialog';
import { uploadImageWithSizes, deleteImageFromStorage, validateImageFile } from '@/lib/imageUtils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessLogoUploadProps {
  businessId: string;
  currentLogoUrl?: string;
  currentThumbnailUrl?: string;
  onUploadComplete?: (logoUrl: string, thumbnailUrl: string) => void;
  className?: string;
  disabled?: boolean;
  autoSave?: boolean; // If false, only uploads to storage without updating database
}

export const BusinessLogoUpload: React.FC<BusinessLogoUploadProps> = ({
  businessId,
  currentLogoUrl,
  currentThumbnailUrl,
  onUploadComplete,
  className,
  disabled = false,
  autoSave = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload images.",
        variant: "destructive",
      });
      return;
    }

    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Upload failed",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // For new businesses (during onboarding), just store temporarily
    if (businessId === "new") {
      toast({
        title: "Info",
        description: "Logo will be saved when you create the business.",
      });
      onUploadComplete?.('', '');
      return;
    }

    // Open crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageForCrop(e.target?.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob, _aspectRatio: number) => {
    setIsUploading(true);

    try {
      // Only delete old logo if autoSave is enabled
      if (autoSave) {
        if (currentLogoUrl) {
          await deleteImageFromStorage(currentLogoUrl);
        }
        if (currentThumbnailUrl) {
          await deleteImageFromStorage(currentThumbnailUrl);
        }
      }

      // Create a File from the blob for upload
      const croppedFile = new File([croppedBlob], 'logo.webp', { type: 'image/webp' });

      // Upload new logo to storage
      const { mediumUrl, thumbnailUrl } = await uploadImageWithSizes(
        croppedFile,
        `business-logos/${businessId}`,
        'logo'
      );

      // Only update database if autoSave is enabled
      if (autoSave) {
        const { error } = await supabase
          .from('user_businesses')
          .update({
            logo_url: mediumUrl,
            logo_thumbnail_url: thumbnailUrl,
          })
          .eq('id', businessId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Business logo updated successfully!",
        });
      } else {
        toast({
          title: "Logo uploaded",
          description: "Click Save to apply changes.",
        });
      }

      onUploadComplete?.(mediumUrl, thumbnailUrl);
    } catch (error: any) {
      console.error('Error uploading business logo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setImageForCrop(null);
    }
  };

  const handleImageRemove = async () => {
    if (!user) return;

    // For new businesses, just clear the preview
    if (businessId === "new") {
      onUploadComplete?.('', '');
      return;
    }

    setIsUploading(true);

    try {
      // Only delete from storage and database if autoSave is enabled
      if (autoSave) {
        if (currentLogoUrl) {
          await deleteImageFromStorage(currentLogoUrl);
        }
        if (currentThumbnailUrl) {
          await deleteImageFromStorage(currentThumbnailUrl);
        }

        const { error } = await supabase
          .from('user_businesses')
          .update({
            logo_url: null,
            logo_thumbnail_url: null,
          })
          .eq('id', businessId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Business logo removed successfully!",
        });
      } else {
        toast({
          title: "Logo removed",
          description: "Click Save to apply changes.",
        });
      }

      onUploadComplete?.('', '');
    } catch (error: any) {
      console.error('Error removing business logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <ImageUpload
        variant="logo"
        currentImageUrl={currentLogoUrl}
        onImageSelect={handleImageSelect}
        onImageRemove={currentLogoUrl ? handleImageRemove : undefined}
        isUploading={isUploading}
        disabled={disabled}
        className={className}
      />

      {imageForCrop && (
        <LogoCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageForCrop}
          onCropComplete={handleCropComplete}
          title="Crop Business Logo"
        />
      )}
    </>
  );
};
