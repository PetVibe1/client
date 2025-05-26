import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaw, 
  faHome, 
  faUsers, 
  faCog, 
  faSignOutAlt, 
  faBars, 
  faTimes, 
  faList, 
  faUser, 
  faChartBar, 
  faCalendarAlt, 
  faShoppingCart, 
  faBell,
  faDog,
  faCat,
  faClinicMedical,
  faMoneyBillWave,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';
import { getDashboardStats, DashboardStats } from '../../utils/api';

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarStats {
  totalPets: number;
  totalUsers: number;
  pendingOrders: number;
  pendingAppointments: number;
}

// Constants to protect against typos
const STORAGE_KEY_SIDEBAR_STATS = 'adminDashboardStats';
const STORAGE_KEY_DASHBOARD_DATA = 'adminDashboardData';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SidebarStats>({
    totalPets: 0,
    totalUsers: 0,
    pendingOrders: 0,
    pendingAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Define fetch function outside useEffect for reusability
  const fetchSidebarData = useCallback(async (skipCache = false) => {
    try {
      setFetchError(null);
      
      // First try to load from localStorage to prevent UI flicker
      if (!skipCache) {
        try {
          const cachedStats = localStorage.getItem(STORAGE_KEY_SIDEBAR_STATS);
          if (cachedStats) {
            const parsedStats = JSON.parse(cachedStats);
            setStats({
              totalPets: parsedStats.pets?.total || 0,
              totalUsers: parsedStats.users?.total || 0,
              pendingOrders: parsedStats.orders?.pending || 0,
              pendingAppointments: parsedStats.appointments?.pending || 0
            });
            setIsLoading(false);
          }
        } catch (e) {
          console.error('Error parsing cached stats:', e);
        }
      }
      
      // Always fetch fresh data from API
      try {
        const dashboardStats = await getDashboardStats(2); // Retry up to 2 times
        
        // Save data to localStorage
        localStorage.setItem(STORAGE_KEY_SIDEBAR_STATS, JSON.stringify(dashboardStats));
        
        // Update state with fresh data
        setStats({
          totalPets: dashboardStats.pets.total || 0,
          totalUsers: dashboardStats.users.total || 0,
          pendingOrders: dashboardStats.orders.pending || 0,
          pendingAppointments: dashboardStats.appointments.pending || 0
        });
        
        // Set loading to false now that we have fresh data
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching dashboard data from API:', error);
        
        // Show error only if we don't have cached data
        if (!localStorage.getItem(STORAGE_KEY_SIDEBAR_STATS)) {
          setFetchError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      console.error('Error in fetchSidebarData:', error);
      setFetchError('Đã xảy ra lỗi. Vui lòng làm mới trang.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Hook to load data on initial render
  useEffect(() => {
    fetchSidebarData();
    
    // Add a listener for storage events to handle cross-tab updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY_SIDEBAR_STATS && event.newValue) {
        try {
          const parsedStats = JSON.parse(event.newValue);
          setStats({
            totalPets: parsedStats.pets?.total || 0,
            totalUsers: parsedStats.users?.total || 0,
            pendingOrders: parsedStats.orders?.pending || 0,
            pendingAppointments: parsedStats.appointments?.pending || 0
          });
        } catch (e) {
          console.error('Error parsing stats from storage event:', e);
        }
      }
    };
    
    // Register storage event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Also register a listener for HMR reload events
    if (typeof window !== 'undefined') {
      // This function runs after any hot module reload
      const handleHMRReload = () => {
        console.log('Detected HMR reload, refreshing admin data...');
        fetchSidebarData(false);
      };
      
      // We're adding a property to the window object to track our handler
      // @ts-ignore - Custom property on window
      window.__adminLayoutHMRHandler = handleHMRReload;
      
      // Before unload, make sure data is saved
      window.addEventListener('beforeunload', () => {
        console.log('Page unloading, ensuring data is saved...');
        // The data should already be saved in localStorage during API calls
      });
      
      // Listen for dedicated HMR events if we're in development
      if (process.env.NODE_ENV === 'development') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            // When tab becomes visible again, refresh data
            fetchSidebarData(false);
          }
        });
      }
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // Run our HMR handler before component unmounts
      // @ts-ignore - Custom property on window
      if (typeof window !== 'undefined' && window.__adminLayoutHMRHandler) {
        // @ts-ignore - Custom property on window
        window.__adminLayoutHMRHandler();
      }
    };
  }, [fetchSidebarData]);

  const navigation = [
    { 
      name: 'Tổng quan', 
      href: '/admin', 
      icon: faHome,
      count: null
    },
    { 
      name: 'Quản lý thú cưng', 
      href: '/admin/pets', 
      icon: faPaw,
      count: stats.totalPets
    },
    { 
      name: 'Quản lý người dùng', 
      href: '/admin/users', 
      icon: faUsers,
      count: stats.totalUsers
    },
    { 
      name: 'Lịch hẹn', 
      href: '/admin/schedule', 
      icon: faCalendarAlt,
      count: stats.pendingAppointments
    },
    { 
      name: 'Đơn hàng', 
      href: '/admin/orders', 
      icon: faShoppingCart,
      count: stats.pendingOrders
    },
    { 
      name: 'Báo cáo', 
      href: '/admin/reports', 
      icon: faChartBar,
      count: null
    },
    { 
      name: 'Hồ sơ của tôi', 
      href: '/admin/profile', 
      icon: faUser,
      count: null
    },
    { 
      name: 'Cài đặt', 
      href: '/admin/settings', 
      icon: faCog,
      count: null
    },
  ];

  const handleLogout = async () => {
    // Clear localStorage before logout
    localStorage.removeItem(STORAGE_KEY_SIDEBAR_STATS);
    localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin' && router.pathname === '/admin') {
      return true;
    }
    return router.pathname.startsWith(href) && href !== '/admin';
  };

  // Function to manually refresh data
  const handleRefreshData = () => {
    setIsLoading(true);
    fetchSidebarData(true); // Skip cache
  };

  return (
    <div className="flex h-screen bg-amber-50">
      {/* Mobile sidebar overlay */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-slate-800 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700 bg-slate-900">
            <div className="flex items-center">
              <div className="relative w-10 h-10 bg-amber-300 rounded-lg flex items-center justify-center mr-2">
                <FontAwesomeIcon 
                  icon={faPaw} 
                  className="text-slate-900 text-xl"
                />
              </div>
              <span className="text-xl font-bold text-white">Monitö Admin</span>
            </div>
            <button 
              className="text-gray-300 hover:text-white" 
              onClick={() => setSidebarOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-amber-500 text-white"
                    : "text-gray-300 hover:bg-amber-500/20 hover:text-white"
                )}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={item.icon} className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.count !== null && (
                  <span className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive(item.href) 
                      ? "bg-white text-amber-600" 
                      : "bg-slate-700 text-white"
                  )}>
                    {isLoading ? '...' : item.count}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-base font-medium text-gray-300 hover:bg-amber-500/20 hover:text-white rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-5 w-5" />
              Đăng xuất
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-slate-800 text-white">
        <div className="flex items-center h-16 px-4 border-b border-slate-700 bg-slate-900">
          <div className="relative w-10 h-10 bg-amber-300 rounded-lg flex items-center justify-center mr-2">
            <FontAwesomeIcon 
              icon={faPaw} 
              className="text-slate-900 text-xl"
            />
          </div>
          <span className="text-xl font-bold text-white">Monitö Admin</span>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-amber-500 text-white"
                    : "text-gray-300 hover:bg-amber-500/20 hover:text-white"
                )}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={item.icon} className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.count !== null && (
                  <span className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive(item.href) 
                      ? "bg-white text-amber-600" 
                      : "bg-slate-700 text-white"
                  )}>
                    {isLoading ? '...' : item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          {/* User profile in sidebar */}
          <div className="px-4 mt-6">
            <div className="py-4 border-t border-slate-700">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-slate-800" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-amber-500/20 hover:text-white rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center md:hidden">
              <button
                className="text-slate-700 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
              </button>
              <span className="ml-3 text-xl font-bold text-slate-800">Monitö Admin</span>
            </div>
            
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-slate-800">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {fetchError && (
                <span className="text-red-500 text-xs mr-2">{fetchError}</span>
              )}
              
              <button 
                className="p-1 rounded-full text-slate-600 hover:text-amber-500 hover:bg-amber-50 focus:outline-none"
                onClick={handleRefreshData}
                disabled={isLoading}
                title="Làm mới dữ liệu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button className="p-1 rounded-full text-slate-600 hover:text-amber-500 hover:bg-amber-50 focus:outline-none relative">
                <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                {(stats.pendingOrders > 0 || stats.pendingAppointments > 0) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-500"></span>
                )}
              </button>
              <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center md:hidden">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-slate-800" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto bg-amber-50 focus:outline-none">
          <div className="py-6 md:px-6 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 