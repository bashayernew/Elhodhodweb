import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';

export default function FinanceManager(){
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [payouts, setPayouts] = useState([]);

  useEffect(()=>{
    const run = async ()=>{
      setLoading(true);
      try{ const res = await apiFetch('/finance/summary'); setBalance(res.data?.balance || 0); setPayouts(res.data?.payouts || []); }
      catch{ setBalance(0); setPayouts([]); }
      finally{ setLoading(false); }
    };
    run();
  },[]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="text-sm text-gray-600">Current Balance</div>
        <div className="text-2xl font-semibold">{balance} KWD</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="text-lg font-semibold mb-2">Payouts</div>
        {loading && <div className="animate-pulse h-6 bg-gray-100 rounded" />}
        {!loading && payouts.length===0 && <div className="text-gray-500">No payouts yet.</div>}
        {!loading && payouts.length>0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Status</th></tr></thead>
              <tbody>
                {payouts.map((p, i)=> (
                  <tr key={i} className="border-t"><td className="py-2 pr-4">{p.date}</td><td className="py-2 pr-4">{p.amount} KWD</td><td className="py-2 pr-4 capitalize">{p.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


