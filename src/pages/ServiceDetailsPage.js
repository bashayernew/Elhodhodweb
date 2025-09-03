import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StarIcon, MapPinIcon, ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo service data as fallback
  const demoServices = {
    'demo-1': {
      id: 'demo-1',
      title: 'Apartment Deep Cleaning',
      description: 'Full deep cleaning for 2-bedroom apartment, eco-friendly supplies. Includes kitchen, bathrooms, living areas, and bedrooms. Professional cleaning team with 5+ years experience.',
      price: 35,
      images: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      governorate: 'Hawalli',
      area: 'Salmiya',
      category: 'Cleaning',
      providerId: 'demo-provider-1',
      provider: {
        profile: {
          firstName: 'Ahmed',
          lastName: 'Cleaning',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        provider: {
          categories: JSON.stringify(['Cleaning', 'Maintenance', 'Home Services'])
        }
      }
    },
    'demo-2': {
      id: 'demo-2',
      title: 'Home Renovation & Painting',
      description: 'Complete home renovation including painting, minor repairs, and interior updates. Professional team with modern equipment and quality materials.',
      price: 500,
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      governorate: 'Kuwait City',
      area: 'Salmiya',
      category: 'Renovation',
      providerId: 'demo-provider-2',
      provider: {
        profile: {
          firstName: 'Construction',
          lastName: 'Pro',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        provider: {
          categories: JSON.stringify(['Construction', 'Renovation', 'Painting'])
        }
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Try to fetch from backend first
    apiFetch(`/services/${id}`)
      .then((res) => {
        if (mounted && res.data) {
          setData(res.data);
        } else {
          // Fallback to demo data
          const demoData = demoServices[id] || demoServices['demo-1'];
          setData(demoData);
        }
      })
      .catch(() => {
        // Backend not available, use demo data
        const demoData = demoServices[id] || demoServices['demo-1'];
        setData(demoData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <div className="container-hodhod py-10"><div className="animate-pulse h-64 bg-gray-100 rounded" /></div>;
  }
  if (!data) {
    return <div className="container-hodhod py-10">Service not found</div>;
  }

  return (
    <div className="container-hodhod py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/">Home</Link> <span>/</span> <Link to="/services">Services</Link> <span>/</span> <span className="text-gray-900">{data.title}</span>
      </nav>

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <img src={data.images?.[0] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60'} alt={data.title} className="w-full h-80 object-cover rounded-hodhod" />
          <div className="mt-2 grid grid-cols-5 gap-2">
            {(data.images || []).slice(0, 5).map((img, idx) => (
              <img key={idx} src={img} alt="thumb" className="w-full h-20 object-cover rounded" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="inline-flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" /> {data.rating?.toFixed?.(1) || '—'}</span>
            <span className="inline-flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {data.governorate}{data.area ? `, ${data.area}` : ''}</span>
            <button className="inline-flex items-center gap-1 hover:text-hodhod-gold"><ShareIcon className="w-4 h-4" /> Share</button>
          </div>
          <p className="text-gray-700 mb-4">{data.description}</p>
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-semibold text-hodhod-gold">{data.price} KWD</div>
            <div className="flex gap-2">
              <Link to={`/messages?to=${data.providerId}`} className="btn-outline">Chat</Link>
              <button className="btn-outline inline-flex items-center gap-1"><HeartIcon className="w-4 h-4" /> Save</button>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/orders/new?serviceId=${data.id}`} className="btn-primary">Order Now</Link>
            <Link to="/messages" className="btn-outline">Chat</Link>
          </div>
        </div>
      </div>

      {/* Professional block with categories */}
      <div className="bg-white rounded-hodhod shadow-hodhod p-6 mb-6">
        <div className="flex items-center gap-3">
          {data.provider?.profile?.avatar ? (
            <img src={data.provider.profile.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center font-semibold">
              {(data.provider?.profile?.firstName || 'P').slice(0,1)}
            </div>
          )}
          <div>
            <div className="font-semibold">{data.provider?.profile?.firstName || 'Professional'}</div>
            <div className="text-sm text-gray-600">Response time: —</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(() => { try { return JSON.parse(data.provider?.provider?.categories || '[]'); } catch { return []; } })().slice(0,6).map((c) => (
                <span key={c} className="badge-success">{c}</span>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <Link to={`/providers/${data.providerId}`} className="btn-outline">View Profile</Link>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-6">
          <h3 className="text-lg font-semibold mb-3">What’s included</h3>
          <p className="text-gray-600">Details TBD.</p>
          <h3 className="text-lg font-semibold mt-6 mb-3">FAQs</h3>
          <p className="text-gray-600">TBD.</p>
        </div>
        <div className="bg-white rounded-hodhod shadow-hodhod p-6">
          <h3 className="text-lg font-semibold mb-3">Availability</h3>
          <p className="text-gray-600">Next available: TBD</p>
        </div>
      </div>
    </div>
  );
}


