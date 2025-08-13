'use client';

import React from 'react';
import TestCard from '@/components/TestCard';
import OverviewCard from '@/components/OverviewCard';
import { SchoolIcon } from 'lucide-react';
import { getOverviewMetrics } from '@/lib/mock';

export default function TestLayoutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 md:px-8 py-4">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <SchoolIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OctaMind</h1>
              <p className="text-sm text-gray-500">Powered by OctaMind</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-6 md:px-8 py-6 space-y-6">
        {/* Overview Card Demo */}
        <OverviewCard
          greeting="Good Evening, Jeet!"
          subtext="Here is your dashboard overview for today"
          metrics={getOverviewMetrics()}
        />

        <div className="card card-pad">
          <h1 className="title text-2xl mb-2">Layout Test Page</h1>
          <p className="muted mb-6">This page demonstrates the new global UI foundation with Tailwind CSS.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestCard />
            <TestCard />
            <TestCard />
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="title text-lg mb-2">CSS Variables Test</h2>
            <div className="space-y-2 text-sm">
              <div>Brand color: <span className="text-[var(--brand)] font-semibold">#3B82F6</span></div>
              <div>Ink color: <span className="text-[var(--ink)] font-semibold">#0F172A</span></div>
              <div>Muted color: <span className="text-[var(--muted)] font-semibold">#64748B</span></div>
              <div>Card color: <span className="text-[var(--card)] font-semibold bg-gray-200 px-1 rounded">#FFFFFF</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <SchoolIcon className="w-3 h-3 text-white" />
              </div>
                              <span className="text-sm text-gray-600">OctaMind</span>
            </div>
            
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} OctaMind. All rights reserved.
            </div>
            
            <div className="text-sm text-gray-400">
              v1.0.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
