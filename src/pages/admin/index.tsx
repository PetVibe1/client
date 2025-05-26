import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getRevenueData, getAppointments, getUnreadComments } from '../../utils/api';
import AdminLayout from '../../components/layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faUsers, 
  faChartBar, 
  faMoneyBillWave, 
  faCalendarAlt,
  faPaw,
  faDog,
  faCat,
  faComment,
  faExternalLinkAlt,
  faReply,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { StatCard } from '../../components/ui/stat-card';
import { ShadcnBarChart } from '../../components/ui/shadcn-bar-chart';
import { DataTable } from '../../components/ui/data-table';
import { Schedule } from '../../components/ui/schedule';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import withAdminProtection from '../../components/auth/withAdminProtection';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Pet {
  _id: string;
  code: string;
  name: string;
  species: string;
  breed?: string;
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

interface DashboardStats {
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

// After DashboardStats interface, add a new interface for cached data with timestamp
interface CachedDashboardData {
  dashboardStats: DashboardStats | null;
  salesData: { month: string; sales: number }[];
  scheduleEvents: any[];
  timestamp: number; // Unix timestamp in milliseconds
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Comment interface for the dashboard
interface Comment {
  _id: string;
  petId: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
  userId?: string;
  replies?: {
    _id: string;
    adminId: string;
    adminName: string;
    content: string;
    createdAt: string;
  }[];
  isRead?: boolean;
}

const AdminDashboard: NextPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentPets, setRecentPets] = useState<Pet[]>([]);
  const [salesData, setSalesData] = useState<{ month: string; sales: number }[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Add state for unread comments
  const [unreadComments, setUnreadComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Fetch data for dashboard
  useEffect(() => {
    const fetchDashboardData = async (forceRefresh = false) => {
      try {
        setLoading(true);
        
        // Try to get data from localStorage first
        const storedData = localStorage.getItem('adminDashboardData');
        
        if (storedData && !forceRefresh) {
          try {
            const parsedData: CachedDashboardData = JSON.parse(storedData);
            const currentTime = Date.now();
            
            // Check if the cached data is still valid (less than CACHE_DURATION old)
            if (parsedData.timestamp && (currentTime - parsedData.timestamp) < CACHE_DURATION) {
              console.log('Using cached dashboard data from localStorage');
              
              // Set data from cache
              if (parsedData.dashboardStats) {
                setDashboardStats(parsedData.dashboardStats);
              }
              
              if (parsedData.salesData) {
                setSalesData(parsedData.salesData);
              }
              
              if (parsedData.scheduleEvents) {
                setScheduleEvents(parsedData.scheduleEvents);
              }
              
              // Set the last refreshed time from the timestamp
              setLastRefreshed(new Date(parsedData.timestamp));
              
              // Skip API calls and exit early
              setLoading(false);
              return;
            } else {
              console.log('Cached data expired, fetching fresh data');
            }
          } catch (e) {
            console.error('Error parsing stored dashboard data:', e);
          }
        }
        
        // If we got here, we need to fetch fresh data
        let stats, revenueData, appointmentsData;
        
        try {
          stats = await getDashboardStats();
          if (stats) {
            setDashboardStats(stats);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard stats:', err);
          // Keep using cached data if available
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              if (parsedData.dashboardStats) {
                setDashboardStats(parsedData.dashboardStats);
              }
            } catch (e) {
              console.error('Error parsing stored dashboard data:', e);
            }
          }
        }
        
        try {
          revenueData = await getRevenueData();
          if (revenueData) {
            setSalesData(revenueData);
          }
        } catch (err) {
          console.error('Failed to fetch revenue data:', err);
          // Keep using cached data if available
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              if (parsedData.salesData) {
                setSalesData(parsedData.salesData);
              }
            } catch (e) {
              console.error('Error parsing stored dashboard data:', e);
            }
          }
        }
        
        try {
          appointmentsData = await getAppointments({ status: 'pending', limit: 5 });
          
          if (appointmentsData.appointments) {
            const formattedEvents = appointmentsData.appointments.map(appointment => ({
              id: appointment._id,
              title: appointment.title,
              date: new Date(appointment.date),
              status: appointment.status
            }));
            setScheduleEvents(formattedEvents);
          }
        } catch (err) {
          console.error('Failed to fetch appointment data:', err);
          // Keep using cached data if available
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              if (parsedData.scheduleEvents) {
                setScheduleEvents(parsedData.scheduleEvents);
              }
            } catch (e) {
              console.error('Error parsing stored dashboard data:', e);
            }
          }
        }
        
        // Save all data to localStorage with timestamp
        const currentTime = Date.now();
        setLastRefreshed(new Date(currentTime));
        
        const dataToStore: CachedDashboardData = {
          dashboardStats: stats || dashboardStats,
          salesData: revenueData || salesData,
          scheduleEvents: appointmentsData ? appointmentsData.appointments.map(appointment => ({
            id: appointment._id,
            title: appointment.title,
            date: appointment.date,
            status: appointment.status
          })) : scheduleEvents,
          timestamp: currentTime
        };
        
        localStorage.setItem('adminDashboardData', JSON.stringify(dataToStore));
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    
    fetchDashboardData();
    
    // Register a listener for HMR reload events
    if (typeof window !== 'undefined') {
      // This function will run on visibility change to handle HMR
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Check when the data was last refreshed
          const storedData = localStorage.getItem('adminDashboardData');
          if (storedData) {
            try {
              const parsedData: CachedDashboardData = JSON.parse(storedData);
              const currentTime = Date.now();
              
              // Only refresh if cache is expired
              if (!parsedData.timestamp || (currentTime - parsedData.timestamp) > CACHE_DURATION) {
                console.log('Dashboard visible and cache expired, refreshing data');
                fetchDashboardData();
              } else {
                console.log('Dashboard visible but cache still valid, using cached data');
              }
            } catch (e) {
              console.error('Error checking data freshness:', e);
              fetchDashboardData();
            }
          } else {
            fetchDashboardData();
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // For recovering from HMR rebuilds
      const handleHMRRecover = () => {
        console.log('Attempting to recover dashboard data after HMR rebuild');
        const storedData = localStorage.getItem('adminDashboardData');
        if (storedData) {
          try {
            const parsedData: CachedDashboardData = JSON.parse(storedData);
            if (parsedData.dashboardStats) {
              setDashboardStats(parsedData.dashboardStats);
            }
            if (parsedData.salesData) {
              setSalesData(parsedData.salesData);
            }
            if (parsedData.scheduleEvents) {
              setScheduleEvents(parsedData.scheduleEvents);
            }
            if (parsedData.timestamp) {
              setLastRefreshed(new Date(parsedData.timestamp));
            }
          } catch (e) {
            console.error('Error recovering data after HMR:', e);
          }
        }
      };
      
      // @ts-ignore - Custom property on window
      window.__adminDashboardHMRHandler = handleHMRRecover;
      
      // Add event listener for beforeunload to ensure data is saved
      const handleBeforeUnload = () => {
        // The data is already saved in localStorage during fetching
        // This is just an extra safeguard
        if (dashboardStats) {
          const dataToStore: CachedDashboardData = {
            dashboardStats,
            salesData,
            scheduleEvents,
            timestamp: Date.now()
          };
          localStorage.setItem('adminDashboardData', JSON.stringify(dataToStore));
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // Run our HMR handler before component unmounts
        // @ts-ignore - Custom property on window
        if (window.__adminDashboardHMRHandler) {
          // @ts-ignore - Custom property on window
          window.__adminDashboardHMRHandler();
        }
      };
    }
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);
  
  // Format for shadcn bar chart
  const petsByCategoryForChart = React.useMemo(() => {
    if (!dashboardStats) return { data: [], categories: [] };
    
    // Transform data for shadcn bar chart
    const formattedData = dashboardStats.pets.bySpecies.map(item => ({
      category: item.category,
      "Số lượng": item.count
    }));

    return {
      data: formattedData,
      categories: [{ name: "Số lượng", color: "#3b82f6" }]
    };
  }, [dashboardStats]);
  
  // Format for shadcn bar chart
  const salesDataForChart = React.useMemo(() => {
    if (!salesData.length) return { data: [], categories: [] };
    
    const formattedData = salesData.map(item => ({
      month: item.month,
      "Doanh thu": item.sales / 1000000 // Convert to millions for better display
    }));

    return {
      data: formattedData,
      categories: [{ name: "Doanh thu", color: "#3b82f6" }]
    };
  }, [salesData]);

  // Pet table columns
  const petColumns = [
    { 
      header: 'Mã', 
      accessorKey: 'code' as keyof Pet 
    },
    { 
      header: 'Tên', 
      accessorKey: 'name' as keyof Pet,
      cell: (pet: Pet) => (
        <div className="font-medium text-slate-800">{pet.name}</div>
      )
    },
    { 
      header: 'Giá', 
      accessorKey: 'price' as keyof Pet,
      cell: (pet: Pet) => formatCurrency(pet.price)
    },
    { 
      header: 'Trạng thái', 
      accessorKey: 'available' as keyof Pet,
      cell: (pet: Pet) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            pet.available
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-800'
          }`}
        >
          {pet.available ? 'Còn hàng' : 'Đã bán'}
        </span>
      )
    },
  ];

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Call fetchDashboardData with forceRefresh=true
    const fetchDashboardData = async (forceRefresh = true) => {
      try {
        // Same implementation as above, just forcing refresh
        // ... similar to the useEffect code but forcing refresh
        setLoading(true);
        
        let stats, revenueData, appointmentsData;
        
        try {
          stats = await getDashboardStats();
          if (stats) {
            setDashboardStats(stats);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard stats:', err);
        }
        
        try {
          revenueData = await getRevenueData();
          if (revenueData) {
            setSalesData(revenueData);
          }
        } catch (err) {
          console.error('Failed to fetch revenue data:', err);
        }
        
        try {
          appointmentsData = await getAppointments({ status: 'pending', limit: 5 });
          
          if (appointmentsData.appointments) {
            const formattedEvents = appointmentsData.appointments.map(appointment => ({
              id: appointment._id,
              title: appointment.title,
              date: new Date(appointment.date),
              status: appointment.status
            }));
            setScheduleEvents(formattedEvents);
          }
        } catch (err) {
          console.error('Failed to fetch appointment data:', err);
        }
        
        // Save all data to localStorage with timestamp
        const currentTime = Date.now();
        setLastRefreshed(new Date(currentTime));
        
        const dataToStore: CachedDashboardData = {
          dashboardStats: stats || dashboardStats,
          salesData: revenueData || salesData,
          scheduleEvents: appointmentsData ? appointmentsData.appointments.map(appointment => ({
            id: appointment._id,
            title: appointment.title,
            date: appointment.date,
            status: appointment.status
          })) : scheduleEvents,
          timestamp: currentTime
        };
        
        localStorage.setItem('adminDashboardData', JSON.stringify(dataToStore));
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    
    fetchDashboardData(true);
  };

  useEffect(() => {
    const fetchUnreadComments = async () => {
      try {
        setIsLoadingComments(true);
        const data = await getUnreadComments();
        setUnreadComments(data);
      } catch (err) {
        console.error('Error fetching unread comments:', err);
        // Don't set global error - just handle comments separately
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchUnreadComments();
  }, []);

  // Format detailed time for comments
  const formatDetailedTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardStats) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard | Pet Store</title>
      </Head>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-sm text-slate-500">
              Cập nhật lúc: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Tổng số thú cưng"
          value={dashboardStats.pets.total.toString()}
          icon={<FontAwesomeIcon icon={faPaw} className="h-5 w-5 text-white" />}
          subtitle={`${dashboardStats.pets.available} còn hàng`}
          className="bg-gradient-to-br from-amber-50 to-white border-amber-200"
        />

        <StatCard
          title="Người dùng"
          value={dashboardStats.users.total.toString()}
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-white" />
          }
          subtitle={`${dashboardStats.users.newThisMonth} mới tháng này`}
          className="bg-gradient-to-br from-blue-50 to-white border-blue-200"
        />

        <StatCard
          title="Doanh thu tháng"
          value={formatCurrency(dashboardStats.revenue.currentMonth)}
          icon={
            <FontAwesomeIcon icon={faChartBar} className="h-5 w-5 text-white" />
          }
          change={`${dashboardStats.revenue.changePercentage.toFixed(1)}%`}
          changeType={
            dashboardStats.revenue.changePercentage >= 0
              ? "increase"
              : "decrease"
          }
          subtitle="so với tháng trước"
          className="bg-gradient-to-br from-green-50 to-white border-green-200"
        />

        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(dashboardStats.revenue.total)}
          icon={
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              className="h-5 w-5 text-white"
            />
          }
          subtitle="từ tất cả đơn hàng"
          className="bg-gradient-to-br from-purple-50 to-white border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <ShadcnBarChart
            title="Doanh thu theo tháng (triệu VND)"
            data={salesDataForChart.data}
            categories={salesDataForChart.categories}
            index="month"
            valueFormatter={(value) => `${value} Tr`}
          />
        </div>

        {/* Pet Categories */}
        <div>
          <ShadcnBarChart
            title="Thú cưng theo loại"
            data={petsByCategoryForChart.data}
            categories={petsByCategoryForChart.categories}
            index="category"
            valueFormatter={(value) => `${value} con`}
            showLegend={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Lịch hẹn sắp tới</CardTitle>
              <CardDescription>
                <span className="text-black">{`${dashboardStats.appointments.pending} lịch hẹn đang chờ`}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleEvents.length > 0 ? (
                <Schedule events={scheduleEvents} />
              ) : (
                <div className="text-center py-6 text-slate-800">
                  Không có lịch hẹn sắp tới
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => router.push("/admin/schedule")}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Xem tất cả
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Đơn hàng</CardTitle>
              <CardDescription className="text-black">
                Tổng quan đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-purple-700">
                      {dashboardStats.orders.pending}
                    </div>
                    <div className="text-sm text-slate-600">Chờ xử lý</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700">
                      {dashboardStats.orders.processing}
                    </div>
                    <div className="text-sm text-slate-600">Đang xử lý</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-700">
                      {dashboardStats.orders.completed}
                    </div>
                    <div className="text-sm text-slate-600">Hoàn thành</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-700">
                      {dashboardStats.orders.cancelled}
                    </div>
                    <div className="text-sm text-slate-600">Đã hủy</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => router.push("/admin/orders")}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Unread Comments Widget */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#003459]">
              <FontAwesomeIcon icon={faComment} className="mr-2 text-amber-500" />
              Bình luận chưa đọc
            </h2>
            <Link 
              href="/admin/comments" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Xem tất cả
              <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 text-xs" />
            </Link>
          </div>
          
          {isLoadingComments ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003459]"></div>
            </div>
          ) : unreadComments.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">Không có bình luận nào chưa đọc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unreadComments.slice(0, 3).map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mr-2">
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-medium text-[#003459]">{comment.name}</h3>
                        <p className="text-xs text-gray-500">{formatDetailedTime(comment.createdAt)}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/comments`} 
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
                    >
                      <FontAwesomeIcon icon={faReply} className="mr-1" />
                      Phản hồi
                    </Link>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">{comment.content}</p>
                  <div className="text-right">
                    <Link 
                      href={`/pets/${comment.petId}`}
                      className="text-xs text-gray-500 hover:text-[#003459]"
                    >
                      Xem thú cưng
                    </Link>
                  </div>
                </div>
              ))}
              
              {unreadComments.length > 3 && (
                <div className="text-center pt-2">
                  <Link 
                    href="/admin/comments" 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + {unreadComments.length - 3} bình luận khác
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap the component with admin protection
export default withAdminProtection(AdminDashboard); 