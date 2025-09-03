import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const stats = {
    totalRequests: 12,
    activeRequests: 3,
    completedJobs: 8,
    totalSpent: 2450,
    walletBalance: 500
  };

  const recentRequests = [
    {
      id: 1,
      title: 'Kitchen Renovation',
      provider: 'Ahmed Construction',
      status: 'in-progress',
      budget: 2000,
      date: '2024-01-15',
      location: 'Dubai Marina'
    },
    {
      id: 2,
      title: 'Plumbing Repair',
      provider: 'Quick Fix Plumbing',
      status: 'completed',
      budget: 300,
      date: '2024-01-10',
      location: 'Dubai Marina'
    },
    {
      id: 3,
      title: 'Electrical Installation',
      provider: 'Power Solutions',
      status: 'pending',
      budget: 800,
      date: '2024-01-20',
      location: 'Dubai Marina'
    }
  ];

  const recentBids = [
    {
      id: 1,
      requestTitle: 'Kitchen Renovation',
      provider: 'Ahmed Construction',
      amount: 1800,
      message: 'I can complete this project within 2 weeks with high-quality materials.',
      date: '2024-01-16',
      status: 'accepted'
    },
    {
      id: 2,
      requestTitle: 'Kitchen Renovation',
      provider: 'Modern Builders',
      amount: 2200,
      message: 'Professional kitchen renovation with premium finishes.',
      date: '2024-01-16',
      status: 'pending'
    },
    {
      id: 3,
      requestTitle: 'Plumbing Repair',
      provider: 'Quick Fix Plumbing',
      amount: 250,
      message: 'I can fix this issue today. Same day service available.',
      date: '2024-01-11',
      status: 'accepted'
    }
  ];

  const recentMessages = [
    {
      id: 1,
      provider: 'Ahmed Construction',
      lastMessage: 'I will start the work tomorrow at 9 AM.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      provider: 'Quick Fix Plumbing',
      lastMessage: 'Thank you for choosing our services!',
      time: '1 day ago',
      unread: false
    },
    {
      id: 3,
      provider: 'Power Solutions',
      lastMessage: 'Can you provide more details about the electrical requirements?',
      time: '2 days ago',
      unread: false
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in-progress':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'requests', label: 'My Requests', icon: DocumentTextIcon },
    { id: 'bids', label: 'Bids Received', icon: CurrencyDollarIcon },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-hodhod py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-hodhod-black font-cairo mb-2">
                {t('dashboard.user.title')}
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || 'User'}! Here's what's happening with your projects.
              </p>
            </div>
            <Link to="/post-request" className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('dashboard.user.postRequest')}
            </Link>
          </div>
        </div>
      </div>

      <div className="container-hodhod py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card text-center"
          >
            <div className="text-2xl font-bold text-hodhod-gold mb-2">{stats.totalRequests}</div>
            <div className="text-gray-600">Total Requests</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card text-center"
          >
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.activeRequests}</div>
            <div className="text-gray-600">Active Requests</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card text-center"
          >
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.completedJobs}</div>
            <div className="text-gray-600">Completed Jobs</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card text-center"
          >
            <div className="text-2xl font-bold text-hodhod-gold mb-2">${stats.totalSpent}</div>
            <div className="text-gray-600">Total Spent</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card text-center"
          >
            <div className="text-2xl font-bold text-green-600 mb-2">${stats.walletBalance}</div>
            <div className="text-gray-600">Wallet Balance</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-hodhod shadow-hodhod mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-hodhod-gold text-hodhod-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-hodhod-black mb-4">
                    Recent Requests
                  </h3>
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div key={request.id} className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-hodhod-black">{request.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <UserIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {request.provider}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                            {request.location}
                          </div>
                          <div className="font-medium text-hodhod-gold">
                            ${request.budget}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/dashboard/user/requests" className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm">
                    View all requests →
                  </Link>
                </div>

                {/* Recent Bids */}
                <div>
                  <h3 className="text-lg font-semibold text-hodhod-black mb-4">
                    Recent Bids
                  </h3>
                  <div className="space-y-4">
                    {recentBids.map((bid) => (
                      <div key={bid.id} className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-hodhod-black">{bid.requestTitle}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bid.status === 'accepted' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <UserIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {bid.provider}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{bid.message}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{bid.date}</span>
                          <div className="font-medium text-hodhod-gold">
                            ${bid.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/dashboard/user/bids" className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm">
                    View all bids →
                  </Link>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-hodhod-black">
                    My Requests
                  </h3>
                  <Link to="/post-request" className="btn-primary">
                    <PlusIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    New Request
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-hodhod-black mb-2">{request.title}</h4>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
                            <span className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                              {request.provider}
                            </span>
                            <span className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                              {request.location}
                            </span>
                            <span>{request.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <div className="text-right">
                            <div className="font-semibold text-hodhod-gold">${request.budget}</div>
                            <div className="text-xs text-gray-500">Budget</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Link to={`/requests/${request.id}`} className="btn-outline">
                          View Details
                        </Link>
                        <Link to={`/requests/${request.id}/bids`} className="btn-outline">
                          View Bids
                        </Link>
                        {request.status === 'pending' && (
                          <button className="btn-outline text-red-600 hover:bg-red-50">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div>
                <h3 className="text-lg font-semibold text-hodhod-black mb-6">
                  Bids Received
                </h3>
                <div className="space-y-4">
                  {recentBids.map((bid) => (
                    <div key={bid.id} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-hodhod-black mb-2">{bid.requestTitle}</h4>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
                            <span className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                              {bid.provider}
                            </span>
                            <span>{bid.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-hodhod-gold">${bid.amount}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bid.status === 'accepted' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{bid.message}</p>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {bid.status === 'pending' && (
                          <>
                            <button className="btn-primary">Accept Bid</button>
                            <button className="btn-outline">Reject</button>
                          </>
                        )}
                        <Link to={`/providers/${bid.provider}`} className="btn-outline">
                          View Professional
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-semibold text-hodhod-black mb-6">
                  Messages
                </h3>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-10 h-10 bg-hodhod-gold-light rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-hodhod-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium text-hodhod-black">{message.provider}</h4>
                            <p className="text-sm text-gray-600">{message.lastMessage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{message.time}</div>
                          {message.unread && (
                            <div className="w-3 h-3 bg-hodhod-gold rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/messages" className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm">
                  View all messages →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
