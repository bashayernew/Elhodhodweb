import React, { useEffect, useMemo, useState } from 'react';

export default function MarketingManager(){
  const [coupons, setCoupons] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('demo_coupons')||'[]'); }catch{ return []; } });
  const [editing, setEditing] = useState(null);

  const saveAll = (list)=> localStorage.setItem('demo_coupons', JSON.stringify(list));

  const upsert = (c)=> setCoupons(prev=>{ const next=[...prev]; const i=next.findIndex(x=>x.code===c.code); if(i>=0) next[i]=c; else next.unshift(c); saveAll(next); return next; });
  const remove = (code)=> setCoupons(prev=>{ const n=prev.filter(x=>x.code!==code); saveAll(n); return n; });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Coupons</h3>
        <button className="btn-primary" onClick={()=>setEditing({ code:'', type:'percent', value:'10', validUntil:'' })}>Create</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((c)=> (
          <div key={c.code} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="font-semibold">{c.code}</div>
            <div className="text-sm text-gray-600">{c.type==='percent' ? `${c.value}% off` : `${c.value} KWD off`} • Valid until {c.validUntil||'—'}</div>
            <div className="mt-2 flex gap-2"><button className="btn-outline" onClick={()=>setEditing({...c})}>Edit</button><button className="btn-outline" onClick={()=>remove(c.code)}>Delete</button></div>
          </div>
        ))}
        {coupons.length===0 && <div className="text-gray-500">No coupons yet.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{editing.code ? 'Edit Coupon' : 'Create Coupon'}</h3><button onClick={()=>setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm text-gray-700 mb-1">Code</label><input className="input-field" value={editing.code} onChange={(e)=>setEditing({...editing, code:e.target.value.toUpperCase()})} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="block text-sm text-gray-700 mb-1">Type</label><select className="input-field" value={editing.type} onChange={(e)=>setEditing({...editing, type:e.target.value})}><option value="percent">Percent</option><option value="amount">Amount</option></select></div>
                <div><label className="block text-sm text-gray-700 mb-1">Value</label><input type="number" className="input-field" value={editing.value} onChange={(e)=>setEditing({...editing, value:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Valid Until</label><input type="date" className="input-field" value={editing.validUntil} onChange={(e)=>setEditing({...editing, validUntil:e.target.value})} /></div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2"><button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn-primary" onClick={()=>{ upsert(editing); setEditing(null); }}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}


