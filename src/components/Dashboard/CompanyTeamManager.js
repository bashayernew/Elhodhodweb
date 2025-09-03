import React, { useEffect, useState } from 'react';

export default function CompanyTeamManager(){
  const [team, setTeam] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('demo_company_team')||'[]'); }catch{ return []; } });
  const [editing, setEditing] = useState(null);

  const saveAll = (list)=> localStorage.setItem('demo_company_team', JSON.stringify(list));

  const upsert = (m)=> setTeam(prev=>{ const next=[...prev]; const i=next.findIndex(x=>x.id===m.id); if(i>=0) next[i]=m; else next.unshift(m); saveAll(next); return next; });
  const remove = (id)=> setTeam(prev=>{ const n=prev.filter(x=>x.id!==id); saveAll(n); return n; });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team</h3>
        <button className="btn-primary" onClick={()=>setEditing({ id:'', name:'', role:'', email:'' })}>Add Member</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {team.map((m)=> (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="font-semibold">{m.name}</div>
            <div className="text-sm text-gray-600">{m.role}</div>
            <div className="text-sm text-gray-600">{m.email}</div>
            <div className="mt-2 flex gap-2"><button className="btn-outline" onClick={()=>setEditing({...m})}>Edit</button><button className="btn-outline" onClick={()=>remove(m.id)}>Remove</button></div>
          </div>
        ))}
        {team.length===0 && <div className="text-gray-500">No team members yet.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{editing.id ? 'Edit Member' : 'Add Member'}</h3><button onClick={()=>setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm text-gray-700 mb-1">Name</label><input className="input-field" value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})} /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Role</label><input className="input-field" value={editing.role} onChange={(e)=>setEditing({...editing, role:e.target.value})} /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Email</label><input className="input-field" value={editing.email} onChange={(e)=>setEditing({...editing, email:e.target.value})} /></div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2"><button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn-primary" onClick={()=>{ const rec={ ...editing, id: editing.id || String(Date.now()) }; upsert(rec); setEditing(null); }}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}


