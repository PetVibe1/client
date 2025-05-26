import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PetItem from './PetItem';
import { getSimilarPets } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface SimilarPetsProps {
  petId: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

interface Pet {
  _id: string;
  code: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  price: number;
  image?: {
    url: string;
    public_id: string;
  };
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

const SimilarPets: React.FC<SimilarPetsProps> = ({ 
  petId, 
  title = "Thú cưng tương tự", 
  subtitle = "Có thể bạn cũng thích",
  limit = 4
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSimilarPets = async () => {
      if (!petId) return;
      
      setIsLoading(true);
      try {
        const similarPets = await getSimilarPets(petId, limit);
        setPets(similarPets);
        console.log(`Loaded ${similarPets.length} similar pets`);
      } catch (err) {
        console.error('Error loading similar pets:', err);
        setError('Không thể tải dữ liệu thú cưng tương tự.');
        setPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarPets();
  }, [petId, limit]);

  // Don't render anything if no similar pets found
  if (!isLoading && pets.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">{subtitle}</p>
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          </div>
          <Link 
            href="/pets"
            className="inline-flex items-center px-6 py-3 rounded-full border-2 border-slate-800 text-slate-800 font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            Xem thêm <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetItem
                key={pet._id}
                id={pet._id}
                code={pet.code}
                name={pet.name}
                gender={pet.gender}
                age={pet.age}
                price={pet.price}
                imageUrl={pet.image?.url || '/images/pet-placeholder.jpg'}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SimilarPets; 