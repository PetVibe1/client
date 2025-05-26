import { getUserProfile, updateUserProfile } from '../utils/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchUserInfo = async (): Promise<User> => {
  try {
    return await getUserProfile();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserInfo = async (userData: Partial<User>): Promise<User> => {
  try {
    return await updateUserProfile(userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 