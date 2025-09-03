import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

export default function OrdersManager(){
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(()=> items.filter(o =>
    (status==='all' || o.status===status) && (!q || (o.orderNumber||'').toLowerCase().includes(q.toLowerCase()))
  ), [items, status, q]);

  const refresh = async ()=>{
    setLoading(true);
    try { const res = await apiFetch('/orders?limit=50'); setItems(res.data||[]); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ refresh(); }, []);

  const updateStatus = async (id, next) => {
    try { await apiFetch(`/orders/${id}/status`, { method: 'PUT', body: { status: next } }); }
    catch {}
    finally { refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <input className="input-field" placeholder="Search by order #" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input-field" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="requested">Requested</option>
            <option value="quoting">Quoting</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button className="btn-outline" onClick={refresh}>Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_,i)=> <div key={i} className="animate-pulse h-40 bg-gray-100 rounded" />)}
        {!loading && filtered.map((o) => (
          <motion.div key={o.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold">{o.orderNumber}</div>
              <div className="text-xs px-2 py-0.5 rounded-full border capitalize">{o.status}</div>
            </div>
            <div className="text-sm text-gray-600 mb-2">Total: {o.totalAmount} KWD</div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={()=>updateStatus(o.id, 'scheduled')}>Schedule</button>
              <button className="btn-outline" onClick={()=>updateStatus(o.id, 'in_progress')}>Start</button>
              <button className="btn-outline" onClick={()=>updateStatus(o.id, 'completed')}>Complete</button>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length===0 && <div className="text-gray-500">No orders found.</div>}
      </div>
    </div>
  );
}


