import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';

const key = (pid) => `demo_company_calendar_${pid || 'default'}`;

export default function CalendarManager({ providerId = 'me' }) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const s = new Date(d.setDate(diff)); s.setHours(0,0,0,0); return s;
  });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 86400000)), [weekStart]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/calendar');
      setEvents(res.data || []);
      localStorage.setItem(key(providerId), JSON.stringify(res.data || []));
    } catch (_) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAll = (list) => localStorage.setItem(key(providerId), JSON.stringify(list));

  const createOrUpdate = (e) => {
    setEvents((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x.id === e.id);
      if (idx >= 0) next[idx] = e; else next.push(e);
      saveAll(next);
      return next;
    });
  };

  const remove = (id) => {
    setEvents((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveAll(next);
      return next;
    });
  };

  const nextWeek = () => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000));
  const prevWeek = () => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Week of {weekStart.toLocaleDateString()}</div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={prevWeek}>Prev</button>
          <button className="btn-outline" onClick={() => setWeekStart(new Date())}>Today</button>
          <button className="btn-outline" onClick={nextWeek}>Next</button>
          <button className="btn-primary" onClick={() => setEditing({ id: '', title: '', date: new Date().toISOString().slice(0,10), time: '09:00', technician: '', branch: '' })}>New Job</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((d) => (
          <div key={d.toISOString()} className="bg-white rounded-xl shadow-sm border p-2 min-h-[160px]">
            <div className="text-sm font-medium mb-2">{d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
            {events.filter((e) => e.date === d.toISOString().slice(0,10)).map((e) => (
              <div key={e.id} className="text-xs mb-1 p-2 rounded border">
                <div className="font-semibold">{e.time} • {e.title}</div>
                <div className="text-gray-600">{e.technician || 'Unassigned'} @ {e.branch || '—'}</div>
                <div className="mt-1 flex gap-1">
                  <button className="btn-outline text-xs" onClick={() => setEditing({ ...e })}>Edit</button>
                  <button className="btn-outline text-xs" onClick={() => remove(e.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-hodhod shadow-hodhod max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{editing.id ? 'Edit Job' : 'New Job'}</h3><button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm text-gray-700 mb-1">Title</label><input className="input-field" value={editing.title} onChange={(e)=>setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="block text-sm text-gray-700 mb-1">Date</label><input type="date" className="input-field" value={editing.date} onChange={(e)=>setEditing({ ...editing, date: e.target.value })} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Time</label><input type="time" className="input-field" value={editing.time} onChange={(e)=>setEditing({ ...editing, time: e.target.value })} /></div>
                <div><label className="block text-sm text-gray-700 mb-1">Technician</label><input className="input-field" value={editing.technician} onChange={(e)=>setEditing({ ...editing, technician: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm text-gray-700 mb-1">Branch</label><input className="input-field" value={editing.branch} onChange={(e)=>setEditing({ ...editing, branch: e.target.value })} /></div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2"><button className="btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn-primary" onClick={async()=>{ const payload = { ...editing, id: editing.id || String(Date.now()) }; try{ if(editing.id){ await apiFetch(`/calendar/${editing.id}`, { method:'PUT', body: payload }); } else { await apiFetch('/calendar', { method:'POST', body: payload }); } } catch(_){} createOrUpdate(payload); setEditing(null); }}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}


