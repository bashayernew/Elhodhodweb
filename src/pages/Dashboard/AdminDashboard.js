import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  PauseIcon,
  CheckIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  // Support Inbox demo state
  const [supportFilter, setSupportFilter] = useState('open');
  const [tickets, setTickets] = useState(() => ([
    {
      id: 'T-1024', status: 'open', unread: 2, subject: 'Issue placing a bid',
      user: { id: 'u1', name: 'Omar Al-Fulan', role: 'user' },
      context: { url: '/auctions/1', auctionId: 1 },
      messages: [
        { id: 'm1', from: 'user', text: 'I cannot place a bid, button disabled', ts: Date.now()-3600_000 },
        { id: 'm2', from: 'agent', text: 'We are looking into it for you.', ts: Date.now()-1800_000 }
      ],
      notes: []
    },
    {
      id: 'T-1025', status: 'pending', unread: 0, subject: 'Provider verification',
      user: { id: 'p9', name: 'CoolAir MEP', role: 'provider' },
      context: { url: '/providers/1755286739876', providerId: '1755286739876' },
      messages: [
        { id: 'm3', from: 'user', text: 'How long does verification take?', ts: Date.now()-7200_000 }
      ],
      notes: [{ id:'n1', text:'Asked for documents', ts: Date.now()-7100_000, author:'Admin' }]
    }
  ]));
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = tickets.find(t=> t.id===selectedTicketId) || tickets.find(t=> t.status===supportFilter) || tickets[0];
  const [composeText, setComposeText] = useState('');
  const [composeInternal, setComposeInternal] = useState(false);
  // Help Articles demo state
  const [articles, setArticles] = useState([
    { id:'a1', titleEn:'How to place a bid', titleAr:'كيفية المزايدة', tags:['bidding','auctions'], published:true },
    { id:'a2', titleEn:'Contact a provider', titleAr:'التواصل مع المزود', tags:['chat','providers'], published:true }
  ]);
  const [articleDraft, setArticleDraft] = useState({ id:'', titleEn:'', titleAr:'', tags:'', published:true });

  const stats = {
    totalUsers: 1250,
    totalProviders: 340,
    pendingApprovals: 15,
    totalRevenue: 45000,
    activeListings: 890,
    totalTransactions: 2340,
    disputes: 8,
    complaints: 23
  };

  const tabs = [
    { id: 'overview', label: t('dashboard.overview'), icon: HomeIcon },
    { id: 'users', label: t('dashboard.users'), icon: UsersIcon },
    { id: 'providers', label: t('dashboard.providers'), icon: UserGroupIcon },
    { id: 'approvals', label: t('dashboard.approvals'), icon: ShieldCheckIcon },
    { id: 'analytics', label: t('dashboard.analytics'), icon: ChartBarIcon },
    { id: 'disputes', label: t('dashboard.disputes'), icon: ExclamationTriangleIcon },
    { id: 'support', label: 'Support Inbox', icon: ChatBubbleLeftRightIcon },
    { id: 'help', label: 'Help Articles', icon: DocumentTextIcon },
    { id: 'supportSettings', label: 'Support Settings', icon: CogIcon },
    { id: 'adminNotifications', label: 'Notifications', icon: BellIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.adminDashboard')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.platformManagement')} - {t('dashboard.adminPanel')}
          </p>
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
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalUsers')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Professionals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProviders.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingApprovals')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} SAR</p>
              </div>
              <div className="p-3 bg-gold-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.activeListings')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalTransactions')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.disputes')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disputes}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.complaints')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complaints}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button className="btn-primary flex items-center justify-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{t('dashboard.reviewApprovals')}</span>
                  </button>
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span>{t('dashboard.resolveDisputes')}</span>
                  </button>
                  <button className="btn-outline flex items-center justify-center space-x-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span>{t('dashboard.viewAnalytics')}</span>
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New provider registration: Ahmed Hassan</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Payment dispute reported for Order #1234</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New user registration: Fatima Al-Zahra</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Complaint filed against provider: Omar Khalil</span>
                    </div>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.platformHealth')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.serverStatus')}</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {t('dashboard.online')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.databaseStatus')}</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {t('dashboard.online')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.paymentGateway')}</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {t('dashboard.online')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.quickStats')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.todayUsers')}</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.todayTransactions')}</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('dashboard.todayRevenue')}</span>
                        <span className="font-medium">2,450 SAR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.users')}</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder={t('dashboard.searchUsers')}
                      className="input-field-sm"
                    />
                    <select className="input-field-sm">
                      <option>{t('dashboard.allUsers')}</option>
                      <option>{t('dashboard.activeUsers')}</option>
                      <option>{t('dashboard.suspendedUsers')}</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.usersContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.providers')}</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder={t('dashboard.searchProviders')}
                      className="input-field-sm"
                    />
                    <select className="input-field-sm">
                      <option>All Professionals</option>
                      <option>Verified Professionals</option>
                      <option>Pending Professionals</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.providersContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.approvals')}</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.approvalsContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.analytics')}</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.analyticsContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'disputes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.disputes')}</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.disputesContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.settings')}</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600">{t('dashboard.settingsContent')}</p>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Inbox */}
                <div className="lg:col-span-1 bg-white border rounded-lg overflow-hidden">
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="font-medium">Inbox</div>
                    <div className="flex gap-1">
                      {['open','pending','resolved','snoozed'].map((s)=> (
                        <button key={s} onClick={()=>{ setSupportFilter(s); setSelectedTicketId(null); }} className={`px-2 py-1 text-xs rounded-full border ${supportFilter===s?'bg-gold-50 border-gold-300 text-gold-700':'bg-white text-gray-700 border-gray-300'}`}>{s[0].toUpperCase()+s.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y max-h-[60vh] overflow-auto">
                    {tickets.filter(t=> supportFilter==='all' ? true : t.status===supportFilter).map((t)=> (
                      <button key={t.id} onClick={()=> setSelectedTicketId(t.id)} className={`w-full text-left px-3 py-2 ${selectedTicket?.id===t.id?'bg-gold-50':''}`}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{t.subject}</div>
                          {t.unread>0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{t.unread}</span>}
                        </div>
                        <div className="text-xs text-gray-500">{t.user.name} • {t.user.role}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation */}
                <div className="lg:col-span-2 bg-white border rounded-lg flex flex-col">
                  {!selectedTicket ? (
                    <div className="p-6 text-sm text-gray-500">Select a ticket</div>
                  ) : (
                    <>
                      <div className="p-3 border-b flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedTicket.subject}</div>
                          <div className="text-xs text-gray-500">{selectedTicket.user.name} • {selectedTicket.user.role}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-outline text-xs" onClick={()=> alert('Assigned to you')}>Assign to me</button>
                          <button className="btn-outline text-xs" onClick={()=> setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, status:'snoozed' } : t))}><PauseIcon className="w-4 h-4"/> Snooze</button>
                          <button className="btn-outline text-xs" onClick={()=> setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, status:'resolved' } : t))}><CheckIcon className="w-4 h-4"/> Resolve</button>
                        </div>
                      </div>
                      <div className="p-3 border-b text-xs text-gray-600 flex flex-wrap gap-2">
                        <a className="underline" href={selectedTicket.context?.url || '#'} target="_blank" rel="noreferrer">Open context</a>
                        {selectedTicket.context?.auctionId && <a className="underline" href={`/auctions/${selectedTicket.context.auctionId}`}>Auction</a>}
                        {selectedTicket.context?.providerId && <a className="underline" href={`/providers/${selectedTicket.context.providerId}`}>Provider</a>}
                        {selectedTicket.user?.id && <a className="underline" href={`/users/${selectedTicket.user.id}`}>User profile</a>}
                      </div>
                      <div className="flex-1 overflow-auto p-4 space-y-3">
                        {selectedTicket.messages.map(m=> (
                          <div key={m.id} className={`max-w-[80%] ${m.from==='agent'?'ml-auto':''}`}>
                            <div className={`${m.from==='agent'?'bg-gold-50':'bg-gray-100'} rounded-lg px-3 py-2 text-sm`}>{m.text}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{new Date(m.ts).toLocaleString()}</div>
                          </div>
                        ))}
                        {selectedTicket.notes?.map(n=> (
                          <div key={n.id} className="max-w-[80%] ml-auto">
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2 text-xs">Internal note: {n.text}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{new Date(n.ts).toLocaleString()} • {n.author}</div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <label className="inline-flex items-center gap-1"><input type="checkbox" checked={composeInternal} onChange={(e)=> setComposeInternal(e.target.checked)} /> Internal note</label>
                          <div className="flex items-center gap-2">
                            <button className="btn-outline text-xs" onClick={()=> setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, status:'open' } : t))}>Mark Open</button>
                            <button className="btn-outline text-xs" onClick={()=> setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, status:'pending' } : t))}>Mark Pending</button>
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="btn-outline cursor-pointer text-xs"><PaperClipIcon className="w-4 h-4"/> Attach<input type="file" className="hidden" multiple /></label>
                          <textarea rows={2} value={composeText} onChange={(e)=> setComposeText(e.target.value)} className="input-field flex-1" placeholder={composeInternal? 'Write an internal note...' : 'Write a reply...'} />
                          <button className="btn-primary" onClick={()=>{
                            if (!composeText.trim()) return;
                            if (composeInternal) {
                              setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, notes:[...(t.notes||[]), { id: 'n'+Date.now(), text: composeText, ts: Date.now(), author: 'Admin' }] } : t));
                            } else {
                              setTickets(prev=> prev.map(t=> t.id===selectedTicket.id? { ...t, messages:[...t.messages, { id: 'm'+Date.now(), from: 'agent', text: composeText, ts: Date.now() }] } : t));
                            }
                            setComposeText('');
                          }}><PaperAirplaneIcon className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 bg-white border rounded-lg p-4">
                  <div className="font-medium mb-2">Articles</div>
                  <div className="space-y-2 max-h-[60vh] overflow-auto">
                    {articles.map(a=> (
                      <button key={a.id} onClick={()=> setArticleDraft({ id:a.id, titleEn:a.titleEn, titleAr:a.titleAr, tags:a.tags.join(','), published:a.published })} className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50">
                        <div className="text-sm font-medium">{a.titleEn}</div>
                        <div className="text-xs text-gray-500">{a.published? 'Published':'Unpublished'} • {a.tags.join(', ')}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white border rounded-lg p-4 space-y-3">
                  <div className="font-medium">{articleDraft.id? 'Edit Article' : 'New Article'}</div>
                  <div className="grid grid-cols-1 gap-2">
                    <input className="input-field" placeholder="Title (English)" value={articleDraft.titleEn} onChange={(e)=> setArticleDraft({ ...articleDraft, titleEn:e.target.value })} />
                    <input className="input-field" placeholder="العنوان (Arabic)" value={articleDraft.titleAr} onChange={(e)=> setArticleDraft({ ...articleDraft, titleAr:e.target.value })} />
                    <input className="input-field" placeholder="tags (comma separated)" value={articleDraft.tags} onChange={(e)=> setArticleDraft({ ...articleDraft, tags:e.target.value })} />
                    <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={articleDraft.published} onChange={(e)=> setArticleDraft({ ...articleDraft, published:e.target.checked })}/> Published</label>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary" onClick={()=>{
                      if (!articleDraft.titleEn) return;
                      if (articleDraft.id) {
                        setArticles(prev=> prev.map(a=> a.id===articleDraft.id ? { ...a, titleEn:articleDraft.titleEn, titleAr:articleDraft.titleAr, tags: articleDraft.tags.split(',').map(s=>s.trim()).filter(Boolean), published:articleDraft.published } : a));
                      } else {
                        setArticles(prev=> [{ id:'a'+Date.now(), titleEn:articleDraft.titleEn, titleAr:articleDraft.titleAr, tags:articleDraft.tags.split(',').map(s=>s.trim()).filter(Boolean), published:articleDraft.published }, ...prev]);
                      }
                      setArticleDraft({ id:'', titleEn:'', titleAr:'', tags:'', published:true });
                    }}>Save</button>
                    {articleDraft.id && <button className="btn-outline" onClick={()=> setArticles(prev=> prev.filter(a=> a.id!==articleDraft.id))}>Delete</button>}
                    <button className="btn-outline" onClick={()=> setArticleDraft({ id:'', titleEn:'', titleAr:'', tags:'', published:true })}>Clear</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'supportSettings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="font-medium">Business Hours</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-field" type="time" defaultValue="09:00" />
                    <input className="input-field" type="time" defaultValue="18:00" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Holidays (comma separated dates)</label>
                    <input className="input-field" placeholder="2025-01-01, 2025-02-25" />
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="font-medium">Auto Replies</div>
                  <textarea className="input-field" rows={3} placeholder="After-hours message..." />
                  <textarea className="input-field" rows={3} placeholder="First response message..." />
                </div>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="font-medium">Routing Rules</div>
                  <input className="input-field" placeholder="e.g. billing:* -> @fatima" />
                  <input className="input-field" placeholder="e.g. Arabic -> @ahmed" />
                </div>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="font-medium">Escalation</div>
                  <label className="text-sm">Alert if no reply after (minutes)</label>
                  <input className="input-field w-40" type="number" defaultValue={30} />
                  <div className="font-medium mt-2">Widget Text</div>
                  <input className="input-field" placeholder="Widget title" defaultValue="Help Center" />
                  <input className="input-field" placeholder="Welcome message" defaultValue="How can we help?" />
                </div>
              </div>
            )}

            {activeTab === 'adminNotifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="font-medium mb-2">Alerts</div>
                  <label className="flex items-center justify-between py-2 text-sm"><span>New support request</span><input type="checkbox" defaultChecked /></label>
                  <label className="flex items-center justify-between py-2 text-sm"><span>New message in assigned ticket</span><input type="checkbox" defaultChecked /></label>
                  <label className="flex items-center justify-between py-2 text-sm"><span>Escalation alerts</span><input type="checkbox" defaultChecked /></label>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="font-medium mb-2">Channels</div>
                  <label className="flex items-center justify-between py-2 text-sm"><span>Email</span><input type="checkbox" defaultChecked /></label>
                  <label className="flex items-center justify-between py-2 text-sm"><span>WhatsApp</span><input type="checkbox" defaultChecked /></label>
                  <label className="flex items-center justify-between py-2 text-sm"><span>SMS</span><input type="checkbox" /></label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
