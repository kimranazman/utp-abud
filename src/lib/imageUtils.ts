import { supabase } from "@/integrations/supabase/client";

export interface ImageSizes {
  thumbnail: Blob;
  medium: Blob;
  full: Blob;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compress a single image to specified dimensions and quality
 */
export const compressImage = async (
  file: File, 
  options: CompressOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        format,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate multiple sizes of an image (thumbnail, medium, full)
 */
export const generateImageSizes = async (file: File): Promise<ImageSizes> => {
  const [thumbnail, medium, full] = await Promise.all([
    compressImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.9 }),
    compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 }),
    compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 })
  ]);

  return { thumbnail, medium, full };
};

/**
 * Upload image to Supabase Storage with multiple sizes
 */
export const uploadImageWithSizes = async (
  file: File,
  folder: string,
  fileName: string
): Promise<{ thumbnailUrl: string; mediumUrl: string; fullUrl: string }> => {
  const sizes = await generateImageSizes(file);
  const timestamp = Date.now();
  
  const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  
  const uploads = await Promise.all([
    supabase.storage
      .from('images')
      .upload(`${folder}/thumbnail_${baseName}_${timestamp}.webp`, sizes.thumbnail),
    supabase.storage
      .from('images')
      .upload(`${folder}/medium_${baseName}_${timestamp}.webp`, sizes.medium),
    supabase.storage
      .from('images')
      .upload(`${folder}/full_${baseName}_${timestamp}.webp`, sizes.full)
  ]);

  // Check for errors
  uploads.forEach((upload, index) => {
    if (upload.error) {
      const sizeNames = ['thumbnail', 'medium', 'full'];
      throw new Error(`Failed to upload ${sizeNames[index]}: ${upload.error.message}`);
    }
  });

  // Get public URLs
  const thumbnailUrl = supabase.storage.from('images').getPublicUrl(uploads[0].data!.path).data.publicUrl;
  const mediumUrl = supabase.storage.from('images').getPublicUrl(uploads[1].data!.path).data.publicUrl;
  const fullUrl = supabase.storage.from('images').getPublicUrl(uploads[2].data!.path).data.publicUrl;

  return { thumbnailUrl, mediumUrl, fullUrl };
};

/**
 * Delete image files from storage
 */
export const deleteImageFromStorage = async (url: string): Promise<void> => {
  if (!url) return;
  
  try {
    // Extract path from public URL
    const urlParts = url.split('/storage/v1/object/public/images/');
    if (urlParts.length !== 2) return;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, WebP allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large, max 5MB'
    };
  }

  return { isValid: true };
};

/**
 * Crop area type from react-easy-crop
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extract cropped region from image using canvas
 */
export const getCroppedImg = async (
  imageSrc: string,
  cropArea: CropArea,
  outputFormat: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/webp'
): Promise<Blob> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to crop dimensions
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Draw cropped portion of image
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create cropped image'));
          }
        },
        outputFormat,
        0.9
      );
    };

    image.onerror = () => reject(new Error('Failed to load image for cropping'));
    image.src = imageSrc;
  });
};