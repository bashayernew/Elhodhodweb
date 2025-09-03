import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [wishlist, setWishlist] = useState(new Set());
  const [locationsData, setLocationsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);

  // Mock data - replace with actual API calls
  const products = [
    {
      id: 1,
      title: 'Professional Drill Set',
      seller: 'Tools Pro',
      rating: 4.6,
      reviews: 234,
      price: 89.99,
      originalPrice: 120.00,
      location: 'Dubai',
      category: 'tools',
      condition: 'new',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
      description: 'Complete professional drill set with 20 pieces including drill bits and accessories.',
      inStock: true,
      verified: true
    },
    {
      id: 2,
      title: 'LED Light Fixtures',
      seller: 'Lighting World',
      rating: 4.8,
      reviews: 189,
      price: 45.50,
      originalPrice: 60.00,
      location: 'Abu Dhabi',
      category: 'lighting',
      condition: 'new',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      description: 'Modern LED light fixtures for home and office lighting solutions.',
      inStock: true,
      verified: true
    },
    {
      id: 3,
      title: 'Kitchen Sink',
      seller: 'Home Essentials',
      rating: 4.5,
      reviews: 67,
      price: 199.99,
      originalPrice: 250.00,
      location: 'Sharjah',
      category: 'appliances',
      condition: 'refurbished',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      description: 'Stainless steel kitchen sink with modern design and easy installation.',
      inStock: true,
      verified: false
    },
    {
      id: 4,
      title: 'Wooden Coffee Table',
      seller: 'Furniture Plus',
      rating: 4.7,
      reviews: 156,
      price: 299.99,
      originalPrice: 399.99,
      location: 'Dubai',
      category: 'furniture',
      condition: 'used',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      description: 'Beautiful wooden coffee table with storage compartment.',
      inStock: true,
      verified: true
    },
    {
      id: 5,
      title: 'Ceramic Tiles',
      seller: 'Tile Masters',
      rating: 4.4,
      reviews: 89,
      price: 15.99,
      originalPrice: 22.50,
      location: 'Abu Dhabi',
      category: 'materials',
      condition: 'new',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      description: 'High-quality ceramic tiles for bathroom and kitchen flooring.',
      inStock: false,
      verified: true
    },
    {
      id: 6,
      title: 'Wall Art Decor',
      seller: 'Art Gallery',
      rating: 4.9,
      reviews: 45,
      price: 75.00,
      originalPrice: 95.00,
      location: 'Sharjah',
      category: 'decor',
      condition: 'new',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      description: 'Beautiful wall art pieces to enhance your home decor.',
      inStock: true,
      verified: true
    }
  ];

  // Load product categories (static JSON) and Kuwait locations
  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL || ''}/data/kuwait-locations.json`).then(r => r.json()),
          fetch(`${process.env.PUBLIC_URL || ''}/data/product-categories.json`).then(r => r.json())
        ]);
        setLocationsData(locRes);
        setCategoriesData(catRes);
      } catch (_) {
        setLocationsData(null);
        setCategoriesData(null);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const items = categoriesData?.categories || [];
    return [{ value: '', label: 'All Categories' }, ...items.map((c) => ({ value: c.slug || c.name_en || c.id, label: c.name_en || c.name?.en || c.id }))];
  }, [categoriesData]);

  const subcategories = useMemo(() => {
    const found = (categoriesData?.categories || []).find((c) => (c.slug || c.name_en || c.id) === selectedCategory);
    return found ? (found.subcategories || []).map((s) => ({ value: s.slug || s.name_en || s.id, label: s.name_en || s.name?.en || s.id })) : [];
  }, [selectedCategory, categoriesData]);

  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'new', label: t('products.new') },
    { value: 'used', label: t('products.used') },
    { value: 'refurbished', label: t('products.refurbished') }
  ];

  const governorates = useMemo(() => (locationsData?.governorates || []).map((g) => ({ value: g.name?.en || g.en || g.id, label: g.name?.en || g.en || g.id })), [locationsData]);
  const areas = useMemo(() => {
    const g = (locationsData?.governorates || []).find((x) => (x.name?.en || x.en || x.id) === selectedGovernorate);
    return g ? g.areas.map((a) => ({ value: a.name?.en || a.en || a.id, label: a.name?.en || a.en || a.id })) : [];
  }, [selectedGovernorate, locationsData]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Rating' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ];

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    const matchesLocation = !selectedGovernorate || (product.location || '').toLowerCase().includes(selectedGovernorate.toLowerCase());
    const matchesArea = !selectedArea || (product.location || '').toLowerCase().includes(selectedArea.toLowerCase());
    const matchesPriceMin = !minPrice || product.price >= parseFloat(minPrice);
    const matchesPriceMax = !maxPrice || product.price <= parseFloat(maxPrice);
    const matchesRating = !minRating || product.rating >= parseFloat(minRating);
    const matchesVerified = !verifiedOnly || product.verified === true;
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesCondition && matchesLocation && matchesArea && matchesPriceMin && matchesPriceMax && matchesRating && matchesVerified;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-hodhod py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-hodhod-black font-cairo mb-4">
              {t('products.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover quality construction materials, tools, and home essentials
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
                    placeholder="Search products..."
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
                      onClick={() => { setSelectedCategory(category.value); setSelectedSubcategory(''); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-hodhod-gold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.label}</span>
                        {/* counts omitted for demo */}
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
                        onClick={() => setSelectedSubcategory(s.value)}
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

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <button
                      key={condition.value}
                      onClick={() => setSelectedCondition(condition.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCondition === condition.value
                          ? 'bg-hodhod-gold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {condition.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select className="w-full px-3 py-2 border rounded-lg mb-2" value={selectedGovernorate} onChange={(e) => { setSelectedGovernorate(e.target.value); setSelectedArea(''); }}>
                  <option value="">All Governorates</option>
                  {governorates.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <select className="w-full px-3 py-2 border rounded-lg" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} disabled={!selectedGovernorate}>
                  <option value="">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Price</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Price</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
              </div>

              {/* Rating + Verified */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                  <option value="">All</option>
                  <option value="1">1★+</option>
                  <option value="2">2★+</option>
                  <option value="3">3★+</option>
                  <option value="4">4★+</option>
                  <option value="4.5">4.5★+</option>
                </select>
                <div className="mt-3 flex items-center gap-2">
                  <input id="verifiedOnlyProducts" type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                  <label htmlFor="verifiedOnlyProducts" className="text-sm text-gray-700">Verified sellers only</label>
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

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedProducts.length} of {products.length} products
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/signup', { state: { from: '/post-product-request' } });
                    } else {
                      navigate('/post-product-request');
                    }
                  }}
                  className="btn-outline"
                >
                  Post Product Request
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="card-hover relative cursor-pointer"
                  onClick={(e) => {
                    const tag = (e.target.tagName || '').toLowerCase();
                    if (tag === 'a' || tag === 'button' || e.target.closest('a') || e.target.closest('button')) return;
                    // Navigate to product details page
                    window.location.href = `/products/${product.id}`;
                  }}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-hodhod"
                    />
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex space-x-2 rtl:space-x-reverse">
                      {product.originalPrice && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          -{getDiscountPercentage(product.originalPrice, product.price)}%
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 capitalize">
                        {product.condition}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      {wishlist.has(product.id) ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-hodhod">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-red-600 border border-red-200">Out of Stock</span>
                        </div>
                      )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-hodhod-black mb-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      <Link to={`/providers/${product.sellerId || product.providerId || `prov-demo-${product.id}`}?tab=products`} className="hover:text-hodhod-gold underline-offset-4 hover:underline">
                        {product.seller}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-500 ml-1 rtl:ml-0 rtl:mr-1">
                          ({product.reviews})
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm">{product.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                       <span className="text-xl font-bold text-hodhod-gold">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Link
                        to={`/products/${product.id}`}
                        className="flex-1 btn-primary text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/messages?to=${product.sellerId || 'seller-' + product.id}`}
                        className="btn-outline flex items-center justify-center"
                        aria-label="Chat with seller"
                        title="Chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </Link>
                      <button
                        disabled={!product.inStock}
                        className="btn-outline flex items-center justify-center"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
