import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../utils/api';

const DEFAULT_SERVICE = {
  id: '',
  title: '',
  description: '',
  category: '',
  subcategory: '',
  pricingModel: 'fixed', // fixed | hourly | visit | quote
  price: '',
  leadTime: '',
  areas: '', // comma-separated for demo
  status: 'draft', // draft | active | hidden
};

function loadDemo(providerId) {
  const key = `demo_company_services_${providerId || 'default'}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveDemo(providerId, items) {
  const key = `demo_company_services_${providerId || 'default'}`;
  localStorage.setItem(key, JSON.stringify(items));
}

export default function ServicesManager() {
  const { user } = useAuth();
  const providerId = user?.id || 'me';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null); // object or null

  const filtered = useMemo(() => {
    return (items || []).filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q || s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/provider/services', { timeoutMs: 4000 });
      setItems(res.data || []);
    } catch (_) {
      setItems(loadDemo(providerId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsertLocal = (record) => {
    setItems((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x.id === record.id);
      if (idx >= 0) next[idx] = record; else next.unshift(record);
      saveDemo(providerId, next);
      return next;
    });
  };

  const removeLocal = (id) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveDemo(providerId, next);
      return next;
    });
  };

  const handleSave = async (form) => {
    const payload = { ...form };
    try {
      if (payload.id) {
        await apiFetch(`/provider/services/${payload.id}`, { method: 'PUT', body: payload, timeoutMs: 5000 });
      } else {
        const created = await apiFetch('/provider/services', { method: 'POST', body: payload, timeoutMs: 5000 });
        payload.id = created?.data?.id || String(Date.now());
      }
      upsertLocal(payload);
      setEditing(null);
    } catch (_) {
      // Demo fallback: upsert locally with generated id
      if (!payload.id) payload.id = String(Date.now());
      upsertLocal(payload);
      setEditing(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/provider/services/${id}`, { method: 'DELETE', timeoutMs: 4000 });
      removeLocal(id);
    } catch (_) {
      removeLocal(id);
    }
  };

  const duplicate = (s) => {
    const copy = { ...s, id: '', title: `${s.title} (copy)`, status: 'draft' };
    setEditing(copy);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <input className="input-field" placeholder="Search services" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="input-field" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={fetchList}>Refresh</button>
          <button className="btn-primary" onClick={() => setEditing({ ...DEFAULT_SERVICE })}>Add Service</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={`s-${i}`} className="animate-pulse h-40 bg-gray-100 rounded" />
        ))}
        {!loading && filtered.map((s) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1 capitalize">{s.pricingModel || 'fixed'} • {s.status}</div>
            <div className="font-semibold mb-1">{s.title}</div>
            <div className="text-sm text-gray-600 mb-3">Lead time: {s.leadTime || '—'} • Coverage: {s.areas || '—'}</div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={() => setEditing({ ...s })}>Edit</button>
              <button className="btn-outline" onClick={() => duplicate(s)}>Duplicate</button>
              <button className="btn-outline" onClick={() => handleSave({ ...s, status: s.status === 'hidden' ? 'active' : 'hidden' })}>{s.status === 'hidden' ? 'Unhide' : 'Hide'}</button>
              <button className="btn-outline" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-gray-500">No services found.</div>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editing.id ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input className="input-field" value={editing.title} onChange={(e)=>setEditing({ ...editing, title: e.target.value })} />
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
                  <label className="block text-sm text-gray-700 mb-1">Pricing Model</label>
                  <select className="input-field" value={editing.pricingModel} onChange={(e)=>setEditing({ ...editing, pricingModel: e.target.value })}>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="visit">Per Visit</option>
                    <option value="quote">Quote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Price (KWD)</label>
                  <input type="number" className="input-field" value={editing.price} onChange={(e)=>setEditing({ ...editing, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Lead Time</label>
                  <input className="input-field" placeholder="e.g., 1-2 days" value={editing.leadTime} onChange={(e)=>setEditing({ ...editing, leadTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Coverage Areas</label>
                <input className="input-field" placeholder="Governorate/Areas, ..." value={editing.areas} onChange={(e)=>setEditing({ ...editing, areas: e.target.value })} />
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
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={()=>handleSave(editing)} disabled={!editing.title?.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


