import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface PetCardProps {
  pet: {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age: number;
    gender: string;
    price: number;
    image?: {
      url: string;
      public_id: string;
    };
    available: boolean;
  };
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <div className="relative h-48 w-full">
        {pet.image && pet.image.url ? (
          <img
            src={pet.image.url}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        {!pet.available && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
            Not Available
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
          <span className="text-lg font-bold text-blue-600">${pet.price.toFixed(2)}</span>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>
            {pet.species} {pet.breed && `• ${pet.breed}`}
          </p>
          <p>
            {pet.age} {pet.age === 1 ? 'year' : 'years'} • {pet.gender}
          </p>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Link
            href={`/pets/${pet._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View Details
          </Link>
          
          {isAdmin && (
            <Link
              href={`/admin/pets/edit/${pet._id}`}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetCard; 