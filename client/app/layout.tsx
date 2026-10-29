'use client';

import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        {/* Render AdminNavbar on admin pages (except login), or public Navbar elsewhere */}
        {isAdminRoute ? (!isLoginPage && <AdminNavbar />) : <Navbar />}

        <main className="flex-grow">{children}</main>

        {/* Render the standard Footer component on all pages except the login screen */}
        {!isLoginPage && <Footer />}
      </body>
    </html>
  );
}