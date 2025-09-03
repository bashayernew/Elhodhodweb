import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserIcon,
  StarIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  PhotoIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UsersIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import ServicesManager from '../../components/Dashboard/ServicesManager';
import ProductsManager from '../../components/Dashboard/ProductsManager';
import AuctionsManager from '../../components/Dashboard/AuctionsManager';
import OrdersManager from '../../components/Dashboard/OrdersManager';
import QuotesManager from '../../components/Dashboard/QuotesManager';
import CalendarManager from '../../components/Dashboard/CalendarManager';
import CustomersManager from '../../components/Dashboard/CustomersManager';
import MarketingManager from '../../components/Dashboard/MarketingManager';
import AnalyticsManager from '../../components/Dashboard/AnalyticsManager';
import FinanceManager from '../../components/Dashboard/FinanceManager';
import CompanyTeamManager from '../../components/Dashboard/CompanyTeamManager';
import SettingsManager from '../../components/Dashboard/SettingsManager';
import { apiFetch } from '../../utils/api';

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isCompany = (user?.subrole || user?.providerType) === 'company';
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState({ jobs: [], customers: [], payouts: [] });

  const stats = {
    totalListings: 12,
    activeListings: 8,
    completedOrders: 45,
    totalEarnings: 12500,
    pendingPayments: 3200,
    averageRating: 4.8,
    totalReviews: 67,
    openRequests: 15
  };

  const tabs = useMemo(() => (
    isCompany ? [
      { id: 'overview', label: 'Overview', icon: HomeIcon },
      // Catalog
      { id: 'catalog_services', label: 'Catalog • Services', icon: WrenchScrewdriverIcon },
      { id: 'catalog_products', label: 'Catalog • Products', icon: TagIcon },
      { id: 'catalog_auctions', label: 'Catalog • Auctions', icon: ClipboardDocumentListIcon },
      { id: 'catalog_portfolio', label: 'Catalog • Portfolio', icon: PhotoIcon },
      // Sales & Ops
      { id: 'sales_orders', label: 'Sales & Ops • Orders', icon: ShoppingBagIcon },
      { id: 'sales_quotes', label: 'Sales & Ops • Quotes', icon: ClipboardDocumentListIcon },
      { id: 'sales_calendar', label: 'Sales & Ops • Calendar', icon: CalendarDaysIcon },
      { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
      // Customers
      { id: 'customers', label: 'Customers', icon: UsersIcon },
      // Marketing
      { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
      // Analytics
      { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
      // Finance
      { id: 'finance', label: 'Finance', icon: BanknotesIcon },
      // Company & Team
      { id: 'company_team', label: 'Company & Team', icon: BuildingOfficeIcon },
      // Settings
      { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
    ] : [
      { id: 'overview', label: 'Overview', icon: HomeIcon },
      { id: 'listings', label: 'My Listings', icon: ClipboardDocumentListIcon },
      { id: 'requests', label: 'Open Requests', icon: EyeIcon },
      { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
      { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
      { id: 'earnings', label: 'Earnings', icon: CurrencyDollarIcon },
      { id: 'profile', label: 'Profile', icon: UserIcon }
    ]
  ), [isCompany, t]);

  useEffect(() => {
    if (!isCompany) return;
    let mounted = true;
    const load = async () => {
      try {
        const [cal, cus, fin] = await Promise.allSettled([
          apiFetch('/calendar'),
          apiFetch('/customers?limit=5'),
          apiFetch('/finance/summary'),
        ]);
        const jobs = cal.status === 'fulfilled' ? (cal.value?.data || []) : [];
        const customers = cus.status === 'fulfilled' ? (cus.value?.data || []) : [];
        const payouts = fin.status === 'fulfilled' ? (fin.value?.data?.payouts || []) : [];
        if (mounted) setOverviewData({ jobs, customers, payouts });
      } catch (_) {
        if (mounted) setOverviewData({ jobs: [], customers: [], payouts: [] });
      }
    };
    load();
    return () => { mounted = false; };
  }, [isCompany]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
          <p className="text-gray-600">Welcome back — manage your business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
              </div>
              <div className="p-3 bg-gold-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total earnings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <StarIcon className="h-5 w-5 text-yellow-400 ml-1" />
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openRequests}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-gold-500 text-gold-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button className="btn-primary flex items-center justify-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>New Service</span>
                  </button>
                  <button className="btn-outline flex items-center justify-center space-x-2">
                    <EyeIcon className="h-5 w-5" />
                    <span>Open Requests</span>
                  </button>
                </div>

                {/* Overview Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Next Jobs</h3>
                    {overviewData.jobs.slice(0,3).map((j) => (
                      <div key={j.id} className="text-sm text-gray-700 flex justify-between py-1 border-b last:border-b-0">
                        <span>{j.date} {j.time} • {j.title}</span>
                        <span className="text-gray-500">{j.technician || '—'}</span>
                      </div>
                    ))}
                    {overviewData.jobs.length === 0 && <div className="text-sm text-gray-500">No jobs scheduled.</div>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Customers</h3>
                    {overviewData.customers.slice(0,3).map((c) => (
                      <div key={c.id} className="text-sm text-gray-700 flex justify-between py-1 border-b last:border-b-0">
                        <span>{c.name}</span>
                        <span className="text-gray-500">Orders: {c.orders ?? 0}</span>
                      </div>
                    ))}
                    {overviewData.customers.length === 0 && <div className="text-sm text-gray-500">No customers yet.</div>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Latest Payouts</h3>
                    {overviewData.payouts.slice(0,3).map((p, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex justify-between py-1 border-b last:border-b-0">
                        <span>{p.date}</span>
                        <span className="text-gray-500">{p.amount} KWD • {p.status}</span>
                      </div>
                    ))}
                    {overviewData.payouts.length === 0 && <div className="text-sm text-gray-500">No payouts yet.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Catalog - Services */}
            {activeTab === 'catalog_services' && (
              <ServicesManager />
            )}

            {/* Catalog - Products */}
            {activeTab === 'catalog_products' && (
              <ProductsManager />
            )}

            {/* Catalog - Auctions */}
            {activeTab === 'catalog_auctions' && (
              <AuctionsManager />
            )}

            {/* Catalog - Portfolio */}
            {activeTab === 'catalog_portfolio' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Portfolio</h3>
                  <button className="btn-primary">Add Project</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(8)].map((_,i)=> <div key={i} className="h-24 rounded bg-gray-100" />)}
                </div>
              </div>
            )}

            {/* Sales & Operations - Orders */}
            {activeTab === 'sales_orders' && (
              <OrdersManager />
            )}

            {/* Sales & Operations - Quotes */}
            {activeTab === 'sales_quotes' && (
              <QuotesManager providerId={user?.id} />
            )}

            {/* Sales & Operations - Calendar */}
            {activeTab === 'sales_calendar' && (
              <CalendarManager providerId={user?.id} />
            )}

            {/* Customers */}
            {activeTab === 'customers' && (
              <CustomersManager />
            )}

            {/* Marketing */}
            {activeTab === 'marketing' && (<MarketingManager />)}

            {/* Analytics */}
            {activeTab === 'analytics' && (<AnalyticsManager />)}

            {/* Finance */}
            {activeTab === 'finance' && (<FinanceManager />)}

            {/* Company & Team */}
            {activeTab === 'company_team' && (<CompanyTeamManager />)}

            {/* Settings */}
            {activeTab === 'settings' && (<SettingsManager />)}
            {!isCompany && activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">Manage and track your listings here.</p>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Requests</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">Review and respond to incoming customer requests.</p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">View and manage your orders.</p>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">Chat with customers and team.</p>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">See your revenue and payouts.</p>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">Update your account and business details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
