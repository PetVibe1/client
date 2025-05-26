import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import ImageUpload from '../common/ImageUpload';
import { createPet, updatePet } from '../../utils/api';
import { useRouter } from 'next/router';

interface PetFormProps {
  pet?: any;
  isEditing?: boolean;
}

type PetFormData = {
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  price: number;
  description: string;
};

const PetForm: React.FC<PetFormProps> = ({ pet, isEditing = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ url: string; public_id: string } | null>(
    pet?.image ? { url: pet.image.url, public_id: pet.image.public_id } : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetFormData>({
    defaultValues: isEditing
      ? {
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          age: pet.age,
          gender: pet.gender,
          price: pet.price,
          description: pet.description || '',
        }
      : undefined,
  });

  const onSubmit = async (data: PetFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const petData = {
        ...data,
        image: imageData,
      };

      if (isEditing) {
        await updatePet(pet._id, petData);
      } else {
        await createPet(petData);
      }

      router.push('/pets');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (data: { url: string; public_id: string }) => {
    setImageData(data);
  };

  const handleImageRemove = () => {
    setImageData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Pet' : 'Add New Pet'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Pet name is required',
            })}
          />

          <Input
            label="Species"
            error={errors.species?.message}
            {...register('species', {
              required: 'Species is required',
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Breed"
            error={errors.breed?.message}
            {...register('breed')}
          />

          <Input
            label="Age"
            type="number"
            error={errors.age?.message}
            {...register('age', {
              required: 'Age is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Age must be positive',
              },
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register('gender', {
                required: 'Gender is required',
              })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <Input
            label="Price"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', {
              required: 'Price is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Price must be positive',
              },
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            {...register('description')}
          ></textarea>
        </div>

        <ImageUpload
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          existingImage={imageData}
          className="mt-4"
        />

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Update Pet' : 'Add Pet'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetForm; 