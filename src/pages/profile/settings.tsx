import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import MainLayout from '../../components/layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { User, fetchUserInfo, updateUserInfo } from '../../services/userService';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const ProfileSettingsPage: NextPage = () => {
  const { user: authUser, fetchUserProfile } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserInfo();
        setUser(userData);
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          email: userData.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error: any) {
        setError(error?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      loadUserProfile();
    }
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      // Validate password fields
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Vui lòng nhập mật khẩu hiện tại');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }
      }

      // Create update data object
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      // Only include email if changed
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }

      // Include password if changing
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      // Update user
      await updateUserInfo(updateData);
      await fetchUserProfile(); // Refresh auth context
      setSuccess('Cập nhật thông tin thành công');

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error: any) {
      setError(error?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!authUser) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-slate-600">Vui lòng đăng nhập để chỉnh sửa hồ sơ.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Cài đặt tài khoản | Monitö</title>
      </Head>

      {/* Hero header with decorative elements */}
      <div className="relative bg-gradient-to-r from-amber-100 to-amber-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300 rounded-bl-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300 rounded-tr-full opacity-30"></div>
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                Cài đặt tài khoản
              </h1>
              <p className="mt-2 text-slate-600">
                Cập nhật thông tin cá nhân và bảo mật tài khoản của bạn
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                href="/profile" 
                className="inline-flex items-center px-4 py-2 rounded-full border-2 border-slate-800 text-slate-800 font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Xem hồ sơ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-amber-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ArrowPathIcon className="animate-spin h-12 w-12 text-amber-500 mb-4" />
              <p className="text-slate-600 text-lg">Đang tải thông tin...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Notifications */}
              {error && (
                <div className="bg-red-50 p-4 rounded-lg shadow-md border border-red-200 flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 p-4 rounded-lg shadow-md border border-green-200 flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Settings Form Card */}
              <form onSubmit={handleSubmit}>
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                  {/* Personal Information Section */}
                  <div className="px-6 py-6 sm:p-8 border-b border-amber-100">
                    <div className="flex items-center mb-6">
                      <div className="bg-amber-100 rounded-full p-2 mr-4">
                        <UserCircleIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                          Thông tin cá nhân
                        </h2>
                        <p className="text-sm text-slate-600">
                          Cập nhật thông tin cá nhân của bạn
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                          Tên
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                            placeholder="Nhập tên của bạn"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                          Họ
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                            placeholder="Nhập họ của bạn"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="px-6 py-6 sm:p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-amber-100 rounded-full p-2 mr-4">
                        <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">
                          Đổi mật khẩu
                        </h3>
                        <p className="text-sm text-slate-600">
                          Để trống nếu không muốn thay đổi mật khẩu
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
                          Mật khẩu hiện tại
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                            Mật khẩu mới
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <LockClosedIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="password"
                              name="newPassword"
                              id="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                            Xác nhận mật khẩu mới
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <LockClosedIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="password"
                              name="confirmPassword"
                              id="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="block w-full pl-10 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-6 sm:px-8 bg-slate-50 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <Link
                      href="/profile"
                      className="inline-flex justify-center items-center px-5 py-3 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors"
                    >
                      Hủy
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex justify-center items-center px-5 py-3 border border-transparent rounded-lg text-white bg-slate-800 hover:bg-slate-700 font-medium text-sm shadow-sm transition-colors ${
                        saving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {saving ? (
                        <>
                          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="hidden md:block fixed bottom-10 right-10 w-32 h-32 bg-amber-200 rounded-full opacity-20"></div>
      <div className="hidden md:block fixed top-40 left-10 w-24 h-24 bg-amber-200 rounded-full opacity-20"></div>
    </MainLayout>
  );
};

export default ProfileSettingsPage; 