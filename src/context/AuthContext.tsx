import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { loginUser, registerUser, getUserProfile } from '../utils/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAdmin: false,
  initialized: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  fetchUserProfile: async () => {},
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode | ((authState: { loading: boolean; initialized: boolean }) => ReactNode);
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [tokenRefreshing, setTokenRefreshing] = useState<boolean>(false);
  const router = useRouter();
  
  // Safe access to router pathname - handle undefined router during HMR
  const currentPath = typeof router?.pathname === 'string' ? router.pathname : '';

  // Enhanced token handling
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userToken');
    }
    return null;
  };

  const saveToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userToken', token);
      
      // Also store token expiration time (assuming 1 day expiration)
      const expiry = new Date();
      expiry.setTime(expiry.getTime() + (24 * 60 * 60 * 1000));
      localStorage.setItem('tokenExpiry', expiry.toISOString());
    }
  };

  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('tokenExpiry');
      
      // Also clear admin data
      localStorage.removeItem('adminDashboardStats');
      localStorage.removeItem('adminDashboardData');
    }
  };
  
  const isTokenExpired = () => {
    if (typeof window !== 'undefined') {
      const expiryStr = localStorage.getItem('tokenExpiry');
      if (!expiryStr) return true;
      
      const expiry = new Date(expiryStr);
      return expiry < new Date();
    }
    return true;
  };

  // Initial auth check - run only once on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (token && !isTokenExpired()) {
          try {
            await fetchUserProfile();
          } catch (error) {
            console.error('Failed to fetch user profile with existing token:', error);
            
            if (error instanceof Error && error.message.includes('401')) {
              removeToken();
              setUser(null);
            }
          }
        } else if (token && isTokenExpired()) {
          console.log('Token expired, removing...');
          removeToken();
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkUserLoggedIn();
  }, []); // Only run once on mount
  
  // Handle path changes - safer pattern for router dependency
  useEffect(() => {
    // No-op function for path changes, just to sync authentication state if needed
    // We'll reuse the already created fetchUserProfile without duplicating code
  }, [currentPath]);
  
  // Re-validate token periodically on admin pages to ensure continuous session
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Safely check for admin path with null/undefined protection
    const isAdminPage = currentPath.startsWith('/admin');
    
    // If user is admin and on an admin page, refresh profile every 5 minutes
    if (user?.role === 'admin' && isAdminPage) {
      intervalId = setInterval(async () => {
        try {
          if (!tokenRefreshing) {
            setTokenRefreshing(true);
            await fetchUserProfile(); // This will update the user state if successful
            setTokenRefreshing(false);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          setTokenRefreshing(false);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.role, currentPath]);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await getUserProfile();
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Only remove token and redirect for authentication errors (401)
      if (error?.response?.status === 401) {
        console.warn('Authentication token invalid or expired. Clearing token.');
        removeToken();
        setUser(null);
        throw new Error('Authentication failed (401)');
      } else {
        // For other errors, like network issues, keep the token and just log the error
        console.error('Non-authentication error occurred:', error?.message);
      }
      
      // Throw a user-friendly error message
      const errorMessage = error?.response?.data?.message || 'Failed to fetch user profile';
      setError(errorMessage);
      
      // Re-throw the error for handling by the caller
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      if (data && data.token) {
        saveToken(data.token);
        setUser(data);
        // Remove automatic redirect from here since LoginForm will handle it
        return data;
      } else {
        throw new Error('Invalid response from login API');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(userData);
      if (data && data.token) {
        saveToken(data.token);
        setUser(data);
        router.push('/'); // Redirect to homepage after registration
      } else {
        throw new Error('Invalid response from registration API');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    removeToken();
    setUser(null);
    router.push('/'); // Redirect to homepage after logout
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = user?.role === 'admin';

  const contextValue = {
    user,
    loading,
    error,
    isAdmin,
    initialized,
    login,
    register,
    logout,
    fetchUserProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {typeof children === 'function' ? children({ loading, initialized }) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 