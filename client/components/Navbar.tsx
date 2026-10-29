'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/view/about' },
    { name: 'Services', href: '/view/services' },
    { name: 'Programs', href: '/view/programs' },
    { name: 'Events', href: '/view/events' },
    { name: 'Job Vacancies', href: '/view/jobs' },
    { name: 'Directory', href: '/view/directory' },
    { name: 'Contact', href: '/view/contact' },
  ];

  return (
    <header className="bg-[#0B1F3B] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-[#059669] text-white rounded-full flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
              PG
            </div>
            <div>
              <span className="font-extrabold tracking-wide text-lg sm:text-xl block leading-tight text-white">
                PESO GUAGUA
              </span>
              <span className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase block">
                Public Employment Service Office
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#059669] text-white shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Admin Login Button */}
          <div className="hidden xl:block">
            <Link
              href="/admin/login"
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-md text-xs font-bold transition shadow-sm"
            >
              Portal Admin
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="xl:hidden bg-[#0a182e] border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold ${
                  isActive
                    ? 'bg-[#059669] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-md text-sm"
            >
              Portal Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}