import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import AuthLayout from '../components/layouts/AuthLayout';

const RegisterPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to home page
  React.useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <AuthLayout>
      <Head>
        <title>Đăng ký | Pet Store</title>
        <meta name="description" content="Tạo tài khoản mới cho Monitö Pet Store" />
      </Head>
      <div className="py-20 bg-gradient-to-br from-amber-50 via-white to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-amber-200"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-blue-100"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-50"></div>
        </div>
        <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10">
          <RegisterForm />
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage; 