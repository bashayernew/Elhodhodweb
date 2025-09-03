import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const WalletPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const walletStats = {
    balance: 1250.50,
    pending: 320.00,
    totalEarned: 8500.00,
    totalSpent: 4500.00
  };

  const transactions = [
    {
      id: 1,
      type: 'credit',
      amount: 800.00,
      description: 'Payment received for House Painting',
      status: 'completed',
      date: '2024-01-20',
      time: '14:30',
      reference: 'TXN-001234'
    },
    {
      id: 2,
      type: 'debit',
      amount: 150.00,
      description: 'Payment for Plumbing Service',
      status: 'completed',
      date: '2024-01-19',
      time: '09:15',
      reference: 'TXN-001233'
    },
    {
      id: 3,
      type: 'credit',
      amount: 1200.00,
      description: 'Payment received for Kitchen Renovation',
      status: 'pending',
      date: '2024-01-18',
      time: '16:45',
      reference: 'TXN-001232'
    },
    {
      id: 4,
      type: 'debit',
      amount: 75.00,
      description: 'Platform fee for service',
      status: 'completed',
      date: '2024-01-17',
      time: '11:20',
      reference: 'TXN-001231'
    },
    {
      id: 5,
      type: 'credit',
      amount: 500.00,
      description: 'Wallet top-up',
      status: 'completed',
      date: '2024-01-16',
      time: '13:10',
      reference: 'TXN-001230'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'failed': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: t('wallet.overview') },
    { id: 'transactions', label: t('wallet.transactions') },
    { id: 'addFunds', label: t('wallet.addFunds') },
    { id: 'withdraw', label: t('wallet.withdraw') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('wallet.title')}
          </h1>
          <p className="text-gray-600">
            {t('wallet.subtitle')}
          </p>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('wallet.availableBalance')}</p>
                <p className="text-2xl font-bold text-gray-900">{walletStats.balance.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">{t('wallet.pendingAmount')}</p>
                <p className="text-2xl font-bold text-gray-900">{walletStats.pending.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">{t('wallet.totalEarned')}</p>
                <p className="text-2xl font-bold text-gray-900">{walletStats.totalEarned.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-gold-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-gold-600" />
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
                <p className="text-sm font-medium text-gray-600">{t('wallet.totalSpent')}</p>
                <p className="text-2xl font-bold text-gray-900">{walletStats.totalSpent.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gold-500 text-gold-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
                    <span>{t('wallet.addFunds')}</span>
                  </button>
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <ArrowUpIcon className="h-5 w-5" />
                    <span>{t('wallet.withdrawFunds')}</span>
                  </button>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('wallet.recentTransactions')}</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowUpIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownIcon className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.date} at {transaction.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} SAR
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{t(`wallet.status.${transaction.status}`)}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('wallet.transactions')}</h3>
                  <div className="flex space-x-2">
                    <select className="input-field-sm">
                      <option>{t('wallet.allTransactions')}</option>
                      <option>{t('wallet.credits')}</option>
                      <option>{t('wallet.debits')}</option>
                    </select>
                    <select className="input-field-sm">
                      <option>{t('wallet.allStatus')}</option>
                      <option>{t('wallet.status.completed')}</option>
                      <option>{t('wallet.status.pending')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowUpIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.reference}</p>
                          <p className="text-sm text-gray-600">{transaction.date} at {transaction.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} SAR
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{t(`wallet.status.${transaction.status}`)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addFunds' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('wallet.addFunds')}</h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wallet.amount')}
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wallet.paymentMethod')}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="paymentMethod" value="card" className="text-gold-600" />
                        <CreditCardIcon className="h-5 w-5 text-gray-400" />
                        <span>{t('wallet.creditCard')}</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="paymentMethod" value="bank" className="text-gold-600" />
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <span>{t('wallet.bankTransfer')}</span>
                      </label>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    {t('wallet.addFunds')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('wallet.withdraw')}</h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wallet.withdrawalAmount')}
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input-field"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {t('wallet.availableForWithdrawal')}: {walletStats.balance} SAR
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wallet.bankAccount')}
                    </label>
                    <select className="input-field">
                      <option>{t('wallet.selectBankAccount')}</option>
                      <option>Riyad Bank - ****1234</option>
                      <option>Al Rajhi Bank - ****5678</option>
                    </select>
                  </div>
                  <button className="btn-secondary w-full">
                    {t('wallet.requestWithdrawal')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
