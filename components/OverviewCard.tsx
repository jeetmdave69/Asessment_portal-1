import React from 'react';
import { SunIcon } from 'lucide-react';

type OverviewProps = {
  greeting: string;            // e.g. "Good Evening, Jeet!"
  subtext?: string;            // e.g. "Here is your dashboard overview for today"
  metrics: Array<{ label: string; value: string | number }>;
};

export default function OverviewCard({ greeting, subtext, metrics }: OverviewProps) {
  // Get appropriate icon based on time of day
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌞';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  return (
    <div className="card" role="region" aria-label="Dashboard overview">
      <div className="card-pad grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        {/* Left Section: Icon, Title, Subtext */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white" aria-hidden="true">
            <span className="text-lg">{getTimeIcon()}</span>
          </div>
          <div>
            <h2 className="title text-2xl md:text-3xl font-semibold tracking-tight">
              {greeting}
            </h2>
            {subtext && (
              <p className="muted mt-1">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Metrics */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
          {metrics.map((metric, index) => (
            <div key={index} className="px-4 text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {metric.label}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
