import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import ProfileDropdown from '../ProfileDropdown';
import { getDistinctSpecies } from '../../services/petService';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Ref for dropdown menu to detect clicks outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const species = await getDistinctSpecies();
        setSpeciesList(species);
      } catch (error) {
        console.error("Error fetching species list:", error);
      }
    };
    
    fetchSpecies();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: 'Trang Chủ', href: '/' },
    { name: 'Giới Thiệu', href: '/about' },
    { name: 'Liên Hệ', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30">
      {/* Header */}
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
            <nav className="hidden md:flex space-x-5 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm lg:text-base font-medium transition-all duration-200 ${
                    router.pathname === link.href
                      ? 'text-amber-600 border-b-2 border-amber-500'
                      : 'text-slate-700 hover:text-amber-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Categories Dropdown - Simplified implementation */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className={`flex items-center text-sm lg:text-base font-medium transition-all duration-200 ${
                    router.pathname.startsWith('/pets')
                      ? 'text-amber-600 border-b-2 border-amber-500'
                      : 'text-slate-700 hover:text-amber-600'
                  }`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Danh Mục
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <a
                        href="/pets"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      >
                        Tất cả thú cưng
                      </a>
                      {speciesList.map((species) => (
                        <a
                          key={species}
                          href={`/pets?species=${encodeURIComponent(species)}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                        >
                          {species}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Search and Login */}
            <div className="flex items-center space-x-2">
              <form onSubmit={handleSearch} className="relative hidden md:block mr-1">
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  className="w-40 lg:w-48 py-1 px-3 pr-7 text-xs rounded-full border border-amber-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
                >
                  <MagnifyingGlassIcon className="h-3 w-3" />
                </button>
              </form>

              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="hidden md:flex items-center space-x-1.5">
                  <Link
                    href="/login"
                    className="px-2.5 py-1 text-xs rounded-full text-slate-800 border border-slate-800 font-medium hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="px-2.5 py-1 text-xs rounded-full text-amber-500 border border-amber-500 font-medium hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    href="/login"
                    className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    Tham gia cộng đồng
                  </Link>
                </div>
              )}

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
          </div>

          {/* Mobile menu - Simplified implementation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 border-t border-amber-200 pt-3">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`block px-4 py-2 rounded-md text-base font-medium ${
                      router.pathname === link.href
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    {link.name}
                  </a>
                ))}

                {/* Mobile Categories Menu - Simplified */}
                <div className="relative">
                  <button
                    type="button"
                    className={`flex items-center w-full text-left px-4 py-2 rounded-md text-base font-medium ${
                      router.pathname.startsWith('/pets')
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    Danh Mục
                    <ChevronDownIcon className="ml-1 h-5 w-5 inline" />
                  </button>

                  {dropdownOpen && (
                    <div className="pl-4 mt-1 space-y-1">
                      <a
                        href="/pets"
                        className="block px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                      >
                        Tất cả thú cưng
                      </a>
                      {speciesList.map((species) => (
                        <a
                          key={species}
                          href={`/pets?species=${encodeURIComponent(species)}`}
                          className="block px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                        >
                          {species}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <a
                    href="/admin"
                    className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  >
                    Admin
                  </a>
                )}
                {!user && (
                  <>
                    <a
                      href="/login"
                      className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                    >
                      Đăng nhập
                    </a>
                    <a
                      href="/register"
                      className="block px-4 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                    >
                      Đăng ký
                    </a>
                  </>
                )}
                <form onSubmit={handleSearch} className="mt-4 px-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập từ khóa..."
                      className="w-full py-2 px-4 pr-10 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center mb-4">
                <div className="relative w-10 h-10 bg-amber-300 rounded-lg flex items-center justify-center mr-2">
                  <FontAwesomeIcon 
                    icon={faPaw} 
                    className="text-slate-800 text-lg"
                  />
                </div>
                <span className="text-2xl font-bold text-white">Monitö</span>
              </Link>
              <p className="text-gray-300 text-sm">
                Cửa hàng thú cưng hàng đầu, nơi bạn có thể tìm thấy người bạn đồng hành lý tưởng.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-amber-300 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Địa chỉ: 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</li>
                <li>Số điện thoại: (028) 1234 5678</li>
                <li>Email: info@monito.com</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Đăng ký nhận tin</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Đăng ký nhận tin tức và ưu đãi mới nhất từ Monitö
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-800"
                />
                <button 
                  type="submit"
                  className="bg-amber-400 text-slate-800 px-4 rounded-r-md font-medium hover:bg-amber-300 transition-colors"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Monitö. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;