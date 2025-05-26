import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { getAllUsers, deleteUser } from '../../../utils/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserPlus, 
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

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

const UsersPage: NextPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersPerPage] = useState(10);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    // Redirect non-admin users
    if (isAdmin === false) {
      router.push('/');
    }

    fetchUsers();
  }, [isAdmin, router, currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: { page?: number; limit?: number; role?: string } = {
        page: currentPage,
        limit: usersPerPage,
      };

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const response = await getAllUsers(params);
      
      // If response is paginated
      if (response.users && response.totalPages) {
        setUsers(response.users);
        setTotalPages(response.totalPages);
      } else {
        // If response is a simple array
        setUsers(response);
        setTotalPages(Math.ceil(response.length / usersPerPage));
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;

    try {
      await deleteUser(userId);
      setShowConfirmDelete(null);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Quản lý người dùng | Admin</title>
      </Head>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="mt-1 text-slate-600">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <button 
          onClick={() => router.push('/admin/users/create')} 
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Thêm người dùng
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
          <CardTitle className="text-black">Danh sách người dùng</CardTitle>
          <CardDescription className="text-black">Tổng số: {users.length} người dùng</CardDescription>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="w-full p-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
              />
            </div>
            
            <div className="relative">
              <select
                className="w-full md:w-48 p-2 pl-3 pr-8 border border-slate-300 rounded-lg appearance-none bg-white 
                          text-slate-700 cursor-pointer transition-all duration-200
                          hover:border-amber-400
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                          disabled:opacity-50 disabled:cursor-not-allowed"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
              >
                <option value="all" className="py-2">Tất cả vai trò</option>
                <option value="user" className="py-2">Người dùng</option>
                <option value="admin" className="py-2">Admin</option>
              </select>
              <FontAwesomeIcon 
                icon={faFilter} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy người dùng nào.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{`${user.firstName} ${user.lastName}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Người dùng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {showConfirmDelete === user._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
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
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                                className="text-amber-500 hover:text-amber-600"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => setShowConfirmDelete(user._id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === 1
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show limited page numbers to avoid too many buttons
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-md ${
                              currentPage === page
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      // Show ellipsis for skipped pages
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 py-1">...</span>;
                      }
                      
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === totalPages
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Tiếp
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default UsersPage; 