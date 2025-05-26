import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if user is not authenticated and store current path for redirect
        router.replace({
          pathname: '/login',
          query: { redirect: router.asPath }
        });
      } else if (adminOnly && !isAdmin) {
        // Redirect to homepage if user is not an admin but route requires admin access
        router.replace('/');
      }
    }
  }, [user, loading, adminOnly, isAdmin, router]);

  // Show loading or null when checking authentication
  if (loading || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authentication check passes, render children
  return <>{children}</>;
};

export default ProtectedRoute; 