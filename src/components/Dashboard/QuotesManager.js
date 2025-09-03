import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

const lcKey = (pid) => `demo_company_quotes_${pid || 'default'}`;

export default function QuotesManager({ providerId = 'me' }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // quote to respond

  const filtered = useMemo(() => (items || []).filter((x) => !q || (x.requestTitle || '').toLowerCase().includes(q.toLowerCase())), [items, q]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/quotes?limit=50');
      setItems(res.data || []);
      localStorage.setItem(lcKey(providerId), JSON.stringify(res.data || []));
    } catch (_) {
      try { setItems(JSON.parse(localStorage.getItem(lcKey(providerId)) || '[]')); } catch { setItems([]); }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (form) => {
    try {
      await apiFetch(`/quotes/${form.id}/respond`, { method: 'PUT', body: { price: form.price, terms: form.terms, expiresAt: form.expiresAt } });
    } catch (_) {
      // demo: update local
      const list = JSON.parse(localStorage.getItem(lcKey(providerId)) || '[]').map((r) => (r.id === form.id ? { ...r, response: { price: form.price, terms: form.terms, expiresAt: form.expiresAt } } : r));
      localStorage.setItem(lcKey(providerId), JSON.stringify(list));
    } finally {
      setEditing(null);
      refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input className="input-field" placeholder="Search requests" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn-outline" onClick={refresh}>Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_,i)=> <div key={i} className="animate-pulse h-40 bg-gray-100 rounded" />)}
        {!loading && filtered.map((r) => (
          <motion.div key={r.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="font-semibold mb-1">{r.requestTitle || 'Request'}</div>
            <div className="text-sm text-gray-600 mb-2">Budget: {r.budget || '—'} • Due: {r.dueDate || '—'}</div>
            {r.response ? (
              <div className="text-sm text-green-700">Quoted {r.response.price} KWD • Expires {r.response.expiresAt || '—'}</div>
            ) : (
              <div className="flex gap-2">
                <button className="btn-primary" onClick={()=>setEditing({ id: r.id, price: '', terms: '', expiresAt: '' })}>Respond</button>
              </div>
            )}
          </motion.div>
        ))}
        {!loading && filtered.length===0 && <div className="text-gray-500">No requests found.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Send Quote</h3><button onClick={()=>setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm text-gray-700 mb-1">Price (KWD)</label><input type="number" className="input-field" value={editing.price} onChange={(e)=>setEditing({ ...editing, price: e.target.value })} /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Terms</label><textarea className="input-field" rows="3" value={editing.terms} onChange={(e)=>setEditing({ ...editing, terms: e.target.value })} /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Expires At</label><input type="date" className="input-field" value={editing.expiresAt} onChange={(e)=>setEditing({ ...editing, expiresAt: e.target.value })} /></div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2"><button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn-primary" onClick={()=>respond(editing)} disabled={!editing.price}>Send</button></div>
          </div>
        </div>
      )}
    </div>
  );
}


