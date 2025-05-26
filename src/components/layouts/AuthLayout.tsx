import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30">
      {/* Simplified Header */}
      <header className="bg-amber-50 shadow-sm py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-12 h-12 bg-amber-300 rounded-xl flex items-center justify-center mr-2 shadow-sm">
                <FontAwesomeIcon 
                  icon={faPaw} 
                  className="text-slate-800 text-2xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800 font-comfortaa">Monitö</span>
                <span className="text-xs text-slate-500 font-comfortaa">pets for best</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-5">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-700 hover:bg-amber-100 transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                href="/danh-muc"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-700 hover:bg-amber-100 transition-colors"
              >
                Danh Mục
              </Link>
              <Link
                href="/gioi-thieu"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-700 hover:bg-amber-100 transition-colors"
              >
                Giới Thiệu
              </Link>
              <Link
                href="/lien-he"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-700 hover:bg-amber-100 transition-colors"
              >
                Liên Hệ
              </Link>
            </nav>

            {/* Auth buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/login"
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  router.pathname === '/login' 
                    ? 'bg-slate-100 font-medium text-slate-800' 
                    : 'text-slate-700 hover:bg-amber-100'
                } transition-colors`}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  router.pathname === '/register' 
                    ? 'bg-slate-100 font-medium text-slate-800' 
                    : 'text-slate-700 hover:bg-amber-100'
                } transition-colors`}
              >
                Đăng ký
              </Link>
              <Link
                href="/register"
                className="ml-1 px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Tham gia cộng đồng
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-amber-600 hover:text-amber-700 hover:bg-amber-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 border-t border-amber-200 pt-3">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang Chủ
                </Link>
                <Link
                  href="/danh-muc"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Danh Mục
                </Link>
                <Link
                  href="/gioi-thieu"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giới Thiệu
                </Link>
                <Link
                  href="/lien-he"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Liên Hệ
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative w-8 h-8 bg-amber-300 rounded-lg flex items-center justify-center mr-2">
                <FontAwesomeIcon 
                  icon={faPaw} 
                  className="text-slate-800 text-sm"
                />
              </div>
              <span className="text-lg font-bold text-white">Monitö</span>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-amber-300 transition-colors text-sm">
                Trang Chủ
              </Link>
              <Link href="/danh-muc" className="text-gray-300 hover:text-amber-300 transition-colors text-sm">
                Danh Mục
              </Link>
              <Link href="/gioi-thieu" className="text-gray-300 hover:text-amber-300 transition-colors text-sm">
                Giới Thiệu
              </Link>
              <Link href="/lien-he" className="text-gray-300 hover:text-amber-300 transition-colors text-sm">
                Liên Hệ
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Monitö. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 