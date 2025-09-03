import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AuctionBidsPage(){
  const { id } = useParams();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(()=>{
    let mounted=true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const res = await fetch(`${baseUrl}/auctions/${id}/bids`); const json=await res.json();
        if(!res.ok||!json.success){
          // Fallback to router state/local snapshot → show empty list with context
          const snap = location.state?.auction || JSON.parse(localStorage.getItem('last_auction')||'null');
          if (snap) { if(mounted) setItems([]); else {} }
          else { throw new Error(json.message||'Failed'); }
        } else { if(mounted) setItems(json.data||[]); }
      } catch(e){ if(mounted) setError(e.message||'Failed to load'); } finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id]);
  if (loading) return <div className="container-hodhod py-10">Loading…</div>;
  if (error) return <div className="container-hodhod py-10 text-red-600">{error}</div>;
  return (
    <div className="container-hodhod py-8">
      <h1 className="text-2xl font-semibold mb-4">Bids</h1>
      <div className="space-y-2">
        {items.length? items.map((b)=> (
          <div key={b.id} className="border rounded p-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{b.amount} KWD</div>
              <div className="text-gray-500">{new Date(b.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-xs text-gray-500">Bidder: {b.bidder?.profile?.firstName || b.bidderId}</div>
          </div>
        )) : <div className="text-gray-500 text-sm">No bids yet.</div>}
      </div>
      <div className="pt-3"><Link to={`/auctions/${id}`} className="text-hodhod-gold">Back to auction</Link></div>
    </div>
  );
}


