import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  WrenchScrewdriverIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  LanguageIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  WalletIcon,
  Cog6ToothIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../../utils/api';
import HelpWidget from '../Help/HelpWidget';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const { user, userType, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Services', href: '/services', icon: WrenchScrewdriverIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Auctions', href: '/auctions', icon: WrenchScrewdriverIcon },
    { name: 'About', href: '/about', icon: HomeIcon },
    { name: 'Contact', href: '/contact', icon: ChatBubbleLeftRightIcon },
  ];

  const effectiveRole = user?.role || userType || 'user';
  const profileHref = (user?.role === 'provider') ? '/providers/me' : '/profile';
  const userNavigation = [
    { name: 'Dashboard', href: `/dashboard/${effectiveRole}`, icon: UserIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Wallet', href: '/wallet', icon: WalletIcon },
    { name: 'Profile', href: profileHref, icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  useEffect(() => {
    const onClickAway = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('click', onClickAway);
    return () => document.removeEventListener('click', onClickAway);
  }, []);

  useEffect(() => {
    // Demo: seed a welcome notification in development so the dropdown isn't empty
    if (process.env.NODE_ENV !== 'production') {
      setNotifications((prev) => {
        if (prev.length) return prev;
        return [
          {
            id: 'welcome',
            title: 'Welcome to HodHod',
            body: 'Thanks for signing up! Explore services and post your first request.',
            read: false,
            time: 'just now',
          },
        ];
      });
    }
  }, []);

  useEffect(() => {
    // Fetch real notifications when user is logged in
    const fetchNotifications = async () => {
      try {
        if (!user) return;
        const res = await apiFetch('/notifications?limit=20');
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((n) => ({
            id: n.id,
            title: n.title || 'Notification',
            body: n.body || '',
            read: !!n.isRead,
            time: new Date(n.createdAt).toLocaleString()
          }));
          setNotifications(mapped);
        }
      } catch (_) {
        // Keep silent in UI; demo seed remains
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-hodhod sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark rounded-hodhod flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-hodhod-black font-cairo">
                HodHod
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-hodhod-gold bg-hodhod-gold-light'
                      : 'text-hodhod-gray-600 hover:text-hodhod-gold hover:bg-hodhod-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 text-hodhod-gray-600 hover:text-hodhod-gold transition-colors"
              >
                <LanguageIcon className="w-5 h-5" />
              </button>

              {user ? (
                <>
                  {/* Dashboard quick access */}
                  <Link to={`/dashboard/${effectiveRole}`} className={`p-2 transition-colors ${isActive(`/dashboard/${effectiveRole}`) ? 'text-hodhod-gold' : 'text-hodhod-gray-600 hover:text-hodhod-gold'}`} aria-label="Dashboard">
                    <Squares2X2Icon className="w-5 h-5" />
                  </Link>
                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setIsNotificationsOpen((v) => !v)}
                      className="p-2 text-hodhod-gray-600 hover:text-hodhod-gold transition-colors relative"
                      aria-label="Notifications"
                      aria-haspopup="true"
                      aria-expanded={isNotificationsOpen}
                    >
                      <BellIcon className="w-5 h-5" />
                      {notifications.some((n) => !n.read) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-hodhod-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-medium">{t('notifications.title') || 'Notifications'}</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={async () => {
                                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                                try { await apiFetch('/notifications/read-all', { method: 'POST' }); } catch (_) {}
                              }}
                              className="text-xs text-hodhod-gold hover:text-hodhod-gold-dark"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">No notifications yet</div>
                          ) : (
                            notifications.map((n) => (
                              <button
                                key={n.id}
                                onClick={async () => {
                                  setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
                                  try { await apiFetch(`/notifications/${n.id}/read`, { method: 'POST' }); } catch (_) {}
                                }}
                                className={`w-full text-left px-4 py-3 text-sm border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-hodhod-gold-light/30'}`}
                              >
                                <div className="font-medium text-hodhod-black">{n.title}</div>
                                {n.body && <div className="text-gray-600 mt-0.5">{n.body}</div>}
                                {n.time && <div className="text-xs text-gray-400 mt-1">{n.time}</div>}
                              </button>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 text-right border-t border-gray-100">
                          <Link to="/messages" className="text-xs text-hodhod-gold hover:text-hodhod-gold-dark">View messages</Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages quick access */}
                  <Link to="/messages" className={`p-2 transition-colors relative ${isActive('/messages') ? 'text-hodhod-gold' : 'text-hodhod-gray-600 hover:text-hodhod-gold'}`}>
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </Link>

                  {/* Favorites quick access */}
                  <Link to="/favorites" className={`p-2 transition-colors relative ${isActive('/favorites') ? 'text-hodhod-gold' : 'text-hodhod-gray-600 hover:text-hodhod-gold'}`}>
                    <HeartIcon className="w-5 h-5" />
                  </Link>

                  {/* User Menu (desktop) */}
                  <div className="hidden md:flex items-center" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen((v) => !v)}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-2 py-1 rounded-lg hover:bg-hodhod-gray-50"
                    >
                      {user.avatar ? (
                        <img className="w-8 h-8 rounded-full" src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center text-xs font-semibold">
                          {(user.name || 'U').slice(0,1)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-hodhod-black max-w-[120px] truncate">{user.name}</span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-4 top-14 w-56 bg-white border border-hodhod-gray-200 rounded-lg shadow-lg py-2 z-50">
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-hodhod-gray-50 ${
                              isActive(item.href) ? 'text-hodhod-gold' : 'text-hodhod-gray-700'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('auth.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex space-x-2 rtl:space-x-reverse">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-hodhod-gray-600 hover:text-hodhod-gold transition-colors"
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium bg-hodhod-gold text-white rounded-lg hover:bg-hodhod-gold-dark transition-colors"
                  >
                    {t('auth.signup')}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-hodhod-gray-600 hover:text-hodhod-gold transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-hodhod-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-hodhod-gold bg-hodhod-gold-light'
                      : 'text-hodhod-gray-600 hover:text-hodhod-gold hover:bg-hodhod-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-hodhod-gray-200 pt-2 mt-2">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-hodhod-gold bg-hodhod-gold-light'
                            : 'text-hodhod-gray-600 hover:text-hodhod-gold hover:bg-hodhod-gray-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-hodhod-gray-200 z-50">
          <div className="flex justify-around">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-hodhod-gold'
                    : 'text-hodhod-gray-600 hover:text-hodhod-gold'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Footer */}
      <footer className="mt-10 bg-gradient-to-b from-white to-hodhod-gold-light/20 border-t border-hodhod-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark rounded-hodhod flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-bold text-hodhod-black font-cairo">HodHod</span>
              </Link>
              <p className="mt-3 text-sm text-hodhod-gray-600 max-w-sm">Kuwait’s construction marketplace connecting buyers, suppliers, and contractors with transparent pricing and fast deals.</p>
            </div>

            <div>
              <div className="font-semibold text-hodhod-black mb-3">Quick Links</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-hodhod-gray-600 hover:text-hodhod-gold">Home</Link></li>
                <li><Link to="/about" className="text-hodhod-gray-600 hover:text-hodhod-gold">About</Link></li>
                <li><Link to="/contact" className="text-hodhod-gray-600 hover:text-hodhod-gold">Contact</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-hodhod-black mb-3">Marketplace</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-hodhod-gray-600 hover:text-hodhod-gold">Services</Link></li>
                <li><Link to="/products" className="text-hodhod-gray-600 hover:text-hodhod-gold">Products</Link></li>
                <li><Link to="/auctions" className="text-hodhod-gray-600 hover:text-hodhod-gold">Auctions</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-hodhod-black mb-3">Contact</div>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:+96598097532" className="text-hodhod-gray-600 hover:text-hodhod-gold">+965 9809 7532</a></li>
                <li><a href="mailto:mishref525@gmail.com" className="text-hodhod-gray-600 hover:text-hodhod-gold">mishref525@gmail.com</a></li>
                <li><a href="https://wa.me/96598097532" target="_blank" rel="noreferrer" className="text-hodhod-gray-600 hover:text-hodhod-gold">WhatsApp Chat</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-hodhod-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-xs text-hodhod-gray-600">© {new Date().getFullYear()} HodHod — All rights reserved.</div>
            <div className="text-xs text-hodhod-gray-600 flex gap-4">
              <Link to="/about" className="hover:text-hodhod-gold">About</Link>
              <Link to="/contact" className="hover:text-hodhod-gold">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Site-wide floating help widget */}
      <HelpWidget />
    </div>
  );
};

export default Layout;
