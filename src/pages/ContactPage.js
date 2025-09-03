import React, { useState } from 'react';
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', role: 'Buyer', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    if (!/^\+?\d[\d\s-]{6,}$/.test(form.phone)) nextErrors.phone = 'Enter a valid phone';
    if (!form.message.trim()) nextErrors.message = 'Required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try { setSubmitting(true); await new Promise((r)=>setTimeout(r,600)); setSent(true); } finally { setSubmitting(false); }
  };

  const phoneDisplay = '+965 9809 7532';
  const whatsappNumber = '+96598097532';
  const supportEmail = 'mishref525@gmail.com';
  const waLink = `https://wa.me/${whatsappNumber.replace(/[^\d]/g,'')}?text=${encodeURIComponent(
    `[ElHodhod] ${form.role} Inquiry\nName: ${form.name}\nCompany: ${form.company}\nPhone: ${form.phone}\nMessage: ${form.message}`
  )}`;
  const telLink = `tel:${whatsappNumber}`;

  return (
    <div className="container-hodhod py-0 space-y-8">
      {/* Hero */}
      <div className="rounded-b-[24px] bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white shadow-hodhod">
        <div className="px-6 py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold">We’re here to help</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Suppliers, contractors, and buyers—ElHodhod connects you with the right materials and partners. Talk to us anytime.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={telLink} className="btn-primary inline-flex items-center gap-2 bg-white text-hodhod-black hover:bg-white/90"><PhoneIcon className="w-4 h-4" /> Call us</a>
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2 border-white text-white hover:bg-white/10"><ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp</a>
            <a href={`mailto:${supportEmail}`} className="btn-outline inline-flex items-center gap-2 border-white text-white hover:bg-white/10"><EnvelopeIcon className="w-4 h-4" /> Email</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-hodhod shadow-hodhod p-6 space-y-4">
          {sent && (
            <div className="p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
              <PaperAirplaneIcon className="w-4 h-4" /> Thanks! We received your message and will reply shortly.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Full name<span className="text-red-600">*</span></label>
              <input className={`input-field ${errors.name ? 'ring-1 ring-red-400' : ''}`} placeholder="Full name" value={form.name} onChange={(e)=>update('name', e.target.value)} />
              {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Company (optional)</label>
              <input className="input-field" placeholder="Company (optional)" value={form.company} onChange={(e)=>update('company', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Email<span className="text-red-600">*</span></label>
              <input className={`input-field ${errors.email ? 'ring-1 ring-red-400' : ''}`} type="email" placeholder="Email" value={form.email} onChange={(e)=>update('email', e.target.value)} />
              {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Phone (+country code)<span className="text-red-600">*</span></label>
              <input className={`input-field ${errors.phone ? 'ring-1 ring-red-400' : ''}`} placeholder="+965 5xxxxxxx" value={form.phone} onChange={(e)=>update('phone', e.target.value)} />
              {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Role</label>
              <select className="input-field" value={form.role} onChange={(e)=>update('role', e.target.value)}>
                <option>Supplier</option>
                <option>Contractor</option>
                <option>Buyer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Your message<span className="text-red-600">*</span></label>
            <textarea className={`input-field ${errors.message ? 'ring-1 ring-red-400' : ''}`} rows={5} placeholder="Your message / inquiry" value={form.message} onChange={(e)=>update('message', e.target.value)} />
            {errors.message && <div className="text-xs text-red-600 mt-1">{errors.message}</div>}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary disabled:opacity-60" disabled={submitting}>{submitting ? 'Sending…' : 'Send Message'}</button>
            <a className="btn-outline" href={`mailto:${supportEmail}?subject=Inquiry (${form.role})&body=${encodeURIComponent(form.message)}`}>Email Us</a>
          </div>
        </form>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-hodhod shadow-hodhod p-4">
            <h3 className="font-semibold mb-2">Direct Contact</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <a href={telLink} className="flex items-center gap-2 hover:text-hodhod-gold"><PhoneIcon className="w-4 h-4" /> {phoneDisplay}</a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-hodhod-gold"><EnvelopeIcon className="w-4 h-4" /> {supportEmail}</a>
              <a className="btn-outline mt-1 inline-flex items-center gap-2" href={waLink} target="_blank" rel="noreferrer"><ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp Chat</a>
            </div>
          </div>

          <div className="bg-white rounded-hodhod shadow-hodhod p-4">
            <h3 className="font-semibold mb-2">Office & Hours</h3>
            <div className="aspect-video rounded overflow-hidden mb-2">
              <iframe
                title="ElHodhod Location"
                width="100%" height="100%" loading="lazy" allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d---"
              />
            </div>
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> Address: Kuwait City</div>
              <div className="mt-1 flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Sat–Thu: 9:00 AM–6:00 PM</div>
              <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Fri: Closed</div>
            </div>
          </div>

          <div className="bg-white rounded-hodhod shadow-hodhod p-4">
            <h3 className="font-semibold mb-2">Follow Us</h3>
            <div className="flex gap-3 text-sm">
              <a className="text-hodhod-gold" href="#" target="_blank" rel="noreferrer">Instagram</a>
              <a className="text-hodhod-gold" href="#" target="_blank" rel="noreferrer">TikTok</a>
              <a className="text-hodhod-gold" href="#" target="_blank" rel="noreferrer">Facebook</a>
              <a className="text-hodhod-gold" href="#" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </aside>
      </div>

      {/* FAQ */}
      <section className="px-1">
        <div className="bg-white rounded-hodhod shadow-hodhod p-6">
          <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {[{q:'How fast do you respond?',a:'Within business hours we usually reply in under 1 hour.'},{q:'Can suppliers join the marketplace?',a:'Yes. Tell us about your catalog in the form and our team will contact you.'},{q:'Do you support WhatsApp?',a:'Yes. Click the WhatsApp button above to start a chat.'}].map((f)=> (
              <details key={f.q} className="border rounded p-2">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <div className="mt-1 text-gray-600">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="rounded-hodhod bg-hodhod-gray-50 border border-hodhod-gray-200 p-6 text-center">
        <div className="font-semibold text-hodhod-black">Have a project or want to partner?</div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <a href="/apply-supplier" className="btn-outline">Join as Supplier</a>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary">Chat on WhatsApp</a>
        </div>
      </section>
    </div>
  );
}


