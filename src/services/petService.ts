import api from '../utils/api';

export interface Pet {
  _id: string;
  code: string;
  name: string;
  species: string;
  breed: string;
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
  updatedAt: string;
}

export const getPets = async (limit: number = 8): Promise<Pet[]> => {
  try {
    const response = await api.get(`/pets?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
};

export const getFeaturedPets = async (limit: number = 8): Promise<Pet[]> => {
  try {
    // Thêm tham số nocache ngẫu nhiên để tránh cache
    const nocache = new Date().getTime();
    const response = await api.get(`/pets/featured?limit=${limit}&sort=createdAt&nocache=${nocache}`);
    console.log(`getFeaturedPets API call with limit=${limit}, nocache=${nocache}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured pets:', error);
    return [];
  }
};

export const getPetById = async (id: string): Promise<Pet | null> => {
  try {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pet with id ${id}:`, error);
    return null;
  }
};

export const getPetsBySpecies = async (species: string): Promise<Pet[]> => {
  try {
    console.log(`Fetching pets by species: "${species}"`);
    
    // Thêm timestamp để tránh cache
    const nocache = new Date().getTime();
    
    // Properly encode the species parameter
    const encodedSpecies = encodeURIComponent(species);
    const url = `/pets/species/${encodedSpecies}?nocache=${nocache}`;
    
    console.log(`Making API request to: ${url}`);
    const response = await api.get(url);
    
    console.log(`Found ${response.data.length} pets for species "${species}"`);
    
    if (response.data.length > 0) {
      // Log một số thông tin về dữ liệu đầu tiên và cuối cùng để debug
      console.log('First pet:', response.data[0].name, '- Created:', new Date(response.data[0].createdAt).toLocaleString());
      console.log('Last pet:', response.data[response.data.length - 1].name, '- Created:', new Date(response.data[response.data.length - 1].createdAt).toLocaleString());
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching pets by species "${species}":`, error);
    return [];
  }
};

export const getDistinctSpecies = async (): Promise<string[]> => {
  try {
    console.log('Fetching distinct species from API');
    const response = await api.get('/pets/species');
    console.log('Distinct species response:', response.data);
    
    // Sort the species alphabetically for consistent display
    const sortedSpecies = [...response.data].sort();
    
    // Cache the species list for faster access
    if (typeof window !== 'undefined') {
      localStorage.setItem('cachedSpeciesList', JSON.stringify(sortedSpecies));
    }
    
    return sortedSpecies;
  } catch (error) {
    console.error('Error fetching distinct species:', error);
    
    // Try to use cached species if available
    if (typeof window !== 'undefined') {
      const cachedSpecies = localStorage.getItem('cachedSpeciesList');
      if (cachedSpecies) {
        console.log('Using cached species list');
        return JSON.parse(cachedSpecies);
      }
    }
    
    return [];
  }
}; 