import React, { useEffect, useState } from 'react';

export default function SettingsManager(){
  const [settings, setSettings] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('demo_company_settings')||'{}'); }catch{ return {}; } });
  const save = (s)=>{ localStorage.setItem('demo_company_settings', JSON.stringify(s)); setSettings(s); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="text-lg font-semibold mb-2">Availability</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="block text-sm text-gray-700 mb-1">Working Days</label><input className="input-field" value={settings.workingDays||''} onChange={(e)=>save({ ...settings, workingDays:e.target.value })} placeholder="Sun-Thu"/></div>
          <div><label className="block text-sm text-gray-700 mb-1">Hours</label><input className="input-field" value={settings.hours||''} onChange={(e)=>save({ ...settings, hours:e.target.value })} placeholder="9AM–6PM"/></div>
          <div><label className="block text-sm text-gray-700 mb-1">Holidays</label><input className="input-field" value={settings.holidays||''} onChange={(e)=>save({ ...settings, holidays:e.target.value })} placeholder="comma separated"/></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="text-lg font-semibold mb-2">Payments</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="block text-sm text-gray-700 mb-1">Methods</label><input className="input-field" value={settings.paymentMethods||''} onChange={(e)=>save({ ...settings, paymentMethods:e.target.value })} placeholder="KNET, Cash-on-delivery"/></div>
          <div><label className="block text-sm text-gray-700 mb-1">Escrow</label><select className="input-field" value={settings.escrow||'enabled'} onChange={(e)=>save({ ...settings, escrow:e.target.value })}><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></div>
          <div><label className="block text-sm text-gray-700 mb-1">Notifications</label><input className="input-field" value={settings.notifications||''} onChange={(e)=>save({ ...settings, notifications:e.target.value })} placeholder="events: order.created, quote.new"/></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="text-lg font-semibold mb-2">Languages</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="block text-sm text-gray-700 mb-1">Default Language</label><select className="input-field" value={settings.defaultLang||'en'} onChange={(e)=>save({ ...settings, defaultLang:e.target.value })}><option value="en">English</option><option value="ar">العربية</option></select></div>
          <div><label className="block text-sm text-gray-700 mb-1">RTL Preview</label><select className="input-field" value={settings.rtl||'off'} onChange={(e)=>save({ ...settings, rtl:e.target.value })}><option value="off">Off</option><option value="on">On</option></select></div>
        </div>
      </div>
    </div>
  );
}


