import axios from 'axios';

// Log API URL for debugging
console.log('Current environment:', process.env.NODE_ENV);
console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
console.log('Using API URL:', API_URL);

// Perform quick API connection test on load
const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', `${API_URL}`);
    const response = await axios.get(`${API_URL}`, { 
      timeout: 5000,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    console.log('API connection test result:', response.status, response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Run the connection test
testApiConnection();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Thêm header để tránh cache
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error - No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    // Handle authentication failures (401 errors)
    if (error.response && error.response.status === 401) {
      const authError = error.response.data?.message || 'Authentication failed';
      console.error('Auth Error:', authError);
      
      // Skip redirect for login/register endpoints to prevent loops
      if (typeof window !== 'undefined' && 
          !error.config.url?.includes('/login') && 
          !error.config.url?.includes('/register')) {
        
        // Clear invalid token
        localStorage.removeItem('userToken');
        localStorage.removeItem('tokenExpiry');
        
        // Get current path to use for redirect after login
        const currentPath = window.location.pathname + window.location.search;
        
        // Redirect to login with the current URL as the redirect target
        // This ensures the user is returned to the page they were trying to access
        if (currentPath.startsWith('/admin')) {
          // For admin routes, always redirect to login page with the current path
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        // For non-admin routes, we'll let the AuthContext handle it through its checks
      }
    }
    
    return Promise.reject(error);
  }
);

// Set up axios config with token
export const setupAxiosConfig = (token: string) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// Auth APIs
export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error; // Re-throw to be handled by the auth context
  }
};

export const loginUser = async (userData: any) => {
  try {
    const response = await api.post('/users/login', userData);
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error; // Re-throw to be handled by the auth context
  }
};

// User APIs
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile API error:', error);
    throw error; // Re-throw to be handled by the auth context
  }
};

export const updateUserProfile = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Admin User Management APIs
export const getAllUsers = async (params?: { page?: number; limit?: number; role?: string }) => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(endpoint);
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Pets API
export const getAllPets = async (params?: { page?: number; limit?: number; species?: string; breed?: string; gender?: string; color?: string; size?: string; minPrice?: number; maxPrice?: number }) => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    console.log('Creating pet query with params:', params);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Make sure to encode special characters properly
        const encodedValue = encodeURIComponent(value.toString());
        queryParams.append(key, encodedValue);
        console.log(`Added param: ${key}=${encodedValue}`);
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/pets${queryString ? `?${queryString}` : ''}`;
  console.log('Fetching pets from endpoint:', endpoint);
  
  try {
    const response = await api.get(endpoint);
    console.log('Successful API response with data count:', response.data.pets?.length || 'unknown');
    return response.data;
  } catch (error) {
    console.error('Error fetching pets in API call:', error);
    throw error;
  }
};

export const getPetById = async (id: string) => {
  const response = await api.get(`/pets/${id}`);
  return response.data;
};

// Get similar pets
export const getSimilarPets = async (id: string, limit: number = 4) => {
  try {
    const response = await api.get(`/pets/${id}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar pets:', error);
    return []; // Return empty array on error
  }
};

export const createPet = async (petData: any) => {
  const response = await api.post('/pets', petData);
  return response.data;
};

export const updatePet = async (id: string, petData: any) => {
  const response = await api.put(`/pets/${id}`, petData);
  return response.data;
};

export const deletePet = async (id: string) => {
  const response = await api.delete(`/pets/${id}`);
  return response.data;
};

// Pet Statistics for Admin
export const getPetStatistics = async () => {
  const response = await api.get('/pets/statistics');
  return response.data;
};

// Image Upload API
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('userToken');
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  return response.data;
};

