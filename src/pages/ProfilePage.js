import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  CameraIcon,
  PencilIcon,
  ShieldCheckIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { subscribeUserToPush } from '../utils/push';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, userType, updateUser } = useAuth();
  const role = user?.role || userType || 'user';
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    language: user?.language || 'en',
    currency: user?.currency || 'KWD',
    timezone: user?.timezone || 'Asia/Kuwait',
    addresses: Array.isArray(user?.addresses) ? user.addresses : []
  });

  const privacyKey = user?.id ? `hodhod_privacy_${user.id}` : 'hodhod_privacy_default';
  const [privacy, setPrivacy] = useState(() => {
    try { return JSON.parse(localStorage.getItem(privacyKey) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    // Keep formData in sync if user changes (e.g., after real login)
    setFormData((prev) => ({
      ...prev,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      language: user?.language || 'en',
      currency: user?.currency || 'KWD',
      timezone: user?.timezone || 'Asia/Kuwait',
      addresses: Array.isArray(user?.addresses) ? user.addresses : []
    }));
    try { setPrivacy(JSON.parse(localStorage.getItem(privacyKey) || '{}')); } catch {}
  }, [user]);

  // Seed demo data for customers if empty
  useEffect(() => {
    if (!user?.id) return;
    const role = user?.role || userType || 'user';
    if (role !== 'user') return;
    const seedKey = `hodhod_demo_customer_seed_${user.id}`;
    const already = localStorage.getItem(seedKey);
    const needsSeed = !(user?.firstName) || !(Array.isArray(user?.addresses) && user.addresses.length);
    if (!already && needsSeed) {
      const demo = {
        firstName: user.firstName || 'Omar',
        lastName: user.lastName || 'Al-Fulan',
        email: user.email || 'omar@example.com',
        phone: user.phone || '+96550000000',
        location: user.location || 'Kuwait City',
        bio: user.bio || 'Homeowner who loves quick, quality service.',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400&auto=format&fit=crop',
        language: user.language || 'en',
        currency: user.currency || 'KWD',
        timezone: user.timezone || 'Asia/Kuwait',
        addresses: user.addresses?.length ? user.addresses : [
          { id: 'addr-home', label: 'Home', line1: 'Block 3, Street 12, House 10', city: 'Salmiya', phone: '+96551111111' },
          { id: 'addr-office', label: 'Office', line1: 'Tower 5, Floor 8, Office 804', city: 'Sharq', phone: '+96552222222' },
        ],
      };
      updateUser({ ...user, ...demo });
      localStorage.setItem(seedKey, '1');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const savePrivacy = () => {
    try { localStorage.setItem(privacyKey, JSON.stringify(privacy)); } catch {}
  };

  const addAddress = () => {
    setFormData((prev) => ({ ...prev, addresses: [...(prev.addresses||[]), { id: Date.now().toString(), label: '', line1: '', city: '', phone: '' }] }));
    setIsEditing(true);
  };
  const updateAddress = (idx, patch) => {
    setFormData((prev) => {
      const next = [...(prev.addresses||[])];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, addresses: next };
    });
  };
  const deleteAddress = (idx) => {
    setFormData((prev) => {
      const next = [...(prev.addresses||[])];
      next.splice(idx,1);
      return { ...prev, addresses: next };
    });
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const tabs = React.useMemo(() => {
    const base = [
      { id: 'personal', label: t('profile.personalInfo'), icon: UserIcon },
      { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
      { id: 'security', label: t('profile.security'), icon: ShieldCheckIcon },
      { id: 'notifications', label: t('profile.notifications'), icon: BellIcon },
      { id: 'preferences', label: t('profile.preferences'), icon: Cog6ToothIcon },
    ];
    // Only customers see customer-only tabs
    if (role === 'user') {
      base.unshift({ id: 'addresses', label: 'Addresses', icon: Cog6ToothIcon });
      base.unshift({ id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon });
      base.push({ id: 'orders', label: 'Orders', icon: Squares2X2Icon });
      base.push({ id: 'saved', label: 'Saved', icon: HeartIcon });
      base.push({ id: 'bids', label: 'Bids', icon: Squares2X2Icon });
      base.push({ id: 'posts', label: 'My Posts', icon: Cog6ToothIcon });
    }
    return base;
  }, [t, role]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-2">{t('profile.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
            <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-8">
              <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-24 h-24 object-cover" />
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent((formData.firstName||'')+ ' '+(formData.lastName||''))}&background=D4AF37&color=fff`} alt="Avatar" className="w-24 h-24 object-cover" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                    <CameraIcon className="w-4 h-4 text-gold-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 4 * 1024 * 1024) { alert('Max 4MB'); return; }
                      const valid = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
                      if (!valid.includes(file.type)) { alert('Use jpeg/png/webp'); return; }

                      // Read file, convert HEIC→JPEG if needed, then crop square via canvas
                      const convertIfNeeded = async (blob) => {
                        if (blob.type === 'image/heic' || blob.type === 'image/heif') {
                          // Simple fallback: attempt decode via browser; if not supported, abort
                          try {
                            const imgBitmap = await createImageBitmap(blob);
                            const canvas = document.createElement('canvas');
                            canvas.width = imgBitmap.width; canvas.height = imgBitmap.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(imgBitmap, 0, 0);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                            const res = await fetch(dataUrl);
                            return await res.blob();
                          } catch { return blob; }
                        }
                        return blob;
                      };

                      const toSquareJpeg = async (blob) => {
                        const img = document.createElement('img');
                        const url = URL.createObjectURL(blob);
                        await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
                        const size = Math.min(img.width, img.height);
                        const sx = Math.floor((img.width - size) / 2);
                        const sy = Math.floor((img.height - size) / 2);
                        const canvas = document.createElement('canvas');
                        canvas.width = 512; canvas.height = 512; // square thumbnail
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                        URL.revokeObjectURL(url);
                        const r = await fetch(dataUrl);
                        return await r.blob();
                      };

                      try {
                        const prepared = await convertIfNeeded(file);
                        const square = await toSquareJpeg(prepared);

                        // Try presigned S3 first
                        const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
                        const pres = await fetch(`${base}/upload/presign?filename=avatar.jpg&type=${encodeURIComponent(square.type)}`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` }
                        }).then(r => r.json());

                        if (pres?.uploadUrl && pres?.fileUrl) {
                          await fetch(pres.uploadUrl, { method: 'PUT', headers: { 'Content-Type': square.type }, body: square });
                          setFormData((p) => ({ ...p, avatar: pres.fileUrl }));
                          return;
                        }

                        // Fallback to local upload endpoint
                        const form = new FormData();
                        form.append('files', new File([square], 'avatar.jpg', { type: 'image/jpeg' }));
                        const up = await fetch(`${base}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` }, body: form }).then(r => r.json());
                        const url = up?.files?.[0]?.url;
                        if (url) setFormData((p) => ({ ...p, avatar: url }));
                      } catch (err) { console.error(err); }
                    }} />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-800">{role === 'provider' ? t('profile.provider') : t('profile.user')}</p>
                {role === 'user' && (
                  <div className="text-sm mt-1 text-gray-800">Preferred language: <span className="font-semibold">{formData.language?.toUpperCase?.() || 'EN'}</span></div>
                )}
                <p className="text-gray-800">{formData.email}</p>
                {/* Profile completeness */}
                <div className="mt-3">
                  {(() => {
                    const checks = [
                      Boolean(formData.firstName),
                      Boolean(formData.lastName),
                      Boolean(formData.avatar),
                      Boolean(formData.bio),
                      Boolean(formData.location),
                      Boolean(formData.phone),
                      Boolean(formData.language),
                      Boolean(formData.timezone),
                    ];
                    const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gold-100">Profile completeness</span>
                          <span className="text-xs text-white font-semibold">{pct}%</span>
                        </div>
                        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: pct + '%' }} />
                        </div>
                        {pct < 100 && (
                          <div className="text-xs mt-1 text-gold-100">
                            { !formData.avatar && 'Add an avatar. '}
                            { !formData.bio && 'Add a short bio. '}
                            { !formData.location && 'Set your location. '}
                            { !formData.phone && 'Add your phone. '}
                            { !formData.language && 'Choose language. '}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary">Save</button>
                    <button onClick={handleCancel} className="btn-outline">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            {/* Mobile: compact select */}
            <div className="md:hidden px-4 md:px-8 py-3">
              <label className="sr-only" htmlFor="profile-tab-select">Section</label>
              <select
                id="profile-tab-select"
                className="input-field w-full"
                value={activeTab}
                onChange={(e)=>setActiveTab(e.target.value)}
              >
                {tabs.map((tab)=> (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>
            {/* Desktop: wrapped pills */}
            <nav className="hidden md:flex flex-wrap gap-2 px-4 md:px-8 py-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gold-50 text-gold-700 border-gold-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="whitespace-normal">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.firstName')}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.lastName')}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.location')}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.bio')}
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      className="input-field w-full resize-none"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="flex justify-end mb-4 gap-2">
                  <a href={`/dashboard/${(role)}`} className="btn-primary">Open full dashboard</a>
                  {role === 'provider' && (
                    <a href={`/providers/me`} className="btn-outline">View public profile</a>
                  )}
                </div>
                <iframe title="Dashboard" src={`${process.env.PUBLIC_URL || ''}/#/dashboard/${role}`} className="w-full h-[70vh] rounded-xl border" />
              </motion.div>
            )}

            {activeTab === 'privacy' && (role === 'user') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-2">Privacy Controls</h3>
                  <p className="text-sm text-gray-600 mb-3">Choose what providers can see when you chat or book with them.</p>
                  {[
                    { key:'showEmail', label:'Show my email to providers' },
                    { key:'showPhone', label:'Show my phone to providers' },
                    { key:'showLocation', label:'Show my city/location to providers' },
                    { key:'showAddresses', label:'Show my saved addresses to providers' },
                  ].map((opt)=> (
                    <label key={opt.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-800">{opt.label}</span>
                      <input type="checkbox" checked={!!privacy[opt.key]} onChange={(e)=> setPrivacy((p)=>({ ...p, [opt.key]: e.target.checked }))} />
                    </label>
                  ))}
                  <div className="pt-2"><button className="btn-primary" onClick={savePrivacy}>Save privacy</button></div>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (role === 'user') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Saved addresses</h3>
                  <button className="btn-primary" onClick={addAddress}>Add address</button>
                </div>
                <div className="space-y-3">
                  {(formData.addresses||[]).map((addr, idx)=> (
                    <div key={addr.id || idx} className="bg-white rounded-lg p-4 border space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input className="input-field" placeholder="Label (Home, Office)" value={addr.label||''} onChange={(e)=>updateAddress(idx,{ label:e.target.value })} disabled={!isEditing} />
                        <input className="input-field md:col-span-2" placeholder="Address line" value={addr.line1||''} onChange={(e)=>updateAddress(idx,{ line1:e.target.value })} disabled={!isEditing} />
                        <input className="input-field" placeholder="City" value={addr.city||''} onChange={(e)=>updateAddress(idx,{ city:e.target.value })} disabled={!isEditing} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input className="input-field" placeholder="Phone (optional)" value={addr.phone||''} onChange={(e)=>updateAddress(idx,{ phone:e.target.value })} disabled={!isEditing} />
                        <div className="md:col-span-3 flex justify-end gap-2">
                          <button className="btn-outline" onClick={()=>deleteAddress(idx)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(formData.addresses||[]).length === 0 && (
                    <div className="text-sm text-gray-500">You have no saved addresses.</div>
                  )}
                </div>
                <div className="pt-2"><button className="btn-primary" onClick={handleSave}>Save changes</button></div>
              </motion.div>
            )}

            {activeTab === 'posts' && (user?.role === 'user') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <MyPostsPanel />
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    {t('profile.passwordChange')}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {t('profile.passwordChangeDesc')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="••••••••"
                    />
                  </div>
                  <button className="btn-primary">
                    {t('profile.updatePassword')}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">WhatsApp Notifications</h4>
                      <p className="text-sm text-gray-600">Receive important updates on WhatsApp</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="waPhone" placeholder="+965XXXXXXXX" className="input-field w-48" />
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={async () => {
                          const phone = document.getElementById('waPhone').value.trim();
                          if (!phone) return;
                          try {
                            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notifications/whatsapp/opt-in`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` },
                              body: JSON.stringify({ phone })
                            });
                          } catch (_) {}
                        }}
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('profile.emailNotifications')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.emailNotificationsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('profile.pushNotifications')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.pushNotificationsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" onChange={async (e) => { if (e.target.checked) { try { await subscribeUserToPush(); } catch (_) {} } }} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('profile.smsNotifications')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.smsNotificationsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.language')}
                    </label>
                    <select
                      className="input-field w-full"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.currency')}
                    </label>
                    <select
                      className="input-field w-full"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      {[
                        'KWD','AED','SAR','QAR','BHD','OMR','USD','EUR','GBP','JPY','TRY','EGP','INR','PKR','BDT','CNY','AUD','CAD','CHF','SEK','NOK','DKK','RUB','ZAR','NGN','IDR','MYR','SGD','HKD','THB','PHP','KES','TZS','UGX'
                      ].map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.timezone')}
                    </label>
                    <select
                      className="input-field w-full"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                    >
                      {[
                        'Asia/Kuwait','Asia/Riyadh','Asia/Dubai','Asia/Qatar','Asia/Bahrain','Asia/Muscat',
                        'Africa/Cairo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow',
                        'America/New_York','America/Los_Angeles','America/Chicago','America/Toronto',
                        'Asia/Tokyo','Asia/Shanghai','Asia/Singapore','Asia/Kolkata','Asia/Karachi',
                        'Australia/Sydney','Pacific/Auckland','Etc/UTC'
                      ].map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-2">
                    <button onClick={handleSave} className="btn-primary">{t('profile.save')}</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (role === 'user') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                <OrdersPanel />
              </motion.div>
            )}

            {activeTab === 'saved' && (role === 'user') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                <SavedPanel />
              </motion.div>
            )}

            {activeTab === 'bids' && (role === 'user') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                <BidsPanel />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// MyPosts panel component
function MyPostsPanel() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [tab, setTab] = React.useState('active');
  const [query, setQuery] = React.useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/post-requests/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` }
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load posts');
        setItems(data.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const filtered = items.filter((p) => {
    const matchesTab = tab === 'all' || (tab === 'active' ? ['running','open','active','pending'].includes((p.status||'').toLowerCase()) : (p.status||'').toLowerCase() === tab);
    const matchesQuery = !query || (p.description||'').toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['active','draft','scheduled','ended','all'].map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-full text-xs border ${tab===k?'bg-gold-50 border-gold-300 text-gold-700':'border-gray-300 text-gray-600'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search posts" className="input-field h-9" />
          <a href="/post-request" className="btn-primary">Create</a>
        </div>
      </div>

      {items.length === 0 && <p className="text-sm text-gray-500">You have no posts yet.</p>}
      {filtered.map((p) => (
        <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{p.type === 'product' ? 'Product' : 'Service'} • {p.category}</p>
            <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()} • {p.status}</p>
            {p.description && <p className="text-sm text-gray-700 mt-1 line-clamp-2">{p.description}</p>}
          </div>
          <div className="flex gap-2">
            <a href={`/post-request?id=${p.id}`} className="btn-outline">Edit</a>
            <button className="btn-outline">Pause</button>
            <button className="btn-outline">Close</button>
          </div>
        </div>
      ))}
      {filtered.length > 0 && (
        <div className="pt-2">
          <a href="/post-request" className="btn-primary">Add Post</a>
        </div>
      )}
    </div>
  );
}

// Customer auxiliary panels (orders/saved/bids)
function OrdersPanel(){
  const [active, setActive] = React.useState([]);
  const [past, setPast] = React.useState([]);
  React.useEffect(()=>{
    (async()=>{
      try { const base=process.env.REACT_APP_API_URL||'http://localhost:5000/api';
        const a=await fetch(`${base}/orders?scope=mine&status=active`, { headers:{ Authorization: `Bearer ${localStorage.getItem('hodhod_token')||''}` } }).then(r=>r.json()).catch(()=>({}));
        const p=await fetch(`${base}/orders?scope=mine&status=past`, { headers:{ Authorization: `Bearer ${localStorage.getItem('hodhod_token')||''}` } }).then(r=>r.json()).catch(()=>({}));
        setActive(a.data||[]); setPast(p.data||[]);
      } catch { setActive([]); setPast([]); }
    })();
  },[]);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Active bookings</h3>
        <div className="space-y-2">{active.length? active.map((o)=> (
          <div key={o.id} className="border rounded p-3 flex items-center justify-between text-sm">
            <div>{o.orderNumber||o.id} • {o.status}</div>
            <a href={`/messages?orderId=${o.id}`} className="btn-outline">Open chat</a>
          </div>
        )) : <div className="text-gray-500 text-sm">No active bookings.</div>}</div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Past bookings</h3>
        <div className="space-y-2">{past.length? past.map((o)=> (
          <div key={o.id} className="border rounded p-3 flex items-center justify-between text-sm">
            <div>{o.orderNumber||o.id} • {o.status}</div>
            <a href={`/post-request?rebook=${o.id}`} className="btn-primary">Rebook</a>
          </div>
        )) : <div className="text-gray-500 text-sm">No past bookings.</div>}</div>
      </div>
    </div>
  );
}

function SavedPanel(){
  const [providers, setProviders] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [auctions, setAuctions] = React.useState([]);
  React.useEffect(()=>{
    (async()=>{
      const base=process.env.REACT_APP_API_URL||'http://localhost:5000/api';
      const auth={ headers:{ Authorization: `Bearer ${localStorage.getItem('hodhod_token')||''}` } };
      try { const r=await fetch(`${base}/favorites?type=provider`, auth).then(r=>r.json()); setProviders(r.data||[]);} catch{}
      try { const r=await fetch(`${base}/favorites?type=product`, auth).then(r=>r.json()); setProducts(r.data||[]);} catch{}
      try { const r=await fetch(`${base}/favorites?type=auction`, auth).then(r=>r.json()); setAuctions(r.data||[]);} catch{}
    })();
  },[]);
  return (
    <div className="space-y-6">
      <Section title="Saved providers" items={providers} empty="No saved providers." hrefKey={(i)=>`/providers/${i.id}`} />
      <Section title="Saved products" items={products} empty="No saved products." hrefKey={(i)=>`/products/${i.id}`} />
      <Section title="Saved auctions" items={auctions} empty="No saved auctions." hrefKey={(i)=>`/auctions#${i.id}`} />
    </div>
  );
}

function Section({ title, items, empty, hrefKey }){
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items?.length? items.map((it)=> (
          <a key={it.id} href={hrefKey(it)} className="border rounded p-3 hover:bg-gray-50">
            <div className="font-medium text-sm">{it.title||it.name||it.brandName||it.id}</div>
            <div className="text-xs text-gray-500">{it.category||it.status||''}</div>
          </a>
        )) : <div className="text-gray-500 text-sm">{empty}</div>}
      </div>
    </div>
  );
}

function BidsPanel(){
  const [items, setItems] = React.useState([]);
  React.useEffect(()=>{
    (async()=>{
      try{ const base=process.env.REACT_APP_API_URL||'http://localhost:5000/api';
        const r=await fetch(`${base}/auctions/my-bids`, { headers:{ Authorization:`Bearer ${localStorage.getItem('hodhod_token')||''}` } }).then(r=>r.json());
        setItems(r.data||[]);
      } catch{ setItems([]);} })();
  },[]);
  return (
    <div className="space-y-3">
      {items.length? items.map((b)=> (
        <div key={b.id} className="border rounded p-3 flex items-center justify-between text-sm">
          <div>{b.auctionTitle||b.auctionId} • {b.amount} KWD</div>
          <a href={`/auctions`} className="btn-outline">View</a>
        </div>
      )) : <div className="text-gray-500 text-sm">No bids yet.</div>}
    </div>
  );
}
