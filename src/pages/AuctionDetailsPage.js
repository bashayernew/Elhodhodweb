import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuctionDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        // Highest priority: router state
        if (location.state?.auction) {
          if (mounted) setData(location.state.auction);
          setLoading(false);
          return;
        }

        // Try backend first
        let res = await fetch(`${baseUrl}/auctions/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          // Fallback to mock card data displayed on listing
          const gridCard = document.querySelector(`[data-auction-id="${id}"]`);
          if (gridCard) {
            const mock = JSON.parse(gridCard.getAttribute('data-auction-json'));
            if (mounted) setData({ ...mock, id });
          } else {
            // Fallback to persisted local snapshot set on click
            try {
              const snap = JSON.parse(localStorage.getItem('last_auction') || 'null');
              if (snap && String(snap.id) === String(id)) { if (mounted) setData(snap); }
              else { throw new Error(json.message || 'Auction not found'); }
            } catch {
              throw new Error(json.message || 'Auction not found');
            }
          }
        } else {
          if (mounted) setData(json.data);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load auction');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const placeBid = async () => {
    setPlacing(true); setMessage(''); setError('');
    try {
      const body = { amount: parseFloat(amount) };
      if (!body.amount || isNaN(body.amount)) { setError('Enter a valid amount'); setPlacing(false); return; }
      const res = await fetch(`${baseUrl}/auctions/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}`
        },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(json.message || 'Failed to place bid');
      setMessage('Bid placed successfully');
      // Refresh latest details
      try { const r = await fetch(`${baseUrl}/auctions/${id}`); const j = await r.json(); if (j?.data) setData(j.data); } catch {}
    } catch (e) {
      setError(e.message || 'Failed to place bid');
    } finally { setPlacing(false); }
  };

  if (loading) return <div className="container-hodhod py-10">Loading…</div>;
  if (error) return <div className="container-hodhod py-10 text-red-600">{error}</div>;
  if (!data) return null;

  const ended = data.status && data.status !== 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-hodhod py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-hodhod shadow-hodhod overflow-hidden">
            <img src={data.image || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60'} alt={data.title} className="w-full h-72 object-cover" />
            <div className="p-6">
              <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
              <p className="text-gray-600 mb-4">{data.description || '—'}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="border rounded p-3"><div className="text-gray-500">Current Price</div><div className="font-semibold">{data.currentPrice ?? data.startPrice} KWD</div></div>
                <div className="border rounded p-3"><div className="text-gray-500">Min Inc.</div><div className="font-semibold">{data.minIncrement} KWD</div></div>
                <div className="border rounded p-3"><div className="text-gray-500">Status</div><div className="font-semibold capitalize">{data.status}</div></div>
                <div className="border rounded p-3"><div className="text-gray-500">Ends</div><div className="font-semibold">{new Date(data.endTime || data.endsAt || Date.now()).toLocaleString()}</div></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-hodhod shadow-hodhod p-6 h-max">
            <h3 className="font-semibold mb-2">Place a bid</h3>
            {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {ended ? (
              <div className="text-sm text-gray-500">Auction has ended.</div>
            ) : (
              <>
                <input type="number" className="input-field w-full mb-2" placeholder="Amount (KWD)" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                <button className="btn-primary w-full" disabled={placing} onClick={placeBid}>{placing ? 'Placing…' : 'Place bid'}</button>
                <div className="text-xs text-gray-500 mt-2">You must be logged in to bid.</div>
              </>
            )}
            <div className="pt-3"><Link to={`/auctions/${id}/bids`} className="btn-outline w-full inline-block text-center">View all bids</Link></div>
            <div className="pt-2"><Link to="/auctions" className="text-sm text-hodhod-gold">Back to auctions</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailsPage;


