import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className={`mx-auto max-w-[1280px] px-6 md:px-8 py-6 space-y-6 ${className}`}>
        {children}
      </main>
    </div>
  );
}
