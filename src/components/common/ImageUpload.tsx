import React, { useState, ChangeEvent } from 'react';
import { uploadImage, deleteImage } from '../../utils/api';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageUpload: (imageData: { url: string; public_id: string }) => void;
  onImageRemove: () => void;
  existingImage?: { url: string; public_id: string } | null;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  existingImage = null,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImage?.url || null);
  const [publicId, setPublicId] = useState<string | null>(existingImage?.public_id || null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Start upload
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadImage(file);
      setPublicId(result.public_id);
      onImageUpload({
        url: result.url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Error uploading image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    setPreviewUrl(null);
    setPublicId(null);
    onImageRemove();
  };

  return (
    <div className={`${className}`}>
      <div className="mb-2 text-sm font-medium text-gray-700">Pet Image</div>

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
          <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
          <div className="text-sm text-gray-600 text-center mb-4">
            <span className="font-medium">Click to upload</span> or drag and drop
            <br />
            JPG, PNG or WEBP (max. 5MB)
          </div>
          
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Select Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      )}

      {isUploading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Uploading...</span>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 text-sm text-red-600">{uploadError}</div>
      )}
    </div>
  );
};

export default ImageUpload; 