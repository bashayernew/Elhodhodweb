import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckBadgeIcon,
  StarIcon,
  MapPinIcon,
  ShareIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [newService, setNewService] = useState({ title: '', price: '' });
  const [newProduct, setNewProduct] = useState({ title: '', price: '' });
  const [newAuction, setNewAuction] = useState({ title: '', endsAt: '' });
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', role: '' });

  // Load provider profile
  useEffect(() => {
    // Sync tab from URL if provided (e.g., ?tab=services)
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setActiveTab(tabParam);
    setEditMode(params.get('edit') === '1');
    
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/providers/${id}`);
        let data = res.data;
        if (!data) throw new Error('not found');
        if (mounted) { setProvider(data); setDraft(data); }
      } catch (_) {
        // Demo fallback
        const demo = {
          id,
          subrole: 'company',
          brandName: 'CoolAir MEP',
          verified: true,
          rating: 4.7,
          responseTime: 'within 1 hour',
          languages: ['English', 'العربية'],
          yearsInBusiness: 7,
          bio: 'We deliver reliable HVAC solutions across Kuwait with certified technicians.',
          workingHours: 'Sun-Thu 9AM–6PM',
          serviceAreas: [{ governorate: 'Farwaniya', areas: ['Khaitan', 'Jleeb'] }],
          cover: DEFAULT_COVER,
          logo: '',
          policies: {
            terms: 'Standard service terms apply.',
            warranty: 'Workmanship warranty for 90 days.',
            refunds: 'Refunds available as per inspection.'
          },
          locations: [{ name: 'Main Branch', lat: 29.3, lng: 47.9 }],
        };
        if (mounted) { setProvider(demo); setDraft(demo); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id, location.search]);

  // Load related content
  useEffect(() => {
    if (!id) return;
    apiFetch(`/services?providerId=${id}`).then((r) => setServices(r.data || [])).catch(() => {
      try { setServices(JSON.parse(localStorage.getItem(`demo_provider_services_${id}`) || '[]')); } catch { setServices([]); }
    });
    apiFetch(`/products?providerId=${id}`).then((r) => setProducts(r.data || [])).catch(() => {
      try { setProducts(JSON.parse(localStorage.getItem(`demo_provider_products_${id}`) || '[]')); } catch { setProducts([]); }
    });
    apiFetch(`/auctions?providerId=${id}`).then((r) => setAuctions(r.data || [])).catch(() => {
      try { setAuctions(JSON.parse(localStorage.getItem(`demo_provider_auctions_${id}`) || '[]')); } catch { setAuctions([]); }
    });
  }, [id]);

  const isCompany = provider?.subrole === 'company';
  const isOwner = user?.id && provider?.id && user.id === provider.id;
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/providers/${provider?.id}` : '';

  const setSearchParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value === undefined || value === null) params.delete(key); else params.set(key, String(value));
    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  };

  const toggleEdit = () => {
    if (!isOwner) return;
    const next = !editMode;
    setEditMode(next);
    setSearchParam('edit', next ? 1 : undefined);
  };

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const saveDraft = async () => {
    if (!isOwner || !draft) return;
    try {
      const payload = { ...draft };
      await apiFetch(`/providers/${provider.id}`, { method: 'PUT', body: payload });
      setProvider(payload);
      setEditMode(false);
      setSearchParam('edit', undefined);
    } catch (_) {}
    // Demo persistence
    try { localStorage.setItem(`demo_provider_profile_${provider.id}`, JSON.stringify(draft)); } catch {}
    try { localStorage.setItem(`demo_provider_services_${provider.id}`, JSON.stringify(services)); } catch {}
    try { localStorage.setItem(`demo_provider_products_${provider.id}`, JSON.stringify(products)); } catch {}
    try { localStorage.setItem(`demo_provider_auctions_${provider.id}`, JSON.stringify(auctions)); } catch {}
    setProvider(draft);
    setEditMode(false);
    setSearchParam('edit', undefined);
  };

  const uploadImage = async (file) => {
    const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
    try {
      const pres = await fetch(`${base}/upload/presign?filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`).then(r=>r.json());
      if (pres?.uploadUrl && pres?.fileUrl) {
        await fetch(pres.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        return pres.fileUrl;
      }
      const form = new FormData();
      form.append('files', file);
      const up = await fetch(`${base}/upload`, { method: 'POST', body: form }).then(r=>r.json());
      return up?.files?.[0]?.url;
    } catch { return null; }
  };

  const tabs = useMemo(() => (
    [
      { id: 'services', label: 'Services' },
      { id: 'products', label: 'Products' },
      { id: 'auctions', label: 'Auctions' },
      { id: 'portfolio', label: 'Portfolio' },
      { id: 'reviews', label: 'Reviews' },
      ...(isCompany ? [{ id: 'team', label: 'Team' }] : []),
      { id: 'policies', label: 'Policies' },
      { id: 'locations', label: 'Locations' }
    ]
  ), [isCompany]);

  if (loading || !provider) {
    return (
      <div className="container-hodhod py-10">
        <div className="animate-pulse h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover + Header */}
      <div className="relative">
        <img src={(editMode ? draft?.cover : provider.cover) || DEFAULT_COVER} alt="cover" className="h-64 w-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container-hodhod">
          <div className="-mt-10 bg-white rounded-hodhod shadow-hodhod p-4 flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-center gap-4">
              {((editMode ? draft?.logo : provider.logo)) ? (
                <img src={editMode ? draft?.logo : provider.logo} alt="logo" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center text-lg font-semibold">
                  {((editMode ? draft?.brandName : provider.brandName) || 'P').slice(0,1)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  {!editMode ? (
                    <h1 className="text-2xl font-bold text-hodhod-black">{provider.brandName || 'Provider'}</h1>
                  ) : (
                    <input className="input-field text-2xl font-bold" value={draft?.brandName || ''} onChange={(e)=>updateDraft({ brandName: e.target.value })} placeholder="Brand / Company name" />
                  )}
                  {provider.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckBadgeIcon className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="inline-flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" /> {provider.rating?.toFixed?.(1) || '—'}</span>
                  {!editMode ? (
                    <span className="inline-flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {provider.responseTime || '—'}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <input className="input-field h-8" value={draft?.responseTime || ''} onChange={(e)=>updateDraft({ responseTime: e.target.value })} placeholder="within 1 hour" />
                    </span>
                  )}
                  {!editMode ? (
                    <span className="inline-flex items-center gap-1"><GlobeAltIcon className="w-4 h-4" /> {(provider.languages || []).join(', ')}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <GlobeAltIcon className="w-4 h-4" />
                      <input className="input-field h-8" value={(draft?.languages || []).join(', ')} onChange={(e)=>updateDraft({ languages: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="English, العربية" />
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <button
                type="button"
                className="btn-outline inline-flex items-center gap-1"
                onClick={async()=>{
                  try{
                    if (navigator.share) {
                      await navigator.share({ title: provider?.brandName || 'Provider', url: profileUrl });
                    } else {
                      try {
                        await navigator.clipboard.writeText(profileUrl);
                        alert('Link copied to clipboard');
                      } catch {
                        const ok = window.prompt('Copy profile link:', profileUrl);
                      }
                    }
                  }catch(_){ /* no-op */ }
                }}
              >
                <ShareIcon className="w-4 h-4" /> Share
              </button>
              {isOwner && (
                <button type="button" onClick={()=>setShowQR(true)} className="btn-outline inline-flex items-center gap-1">QR Code</button>
              )}
              {isOwner && !editMode && (
                <button type="button" onClick={toggleEdit} className="btn-primary inline-flex items-center gap-1">Edit Profile</button>
              )}
              {isOwner && editMode && (
                <div className="flex gap-2">
                  <button type="button" onClick={saveDraft} className="btn-primary">Done</button>
                </div>
              )}
            </div>
            {isOwner && editMode && (
              <div className="mt-3 flex items-center gap-3">
                <label className="btn-outline cursor-pointer">
                  Change Cover
                  <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; const url=await uploadImage(f); if (url) updateDraft({ cover:url }); }} />
                </label>
                <label className="btn-outline cursor-pointer">
                  Change Logo
                  <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; const url=await uploadImage(f); if (url) updateDraft({ logo:url }); }} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About strip (company only extras) */}
      <div className="container-hodhod py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            {!editMode ? (
              <p className="text-gray-700">{provider.bio || '—'}</p>
            ) : (
              <textarea className="input-field w-full" rows={3} value={draft?.bio || ''} onChange={(e)=>updateDraft({ bio: e.target.value })} placeholder="Tell customers about your business" />
            )}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {isCompany && (
                <div className="p-3 rounded bg-gray-50">
                  <div className="text-gray-500">Years in business</div>
                  {!editMode ? (
                    <div className="font-medium text-gray-900">{provider.yearsInBusiness || '—'}</div>
                  ) : (
                    <input className="input-field" type="number" min="0" value={draft?.yearsInBusiness || ''} onChange={(e)=>updateDraft({ yearsInBusiness: e.target.value })} />
                  )}
                </div>
              )}
              <div className="p-3 rounded bg-gray-50">
                <div className="text-gray-500">Working hours</div>
                {!editMode ? (
                  <div className="font-medium text-gray-900">{provider.workingHours || '—'}</div>
                ) : (
                  <input className="input-field" value={draft?.workingHours || ''} onChange={(e)=>updateDraft({ workingHours: e.target.value })} placeholder="Sun-Thu 9AM–6PM" />
                )}
              </div>
              <div className="p-3 rounded bg-gray-50">
                <div className="text-gray-500">Service areas</div>
                {!editMode ? (
                  <div className="font-medium text-gray-900">
                    {(provider.serviceAreas || []).map((g) => `${g.governorate}${g.areas?.length ? ` (${g.areas.join(', ')})` : ''}`).join(' • ') || '—'}
                  </div>
                ) : (
                  <textarea className="input-field" rows={2} value={(draft?.serviceAreas || []).map((g)=> `${g.governorate}${g.areas?.length ? ` (${g.areas.join(', ')})` : ''}`).join('\n')} onChange={(e)=>{
                    const lines = e.target.value.split(/\n+/).map(l=>l.trim()).filter(Boolean);
                    const parsed = lines.map((l)=>{
                      const m = /(.*?)(?:\s*\((.*)\))?$/.exec(l);
                      return { governorate: (m?.[1]||'').trim(), areas: (m?.[2]||'').split(',').map(s=>s.trim()).filter(Boolean) };
                    });
                    updateDraft({ serviceAreas: parsed });
                  }} placeholder={'Farwaniya (Khaitan, Jleeb)'} />
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            {!editMode ? (
              <div className="text-sm text-gray-700 space-y-1">
                <div>{provider?.contact?.phone ? `Phone: ${provider.contact.phone}` : '—'}</div>
                <div>{provider?.contact?.email ? `Email: ${provider.contact.email}` : '—'}</div>
                <div>{provider?.contact?.whatsapp ? `WhatsApp: ${provider.contact.whatsapp}` : '—'}</div>
                <div>{provider?.contact?.website ? (<a href={provider.contact.website} className="text-hodhod-gold underline" target="_blank" rel="noreferrer">Website</a>) : '—'}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <input className="input-field w-full" placeholder="Phone" value={draft?.contact?.phone || ''} onChange={(e)=> updateDraft({ contact:{ ...(draft?.contact||{}), phone:e.target.value } })} />
                <input className="input-field w-full" placeholder="Email" value={draft?.contact?.email || ''} onChange={(e)=> updateDraft({ contact:{ ...(draft?.contact||{}), email:e.target.value } })} />
                <input className="input-field w-full" placeholder="WhatsApp (e.g., +965…)" value={draft?.contact?.whatsapp || ''} onChange={(e)=> updateDraft({ contact:{ ...(draft?.contact||{}), whatsapp:e.target.value } })} />
                <input className="input-field w-full" placeholder="Website URL" value={draft?.contact?.website || ''} onChange={(e)=> updateDraft({ contact:{ ...(draft?.contact||{}), website:e.target.value } })} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-hodhod">
        {showQR && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setShowQR(false)}>
            <div className="bg-white rounded-hodhod shadow-hodhod p-4" onClick={(e)=>e.stopPropagation()}>
              <h3 className="font-semibold mb-2">Share your profile</h3>
              <div className="flex items-center gap-4">
                <img alt="QR"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}`}
                  onError={(e)=>{ e.currentTarget.src=`https://quickchart.io/qr?size=220&text=${encodeURIComponent(profileUrl)}`; }}
                />
                <div className="text-sm text-gray-600 break-all max-w-[50vw]">
                  {profileUrl}
                </div>
              </div>
              <div className="pt-3 text-right">
                <button className="btn-outline mr-2" onClick={async()=>{ try{ await navigator.clipboard.writeText(profileUrl); alert('Link copied'); }catch{ window.prompt('Copy link:', profileUrl); }}}>Copy link</button>
                <a className="btn-outline mr-2" href={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}`} download={`provider-${provider?.id}-qr.png`}>Download QR</a>
                <button className="btn-primary" onClick={()=>setShowQR(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-2 rounded-full text-sm ${activeTab === t.id ? 'bg-hodhod-gold text-white' : 'bg-white border text-gray-700'}`}>{t.label}</button>
          ))}
        </div>

        {/* Services */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-6">
            {isOwner && editMode && (
              <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-4 flex flex-col gap-3">
                <div className="font-semibold">Add Service</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="input-field" placeholder="Title" value={newService.title} onChange={(e)=>setNewService({ ...newService, title: e.target.value })} />
                  <input className="input-field" placeholder="Price (KWD)" type="number" value={newService.price} onChange={(e)=>setNewService({ ...newService, price: e.target.value })} />
                  <button className="btn-primary" onClick={async ()=>{
                    if (!newService.title) return;
                    try {
                      const created = await apiFetch('/services/provider/services', { method:'POST', body:{ title:newService.title, price:newService.price } });
                      setServices((prev)=>[created.data, ...prev]);
                    } catch { setServices((prev)=>[{ id: Date.now().toString(), title:newService.title, price:newService.price }, ...prev]); }
                    setNewService({ title:'', price:'' });
                  }}>Add</button>
                </div>
              </div>
            )}
            {services.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover">
                <img src={s.images?.[0] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60'} alt={s.title} className="h-40 w-full object-cover rounded-t-hodhod" />
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <div className="flex gap-2 mt-2">
                    <Link to={`/services/${s.id}`} className="btn-outline">View</Link>
                    {isOwner && editMode && (
                      <button className="btn-outline" onClick={async ()=>{
                        try { await apiFetch(`/services/provider/services/${s.id}`, { method:'DELETE' }); } catch {}
                        setServices((prev)=> prev.filter(x=>x.id!==s.id));
                      }}>Remove</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {services.length === 0 && <div className="text-gray-500 py-6">No services yet.</div>}
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-6">
            {products.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover">
                <img src={p.image} alt={p.title} className="h-40 w-full object-cover rounded-t-hodhod" />
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{p.title}</h4>
                  <div className="text-hodhod-gold font-semibold mb-3">{p.price} KWD</div>
                  <div className="flex gap-2 mt-2">
                    <Link to={`/products/${p.id}`} className="btn-outline">View</Link>
                  </div>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && <div className="text-gray-500 py-6">No products yet.</div>}
          </div>
        )}

        {/* Auctions */}
        {activeTab === 'auctions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-6">
            {isOwner && editMode && (
              <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-4 flex flex-col gap-3">
                <div className="font-semibold">Create Auction</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="input-field" placeholder="Title" value={newAuction.title} onChange={(e)=>setNewAuction({ ...newAuction, title: e.target.value })} />
                  <input className="input-field" type="datetime-local" value={newAuction.endsAt} onChange={(e)=>setNewAuction({ ...newAuction, endsAt: e.target.value })} />
                  <button className="btn-primary" onClick={async ()=>{
                    if (!newAuction.title) return;
                    try { const created = await apiFetch('/auctions/provider/auctions', { method:'POST', body:{ title:newAuction.title, startsAt: new Date().toISOString(), endsAt: newAuction.endsAt } }); setAuctions((prev)=>[created.data, ...prev]); }
                    catch { setAuctions((prev)=>[{ id: Date.now().toString(), title:newAuction.title, endsAt:newAuction.endsAt }, ...prev]); }
                    setNewAuction({ title:'', endsAt:'' });
                  }}>Add</button>
                </div>
              </div>
            )}
            {auctions.map((a) => (
              <div key={a.id} className="card-hover p-4">
                <h4 className="font-semibold mb-1">{a.title}</h4>
                <div className="text-sm text-gray-600 mb-2">Ends in: {a.endsIn || '—'}</div>
                <div className="flex gap-2">
                  <Link to={`/auctions`} className="btn-primary">Bid Now</Link>
                  {isOwner && editMode && (
                    <button className="btn-outline" onClick={async ()=>{ try { await apiFetch(`/auctions/provider/auctions/${a.id}`, { method:'DELETE' }); } catch {}; setAuctions((prev)=> prev.filter(x=>x.id!==a.id)); }}>Remove</button>
                  )}
                </div>
              </div>
            ))}
            {auctions.length === 0 && <div className="text-gray-500 py-6">No auctions yet.</div>}
          </div>
        )}

        {/* Portfolio placeholder */}
        {activeTab === 'portfolio' && (
          <div className="py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {isOwner && editMode && (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 bg-white rounded-hodhod shadow-hodhod p-4 flex items-center gap-2">
                <input className="input-field flex-1" placeholder="Image URL" value={newPortfolioUrl} onChange={(e)=>setNewPortfolioUrl(e.target.value)} />
                <button className="btn-outline" onClick={()=>{ if (!newPortfolioUrl) return; const next=[...(draft?.portfolio||[])]; next.push(newPortfolioUrl); updateDraft({ portfolio: next }); setNewPortfolioUrl(''); }}>Add URL</button>
                <label className="btn-outline cursor-pointer">Upload<input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const url = await uploadImage(f); if (url) { const next=[...(draft?.portfolio||[])]; next.push(url); updateDraft({ portfolio: next }); } }} /></label>
              </div>
            )}
            {((editMode ? draft?.portfolio : provider.portfolio) || []).map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="portfolio" className="w-full h-40 object-cover rounded" />
                {isOwner && editMode && (
                  <button className="btn-outline absolute top-2 right-2" onClick={()=>{ const arr=[...(draft?.portfolio||[])]; arr.splice(idx,1); updateDraft({ portfolio: arr }); }}>Remove</button>
                )}
              </div>
            ))}
            {(((editMode ? draft?.portfolio : provider.portfolio) || []).length === 0) && <div className="text-gray-500">No portfolio yet.</div>}
          </div>
        )}

        {/* Reviews placeholder */}
        {activeTab === 'reviews' && (
          <div className="py-6">
            <div className="bg-white rounded-hodhod shadow-hodhod p-4">Reviews coming soon.</div>
          </div>
        )}

        {/* Team (company only) */}
        {activeTab === 'team' && (
          <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(provider.team || []).map((m) => (
              <div key={m.name} className="bg-white rounded-hodhod shadow-hodhod p-4">
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-gray-600">{m.role}</div>
              </div>
            ))}
            {(provider.team || []).length === 0 && <div className="text-gray-500">Team info not added.</div>}
          </div>
        )}

        {/* Policies */}
        {activeTab === 'policies' && (
          <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-hodhod shadow-hodhod p-4"><h4 className="font-semibold mb-2">Service Terms</h4>{!editMode ? (<p className="text-gray-700">{provider.policies?.terms || '—'}</p>) : (<textarea className="input-field w-full" rows={4} value={draft?.policies?.terms || ''} onChange={(e)=>updateDraft({ policies:{ ...(draft?.policies||{}), terms:e.target.value } })} />)}</div>
            <div className="bg-white rounded-hodhod shadow-hodhod p-4"><h4 className="font-semibold mb-2">Warranty</h4>{!editMode ? (<p className="text-gray-700">{provider.policies?.warranty || '—'}</p>) : (<textarea className="input-field w-full" rows={4} value={draft?.policies?.warranty || ''} onChange={(e)=>updateDraft({ policies:{ ...(draft?.policies||{}), warranty:e.target.value } })} />)}</div>
            <div className="bg-white rounded-hodhod shadow-hodhod p-4"><h4 className="font-semibold mb-2">Returns / Refunds</h4>{!editMode ? (<p className="text-gray-700">{provider.policies?.refunds || '—'}</p>) : (<textarea className="input-field w-full" rows={4} value={draft?.policies?.refunds || ''} onChange={(e)=>updateDraft({ policies:{ ...(draft?.policies||{}), refunds:e.target.value } })} />)}</div>
          </div>
        )}

        {/* Locations */}
        {activeTab === 'locations' && (
          <div className="py-6">
            <div className="bg-white rounded-hodhod shadow-hodhod p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> Branches & Service Area</h4>
              {!editMode ? (
                <div className="text-sm text-gray-700 mb-3">{(provider.locations || []).map((l) => l.name).join(' • ') || '—'}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <input className="input-field flex-1" placeholder="Branch name" value={newLocation} onChange={(e)=>setNewLocation(e.target.value)} />
                    <button className="btn-primary" onClick={()=>{ if(!newLocation) return; const next=[...(draft?.locations||[])]; next.push({ name: newLocation }); updateDraft({ locations: next }); setNewLocation(''); }}>Add</button>
                  </div>
                  <div className="space-y-2">
                    {(draft?.locations || []).map((l, idx)=> (
                      <div key={`${l.name}-${idx}`} className="flex items-center justify-between border rounded p-2">
                        <span className="text-sm">{l.name}</span>
                        <button className="btn-outline" onClick={()=>{ const next=[...(draft?.locations||[])]; next.splice(idx,1); updateDraft({ locations: next }); }}>Remove</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">Map placeholder</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


