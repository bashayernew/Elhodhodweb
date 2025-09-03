import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../utils/api';

const DEFAULT_AUCTION = {
  id: '',
  title: '',
  description: '',
  startPrice: '0',
  minIncrement: '1',
  reservePrice: '',
  buyNowPrice: '',
  startsAt: '',
  endsAt: '',
};

function loadDemo(pid){ try{ return JSON.parse(localStorage.getItem(`demo_company_auctions_${pid}`)||'[]'); }catch{ return []; } }
function saveDemo(pid, items){ localStorage.setItem(`demo_company_auctions_${pid}`, JSON.stringify(items)); }

export default function AuctionsManager(){
  const { user } = useAuth();
  const pid = user?.id || 'me';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(()=> items.filter(a=> !q || a.title.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const refresh = async ()=>{
    setLoading(true);
    try{ const res = await apiFetch('/auctions/provider/auctions'); setItems(res.data||[]); }
    catch{ setItems(loadDemo(pid)); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ refresh(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const upsert = (rec)=> setItems(prev=>{ const next=[...prev]; const i=next.findIndex(x=>x.id===rec.id); if(i>=0) next[i]=rec; else next.unshift(rec); saveDemo(pid,next); return next;});
  const remove = (id)=> setItems(prev=>{ const n=prev.filter(x=>x.id!==id); saveDemo(pid,n); return n;});

  const save = async(form)=>{
    const payload={...form};
    try{
      if(payload.id) { /* not used for now */ }
      else { const created = await apiFetch('/auctions/provider/auctions', { method:'POST', body: payload }); payload.id = created?.data?.id || String(Date.now()); }
      upsert(payload); setEditing(null);
    }catch{ if(!payload.id) payload.id=String(Date.now()); upsert(payload); setEditing(null); }
  };
  const del = async(id)=>{ try{ await apiFetch(`/auctions/provider/auctions/${id}`, { method:'DELETE' }); }catch{} remove(id); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input className="input-field" placeholder="Search auctions" value={q} onChange={(e)=>setQ(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-outline" onClick={refresh}>Refresh</button>
          <button className="btn-primary" onClick={()=>setEditing({ ...DEFAULT_AUCTION })}>Create Auction</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_,i)=> <div key={i} className="animate-pulse h-40 bg-gray-100 rounded" />)}
        {!loading && filtered.map((a)=> (
          <motion.div key={a.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">Current: {a.currentPrice ?? a.startPrice} • Min inc: {a.minIncrement}</div>
            <div className="font-semibold mb-1">{a.title}</div>
            <div className="text-sm text-gray-600 mb-3">Ends: {a.endsAt || a.endTime || '—'}</div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={()=>del(a.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length===0 && <div className="text-gray-500">No auctions found.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Create Auction</h3><button onClick={()=>setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm text-gray-700 mb-1">Title</label><input className="input-field" value={editing.title} onChange={(e)=>setEditing({ ...editing, title: e.target.value })} /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Description</label><textarea className="input-field" rows="3" value={editing.description} onChange={(e)=>setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-700 mb-1">Start Price</label><input type="number" className="input-field" value={editing.startPrice} onChange={(e)=>setEditing({ ...editing, startPrice: e.target.value })} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Min Increment</label><input type="number" className="input-field" value={editing.minIncrement} onChange={(e)=>setEditing({ ...editing, minIncrement: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-700 mb-1">Reserve Price</label><input type="number" className="input-field" value={editing.reservePrice} onChange={(e)=>setEditing({ ...editing, reservePrice: e.target.value })} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Buy-Now Price</label><input type="number" className="input-field" value={editing.buyNowPrice} onChange={(e)=>setEditing({ ...editing, buyNowPrice: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-700 mb-1">Starts At</label><input type="datetime-local" className="input-field" value={editing.startsAt} onChange={(e)=>setEditing({ ...editing, startsAt: e.target.value })} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Ends At</label><input type="datetime-local" className="input-field" value={editing.endsAt} onChange={(e)=>setEditing({ ...editing, endsAt: e.target.value })} /></div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={()=>save(editing)} disabled={!editing.title?.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


