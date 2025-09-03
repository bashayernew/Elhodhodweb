import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  CheckBadgeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60';

const ServicesPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Quick view removed; keep state to avoid larger refactor, but unused
  const [quickViewId, setQuickViewId] = useState(null);
  const [locationsData, setLocationsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const demoServices = useMemo(() => ([
    {
      id: 'demo-1',
      title: 'Apartment Deep Cleaning',
      description: 'Full deep cleaning for 2-bedroom apartment, eco-friendly supplies.',
      price: 35,
      governorate: 'Hawalli',
      area: 'Salmiya',
      rating: 4.8,
      category: 'Cleaning',
      images: [
        'https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1598300183876-3ea8f092f4a0?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-1',
      provider: {
        profile: { firstName: 'Sparkle Clean', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    },
    {
      id: 'demo-2',
      title: 'AC Maintenance (Split Unit)',
      description: 'Inspection, gas refill, and filter replacement per unit.',
      price: 15,
      governorate: 'Farwaniya',
      area: 'Khaitan',
      rating: 4.7,
      category: 'HVAC',
      images: [
        'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-2',
      provider: {
        profile: { firstName: 'CoolAir MEP', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    },
    {
      id: 'demo-3',
      title: 'Interior Painting (per room)',
      description: 'Two coats premium paint, minor wall prep included.',
      price: 30,
      governorate: 'Capital',
      area: 'Sharq',
      rating: 4.6,
      category: 'Décor & Interiors',
      images: [
        'https://images.unsplash.com/photo-1562259949-e8e7689d7824?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-3',
      provider: {
        profile: { firstName: 'Color Masters', avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    },
    {
      id: 'demo-4',
      title: 'Leak Repair & Faucet Replacement',
      description: 'Fixing leaks, replacing faucets and minor plumbing works.',
      price: 20,
      governorate: 'Hawalli',
      area: 'Salwa',
      rating: 4.4,
      category: 'Plumbing',
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-4',
      provider: {
        profile: { firstName: 'QuickFix Plumbing', avatar: 'https://images.unsplash.com/photo-1544005313-ff8b1e0f0b66?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    },
    {
      id: 'demo-5',
      title: 'Electrical Fault Diagnosis',
      description: 'Troubleshooting circuits, sockets and breaker issues.',
      price: 25,
      governorate: 'Capital (Al-Asimah)',
      area: 'Kaifan',
      rating: 4.5,
      category: 'Electrical',
      images: [
        'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-5',
      provider: {
        profile: { firstName: 'Power Solutions', avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    },
    {
      id: 'demo-6',
      title: 'Garden Landscaping & Turf',
      description: 'Garden design, border plants and artificial turf installation.',
      price: 40,
      governorate: 'Jahra',
      area: 'Waha',
      rating: 4.3,
      category: 'Landscaping',
      images: [
        'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&auto=format&fit=crop&q=60'
      ],
      providerId: 'prov-demo-6',
      provider: {
        profile: { firstName: 'Green Thumb', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format&q=60' },
        provider: { verificationStatus: 'active' }
      }
    }
  ]), []);

  // Load categories from API, fallback to static JSON
  useEffect(() => {
    const loadStatic = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL || ''}/data/kuwait-locations.json`).then(r => r.json()),
          // Try API first
          apiFetch('/categories').then(r => ({ categories: r.data.map(c => ({ id: c.slug, name: { en: c.nameEn, ar: c.nameAr }, subcategories: c.subcategories.map(s => ({ id: s.slug, name: { en: s.nameEn, ar: s.nameAr } })) })) })).catch(() => fetch(`${process.env.PUBLIC_URL || ''}/data/service-categories.json`).then(r => r.json()))
        ]);
        setLocationsData(locRes);
        setCategoriesData(catRes);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed loading static datasets', e);
      }
    };
    loadStatic();
  }, []);

  // Load services from API with filters
  useEffect(() => {
    const controller = new AbortController();
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
        if (selectedGovernorate) params.set('governorate', selectedGovernorate);
        if (selectedArea) params.set('area', selectedArea);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (minRating) params.set('rating', minRating);
        if (sortBy) params.set('sort', sortBy);
        params.set('page', String(page));
        params.set('limit', String(limit));

        const res = await apiFetch(`/services?${params.toString()}`, { signal: controller.signal, timeoutMs: 4000 });
        const list = res.data || [];
        if (list.length === 0) {
          setIsDemoData(true);
          setServices(demoServices);
          setTotal(demoServices.length);
        } else {
          setIsDemoData(false);
          setServices(list);
          setTotal(res.pagination?.total || list.length);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // fallback to demo data on error
        setIsDemoData(true);
        setServices(demoServices);
        setTotal(demoServices.length);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
    return () => controller.abort();
  }, [selectedCategory, selectedSubcategory, selectedGovernorate, selectedArea, minPrice, maxPrice, minRating, sortBy, page, limit, demoServices]);

  const categories = useMemo(() => {
    const items = categoriesData?.categories || [];
    return [{ value: '', label: 'All Categories' }, ...items.map((c) => ({ value: c.id, label: c.name?.en || c.id }))];
  }, [categoriesData]);

  const subcategories = useMemo(() => {
    const found = (categoriesData?.categories || []).find((c) => c.id === selectedCategory);
    return found ? (found.subcategories || []).map((s) => ({ value: s.id, label: s.name?.en || s.id })) : [];
  }, [selectedCategory, categoriesData]);

  const governorates = useMemo(() => (locationsData?.governorates || []).map((g) => {
    const label = g.name?.en || g.en || g.id;
    return { value: label, label };
  }), [locationsData]);
  const areas = useMemo(() => {
    const g = (locationsData?.governorates || []).find((x) => (x.name?.en || x.en || x.id) === selectedGovernorate);
    return g ? g.areas.map((a) => {
      const label = a.name?.en || a.en || a.id;
      return { value: label, label };
    }) : [];
  }, [selectedGovernorate, locationsData]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Rating' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  const sortedServices = useMemo(() => {
    // Backend handles sorting; this is placeholder for client search + verified filter
    const list = services.filter((s) => {
      const matchesSearch = !searchTerm ||
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVerified = !verifiedOnly || s.provider?.provider?.verificationStatus === 'active';
      return matchesSearch && matchesVerified;
    });
    return list;
  }, [services, searchTerm, verifiedOnly]);

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const toggleFavorite = async (serviceId) => {
    try {
      const isFav = favoriteIds.has(serviceId);
      if (isFav) {
        await apiFetch('/favorites', { method: 'DELETE', body: { type: 'service', itemId: serviceId } });
        const next = new Set(favoriteIds); next.delete(serviceId); setFavoriteIds(next);
      } else {
        await apiFetch('/favorites', { method: 'POST', body: { type: 'service', itemId: serviceId } });
        const next = new Set(favoriteIds); next.add(serviceId); setFavoriteIds(next);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-hodhod py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-hodhod-black font-cairo mb-4">
              {t('services.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find trusted professionals for all your construction and renovation needs
            </p>
          </div>
        </div>
      </div>

      <div className="container-hodhod py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-hodhod shadow-hodhod p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-hodhod-black mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('common.filter')}
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hodhod-gold focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => { setSelectedCategory(category.value); setSelectedSubcategory(''); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-hodhod-gold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {subcategories.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSelectedSubcategory(s.value); setPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedSubcategory === s.value ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={selectedGovernorate} onChange={(e) => { setSelectedGovernorate(e.target.value); setSelectedArea(''); setPage(1); }}>
                    <option value="">All Governorates</option>
                    {governorates.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setPage(1); }} disabled={!selectedGovernorate}>
                    <option value="">All Areas</option>
                    {areas.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Price (KWD)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Price (KWD)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
              </div>

              {/* Rating and toggles */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                  <option value="">All</option>
                  <option value="1">1★+</option>
                  <option value="2">2★+</option>
                  <option value="3">3★+</option>
                  <option value="4">4★+</option>
                  <option value="4.5">4.5★+</option>
                  <option value="5">5★</option>
                </select>
                <div className="mt-3 flex items-center gap-2">
                  <input id="verifiedOnly" type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                  <label htmlFor="verifiedOnly" className="text-sm text-gray-700">Verified providers only</label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hodhod-gold focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">
                Showing {sortedServices.length} of {total} services
              </p>
              <Link
                to="/post-request"
                className="btn-primary"
              >
                {t('services.postRequest')}
              </Link>
            </div>
            {isDemoData && (
              <div className="mb-6 p-3 rounded bg-amber-50 text-amber-800 text-sm">
                Demo data is shown because the database has no services yet.
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
              {(isLoading ? Array.from({ length: 6 }) : sortedServices).map((service, idx) => (
                <motion.div
                  key={service?.id || `skeleton-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="card-hover cursor-pointer"
                  onClick={(e) => {
                    // Avoid triggering when inner actionable links/buttons are clicked
                    const tag = (e.target.tagName || '').toLowerCase();
                    if (tag === 'a' || tag === 'button' || e.target.closest('a') || e.target.closest('button')) return;
                    // Navigate to service details page
                    if (!isLoading && service?.id) {
                      window.location.href = `/services/${service.id}`;
                    }
                  }}
                >
                  <div className="relative">
                    <img
                      src={(service && service.images?.[0]) || DEFAULT_SERVICE_IMAGE}
                      alt={service?.title || 'Service'}
                      className="w-full h-48 object-cover rounded-t-hodhod"
                    />
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex space-x-2 rtl:space-x-reverse">
                      {!isLoading && (
                        <button
                          className={`p-2 rounded-full bg-white/90 shadow ${favoriteIds.has(service.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                          onClick={() => toggleFavorite(service.id)}
                          aria-label="Toggle favorite"
                        >
                          <HeartIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-hodhod-black mb-2">
                      {service?.title || ' '} 
                    </h3>
                    {!isLoading && (
                      <Link to={`/providers/${service.providerId}?tab=services`} className="flex items-center gap-2 text-gray-700 hover:text-hodhod-gold">
                        <img src={service.provider?.profile?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-6 h-6 rounded-full" />
                        <span className="underline-offset-4 hover:underline">{service.provider?.profile?.firstName || 'Professional'}</span>
                      </Link>
                    )}
                    <div className="mt-2 mb-3 flex flex-wrap items-center gap-2">
                      {!isLoading && service.provider?.provider?.verificationStatus === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckBadgeIcon className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                      {!isLoading && service.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <TagIcon className="w-4 h-4" />
                          {service.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {service?.description || ' '}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm font-medium">{isLoading ? ' ' : (service.rating?.toFixed?.(1) || '—')}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm">{isLoading ? ' ' : `${service.governorate || ''}${service.area ? `, ${service.area}` : ''}`}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-hodhod-gold mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="font-semibold text-hodhod-gold">{isLoading ? ' ' : `${service.price} KWD`}</span>
                      </div>
                      {/* Quick View and Chat removed per request */}
                    </div>
                    
                    {!isLoading && (
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Link
                          to={`/services/${service.id}`}
                          className="flex-1 btn-primary text-center"
                        >
                          View Details
                        </Link>
                        {/* Chat button removed */}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="mt-8 flex justify-center gap-2">
                <button className="btn-outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <span className="px-3 py-2">Page {page} of {Math.ceil(total / limit)}</span>
                <button className="btn-outline" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal removed */}
    </div>
  );
};

export default ServicesPage;
