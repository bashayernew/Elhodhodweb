import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/favorites')
      .then((res) => { if (!cancelled) setItems(res.data || []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="container-hodhod py-10">Loading favorites...</div>;

  if (!items.length) {
    return (
      <div className="container-hodhod py-10 text-center">
        <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-4">Browse services and products and tap the heart to save them here.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/services" className="btn-outline">Browse Services</Link>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-hodhod py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((fav) => (
          <div key={fav.id} className="bg-white rounded-hodhod shadow-hodhod overflow-hidden">
            {fav.type === 'service' && (
              <>
                <img src={fav.item?.images?.[0] || 'https://via.placeholder.com/600x400?text=Service'} alt="service" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{fav.item?.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{fav.item?.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/services/${fav.itemId}`} className="btn-primary">View Service</Link>
                  </div>
                </div>
              </>
            )}
            {fav.type === 'product' && (
              <>
                <img src={fav.item?.images?.[0] || 'https://via.placeholder.com/600x400?text=Product'} alt="product" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{fav.item?.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{fav.item?.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/products/${fav.itemId}`} className="btn-primary">View Product</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


