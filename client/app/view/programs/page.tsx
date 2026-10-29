'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const programs = [
    {
      id: 'spes-2026',
      title: 'Special Program for the Employment of Students (SPES)',
      category: 'Scholarship & Employment',
      status: 'Accepting Applications',
      deadline: 'July 15, 2026',
      description: 'DOLE-Municipal partnered summer employment program providing financial assistance to poor students and out-of-school youth.',
      eligibility: 'Aged 15 to 30 years old; must have passing grades.'
    },
    {
      id: 'tesda-nc2',
      title: 'TESDA Free Technical-Vocational Training Scholarships',
      category: 'Skills Training',
      status: 'Ongoing',
      deadline: 'Open until slots are filled',
      description: 'Free NC II certification courses including Electrical Installation, Computer Systems Servicing, and Automotive Servicing.',
      eligibility: 'Filipino citizen, at least High School graduate.'
    },
    {
      id: 'tupad-livelihood',
      title: 'TUPAD Emergency Employment Program',
      category: 'Livelihood Assistance',
      status: 'Accepting Applications',
      deadline: 'Ongoing Batch',
      description: '10 to 30 days community work program with prevailing regional minimum wage support for informal workers.',
      eligibility: 'Underemployed, self-employed, or displaced marginal workers.'
    }
  ];

  const filtered = programs.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      <div className="bg-gradient-to-r from-[#0D2340] to-[#193A73] text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Link href="/view/home" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Programs & Scholarships</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Programs & Scholarships</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Explore available programs, educational opportunities, and employment-related initiatives for eligible Guagua residents.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm mb-8">
          <label className="block text-xs font-semibold text-[#64748B] mb-1">Search Programs</label>
          <input
            type="text"
            placeholder="Search programs and scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#059669] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prog) => (
            <div key={prog.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {prog.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    {prog.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0D2340] mb-2">{prog.title}</h3>
                <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{prog.description}</p>
                
                <div className="text-xs space-y-1 mb-6 text-[#1F2937]">
                  <p><strong>Eligibility:</strong> {prog.eligibility}</p>
                  <p className="text-[#059669]"><strong>Deadline:</strong> {prog.deadline}</p>
                </div>
              </div>

              <Link
                href={`/view/programs/${prog.id}`}
                className="block text-center bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-2.5 rounded-lg transition shadow"
              >
                View Details & Requirements
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}