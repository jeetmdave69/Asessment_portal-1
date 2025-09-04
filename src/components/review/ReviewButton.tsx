'use client';

import { Button, Box } from '@mui/material';
import { Inter } from 'next/font/google';
import { EyeIcon } from 'lucide-react';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

// UI Color tokens - matching the exam interface
const UI = {
  primary: '#283593',
  primaryHover: '#1A237E',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E5E7EB',
  card: '#FFFFFF',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#7C3AED'
};

export type ReviewQuestionState = {
  id: string;
  number: number;              // 1-based index
  section?: string;
  status: 'answered' | 'unanswered' | 'skipped';
  flagged: boolean;
};

export type ReviewSnapshot = {
  total: number;
  answered: number;
  unanswered: number;
  skipped: number;
  flagged: number;
  endsAtISO: string;           // for ticking timer
  questions: ReviewQuestionState[];
};

interface ReviewButtonProps {
  snapshot: ReviewSnapshot;
  onOpen: () => void;
}

export default function ReviewButton({ snapshot, onOpen }: ReviewButtonProps) {
  const reviewCount = snapshot.unanswered + snapshot.flagged;
  
  return (
    <Button
      onClick={onOpen}
      variant="outlined"
      size="large"
      sx={{
        width: '100%',
        py: 2,
        px: 3,
        mb: 2,
        border: `2px solid ${UI.primary}`,
        borderRadius: '12px',
        backgroundColor: UI.card,
        color: UI.primary,
        fontFamily: inter.style.fontFamily,
        fontSize: '16px',
        fontWeight: '600',
        textTransform: 'none',
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: UI.card,
          color: UI.primary,
          borderColor: UI.primary,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px rgba(40, 53, 147, 0.3)`,
          '& .eye-icon': {
            color: UI.primary
          },
          '& span': {
            color: UI.primary
          },
          '& *': {
            color: UI.primary
          }
        },
        '&:focus-visible': {
          outline: `2px solid ${UI.primary}`,
          outlineOffset: '2px'
        }
      }}
      data-testid="ap-review-button"
      aria-label={`Review ${reviewCount} questions that need attention`}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EyeIcon size={18} className="eye-icon" />
        <span>Review ({reviewCount})</span>
      </Box>
    </Button>
  );
}
