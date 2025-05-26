import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Cog6ToothIcon as CogIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ProfileDropdown: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center justify-center rounded-full h-10 w-10 bg-amber-100 hover:bg-amber-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
          <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-3 bg-gray-50">
              <p className="text-sm text-slate-500">Đăng nhập với</p>
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.email || 'example@email.com'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'Quản trị viên' : 'Người dùng'}
              </p>
            </div>
            <div className="border-t border-gray-100"></div>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link
                  href="/profile"
                  className={classNames(
                    active ? 'bg-amber-50 text-slate-900' : 'text-slate-700',
                    'flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-3 h-5 w-5 text-amber-500" aria-hidden="true" />
                  Hồ sơ cá nhân
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link
                  href="/profile/settings"
                  className={classNames(
                    active ? 'bg-amber-50 text-slate-900' : 'text-slate-700',
                    'flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <CogIcon className="mr-3 h-5 w-5 text-amber-500" aria-hidden="true" />
                  Cài đặt tài khoản
                </Link>
              )}
            </Menu.Item>
            
            {/* Admin links */}
            {isAdmin && (
              <>
                <div className="border-t border-gray-100"></div>
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <Link
                      href="/admin"
                      className={classNames(
                        active ? 'bg-amber-50 text-slate-900' : 'text-slate-700',
                        'flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <svg
                        className="mr-3 h-5 w-5 text-amber-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                      Trang quản trị
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <Link
                      href="/admin/pets"
                      className={classNames(
                        active ? 'bg-amber-50 text-slate-900' : 'text-slate-700',
                        'flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <svg
                        className="mr-3 h-5 w-5 text-amber-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Quản lý thú cưng
                    </Link>
                  )}
                </Menu.Item>
              </>
            )}
            
            <div className="border-t border-gray-100"></div>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={classNames(
                    active ? 'bg-amber-50 text-slate-900' : 'text-slate-700',
                    'flex items-center w-full text-left px-4 py-2 text-sm',
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-amber-500" aria-hidden="true" />
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ProfileDropdown; 