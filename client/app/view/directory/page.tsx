'use client';

import Link from 'next/link';

export default function DirectoryPage() {
  const personnel = [
    { name: 'Municipal Government Department Head II', position: 'PESO Office Head', unit: 'Executive Office', email: 'peso.guagua@gmail.com' },
    { name: 'Labor Employment Officer III', position: 'Employment Facilitation Coordinator', unit: 'Job Placement & Recruitment', email: 'employment.peso@guagua.gov.ph' },
    { name: 'Administrative Officer IV', position: 'SPES & Special Programs Officer', unit: 'Youth & Student Programs', email: 'spes.peso@guagua.gov.ph' },
    { name: 'Project Evaluation Officer II', position: 'Livelihood & Training Coordinator', unit: 'Skills Training & Livelihood', email: 'training.peso@guagua.gov.ph' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans text-[#1F2937]">
      <div className="bg-gradient-to-r from-[#0D2340] to-[#193A73] text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Link href="/view/home" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Directory</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">PESO Directory</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Find the appropriate PESO office personnel and learn about the organizational structure.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-[#0D2340] text-sm">Organizational Staff Directory</h3>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {personnel.map((p, idx) => (
              <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition">
                <div>
                  <h4 className="text-sm font-bold text-[#0D2340]">{p.position}</h4>
                  <p className="text-xs text-[#059669] font-medium">{p.name}</p>
                  <span className="inline-block mt-1 bg-slate-100 text-[#64748B] text-[10px] font-bold px-2 py-0.5 rounded">
                    {p.unit}
                  </span>
                </div>
                <div className="text-xs text-[#64748B]">
                  📧 {p.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}