'use client';
import * as React from 'react';
import ChartCardMesmer from './ChartCardMesmer';
import MesmerTooltip from './parts/MesmerTooltip';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Box, Typography } from '@mui/material';

export type Slice = { name:'Correct'|'Incorrect'|'Skipped'; value:number };
const COLORS = ['#10b981','#ef4444','#f59e0b'];

export default function ScoreDonutMesmer({ data, height=340 }:{ data: Slice[]; height?:number }) {
  const total = data.reduce((a,b)=>a+(b?.value??0),0) || 1;
  const correct = data.find(d=>d.name==='Correct')?.value ?? 0;
  const pct = Math.round((correct/total)*100);
  return (
    <ChartCardMesmer title="Score composition" subtitle="Correct / Incorrect / Skipped">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={82} outerRadius={120} paddingAngle={6} cornerRadius={10}>
            {data.map((_,i)=> <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
          </Pie>
          <foreignObject x="36%" y="36%" width="28%" height="28%">
            <Box sx={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
              <Typography variant="h4" fontWeight={900} sx={{ color:'#22d3ee', lineHeight:1 }}>{pct}%</Typography>
              <Typography variant="caption" sx={{ color:'#94a3b8' }}>Correct</Typography>
            </Box>
          </foreignObject>
          <MesmerTooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCardMesmer>
  );
}
