import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import MainLayout from '../../components/layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { User, fetchUserInfo } from '../../services/userService';
import { 
  ArrowPathIcon, 
  UserCircleIcon, 
  EnvelopeIcon, 
  UserIcon, 
  CalendarIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const ProfilePage: NextPage = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserInfo();
        setUser(userData);
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

  if (!authUser) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-slate-600">Vui lòng đăng nhập để xem hồ sơ.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Hồ sơ cá nhân | Monitö</title>
      </Head>

      {/* Hero header with decorative elements */}
      <div className="relative bg-gradient-to-r from-amber-100 to-amber-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300 rounded-bl-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300 rounded-tr-full opacity-30"></div>
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">
            Hồ sơ cá nhân
          </h1>
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
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Có lỗi xảy ra</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : user ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
              {/* Profile header with avatar */}
              <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 h-48">
                <div className="absolute inset-0 bg-opacity-50 bg-amber-500 backdrop-blur-sm flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-br-full opacity-10"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-tl-full opacity-10"></div>
                </div>
                
                <div className="absolute -bottom-20 inset-x-0 flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-xl flex items-center justify-center overflow-hidden">
                    <UserCircleIcon className="h-28 w-28 text-slate-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
              
              {/* Profile body */}
              <div className="pt-24 pb-8 px-4 sm:px-6 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-6">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </div>
                
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  Thông tin chi tiết cá nhân và tài khoản của bạn trong hệ thống Monitö.
                </p>
                
                {/* Info cards */}
                <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                  {/* Personal info card */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-amber-100 pb-2">
                      Thông tin cá nhân
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Name */}
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mr-4">
                          <UserIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500">Họ và tên</p>
                          <p className="text-base font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                      
                      {/* Email */}
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mr-4">
                          <EnvelopeIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500">Email</p>
                          <p className="text-base font-medium text-slate-800">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Join date */}
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mr-4">
                          <CalendarIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500">Ngày tham gia</p>
                          <p className="text-base font-medium text-slate-800">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-center mt-4">
                    <a 
                      href="/profile/settings" 
                      className="inline-flex items-center px-6 py-3 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors shadow-md"
                    >
                      Chỉnh sửa hồ sơ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-12">Không tìm thấy thông tin người dùng.</p>
          )}
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="hidden md:block fixed bottom-10 right-10 w-32 h-32 bg-amber-200 rounded-full opacity-20"></div>
      <div className="hidden md:block fixed top-40 left-10 w-24 h-24 bg-amber-200 rounded-full opacity-20"></div>
    </MainLayout>
  );
};

export default ProfilePage;