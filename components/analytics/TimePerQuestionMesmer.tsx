'use client';
import * as React from 'react';
import ChartCardMesmer from './ChartCardMesmer';
import MesmerTooltip from './parts/MesmerTooltip';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line, Area, ReferenceLine, Tooltip } from 'recharts';

export type TPQ = { q:number; timeSec:number };
const fmt = (s:number)=> s>=60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;

export default function TimePerQuestionMesmer({ data, height=380 }:{ data:TPQ[]; height?:number }) {
  const avg = data.length ? Math.round(data.reduce((a,b)=>a+b.timeSec,0)/data.length) : 0;
  return (
    <ChartCardMesmer title="Time spent on questions" subtitle="Seconds per question with average reference">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top:8, right:12, bottom:6, left:0 }}>
          <defs>
            <linearGradient id="gLine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#3b82f6"/>
            </linearGradient>
            <linearGradient id="gFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,.28)" /><stop offset="100%" stopColor="rgba(59,130,246,0)"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" vertical={false}/>
          <XAxis dataKey="q" tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={{ stroke:'#1f2937' }} tickLine={false}
            label={{ value:'Question #', position:'insideBottomRight', offset:-2, fill:'#64748b' }}/>
          <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={{ stroke:'#1f2937' }} tickLine={false}
            label={{ value:'Seconds', angle:-90, position:'insideLeft', fill:'#64748b' }}/>
          <Area type="monotone" dataKey="timeSec" stroke="none" fill="url(#gFill)" isAnimationActive/>
          <ReferenceLine y={avg} stroke="#64748b" strokeDasharray="6 6"
            label={{ value:`Avg ${fmt(avg)}`, position:'right', fill:'#94a3b8', fontSize:12 }}/>
          <Line type="monotone" dataKey="timeSec" stroke="url(#gLine)" strokeWidth={3} dot={false} activeDot={{ r:5 }} isAnimationActive/>
          <Tooltip content={<MesmerTooltip unit="s"/>}/>
        </LineChart>
      </ResponsiveContainer>
    </ChartCardMesmer>
  );
}
