import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DevCollab" width={32} height={32} />
            <span className="font-bold text-xl text-indigo-600">DevCollab</span>
          </Link>
          
          {/* Nav Links */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/browse" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Browse
            </Link>
            <Link href="/my-interests" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              My Interests
            </Link>
            <Link href="/projects/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              + New Project
            </Link>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-medium text-sm">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="font-medium">{session.user.name || 'Profile'}</span>
            </Link>
            <Link 
              href="/api/auth/signout" 
              className="text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
