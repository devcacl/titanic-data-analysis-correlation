'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <html lang="en" className={isDark ? 'dark' : 'light'}>
      <body className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
        <nav className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold">Titanic Analytics</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
