import React, { useState } from 'react';
import { ImageUpload } from './image-upload';
import { uploadImageWithSizes, deleteImageFromStorage } from '@/lib/imageUtils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  currentThumbnailUrl?: string;
  onUploadComplete?: (avatarUrl: string, thumbnailUrl: string) => void;
  className?: string;
  disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  currentThumbnailUrl,
  onUploadComplete,
  className,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
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

    setIsUploading(true);

    try {
      // Delete old avatar if it exists
      if (currentAvatarUrl) {
        await deleteImageFromStorage(currentAvatarUrl);
      }
      if (currentThumbnailUrl) {
        await deleteImageFromStorage(currentThumbnailUrl);
      }

      // Upload new avatar
      const { mediumUrl, thumbnailUrl } = await uploadImageWithSizes(
        file,
        `avatars/${user.id}`,
        'avatar'
      );

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: mediumUrl,
          avatar_thumbnail_url: thumbnailUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });

      onUploadComplete?.(mediumUrl, thumbnailUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    if (!user) return;

    setIsUploading(true);

    try {
      // Delete from storage
      if (currentAvatarUrl) {
        await deleteImageFromStorage(currentAvatarUrl);
      }
      if (currentThumbnailUrl) {
        await deleteImageFromStorage(currentThumbnailUrl);
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          avatar_thumbnail_url: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Avatar removed successfully!",
      });

      onUploadComplete?.('', '');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ImageUpload
      variant="avatar"
      currentImageUrl={currentAvatarUrl}
      onImageSelect={handleImageSelect}
      onImageRemove={currentAvatarUrl ? handleImageRemove : undefined}
      isUploading={isUploading}
      disabled={disabled}
      className={className}
      enableCrop={true}
      cropAspectRatio={1}
      cropShape="round"
    />
  );
};