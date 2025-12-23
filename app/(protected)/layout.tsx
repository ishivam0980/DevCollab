'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin [animation-direction:reverse]"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Universe...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/browse', label: 'Browse' },
    { href: '/my-interests', label: 'My Interests' },
  ];

  const isActiveLink = (href: string) => pathname === href;
  
  return (
    <div className="min-h-screen bg-[#030014] relative selection:bg-purple-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <div className="sticky top-4 z-50 px-4 sm:px-6 flex justify-center mb-8">
        <nav className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10">
          <div className="px-4 sm:px-6">
            <div className="h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">&lt;/&gt;</span>
                  </div>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent hidden sm:block">
                  DevCollab
                </span>
              </Link>
              
              {/* Center Nav Links */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActiveLink(link.href)
                          ? 'text-white shadow-lg shadow-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {isActiveLink(link.href) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-100 rounded-lg -z-10" />
                      )}
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Right Side */}
              <div className="flex items-center gap-3">
                {/* New Project Button */}
                <Link 
                  href="/projects/new" 
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-purple-500 hover:to-blue-500 font-medium transition-all text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border border-white/10 group"
                >
                  <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Project</span>
                </Link>
              
                {/* Profile Link (Avatar) */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                  title="My Profile"
                >
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-lg object-cover bg-slate-800 shadow-lg shadow-purple-500/20" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <span className="text-white font-semibold text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showMobileMenu ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 px-4">
              <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                      isActiveLink(link.href)
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                 {/* Mobile New Project - ensure it is visible in mobile menu if hidden on navbar */}
                 <Link
                   href="/projects/new"
                   onClick={() => setShowMobileMenu(false)}
                   className="block sm:hidden px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-1"
                 >
                   New Project
                 </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 relative z-10">{children}</main>
    </div>
  );
}

