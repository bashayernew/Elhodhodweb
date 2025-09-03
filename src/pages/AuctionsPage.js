import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const AuctionsPage = () => {
  const { t } = useTranslation();
  const { user, userType } = useAuth();
  const role = user?.role || userType || 'user';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [sortBy, setSortBy] = useState('ending-soon');

  // Mock data fallback
  const auctions = [
    {
      id: 1,
      title: 'Vintage Chandelier',
      seller: 'Antique Treasures',
      rating: 4.8,
      reviews: 45,
      currentBid: 1250,
      startingPrice: 800,
      reservePrice: 1000,
      bids: 12,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      location: 'Dubai',
      category: 'furniture',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
      description: 'Beautiful vintage chandelier from the 1920s, perfect for elegant home decor.',
      verified: true
    },
    {
      id: 2,
      title: 'Antique Door Set',
      seller: 'Heritage Doors',
      rating: 4.6,
      reviews: 23,
      currentBid: 450,
      startingPrice: 300,
      reservePrice: 400,
      bids: 8,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      location: 'Abu Dhabi',
      category: 'materials',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
      description: 'Authentic antique door set with intricate carvings and brass hardware.',
      verified: true
    },
    {
      id: 3,
      title: 'Marble Countertop',
      seller: 'Stone Masters',
      rating: 4.9,
      reviews: 67,
      currentBid: 2100,
      startingPrice: 1500,
      reservePrice: 1800,
      bids: 15,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      location: 'Sharjah',
      category: 'materials',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      description: 'Premium marble countertop slab, perfect for kitchen or bathroom renovation.',
      verified: true
    },
    {
      id: 4,
      title: 'Professional Tool Set',
      seller: 'Tools Pro',
      rating: 4.7,
      reviews: 89,
      currentBid: 350,
      startingPrice: 200,
      reservePrice: 250,
      bids: 6,
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Ended 2 hours ago
      location: 'Dubai',
      category: 'tools',
      status: 'ended',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
      description: 'Complete professional tool set with 50+ pieces, barely used.',
      verified: true,
      winner: 'John Doe'
    },
    {
      id: 5,
      title: 'Designer Light Fixtures',
      seller: 'Luxury Lighting',
      rating: 4.5,
      reviews: 34,
      currentBid: 1800,
      startingPrice: 1200,
      reservePrice: 1500,
      bids: 9,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      location: 'Abu Dhabi',
      category: 'lighting',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      description: 'Set of 3 designer light fixtures, modern and elegant design.',
      verified: false
    },
    {
      id: 6,
      title: 'Garden Furniture Set',
      seller: 'Outdoor Living',
      rating: 4.4,
      reviews: 56,
      currentBid: 750,
      startingPrice: 500,
      reservePrice: 600,
      bids: 11,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      location: 'Sharjah',
      category: 'furniture',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      description: 'Complete garden furniture set including table and 6 chairs.',
      verified: true
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', count: auctions.length },
    { value: 'furniture', label: 'Furniture', count: 45 },
    { value: 'materials', label: 'Materials', count: 67 },
    { value: 'tools', label: 'Tools', count: 34 },
    { value: 'lighting', label: 'Lighting', count: 23 },
    { value: 'decor', label: 'Decoration', count: 28 },
    { value: 'appliances', label: 'Appliances', count: 19 }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'ended', label: 'Ended' }
  ];

  const sortOptions = [
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest' },
    { value: 'current-bid-high', label: 'Current Bid: High to Low' },
    { value: 'current-bid-low', label: 'Current Bid: Low to High' },
    { value: 'bids', label: 'Most Bids' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Filter auctions based on search and filters
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || auction.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || auction.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort auctions
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        return a.endTime - b.endTime;
      case 'newest':
        return b.id - a.id;
      case 'current-bid-high':
        return b.currentBid - a.currentBid;
      case 'current-bid-low':
        return a.currentBid - b.currentBid;
      case 'bids':
        return b.bids - a.bids;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Countdown Timer Component
  const CountdownTimer = ({ endTime, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
      const difference = endTime - new Date();
      if (difference <= 0) {
        onEnd && onEnd();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    }

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, [endTime]);

    const isEndingSoon = timeLeft.hours === 0 && timeLeft.minutes < 30;

    return (
      <div className={`flex space-x-2 rtl:space-x-reverse ${isEndingSoon ? 'animate-pulse-gold' : ''}`}>
        <div className="countdown-item">
          <div className="countdown-number">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="countdown-label">Hours</div>
        </div>
        <div className="countdown-item">
          <div className="countdown-number">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="countdown-label">Minutes</div>
        </div>
        <div className="countdown-item">
          <div className="countdown-number">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="countdown-label">Seconds</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-hodhod py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-hodhod-black font-cairo mb-4">
              {t('auctions.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bid on unique items and find great deals on construction materials and tools
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
                    placeholder="Search auctions..."
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
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-hodhod-gold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.label}</span>
                        <span className="text-xs opacity-75">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedStatus === status.value
                          ? 'bg-hodhod-gold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
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

          {/* Auctions Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedAuctions.length} of {auctions.length} auctions
              </p>
              {role === 'provider' && (
                <Link to="/create-auction" className="btn-primary">
                  {t('auctions.createAuction')}
                </Link>
              )}
            </div>

            {/* Auctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedAuctions.map((auction) => (
                <motion.div
                  key={auction.id}
                  data-auction-id={`${auction.id}`}
                  data-auction-json={JSON.stringify(auction)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="card-hover"
                >
                  <div className="relative">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-48 object-cover rounded-t-hodhod"
                    />
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex flex-wrap gap-2 justify-end">
                      {auction.status === 'ended' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Ended</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      )}
                      {auction.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckBadgeIcon className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    {auction.status === 'ended' && auction.winner && (
                      <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                        <span className="badge-success">
                          Winner: {auction.winner}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-hodhod-black mb-2">
                      {auction.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{auction.seller}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {auction.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm font-medium">{auction.rating}</span>
                        <span className="text-sm text-gray-500 ml-1 rtl:ml-0 rtl:mr-1">
                          ({auction.reviews})
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span className="text-sm">{auction.location}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Bid:</span>
                        <span className="font-semibold text-hodhod-gold">${auction.currentBid}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Starting Price:</span>
                        <span className="text-sm text-gray-500">${auction.startingPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Bids:</span>
                        <span className="text-sm font-medium">{auction.bids}</span>
                      </div>
                    </div>
                    
                    {auction.status === 'active' ? (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Time Left:</div>
                        <CountdownTimer 
                          endTime={auction.endTime}
                          onEnd={() => {
                            // Handle auction end
                            console.log(`Auction ${auction.id} ended`);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="text-sm text-red-600 font-medium">
                          Auction Ended
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Link
                        to={`/auctions/${auction.id}`}
                        state={{ auction }}
                        onClick={() => { try { localStorage.setItem('last_auction', JSON.stringify(auction)); } catch(_){} }}
                        className="flex-1 btn-primary text-center"
                      >
                        {auction.status === 'active' ? 'Place Bid' : 'View Details'}
                      </Link>
                      <Link
                        to={`/auctions/${auction.id}/bids`}
                        state={{ auction }}
                        onClick={() => { try { localStorage.setItem('last_auction', JSON.stringify(auction)); } catch(_){} }}
                        className="btn-outline"
                      >
                        View Bids
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {sortedAuctions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <WrenchScrewdriverIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;
