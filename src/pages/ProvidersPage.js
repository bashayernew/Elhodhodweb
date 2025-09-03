import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ProvidersPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/providers', window.location.origin);
        if (q) url.searchParams.set('q', q);
        if (category) url.searchParams.set('category', category);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (mounted) setItems(data.data || []);
      } catch (_) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [q, category]);

  return (
    <div className="container-hodhod py-8">
      <div className="flex items-center gap-2 mb-4">
        <input className="input-field" placeholder="Search professionals" value={q} onChange={(e)=>setQ(e.target.value)} />
        <input className="input-field" placeholder="Category slug" value={category} onChange={(e)=>setCategory(e.target.value)} />
      </div>

      {loading && <div className="animate-pulse h-40 bg-gray-100 rounded" />}
      {!loading && items.length === 0 && <p className="text-gray-500">No professionals found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-hodhod shadow-hodhod p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center font-semibold">
                {(p.brandName || `${p.firstName||''} ${p.lastName||''}`).trim().slice(0,1) || 'P'}
              </div>
              <div>
                <div className="font-semibold">{p.brandName || `${p.firstName||''} ${p.lastName||''}`}</div>
                <div className="text-xs text-gray-500">{p.verificationStatus}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(p.categories || []).slice(0,6).map((c) => <span className="badge-success" key={c}>{c}</span>)}
                </div>
              </div>
              <div className="ml-auto">
                <Link to={`/providers/${p.id}`} className="btn-outline">View Profile</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


