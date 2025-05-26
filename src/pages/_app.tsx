import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from '../context/AuthContext';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Thêm biểu tượng vào thư viện
library.add(faPaw, faUser);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);
  
  // Check if the current route is an admin route
  useEffect(() => {
    const path = router.pathname;
    setIsAdminRoute(path.startsWith("/admin"));
  }, [router.pathname]);

  return (
    <AuthProvider>
      {({ loading, initialized }) => {
        // Show a loading indicator when auth state is being initialized
        if (!initialized && loading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-amber-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
                <p className="text-slate-700">Đang tải thông tin...</p>
              </div>
            </div>
          );
        }
        
        // For admin routes, wrap with ProtectedRoute
        if (isAdminRoute) {
          return (
            <ProtectedRoute adminOnly={true}>
              <Component {...pageProps} />
            </ProtectedRoute>
          );
        }
        
        // For regular routes, render normally
        return <Component {...pageProps} />;
      }}
    </AuthProvider>
  );
}
