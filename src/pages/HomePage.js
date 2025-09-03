import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRightIcon, 
  StarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { t } = useTranslation();

  // Mock data - replace with actual API calls
  const featuredServices = [
    {
      id: 1,
      title: 'Home Renovation',
      provider: 'Ahmed Construction',
      rating: 4.8,
      reviews: 127,
      price: '$500-2000',
      location: 'Dubai',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      category: 'renovation'
    },
    {
      id: 2,
      title: 'Plumbing Services',
      provider: 'Quick Fix Plumbing',
      rating: 4.9,
      reviews: 89,
      price: '$100-500',
      location: 'Abu Dhabi',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      category: 'plumbing'
    },
    {
      id: 3,
      title: 'Electrical Installation',
      provider: 'Power Solutions',
      rating: 4.7,
      reviews: 156,
      price: '$200-800',
      location: 'Sharjah',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
      category: 'electrical'
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      title: 'Professional Drill Set',
      seller: 'Tools Pro',
      rating: 4.6,
      reviews: 234,
      price: '$89.99',
      originalPrice: '$120.00',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
      condition: 'new'
    },
    {
      id: 2,
      title: 'LED Light Fixtures',
      seller: 'Lighting World',
      rating: 4.8,
      reviews: 189,
      price: '$45.50',
      originalPrice: '$60.00',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      condition: 'new'
    },
    {
      id: 3,
      title: 'Kitchen Sink',
      seller: 'Home Essentials',
      rating: 4.5,
      reviews: 67,
      price: '$199.99',
      originalPrice: '$250.00',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      condition: 'refurbished'
    }
  ];

  const activeAuctions = [
    {
      id: 1,
      title: 'Vintage Chandelier',
      currentBid: '$1,250',
      bids: 12,
      timeLeft: '2h 15m',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
      startingPrice: '$800'
    },
    {
      id: 2,
      title: 'Antique Door Set',
      currentBid: '$450',
      bids: 8,
      timeLeft: '5h 30m',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
      startingPrice: '$300'
    },
    {
      id: 3,
      title: 'Marble Countertop',
      currentBid: '$2,100',
      bids: 15,
      timeLeft: '1h 45m',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      startingPrice: '$1,500'
    }
  ];

  const categories = [
    { name: t('services.categories.construction'), icon: '🏗️', count: 156 },
    { name: t('services.categories.renovation'), icon: '🔨', count: 89 },
    { name: t('services.categories.plumbing'), icon: '🔧', count: 234 },
    { name: t('services.categories.electrical'), icon: '⚡', count: 167 },
    { name: t('services.categories.painting'), icon: '🎨', count: 123 },
    { name: t('services.categories.cleaning'), icon: '🧹', count: 198 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-hodhod-gold-light to-white py-20 overflow-hidden">
        <div className="container-hodhod">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hodhod-black mb-6 font-cairo">
                {t('home.welcome')}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('home.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/services"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  {t('home.getStarted')}
                  <ArrowRightIcon className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-hodhod border border-hodhod-gray-300 text-hodhod-gray-700 hover:bg-hodhod-gray-50"
                >
                  {t('home.learnMore')}
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-hodhod-lg shadow-hodhod-lg p-8 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  {categories.slice(0, 4).map((category, index) => (
                    <Link
                      key={category.name}
                      to={`/services?category=${encodeURIComponent(category.name.toLowerCase())}`}
                      className="text-center p-4 rounded-hodhod bg-gray-50 hover:bg-hodhod-gold-light transition-colors duration-200 cursor-pointer"
                    >
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <div className="font-medium text-sm text-gray-700">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.count} services</div>
                    </Link>
                  ))}
                </div>
              </div>
              <img alt="construction" src="https://images.unsplash.com/photo-1581093458791-9d09f27a87f8?auto=format&fit=crop&w=1200&q=60" className="hidden lg:block absolute -right-20 -bottom-16 w-[520px] h-[320px] object-cover opacity-20 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container-hodhod">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo">
              {t('home.featuredServices')}
            </h2>
            <Link
              to="/services"
              className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium flex items-center"
            >
              {t('home.viewAll')}
              <ArrowRightIcon className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -5 }}
                className="card-hover group relative"
              >
                <Link to={`/services/${service.id}`} className="absolute inset-0 z-10" aria-label={`Open ${service.title}`}></Link>
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-t-hodhod transform transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                    <span className="badge-gold">
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-hodhod-black mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">Quality work for your home</p>
                  <p className="text-gray-600 mb-3">{service.provider}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1 rtl:mr-0 rtl:ml-1" />
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-sm text-gray-500 ml-1 rtl:ml-0 rtl:mr-1">
                        ({service.reviews})
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                      <span className="text-sm">{service.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 text-hodhod-gold mr-1 rtl:mr-0 rtl:ml-1" />
                      <span className="font-semibold text-hodhod-gold">{service.price}</span>
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="inline-flex items-center px-4 py-2 rounded-hodhod text-sm border text-hodhod-gray-700 hover:bg-hodhod-gray-50">{t('home.viewAll')}</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-hodhod">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo">
              {t('home.featuredProducts')}
            </h2>
            <Link
              to="/products"
              className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium flex items-center"
            >
              {t('home.viewAll')}
              <ArrowRightIcon className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="card-hover relative"
              >
                <Link to={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`Open ${product.title}`}></Link>
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-hodhod"
                  />
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                    <span className="badge-success">
                      {product.condition}
                    </span>
                  </div>
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                      <span className="badge-error text-[12px] px-2 py-1">
                        -{Math.round(((parseFloat(product.originalPrice.replace('$', '')) - parseFloat(product.price.replace('$', ''))) / parseFloat(product.originalPrice.replace('$', ''))) * 100)}%
                      </span>
                    </div>
                  )}
                  {product.reviews > 150 && (
                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                      <span className="badge-gold">Best Seller</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-hodhod-black mb-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{product.seller}</p>
                  
                  <div className="flex items-center mb-4">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1 rtl:mr-0 rtl:ml-1" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500 ml-1 rtl:ml-0 rtl:mr-1">
                      ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xl font-bold text-hodhod-gold">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Auctions */}
      <section className="py-16 bg-white">
        <div className="container-hodhod">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo">
              {t('home.activeAuctions')}
            </h2>
            <Link
              to="/auctions"
              className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium flex items-center"
            >
              {t('home.viewAll')}
              <ArrowRightIcon className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAuctions.map((auction) => (
              <motion.div
                key={auction.id}
                whileHover={{ y: -5 }}
                className="card-hover relative"
              >
                <Link to={`/auctions/${auction.id}`} className="absolute inset-0 z-10" aria-label={`Open ${auction.title}`}></Link>
                <div className="relative">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-48 object-cover rounded-t-hodhod"
                  />
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${parseInt(auction.timeLeft) < 1 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      <ClockIcon className="w-3 h-3 inline mr-1 rtl:mr-0 rtl:ml-1" />
                      {auction.timeLeft}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-hodhod-black mb-2">
                    {auction.title}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Bid:</span>
                      <span className="font-semibold text-hodhod-gold">{auction.currentBid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Starting Price:</span>
                      <span className="text-sm text-gray-500">{auction.startingPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Bids:</span>
                      <span className="text-sm font-medium">{auction.bids}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-hodhod-gold" style={{ width: `${Math.min(auction.bids * 5, 100)}%` }} />
                    </div>
                  </div>
                  
                  <Link
                    to={`/auctions/${auction.id}`}
                    className="btn-primary w-full text-center"
                  >
                    Place Bid
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
