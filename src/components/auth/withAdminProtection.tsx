import { useEffect, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { NextPage } from 'next';

export function withAdminProtection<P extends {}>(Component: NextPage<P>): NextPage<P> {
  const WithAdminProtection: NextPage<P> = (props: P) => {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // If not loading and either no user or not an admin
      if (!loading) {
        if (!user) {
          router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        } else if (!isAdmin) {
          // User is logged in but not an admin
          router.replace('/');
        }
      }
    }, [user, loading, isAdmin, router]);
    
    // Show loading state while checking auth
    if (loading || !user || !isAdmin) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    // If user is admin, render the component
    return (
      <ProtectedRoute adminOnly={true}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
  
  // Copy getInitialProps so it's available for the wrapped component
  if (Component.getInitialProps) {
    WithAdminProtection.getInitialProps = Component.getInitialProps;
  }
  
  return WithAdminProtection;
}

export default withAdminProtection; 