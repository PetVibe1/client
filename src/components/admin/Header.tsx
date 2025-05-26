import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faSignOutAlt, faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUnreadComments } from '../../utils/api';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCommentsCount = async () => {
      if (user?.role === 'admin') {
        try {
          const comments = await getUnreadComments();
          setUnreadCount(comments.length);
        } catch (error) {
          console.error('Error fetching unread comments count:', error);
        }
      }
    };
    
    fetchUnreadCommentsCount();
    
    // Set up interval to refresh count every minute
    const interval = setInterval(fetchUnreadCommentsCount, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm fixed top-0 right-0 left-64 z-20">
      <div className="flex-1">
        {/* Left side content if needed */}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        {user?.role === 'admin' && (
          <Link href="/admin/comments">
            <a className="relative p-2 text-gray-500 hover:text-[#003459] transition-colors">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </a>
          </Link>
        )}
        
        {/* User profile dropdown */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-10 h-10 bg-[#003459] text-white rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span className="text-gray-700 font-medium hidden md:block">
              {user?.name || 'Admin User'}
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100">
              <Link href="/admin/profile">
                <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                  Profile
                </a>
              </Link>
              <button 
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-gray-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 