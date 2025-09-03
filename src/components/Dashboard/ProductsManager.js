import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../utils/api';

const DEFAULT_PRODUCT = {
  id: '',
  name: '',
  description: '',
  category: '',
  subcategory: '',
  price: '',
  originalPrice: '',
  condition: 'new',
  stock: '0',
  status: 'draft',
};

function loadDemo(providerId) {
  const key = `demo_company_products_${providerId || 'default'}`;
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveDemo(providerId, items) {
  const key = `demo_company_products_${providerId || 'default'}`;
  localStorage.setItem(key, JSON.stringify(items));
}

export default function ProductsManager() {
  const { user } = useAuth();
  const providerId = user?.id || 'me';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => items.filter(p =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (status === 'all' || p.status === status)
  ), [items, q, status]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/products/provider/products', { timeoutMs: 4000 });
      setItems(res.data || []);
    } catch {
      setItems(loadDemo(providerId));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsertLocal = (record) => {
    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(x => x.id === record.id);
      if (idx >= 0) next[idx] = record; else next.unshift(record);
      saveDemo(providerId, next);
      return next;
    });
  };
  const removeLocal = (id) => setItems(prev => { const next = prev.filter(x=>x.id!==id); saveDemo(providerId, next); return next; });

  const save = async (form) => {
    const payload = { ...form };
    try {
      if (payload.id) await apiFetch(`/products/provider/products/${payload.id}`, { method: 'PUT', body: payload });
      else {
        const created = await apiFetch('/products/provider/products', { method: 'POST', body: payload });
        payload.id = created?.data?.id || String(Date.now());
      }
      upsertLocal(payload); setEditing(null);
    } catch {
      if (!payload.id) payload.id = String(Date.now());
      upsertLocal(payload); setEditing(null);
    }
  };
  const del = async (id) => { try { await apiFetch(`/products/provider/products/${id}`, { method: 'DELETE' }); } catch {} removeLocal(id); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <input className="input-field" placeholder="Search products" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input-field" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={refresh}>Refresh</button>
          <button className="btn-primary" onClick={()=>setEditing({ ...DEFAULT_PRODUCT })}>Add Product</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_,i)=> <div key={i} className="animate-pulse h-40 bg-gray-100 rounded" />)}
        {!loading && filtered.map((p) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1 capitalize">{p.condition || 'new'} • {p.status}</div>
            <div className="font-semibold mb-1">{p.name}</div>
            <div className="text-sm text-gray-600 mb-3">Price: {p.price} • Stock: {p.stock}</div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={()=>setEditing({ ...p })}>Edit</button>
              <button className="btn-outline" onClick={()=>save({ ...p, status: p.status === 'hidden' ? 'active' : 'hidden' })}>{p.status === 'hidden' ? 'Unhide' : 'Hide'}</button>
              <button className="btn-outline" onClick={()=>del(p.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length === 0 && <div className="text-gray-500">No products found.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editing.id ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={()=>setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input className="input-field" value={editing.name} onChange={(e)=>setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows="3" value={editing.description} onChange={(e)=>setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Category</label>
                  <input className="input-field" value={editing.category} onChange={(e)=>setEditing({ ...editing, category: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Subcategory</label>
                  <input className="input-field" value={editing.subcategory} onChange={(e)=>setEditing({ ...editing, subcategory: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Price</label>
                  <input type="number" className="input-field" value={editing.price} onChange={(e)=>setEditing({ ...editing, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Original Price</label>
                  <input type="number" className="input-field" value={editing.originalPrice} onChange={(e)=>setEditing({ ...editing, originalPrice: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Stock</label>
                  <input type="number" className="input-field" value={editing.stock} onChange={(e)=>setEditing({ ...editing, stock: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Condition</label>
                  <select className="input-field" value={editing.condition} onChange={(e)=>setEditing({ ...editing, condition: e.target.value })}>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={editing.status} onChange={(e)=>setEditing({ ...editing, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={()=>save(editing)} disabled={!editing.name?.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


