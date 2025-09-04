'use client';
import * as React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function useCountUp(value: number, duration = 800) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (!Number.isFinite(value)) { setDisplay(0); return; }
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.round((value) * (0.2 + 0.8 * p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export default function StatTileMesmer({ label, value, hint, accent='#22d3ee' }:{
  label:string; value:number|string; hint?:string; accent?:string;
}) {
  const numeric = typeof value === 'number' ? value : Number.NaN;
  const show = Number.isFinite(numeric) ? useCountUp(numeric) : value;
  return (
    <Paper elevation={0} sx={{
      p:2, borderRadius:3,
      background:'linear-gradient(180deg, rgba(15,23,42,.8), rgba(2,6,23,.85))',
      border:'1px solid #111827', color:'#e5e7eb',
      boxShadow:'0 8px 28px rgba(0,0,0,.35)'
    }}>
      <Typography variant="caption" sx={{ color:'#94a3b8', fontWeight:800 }}>{label}</Typography>
      <Box display="flex" alignItems="baseline" gap={1}>
        <Typography variant="h5" fontWeight={900}>{show}</Typography>
        {hint && <Typography variant="caption" sx={{ color:accent, fontWeight:800 }}>{hint}</Typography>}
      </Box>
    </Paper>
  );
}
