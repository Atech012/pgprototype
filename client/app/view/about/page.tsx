'use client';

import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0D2340] to-[#193A73] text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Link href="/view/home" className="hover:underline">Home</Link>
            <span>/</span>
            <span>About Us</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">About PESO Guagua</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Committed to bridging employment opportunities and delivering responsive public service to the citizens of Guagua, Pampanga.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Office Overview */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
          <h2 className="text-xl font-black text-[#0D2340] mb-4">Office Overview</h2>
          <p className="text-sm text-[#64748B] leading-relaxed mb-4">
            The Public Employment Service Office (PESO) - Guagua is a non-fee charging multi-employment service facility established to carry out the full employment and manpower development policies of the Department of Labor and Employment (DOLE). Located at the Guagua Municipal Hall, our office serves as a central hub connecting job seekers, local and overseas employers, students, and displaced workers.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm border-l-4 border-l-[#059669]">
            <h3 className="text-lg font-bold text-[#0D2340] mb-3">Our Mission</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              To provide swift, accessible, and efficient employment facilitation services to all constituents of Guagua, ensuring equal opportunities for decent work, skills enhancement, and livelihood support in partnership with public and private stakeholders.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm border-l-4 border-l-[#193A73]">
            <h3 className="text-lg font-bold text-[#0D2340] mb-3">Our Vision</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              A premier employment service office recognized for excellence, transparency, and proactive livelihood programs that empower Guagua residents toward sustainable economic self-reliance.
            </p>
          </div>
        </div>

        {/* Core Mandate & Functions */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
          <h2 className="text-xl font-black text-[#0D2340] mb-6">Mandate & Core Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#64748B]">
            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-lg mb-2 block">💼</span>
              <strong className="text-[#0D2340] block mb-1 font-bold text-sm">Job Referral & Placement</strong>
              Matching qualified local applicants with verified job vacancies in municipal and partner private enterprises.
            </div>
            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-lg mb-2 block">📊</span>
              <strong className="text-[#0D2340] block mb-1 font-bold text-sm">Labor Market Information</strong>
              Providing accurate statistics and career guidance to students and job seekers to align with industry demands.
            </div>
            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-lg mb-2 block">🌱</span>
              <strong className="text-[#0D2340] block mb-1 font-bold text-sm">Special Programs (SPES / TUPAD)</strong>
              Implementing student employment assistance and emergency livelihood relief initiatives.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}