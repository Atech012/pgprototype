'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      <div className="bg-gradient-to-r from-[#0D2340] to-[#193A73] text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Link href="/view/home" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Contact</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Contact PESO Guagua</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Have questions about our services, programs, or employment opportunities? Reach out to our office below.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0D2340] uppercase tracking-wider mb-2">Office Location</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Guagua Municipal Hall Compound, Guagua, Pampanga, Philippines
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0D2340] uppercase tracking-wider mb-2">Office Hours</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Monday – Friday: 8:00 AM – 5:00 PM<br />
              Closed during weekends and official holidays.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0D2340] uppercase tracking-wider mb-2">Direct Channels</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Email: peso.guagua@gmail.com<br />
              Official FB: facebook.com/peso.guagua
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
          <h2 className="text-xl font-black text-[#0D2340] mb-4">Send Us an Inquiry</h2>
          
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              Thank you! Your message has been noted. Our office staff will review your inquiry shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Subject *</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-6 py-3 rounded-lg transition shadow"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>

      </main>
    </div>
  );
}