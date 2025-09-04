'use client';
import * as React from 'react';
import ChartCardMesmer from './ChartCardMesmer';
import MesmerTooltip from './parts/MesmerTooltip';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

export type SectionBarDatum = { section: string; obtained: number; total: number; percentage: number };

export default function SectionBarMesmer({ data, height = 340 }:{ data: SectionBarDatum[]; height?: number }) {
  return (
    <ChartCardMesmer title="Section-wise score" subtitle="Obtained vs total — labels show %">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={22} barCategoryGap={28}>
          <defs>
            <linearGradient id="gScore" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="gTotal" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="2.75" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="section" tick={{ fontSize: 12, fill:'#94a3b8' }} axisLine={{ stroke:'#1f2937' }} tickLine={false}/>
          <YAxis tick={{ fontSize: 12, fill:'#94a3b8' }} axisLine={{ stroke:'#1f2937' }} tickLine={false}/>
          <Tooltip content={<MesmerTooltip/>}/>
          <Bar dataKey="total" name="Total" fill="url(#gTotal)" radius={[10,10,0,0]} />
          <Bar dataKey="obtained" name="Obtained" fill="url(#gScore)" radius={[10,10,0,0]} style={{ filter:'url(#glow)' }}>
            <LabelList dataKey="percentage" position="top" formatter={(v:number)=>`${v}%`} style={{ fontWeight:900, fill:'#e5e7eb' }}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCardMesmer>
  );
}
