import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createPet, updatePet, uploadImage, uploadMultipleImages } from '../../utils/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

// Helper for formatting numbers with periods as thousand separators (VND style)
const formatNumberWithPeriods = (x: number | null): string => {
  if (x === null) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Helper to parse formatted number strings back to numbers
const parseFormattedNumber = (str: string): number | null => {
  if (!str) return null;
  const parsed = parseInt(str.replace(/\./g, ''), 10);
  return isNaN(parsed) ? null : parsed;
};

export interface PetData {
  _id?: string;
  code: string;
  name: string;
  species: string;
  breed: string;
  age: number | null;
  gender: string;
  price: number | null;
  description: string;
  image?: {
    url: string;
    public_id: string;
  };
  additionalImages?: Array<{
    url: string;
    public_id: string;
  }>;
  available: boolean;
}

interface PetFormProps {
  initialData?: PetData;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const defaultPetData: PetData = {
  code: '',
  name: '',
  species: '',
  breed: '',
  age: null,
  gender: 'Đực',
  price: null,
  description: '',
  available: true,
};

export function PetForm({ initialData = defaultPetData, mode, onSuccess }: PetFormProps) {
  const router = useRouter();
  const [petData, setPetData] = useState<PetData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image?.url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(
    initialData?.additionalImages?.map(img => img.url) || []
  );
  const [formattedPrice, setFormattedPrice] = useState<string>(formatNumberWithPeriods(initialData.price));
  
  // Validation states
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
    species?: string;
    age?: string;
    price?: string;
  }>({});

  // Set the initial data when it changes (useful for edit mode)
  useEffect(() => {
    setPetData(initialData);
    setImagePreview(initialData?.image?.url || null);
    setAdditionalImagePreviews(initialData?.additionalImages?.map(img => img.url) || []);
    setFormattedPrice(formatNumberWithPeriods(initialData.price));
    setFormErrors({});
  }, [initialData]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'code':
        if (!value) return 'Mã thú cưng không được để trống';
        if (value.length < 3) return 'Mã thú cưng phải có ít nhất 3 ký tự';
        return '';
      case 'name':
        if (!value) return 'Tên thú cưng không được để trống';
        return '';
      case 'species':
        if (!value) return 'Vui lòng chọn loài';
        return '';
      case 'age':
        if (value === null) return 'Tuổi không được để trống';
        if (value < 0) return 'Tuổi không thể âm';
        if (value > 360) return 'Tuổi không hợp lệ (tối đa 360 tháng)';
        return '';
      case 'price':
        if (value === null) return 'Giá không được để trống';
        if (value < 0) return 'Giá không thể âm';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPetData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      // Only parse to Number if there's a value, otherwise set to null
      const numberValue = value === '' ? null : Number(value);
      setPetData(prev => ({ ...prev, [name]: numberValue }));
      
      // Validate
      const errorMessage = validateField(name, numberValue);
      setFormErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
      
      return;
    }
    
    // Handle all other inputs
    setPetData(prev => ({ ...prev, [name]: value }));
    
    // Validate text fields
    if (['code', 'name', 'species'].includes(name)) {
      const errorMessage = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  // Handle price input with formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters from the input
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    
    // Format for display with periods
    if (rawValue) {
      const numberValue = parseInt(rawValue, 10);
      setFormattedPrice(formatNumberWithPeriods(numberValue));
      setPetData(prev => ({ ...prev, price: numberValue }));
      
      // Validate
      const errorMessage = validateField('price', numberValue);
      setFormErrors(prev => ({
        ...prev,
        price: errorMessage
      }));
    } else {
      setFormattedPrice('');
      setPetData(prev => ({ ...prev, price: null }));
      
      // Set error for empty price
      setFormErrors(prev => ({
        ...prev,
        price: 'Giá không được để trống'
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setAdditionalImageFiles(prev => [...prev, ...files]);
      
      // Create previews
      const newPreviews = files.map(file => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newPreviews).then(previews => {
        setAdditionalImagePreviews(prev => [...prev, ...previews]);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    // Remove from previews
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If removing a newly added image (from additionalImageFiles)
    if (index < additionalImageFiles.length) {
      setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    } 
    // If removing an existing image (from petData.additionalImages)
    else {
      const existingImageIndex = index - additionalImageFiles.length;
      if (petData.additionalImages) {
        const updatedImages = [...petData.additionalImages];
        updatedImages.splice(existingImageIndex, 1);
        setPetData(prev => ({
          ...prev,
          additionalImages: updatedImages
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      code: validateField('code', petData.code),
      name: validateField('name', petData.name),
      species: validateField('species', petData.species),
      age: validateField('age', petData.age),
      price: validateField('price', petData.price),
    };
    
    setFormErrors(newErrors);
    
    // Check if there are any errors
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại các thông tin.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure age and price are valid numbers before submitting
      const validatedData = {
        ...petData,
        age: petData.age === null ? 0 : petData.age,
        price: petData.price === null ? 0 : petData.price
      };

      // Upload main image if a new image is selected
      let imageData = petData.image;
      
      if (imageFile) {
        const uploadedImage = await uploadImage(imageFile);
        imageData = {
          url: uploadedImage.url,
          public_id: uploadedImage.public_id
        };
      }
      
      // Upload additional images if any
      let additionalImagesData = petData.additionalImages || [];
      
      if (additionalImageFiles.length > 0) {
        const uploadedImages = await uploadMultipleImages(additionalImageFiles);
        
        // Add new uploaded images to existing ones
        const newImagesData = uploadedImages.images.map((img: any) => ({
          url: img.url,
          public_id: img.public_id
        }));
        
        additionalImagesData = [...additionalImagesData, ...newImagesData];
      }
      
      // Prepare pet data with all images
      const petWithImages = {
        ...validatedData,
        image: imageData,
        additionalImages: additionalImagesData
      };
      
      // Create or update pet
      if (mode === 'create') {
        await createPet(petWithImages);
      } else {
        if (petData._id) {
          await updatePet(petData._id, petWithImages);
        } else {
          throw new Error('Pet ID is missing for update operation');
        }
      }
      
      // Show success notification
      alert(mode === 'create' ? 'Thú cưng đã được tạo thành công!' : 'Thú cưng đã được cập nhật thành công!');
      
      // Call success callback or navigate to pets list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/pets');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Pet form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-amber-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
        <CardTitle className="text-slate-800">{mode === 'create' ? 'Thêm thú cưng mới' : 'Chỉnh sửa thú cưng'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mã thú cưng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                required
                className={`w-full p-3 border-2 ${formErrors.code ? 'border-red-300' : 'border-amber-100'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800 placeholder-slate-400`}
                value={petData.code}
                onChange={handleChange}
                placeholder="VD: DOG001"
              />
              {formErrors.code && (
                <p className="mt-1 text-xs text-red-500">{formErrors.code}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên thú cưng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className={`w-full p-3 border-2 ${formErrors.name ? 'border-red-300' : 'border-amber-100'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800 placeholder-slate-400`}
                value={petData.name}
                onChange={handleChange}
                placeholder="Nhập tên thú cưng"
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Loài <span className="text-red-500">*</span>
              </label>
              <select
                name="species"
                required
                className={`w-full p-3 border-2 ${formErrors.species ? 'border-red-300' : 'border-amber-100'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800`}
                value={petData.species}
                onChange={handleChange}
              >
                <option value="">Chọn loài</option>
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Hamster">Hamster</option>
                <option value="Khác">Khác</option>
              </select>
              {formErrors.species && (
                <p className="mt-1 text-xs text-red-500">{formErrors.species}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giống
              </label>
              <input
                type="text"
                name="breed"
                className="w-full p-3 border-2 border-amber-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800 placeholder-slate-400"
                value={petData.breed}
                onChange={handleChange}
                placeholder="VD: Poodle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tuổi (tháng) <span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-lg overflow-hidden border-2 ${formErrors.age ? 'border-red-300' : 'border-amber-100'} focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-300 bg-white`}>
                <input
                  type="number"
                  name="age"
                  min="0"
                  required
                  className="w-full p-3 pl-3 pr-16 border-0 bg-white/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                  value={petData.age === null ? '' : petData.age}
                  onChange={handleChange}
                  placeholder="Nhập tuổi"
                  style={{ appearance: 'textfield' }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 bg-amber-50 text-amber-600 border-l border-amber-100">
                  <span className="text-slate-600 text-sm font-medium">tháng</span>
                </div>
              </div>
              {formErrors.age ? (
                <p className="mt-1 text-xs text-red-500">{formErrors.age}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Nhập tuổi thú cưng tính bằng tháng</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                required
                className="w-full p-3 border-2 border-amber-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800"
                value={petData.gender}
                onChange={handleChange}
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
                <option value="Unknown">Không rõ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giá (VND) <span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-lg overflow-hidden border-2 ${formErrors.price ? 'border-red-300' : 'border-amber-100'} focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-300 bg-white`}>
                <input
                  type="text"
                  name="price"
                  required
                  className="w-full p-3 pl-3 pr-16 border-0 bg-white/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                  value={formattedPrice}
                  onChange={handlePriceChange}
                  placeholder="Nhập giá"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 bg-amber-50 text-amber-600 border-l border-amber-100">
                  <span className="text-amber-600 font-medium">VND</span>
                </div>
              </div>
              {formErrors.price ? (
                <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Nhập giá bán thú cưng</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trạng thái
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={petData.available}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-600 bg-gray-100 rounded border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor="available" className="ml-2 text-sm font-medium text-slate-700">
                  Còn hàng
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={4}
              className="w-full p-3 border-2 border-amber-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 bg-white text-slate-800 placeholder-slate-400"
              value={petData.description}
              onChange={handleChange}
              placeholder="Mô tả thú cưng"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hình ảnh
            </label>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-full max-w-xs p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50/30 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors mb-4"
                >
                  {imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-56 object-contain rounded-md border border-amber-200"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chưa chọn ảnh
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hình ảnh bổ sung
            </label>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-full max-w-xs p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50/30 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                  id="additional-image-upload"
                  multiple
                />
                <label
                  htmlFor="additional-image-upload"
                  className="cursor-pointer py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors mb-4"
                >
                  {additionalImageFiles.length > 0 ? 'Thay đổi hình ảnh bổ sung' : 'Chọn hình ảnh bổ sung'}
                </label>
                
                {additionalImagePreviews.length > 0 ? (
                  <div className="mt-2 flex flex-wrap">
                    {additionalImagePreviews.map((preview, index) => (
                      <div key={index} className="w-1/3 p-2">
                        <div className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-auto max-h-24 object-contain rounded-md border border-amber-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chưa chọn hình ảnh bổ sung
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="py-2.5 px-5 bg-white text-slate-700 border-2 border-slate-300 rounded-lg hover:bg-slate-50"
              onClick={() => router.push('/admin/pets')}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 