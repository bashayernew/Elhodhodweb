import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';

export default function CustomersManager(){
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  const filtered = useMemo(()=> items.filter(c => !q || (c.name||'').toLowerCase().includes(q.toLowerCase())), [items, q]);

  const refresh = async ()=>{
    setLoading(true);
    try{ const res = await apiFetch('/customers?limit=100'); setItems(res.data||[]); }
    catch{ setItems([]); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ refresh(); },[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input className="input-field" placeholder="Search customers" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn-outline" onClick={refresh}>Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_,i)=> <div key={i} className="animate-pulse h-24 bg-gray-100 rounded" />)}
        {!loading && filtered.map((c)=> (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="font-semibold">{c.name || 'Customer'}</div>
            <div className="text-sm text-gray-600">Orders: {c.orders ?? 0} • Rating: {c.rating ?? '—'}</div>
            <div className="text-sm text-gray-600 mt-1">Segments: {(c.segments||[]).join(', ') || '—'}</div>
          </div>
        ))}
        {!loading && filtered.length===0 && <div className="text-gray-500">No customers found.</div>}
      </div>
    </div>
  );
}


