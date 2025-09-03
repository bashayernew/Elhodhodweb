import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StarIcon, MapPinIcon, ShareIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo product data as fallback
  const demoProducts = {
    'demo-1': {
      id: 'demo-1',
      title: 'Premium Construction Tools Set',
      description: 'Professional-grade construction tools including hammer, drill, saw, and safety equipment. Perfect for contractors and DIY enthusiasts.',
      price: 150,
      originalPrice: 200,
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      reviews: 156,
      governorate: 'Hawalli',
      area: 'Salmiya',
      category: 'Tools',
      sellerId: 'demo-provider-1',
      provider: {
        profile: {
          firstName: 'Ahmed',
          lastName: 'Construction',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        provider: {
          categories: JSON.stringify(['Construction', 'Tools', 'Equipment'])
        }
      },
      inStock: true,
      warranty: '2 years',
      returnPolicy: '30 days return policy'
    },
    'demo-2': {
      id: 'demo-2',
      title: 'Smart Home Security System',
      description: 'Complete home security solution with cameras, motion sensors, and mobile app control. Easy installation and 24/7 monitoring.',
      price: 299,
      originalPrice: 399,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      reviews: 89,
      governorate: 'Kuwait City',
      area: 'Salmiya',
      category: 'Security',
      sellerId: 'demo-provider-2',
      provider: {
        profile: {
          firstName: 'Security',
          lastName: 'Solutions',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        provider: {
          categories: JSON.stringify(['Security', 'Technology', 'Installation'])
        }
      },
      inStock: true,
      warranty: '1 year',
      returnPolicy: '14 days return policy'
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Try to fetch from backend first
    apiFetch(`/products/${id}`)
      .then((res) => {
        if (mounted && res.data) {
          setData(res.data);
        } else {
          // Fallback to demo data
          const demoData = demoProducts[id] || demoProducts['demo-1'];
          setData(demoData);
        }
      })
      .catch(() => {
        // Backend not available, use demo data
        const demoData = demoProducts[id] || demoProducts['demo-1'];
        setData(demoData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="container-hodhod py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-hodhod py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn-primary">Browse All Products</Link>
        </div>
      </div>
    );
  }

  const discountPercentage = data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : 0;

  return (
    <div className="container-hodhod py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/">Home</Link> <span>/</span> <Link to="/products">Products</Link> <span>/</span> <span className="text-gray-900">{data.title}</span>
      </nav>

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <img 
            src={data.images?.[0] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60'} 
            alt={data.title} 
            className="w-full h-80 object-cover rounded-hodhod" 
          />
          <div className="mt-2 grid grid-cols-5 gap-2">
            {(data.images || []).slice(0, 5).map((img, idx) => (
              <img key={idx} src={img} alt="thumb" className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          
          {/* Rating and Location */}
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="inline-flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400" /> 
              {data.rating?.toFixed?.(1) || '—'} ({data.reviews || 0})
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" /> 
              {data.governorate}{data.area ? `, ${data.area}` : ''}
            </span>
            <button className="inline-flex items-center gap-1 hover:text-hodhod-gold">
              <ShareIcon className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Price */}
          <div className="mb-4">
            {data.originalPrice && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 line-through">{data.originalPrice} KWD</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  -{discountPercentage}%
                </span>
              </div>
            )}
            <div className="text-3xl font-semibold text-hodhod-gold">{data.price} KWD</div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{data.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              data.inStock 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {data.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Add to Cart
            </button>
            <button className="btn-outline inline-flex items-center gap-1">
              <HeartIcon className="w-5 h-5" /> Save
            </button>
          </div>

          {/* Quick Info */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Warranty:</span>
              <span>{data.warranty || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span>Return Policy:</span>
              <span>{data.returnPolicy || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span>{data.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Information */}
      <div className="bg-white rounded-hodhod shadow-hodhod p-6 mb-6">
        <div className="flex items-center gap-3">
          {data.provider?.profile?.avatar ? (
            <img src={data.provider.profile.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center font-semibold">
              {(data.provider?.profile?.firstName || 'S').slice(0,1)}
            </div>
          )}
          <div>
            <div className="font-semibold">
              {data.provider?.profile?.firstName || 'Seller'} {data.provider?.profile?.lastName || ''}
            </div>
            <div className="text-sm text-gray-600">Verified Seller</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(() => { 
                try { 
                  return JSON.parse(data.provider?.provider?.categories || '[]'); 
                } catch { 
                  return []; 
                } 
              })().slice(0,6).map((c) => (
                <span key={c} className="badge-success">{c}</span>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <Link to={`/providers/${data.sellerId}`} className="btn-outline">View Profile</Link>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-6">
          <h3 className="text-lg font-semibold mb-3">Product Details</h3>
          <p className="text-gray-600 mb-6">{data.description}</p>
          
          <h3 className="text-lg font-semibold mb-3">Features</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
            <li>High-quality materials and construction</li>
            <li>Professional-grade performance</li>
            <li>Easy to use and maintain</li>
            <li>Comes with warranty and support</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3">Specifications</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span>Professional Grade</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span>2024 Edition</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span>Varies</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dimensions:</span>
              <span>Standard</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Shipping Info */}
          <div className="bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-3">Shipping & Delivery</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Standard Delivery:</span>
                <span>2-3 business days</span>
              </div>
              <div className="flex justify-between">
                <span>Express Delivery:</span>
                <span>Same day</span>
              </div>
              <div className="flex justify-between">
                <span>Free Shipping:</span>
                <span>Orders over 100 KWD</span>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-3">Customer Support</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>📞 24/7 Support Available</div>
              <div>💬 Live Chat</div>
              <div>📧 Email Support</div>
              <div>🔄 Easy Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
