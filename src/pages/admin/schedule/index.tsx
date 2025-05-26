import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { getAppointments, Appointment, deleteAppointment, updateAppointment } from '../../../utils/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarPlus, 
  faCalendarCheck, 
  faCalendarTimes, 
  faEdit, 
  faTrash, 
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { format, parseISO, isSameDay, startOfDay, endOfDay, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

const SchedulePage: NextPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'future'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect non-admin users
    if (isAdmin === false) {
      router.push('/');
    }
    
    fetchAppointments();
  }, [isAdmin, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      setShowConfirmDelete(null);
      setAppointments(appointments.filter(appointment => appointment._id !== id));
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.message || 'Có lỗi xảy ra khi xóa lịch hẹn');
    }
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    try {
      await updateAppointment(id, { status });
      setAppointments(appointments.map(appointment => 
        appointment._id === id ? { ...appointment, status } : appointment
      ));
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(search.toLowerCase()) ||
      appointment.customer.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : parseISO(appointment.date as string);
    
    let matchesDate = true;
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    if (dateFilter === 'today') {
      matchesDate = isSameDay(appointmentDate, today);
    } else if (dateFilter === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfDay(addDays(weekStart, 6));
      matchesDate = appointmentDate >= weekStart && appointmentDate <= weekEnd;
    } else if (dateFilter === 'future') {
      matchesDate = appointmentDate >= todayStart;
    } else if (selectedDate) {
      matchesDate = isSameDay(appointmentDate, selectedDate);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <AdminLayout>
      <Head>
        <title>Lịch hẹn | Admin</title>
      </Head>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch hẹn</h1>
          <p className="mt-1 text-slate-600">Quản lý lịch hẹn của khách hàng</p>
        </div>
        <button
          onClick={() => router.push('/admin/schedule/create')}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
          Tạo lịch hẹn
        </button>
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
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <CardDescription>Tổng số: {filteredAppointments.length} lịch hẹn</CardDescription>

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc khách hàng..."
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
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value as any);
                    setSelectedDate(null);
                  }}
                >
                  <option value="all">Tất cả ngày</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="future">Sắp tới</option>
                </select>
                <FontAwesomeIcon
                  icon={faFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <input
                  type="date"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(new Date(e.target.value));
                      setDateFilter('all');
                    } else {
                      setSelectedDate(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy lịch hẹn nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ngày hẹn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredAppointments.map((appointment) => (
                    <React.Fragment key={appointment._id}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="font-medium text-slate-800 cursor-pointer"
                            onClick={() => setShowDetailsId(showDetailsId === appointment._id ? null : appointment._id)}
                          >
                            {appointment.title}
                            {appointment.petName && <span className="text-sm text-slate-500 ml-2">({appointment.petName})</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {format(
                            appointment.date instanceof Date ? appointment.date : parseISO(appointment.date as string),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {appointment.status === 'completed' ? 'Hoàn thành' :
                             appointment.status === 'cancelled' ? 'Đã hủy' :
                             'Chờ xử lý'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {showConfirmDelete === appointment._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDeleteAppointment(appointment._id)}
                                className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => setShowConfirmDelete(null)}
                                className="text-slate-500 hover:text-slate-700 px-2 py-1"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(appointment._id, 'completed')}
                                  className="text-green-500 hover:text-green-600"
                                  title="Đánh dấu hoàn thành"
                                >
                                  <FontAwesomeIcon icon={faCalendarCheck} />
                                </button>
                              )}
                              
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                                  className="text-red-500 hover:text-red-600"
                                  title="Hủy lịch hẹn"
                                >
                                  <FontAwesomeIcon icon={faCalendarTimes} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => router.push(`/admin/schedule/${appointment._id}/edit`)}
                                className="text-amber-500 hover:text-amber-600"
                                title="Chỉnh sửa"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              
                              <button
                                onClick={() => setShowConfirmDelete(appointment._id)}
                                className="text-red-500 hover:text-red-600"
                                title="Xóa"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {showDetailsId === appointment._id && (
                        <tr>
                          <td colSpan={5} className="bg-slate-50 px-6 py-4">
                            <div className="text-sm text-slate-700">
                              <h4 className="font-semibold mb-2">Chi tiết lịch hẹn</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p><span className="font-medium">Tiêu đề:</span> {appointment.title}</p>
                                  <p><span className="font-medium">Khách hàng:</span> {appointment.customer}</p>
                                  {appointment.petName && (
                                    <p><span className="font-medium">Thú cưng:</span> {appointment.petName}</p>
                                  )}
                                </div>
                                <div>
                                  <p><span className="font-medium">Ngày hẹn:</span> {format(
                                    appointment.date instanceof Date ? appointment.date : parseISO(appointment.date as string),
                                    "dd/MM/yyyy", { locale: vi }
                                  )}</p>
                                  <p><span className="font-medium">Giờ hẹn:</span> {format(
                                    appointment.date instanceof Date ? appointment.date : parseISO(appointment.date as string),
                                    "HH:mm", { locale: vi }
                                  )}</p>
                                  <p><span className="font-medium">Trạng thái:</span> {
                                    appointment.status === 'completed' ? 'Hoàn thành' :
                                    appointment.status === 'cancelled' ? 'Đã hủy' :
                                    'Chờ xử lý'
                                  }</p>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-2">
                                  <p className="font-medium">Ghi chú:</p>
                                  <p className="italic">{appointment.notes}</p>
                                </div>
                              )}
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

export default SchedulePage; 