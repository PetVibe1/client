import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faPaw, 
  faCalendarAlt, 
  faShoppingCart, 
  faChartBar, 
  faSignOutAlt,
  faComment 
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { getUnreadComments } from '../../utils/api';

const Sidebar = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread comments count
  useEffect(() => {
    const fetchUnreadCommentsCount = async () => {
      try {
        const comments = await getUnreadComments();
        setUnreadCount(comments.length);
      } catch (error) {
        console.error('Error fetching unread comments count:', error);
      }
    };
    
    fetchUnreadCommentsCount();
    
    // Set up interval to refresh count every 5 minutes
    const interval = setInterval(fetchUnreadCommentsCount, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const menuItems = [
    { name: 'Dashboard', icon: faHome, href: '/admin' },
    { name: 'Users', icon: faUsers, href: '/admin/users' },
    { name: 'Pets', icon: faPaw, href: '/admin/pets' },
    { name: 'Appointments', icon: faCalendarAlt, href: '/admin/appointments' },
    { name: 'Orders', icon: faShoppingCart, href: '/admin/orders' },
    { name: 'Reports', icon: faChartBar, href: '/admin/reports' },
    { 
      name: 'Comments', 
      icon: faComment, 
      href: '/admin/comments',
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];
  
  return (
    <div className={`bg-[#003459] text-white h-screen ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 fixed left-0 top-0 z-30`}>
      <nav className="mt-10">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm ${
                  router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                } rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="relative">
                  <FontAwesomeIcon icon={item.icon} className={`${isCollapsed ? 'text-xl' : 'mr-4'}`} />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                {!isCollapsed && <span>{item.name}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 