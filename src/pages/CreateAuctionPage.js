import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';

const CreateAuctionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    startPrice: '',
    minIncrement: '1',
    reservePrice: '',
    buyNowPrice: '',
    startsAt: new Date().toISOString().slice(0,16),
    endsAt: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,16),
  });

  // A) Auction rules
  const [antiSniping, setAntiSniping] = useState(true);
  const [extendByMin, setExtendByMin] = useState('2');
  const [inLastMin, setInLastMin] = useState('2');

  // B) Deposits
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // C) Notifications (for bidders)
  const [notify15, setNotify15] = useState(true);
  const [notify5, setNotify5] = useState(true);
  const [notify1, setNotify1] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [channelWa, setChannelWa] = useState(false);

  // D) Logistics / scope
  const [fulfillment, setFulfillment] = useState('pickup'); // pickup | delivery | service
  const [fulfillmentLocation, setFulfillmentLocation] = useState('');
  const [extraFees, setExtraFees] = useState('');
  const [policiesRef, setPoliciesRef] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startPrice: parseFloat(form.startPrice || '0'),
        minIncrement: parseFloat(form.minIncrement || '1'),
        reservePrice: form.reservePrice ? parseFloat(form.reservePrice) : undefined,
        buyNowPrice: form.buyNowPrice ? parseFloat(form.buyNowPrice) : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        // Auction rules
        antiSniping,
        antiSnipingExtendByMin: parseInt(extendByMin || '2', 10),
        antiSnipingIfInLastMin: parseInt(inLastMin || '2', 10),
        // Deposits (optional)
        requireDeposit,
        depositAmount: requireDeposit && depositAmount ? parseFloat(depositAmount) : undefined,
        // Notifications
        notifications: {
          reminders: { m15: notify15, m5: notify5, m1: notify1 },
          channels: { inApp: channelInApp, email: channelEmail, sms: channelSms, whatsapp: channelWa }
        },
        // Logistics
        logistics: {
          fulfillment,
          location: fulfillmentLocation,
          extraFees: extraFees || '',
          policiesRef: policiesRef || ''
        }
      };
      if (!payload.title || !form.startPrice) {
        setError('Title and starting price are required');
        setSubmitting(false);
        return;
      }
      await apiFetch('/auctions/provider/auctions', { method: 'POST', body: payload });
      navigate('/auctions');
    } catch (err) {
      setError(err?.message || 'Failed to create auction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-hodhod py-8">
        <h1 className="text-3xl font-bold mb-4">{t('auctions.createAuction') || 'Create Auction'}</h1>
        <form onSubmit={onSubmit} className="bg-white rounded-hodhod shadow-hodhod p-6 space-y-4 max-w-2xl">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" className="input-field w-full" value={form.title} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" className="input-field w-full" rows={4} value={form.description} onChange={onChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting price (KWD)</label>
              <input name="startPrice" type="number" min="0" className="input-field w-full" value={form.startPrice} onChange={onChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min increment (KWD)</label>
              <input name="minIncrement" type="number" min="0" className="input-field w-full" value={form.minIncrement} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reserve price (KWD)</label>
              <input name="reservePrice" type="number" min="0" className="input-field w-full" value={form.reservePrice} onChange={onChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buy-now price (KWD)</label>
              <input name="buyNowPrice" type="number" min="0" className="input-field w-full" value={form.buyNowPrice} onChange={onChange} />
            </div>
            <div className="hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starts at</label>
              <input name="startsAt" type="datetime-local" className="input-field w-full" value={form.startsAt} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ends at</label>
              <input name="endsAt" type="datetime-local" className="input-field w-full" value={form.endsAt} onChange={onChange} />
            </div>
          </div>
          {/* A) Auction rules */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Auction rules</h3>
            <p className="text-sm text-gray-600 mb-3">Proxy bidding: Bidders enter a maximum; system auto-bids up to their max.</p>
            <div className="flex items-center gap-2 mb-2">
              <input id="sniping" type="checkbox" checked={antiSniping} onChange={(e)=>setAntiSniping(e.target.checked)} />
              <label htmlFor="sniping">Extend auction if a bid arrives near the end</label>
            </div>
            {antiSniping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extend by (minutes)</label>
                  <input type="number" min="1" className="input-field w-full" value={extendByMin} onChange={(e)=>setExtendByMin(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">If bid placed in last (minutes)</label>
                  <input type="number" min="1" className="input-field w-full" value={inLastMin} onChange={(e)=>setInLastMin(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* B) Deposits */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Deposits (optional)</h3>
            <div className="flex items-center gap-2 mb-2">
              <input id="deposit" type="checkbox" checked={requireDeposit} onChange={(e)=>setRequireDeposit(e.target.checked)} />
              <label htmlFor="deposit">Require refundable deposit (captured only if winner)</label>
            </div>
            {requireDeposit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit amount (KWD)</label>
                <input type="number" min="0" className="input-field w-full" value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value)} />
              </div>
            )}
          </div>

          {/* C) Notifications */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Bidder reminders</h3>
            <div className="text-sm text-gray-700 mb-2">Send reminders to highest bidder before end</div>
            <div className="flex items-center gap-4 mb-3 text-sm">
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={notify15} onChange={(e)=>setNotify15(e.target.checked)} />15m</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={notify5} onChange={(e)=>setNotify5(e.target.checked)} />5m</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={notify1} onChange={(e)=>setNotify1(e.target.checked)} />1m</label>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={channelInApp} onChange={(e)=>setChannelInApp(e.target.checked)} />In‑app</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={channelEmail} onChange={(e)=>setChannelEmail(e.target.checked)} />Email</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={channelSms} onChange={(e)=>setChannelSms(e.target.checked)} />SMS</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={channelWa} onChange={(e)=>setChannelWa(e.target.checked)} />WhatsApp</label>
            </div>
          </div>

          {/* D) Logistics / scope */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Logistics / scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment</label>
                <select className="input-field w-full" value={fulfillment} onChange={(e)=>setFulfillment(e.target.value)}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="service">Service appointment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className="input-field w-full" value={fulfillmentLocation} onChange={(e)=>setFulfillmentLocation(e.target.value)} placeholder="Address or area" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Extra fees</label>
              <input className="input-field w-full" value={extraFees} onChange={(e)=>setExtraFees(e.target.value)} placeholder="e.g., delivery fee, installation, VAT" />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Policies link or note</label>
              <input className="input-field w-full" value={policiesRef} onChange={(e)=>setPoliciesRef(e.target.value)} placeholder="Link to your policies or short note" />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create auction'}</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/auctions')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;


