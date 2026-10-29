'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('peso_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed.username || 'admin_guagua');
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('peso_token');
    localStorage.removeItem('peso_user');
    router.push('/admin/login');
  };

  const navLinks = [
    { name: 'Home CMS', href: '/admin/home' },
    { name: 'Job Vacancies', href: '/admin/jobs' },
    { name: 'Events', href: '/admin/events' },
    { name: 'Services', href: '/admin/services' },
    { name: 'Programs', href: '/admin/programs' },
    { name: 'Email Templates', href: '/admin/email-templates' },
  ];

  return (
    <header className="bg-[#0B1F3B] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Branding - matches public navbar exactly */}
          <Link href="/admin/home" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-[#059669] text-white rounded-full flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
              PG
            </div>
            <div>
              <span className="font-extrabold tracking-wide text-lg sm:text-xl block leading-tight text-white">
                PESO GUAGUA
              </span>
              <span className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase block">
                Administrative Control Center
              </span>
            </div>
          </Link>

          {/* Admin Navigation Links */}
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

          {/* User Info & Logout Button */}
          <div className="hidden xl:flex items-center space-x-4">
            {username && (
              <span className="text-xs text-slate-300">
                Logged in as: <strong className="text-white">{username}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-bold transition shadow-sm"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}