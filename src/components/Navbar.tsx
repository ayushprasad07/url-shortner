'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300"
              >
                LinkXS
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {status === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              ) : status === 'authenticated' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {session?.user?.name || session?.user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-5 py-2 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-5 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {status === 'loading' ? (
                <div className="space-y-2">
                  <div className="h-11 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="h-11 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              ) : status === 'authenticated' ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="block w-full px-4 py-2.5 text-center text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-center bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block w-full px-4 py-2.5 text-center text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full px-4 py-2.5 text-center bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
