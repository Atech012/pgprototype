'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const servicesData = [
    {
      id: 'job-referral',
      title: 'Local & Overseas Job Referral & Placement',
      category: 'Employment & Referral',
      description: 'Connect qualified Guagua job seekers with verified local employers and licensed overseas recruitment agencies.',
      target: 'Job Seekers, Displaced Workers, Fresh Graduates'
    },
    {
      id: 'spes',
      title: 'Special Program for the Employment of Students (SPES)',
      category: 'Special Programs',
      description: 'Bridging financial assistance for poor but deserving students, out-of-school youth, and dependents of displaced workers.',
      target: 'Students aged 15-30 years old'
    },
    {
      id: 'job-fair',
      title: 'Jobs Fair & Career Advocacy Seminars',
      category: 'Career Support',
      description: 'Regular mega job fairs and high school career guidance counseling in partnership with DOLE and DepEd.',
      target: 'Graduating Students & Job Seekers'
    },
    {
      id: 'livelihood-tupad',
      title: 'Livelihood & Emergency Employment Assistance (TUPAD)',
      category: 'Training & Skills',
      description: 'Community-based safety net programs providing temporary wage employment and micro-enterprise livelihood grants.',
      target: 'Underemployed & Informal Sector Workers'
    }
  ];

  const filtered = servicesData.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0D2340] to-[#193A73] text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Link href="/view/home" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Services</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Our Services</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Discover employment assistance, career support, and other public services offered by PESO Guagua.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm mb-8">
          <label className="block text-xs font-semibold text-[#64748B] mb-1">Search Services</label>
          <input
            type="text"
            placeholder="Search by service title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((svc) => (
            <div key={svc.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <span className="bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-3">
                  {svc.category}
                </span>
                <h3 className="text-lg font-bold text-[#0D2340] mb-2">{svc.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">{svc.description}</p>
                <div className="border-t border-slate-100 pt-3 text-xs">
                  <span className="font-bold text-[#1F2937]">Target Audience: </span>
                  <span className="text-[#64748B]">{svc.target}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Link href={`/view/services/${svc.id}`} className="text-xs font-bold text-[#059669] hover:underline">
                  View Requirements & Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}