import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface PetDetailProps {
  pet: {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age: number;
    gender: string;
    price: number;
    description?: string;
    image?: {
      url: string;
      public_id: string;
    };
    available: boolean;
    createdAt: string;
  };
  onDelete?: () => void;
  isDeleting?: boolean;
}

const PetDetail: React.FC<PetDetailProps> = ({ 
  pet, 
  onDelete,
  isDeleting = false
}) => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:w-1/2">
          {pet.image && pet.image.url ? (
            <img
              src={pet.image.url}
              alt={pet.name}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">No image available</span>
            </div>
          )}
        </div>
        
        {/* Details Section */}
        <div className="md:w-1/2 p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-800">{pet.name}</h1>
            {!pet.available && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Not Available
              </span>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-bold text-blue-600">${pet.price.toFixed(2)}</p>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Species</p>
              <p className="font-medium">{pet.species}</p>
            </div>
            
            {pet.breed && (
              <div>
                <p className="text-sm text-gray-500">Breed</p>
                <p className="font-medium">{pet.breed}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{pet.gender}</p>
            </div>
          </div>
          
          {pet.description && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800">Description</h3>
              <p className="mt-2 text-gray-600">{pet.description}</p>
            </div>
          )}
          
          {isAdmin && (
            <div className="mt-8 flex space-x-4">
              <Link href={`/admin/pets/edit/${pet._id}`} className="flex-1">
                <Button variant="outline" fullWidth>
                  Edit
                </Button>
              </Link>
              
              <Button 
                variant="secondary" 
                fullWidth 
                className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
                onClick={onDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetail; 