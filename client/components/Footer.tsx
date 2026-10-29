'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B1F3B] text-slate-300 border-t-4 border-[#059669]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: About */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-black text-sm">
              PG
            </div>
            <span className="font-extrabold text-white text-lg tracking-wide">PESO GUAGUA</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Public Employment Service Office - Municipal Government of Guagua, Pampanga. Dedicated to promoting full employment and equal work opportunities for all citizens.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link href="/" className="hover:text-emerald-400 transition">Home & Announcements</Link></li>
            <li><Link href="/about" className="hover:text-emerald-400 transition">About PESO Guagua</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition">Municipal Services</Link></li>
            <li><Link href="/programs" className="hover:text-emerald-400 transition">Community Programs & PDFs</Link></li>
          </ul>
        </div>

        {/* Col 3: Services & Opportunities */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Citizen Portals</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link href="/events" className="hover:text-emerald-400 transition">Job Summits & Events</Link></li>
            <li><Link href="/jobs" className="hover:text-emerald-400 transition">Job Vacancies (ATS)</Link></li>
            <li><Link href="/directory" className="hover:text-emerald-400 transition">Management Directory</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400 transition">Location & Inquiry Form</Link></li>
          </ul>
        </div>

        {/* Col 4: Official Contact Info */}
        <div className="space-y-2 text-xs">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Municipal Office</h4>
          <p className="text-slate-400">📍 Municipal Hall Compound, Guagua, Pampanga, Philippines</p>
          <p className="text-slate-400">📞 (045) 900-XXXX / PESO Hotline</p>
          <p className="text-slate-400">📧 support@pesoguagua.gov.ph</p>
          <p className="text-slate-400">🕒 Mon - Fri: 8:00 AM - 5:00 PM</p>
        </div>

      </div>

      <div className="bg-[#071426] py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        © 2026 Municipal Government of Guagua. Public Employment Service Office. All rights reserved.
      </div>
    </footer>
  );
}