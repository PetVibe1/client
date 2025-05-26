import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { getOrders, Order, updateOrderStatus } from '../../../utils/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faEye, 
  faCheck, 
  faTimes, 
  faSpinner,
  faSearch, 
  faFilter, 
  faCircle,
  faCheckCircle,
  faTimesCircle,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { formatCurrency } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const OrdersPage: NextPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (isAdmin === false) {
      router.push('/');
    }
    
    fetchOrders();
  }, [isAdmin, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      setUpdatingStatus(true);
      const updatedOrder = await updateOrderStatus(id, status);
      setOrders(orders.map(order => 
        order._id === id ? { ...order, status } : order
      ));
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <FontAwesomeIcon icon={faCircle} className="text-amber-500" />;
      case 'processing':
        return <FontAwesomeIcon icon={faSpinner} className="text-blue-500" />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
    }
  };

  const statusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
    }
  };

  const paymentStatusText = (status: 'paid' | 'unpaid') => {
    return status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
  };

  const paymentMethodText = (method: 'cash' | 'credit_card' | 'bank_transfer') => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'bank_transfer':
        return 'Chuyển khoản';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
    }
  });

  return (
    <AdminLayout>
      <Head>
        <title>Quản lý đơn hàng | Admin</title>
      </Head>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h1>
          <p className="mt-1 text-slate-600">Theo dõi và quản lý các đơn hàng từ khách hàng</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            disabled={loading}
          >
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-700"
          >
            &times;
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>
            Tổng doanh thu: {formatCurrency(orders.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total : 0), 0))}
          </CardDescription>

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc khách hàng..."
                className="w-full p-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:flex md:flex-row">
              <div className="relative">
                <select
                  className="w-full md:w-40 p-2 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  className="w-full md:w-40 p-2 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                >
                  <option value="all">Tất cả thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </select>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <select
                  className="w-full md:w-48 p-2 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'date' | 'total');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                >
                  <option value="date-desc">Mới nhất trước</option>
                  <option value="date-asc">Cũ nhất trước</option>
                  <option value="total-desc">Giá trị cao nhất</option>
                  <option value="total-asc">Giá trị thấp nhất</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy đơn hàng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Thanh toán
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sortedOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-slate-50 ${selectedOrderId === order._id ? 'bg-slate-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-800">{order.customer.name}</div>
                          <div className="text-xs text-slate-500">{order.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: vi })}
                          <div className="text-xs">{format(new Date(order.createdAt), "HH:mm", { locale: vi })}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{statusIcon(order.status)}</span>
                            <span className={`text-xs font-medium ${
                              order.status === 'completed' ? 'text-green-700' :
                              order.status === 'cancelled' ? 'text-red-700' :
                              order.status === 'processing' ? 'text-blue-700' :
                              'text-amber-700'
                            }`}>
                              {statusText(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {paymentStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="text-amber-500 hover:text-amber-600"
                              onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                              title="Xem chi tiết"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            
                            {order.status === 'pending' && (
                              <button
                                className="text-blue-500 hover:text-blue-600"
                                onClick={() => handleStatusChange(order._id, 'processing')}
                                disabled={updatingStatus}
                                title="Chuyển sang đang xử lý"
                              >
                                <FontAwesomeIcon icon={faSpinner} />
                              </button>
                            )}
                            
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleStatusChange(order._id, 'completed')}
                                disabled={updatingStatus}
                                title="Đánh dấu hoàn thành"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            )}
                            
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleStatusChange(order._id, 'cancelled')}
                                disabled={updatingStatus}
                                title="Hủy đơn hàng"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Order details row */}
                      {selectedOrderId === order._id && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50 px-6 py-4">
                            <div className="text-sm">
                              <div className="mb-4 pb-2 border-b border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-2">Chi tiết đơn hàng</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <p><span className="font-medium">Mã đơn:</span> {order.orderNumber}</p>
                                    <p><span className="font-medium">Ngày tạo:</span> {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                                    <p><span className="font-medium">Cập nhật:</span> {format(new Date(order.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                                  </div>
                                  <div>
                                    <p><span className="font-medium">Khách hàng:</span> {order.customer.name}</p>
                                    <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                                    {order.customer.phone && <p><span className="font-medium">Điện thoại:</span> {order.customer.phone}</p>}
                                  </div>
                                  <div>
                                    <p><span className="font-medium">Phương thức thanh toán:</span> {paymentMethodText(order.paymentMethod)}</p>
                                    <p><span className="font-medium">Trạng thái thanh toán:</span> {paymentStatusText(order.paymentStatus)}</p>
                                    <p><span className="font-medium">Tổng tiền:</span> <span className="font-semibold text-amber-700">{formatCurrency(order.total)}</span></p>
                                  </div>
                                </div>
                              </div>
                              
                              <h5 className="font-medium text-slate-800 mb-2">Sản phẩm</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                  <thead className="bg-slate-100">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Tên
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Đơn giá
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-slate-200">
                                    {order.items.map((item) => (
                                      <tr key={item.petId}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-800">
                                          {item.name}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-800">
                                          {formatCurrency(item.price)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <div className="border-t border-slate-200 pt-2">
                                  <p className="font-medium"><FontAwesomeIcon icon={faMoneyBillWave} className="text-amber-500 mr-2" />Tổng cộng: <span className="text-amber-700 font-bold">{formatCurrency(order.total)}</span></p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default OrdersPage; 