import api from './axios';

// Get comments for a pet
export const getCommentsByPetId = async (petId) => {
  try {
    const response = await api.get(`/comments/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Add a comment to a pet
export const addComment = async (petId, commentData) => {
  try {
    const response = await api.post(`/comments/${petId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}; 