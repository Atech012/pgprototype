'use client';

import Link from 'next/link';

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0D2340] via-[#132E54] to-[#193A73] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4">
              Official Municipal Portal
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Public Employment Service Office <span className="text-emerald-400">Guagua</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Connecting Guagua residents to meaningful employment opportunities, skills training programs, livelihood assistance, and reliable municipal services.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <Link
                href="/view/jobs"
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-6 py-3 rounded-lg shadow transition"
              >
                Browse Job Vacancies
              </Link>
              <Link
                href="/view/services"
                className="bg-[#193A73] hover:bg-[#22488a] text-slate-100 border border-slate-600 text-xs font-bold px-6 py-3 rounded-lg transition"
              >
                Explore Services
              </Link>
            </div>
          </div>

          {/* Quick Stats / Highlight Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl w-full sm:w-80 shadow-xl text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Quick Portal Access</h3>
            <ul className="space-y-3 text-xs text-slate-200">
              <Link href="/view/programs" className="block p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-between">
                <span>📚 Programs & Scholarships</span>
                <span>→</span>
              </Link>
              <Link href="/view/events" className="block p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-between">
                <span>📅 Job Summits & Events</span>
                <span>→</span>
              </Link>
              <Link href="/view/announcements" className="block p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-between">
                <span>📢 Public Announcements</span>
                <span>→</span>
              </Link>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Services Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0D2340]">How We Serve You</h2>
          <p className="text-xs text-[#64748B] mt-2">
            Providing comprehensive employment facilitation and community support under the Municipality of Guagua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center font-black text-lg mb-4">
              💼
            </div>
            <h3 className="text-base font-bold text-[#0D2340] mb-2">Job Placement</h3>
            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Access verified local and overseas job openings with direct application tracking and digital status updates.
            </p>
            <Link href="/view/jobs" className="text-xs font-bold text-[#059669] hover:underline">
              View Vacancies →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center font-black text-lg mb-4">
              🎓
            </div>
            <h3 className="text-base font-bold text-[#0D2340] mb-2">Programs & Training</h3>
            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Discover government educational assistance, SPES student employment, and TESDA technical scholarships.
            </p>
            <Link href="/view/programs" className="text-xs font-bold text-[#059669] hover:underline">
              Explore Programs →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center font-black text-lg mb-4">
              🏛️
            </div>
            <h3 className="text-base font-bold text-[#0D2340] mb-2">Community Directory</h3>
            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Connect directly with our municipal officers, view office hours, and find physical office locations.
            </p>
            <Link href="/view/directory" className="text-xs font-bold text-[#059669] hover:underline">
              Meet the Team →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}