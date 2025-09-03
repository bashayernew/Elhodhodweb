import React from 'react';

export default function AnalyticsManager(){
  // Placeholder KPI cards; hook to real endpoints later
  const cards = [
    { label: 'Revenue (30d)', value: '1,250 KWD' },
    { label: 'Orders (30d)', value: '42' },
    { label: 'Conversion', value: '3.2%' },
    { label: 'Avg. Response Time', value: '0:47h' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c)=> (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border p-4"><div className="text-sm text-gray-600">{c.label}</div><div className="text-2xl font-semibold">{c.value}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 text-gray-600">Charts coming soon (category revenue, branch performance, funnel).</div>
    </div>
  );
}