export const uploadMultipleImages = async (files: File[]) => {
  const formData = new FormData();
  
  console.log(`Uploading ${files.length} files...`);
  
  // Append each file to formData with the same field name
  files.forEach((file, index) => {
    console.log(`Adding file ${index + 1}: ${file.name}, size: ${file.size}`);
    formData.append('images', file);
  });

  try {
    console.log('Sending request to /upload/multiple endpoint');
    // Create a fresh axios instance without any interceptors
    const axiosWithoutAuth = axios.create({
      baseURL: API_URL,
    });
    
    const response = await axiosWithoutAuth.post(`/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    throw error;
  }
};

export const deleteImage = async (public_id: string) => {
  const response = await api.delete('/upload', { data: { public_id } });
  return response.data;
};

// Define the DashboardStats interface before the function
export interface DashboardStats {
  users: {
    total: number;
    admins: number;
    customers: number;
    newThisMonth: number;
  };
  pets: {
    total: number;
    available: number;
    sold: number;
    bySpecies: { category: string; count: number }[];
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    cancelled: number;
  };
  appointments: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
  revenue: {
    total: number;
    currentMonth: number;
    previousMonth: number;
    changePercentage: number;
  };
}

// Admin APIs
export const getDashboardStats = async (retry = 1): Promise<DashboardStats> => {
  try {
    // First check if we have a token
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('No authentication token found for admin API call');
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('Get dashboard stats API error:', error);
    
    // If it's a network error and we have retries left, try again
    if (!error.response && retry > 0) {
      console.log(`Network error fetching stats, retrying... (${retry} attempts left)`);
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getDashboardStats(retry - 1);
    }
    
    // For 401 errors, we'll let the auth context handle the token invalidation
    if (error.response && error.response.status === 401) {
      // Use previously cached data if available
      const cachedData = localStorage.getItem('adminDashboardStats');
      if (cachedData) {
        console.log('Using cached dashboard stats due to auth error');
        return JSON.parse(cachedData);
      }
    }
    
    throw error;
  }
};

// Appointment APIs
export interface Appointment {
  _id: string;
  title: string;
  date: Date | string;
  customer: string;
  customerId?: string;
  petId?: string;
  petName?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAppointments = async (params?: { status?: string; date?: string; page?: number; limit?: number }): Promise<{ appointments: Appointment[]; totalPages: number; currentPage: number }> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(endpoint);
  return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}`, appointmentData);
  return response.data;
};

export const deleteAppointment = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};

export const getAppointmentsByDateRange = async (startDate: Date | string, endDate: Date | string): Promise<Appointment[]> => {
  const response = await api.get('/appointments/range', {
    params: {
      startDate,
      endDate
    }
  });
  return response.data;
};

// Order APIs
export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    petId: string;
    name: string;
    price: number;
    image?: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer';
  createdAt: string;
  updatedAt: string;
}

export const getOrders = async (params?: { status?: string; paymentStatus?: string; page?: number; limit?: number }): Promise<{ orders: Order[]; totalPages: number; currentPage: number }> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(endpoint);
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const updatePaymentStatus = async (id: string, paymentStatus: Order['paymentStatus'], paymentMethod?: Order['paymentMethod']): Promise<Order> => {
  const response = await api.put(`/orders/${id}/payment`, { paymentStatus, paymentMethod });
  return response.data;
};

// Reports API
export const getRevenueData = async () => {
  const response = await api.get('/orders/revenue');
  return response.data;
};

// Comments API
export const getCommentsByPetId = async (petId: string) => {
  try {
    const response = await api.get(`/comments/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (petId: string, commentData: { name: string; content: string; rating: number }) => {
  try {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('Authentication required to add comments');
    }
    
    const response = await api.post(`/comments/${petId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Admin comment functions
export const getUnreadComments = async () => {
  try {
    const response = await api.get('/comments/admin/unread');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread comments:', error);
    throw error;
  }
};

export const markCommentAsRead = async (commentId: string) => {
  try {
    const response = await api.put(`/comments/admin/${commentId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking comment as read:', error);
    throw error;
  }
};

export const addCommentReply = async (commentId: string, content: string) => {
  try {
    const response = await api.post(`/comments/admin/${commentId}/reply`, { content });
    return response.data;
  } catch (error) {
    console.error('Error adding reply to comment:', error);
    throw error;
  }
};

export default api; 