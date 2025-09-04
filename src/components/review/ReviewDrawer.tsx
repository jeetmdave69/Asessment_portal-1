'use client';

import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Chip, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  Alert,
  Button,
  Stack,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  XIcon, 
  ClockIcon, 
  SearchIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  FlagIcon,
  SkipForwardIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { Inter } from 'next/font/google';
import { useState, useEffect, useRef } from 'react';
import { ReviewSnapshot, ReviewQuestionState } from './ReviewButton';

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
  info: '#7C3AED',
  successTint: '#F0FDF4',
  warningTint: '#FEF3C7',
  errorTint: '#FEF2F2',
  infoTint: '#F3E8FF'
};

type FilterType = 'all' | 'answered' | 'unanswered' | 'flagged';

interface ReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  snapshot: ReviewSnapshot;
  onJumpTo: (questionNumber: number) => void;
  onClearAllFlags?: () => void;
  onSubmit?: () => void;
}

export default function ReviewDrawer({ 
  open, 
  onClose, 
  snapshot, 
  onJumpTo, 
  onClearAllFlags,
  onSubmit
}: ReviewDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    if (!open) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(snapshot.endsAtISO).getTime();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [open, snapshot.endsAtISO]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (open && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector('[tabindex="0"]') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [open]);

  const getFilteredQuestions = () => {
    let filtered = snapshot.questions;
    
    // Apply filter
    switch (activeFilter) {
      case 'answered':
        filtered = filtered.filter(q => q.status === 'answered');
        break;
      case 'unanswered':
        filtered = filtered.filter(q => q.status === 'unanswered');
        break;
      case 'flagged':
        filtered = filtered.filter(q => q.flagged);
        break;
    }
    
    // Apply search
    if (searchQuery) {
      const query = parseInt(searchQuery);
      if (!isNaN(query)) {
        filtered = filtered.filter(q => q.number === query);
      }
    }
    
    return filtered;
  };

  const getQuestionIcon = (question: ReviewQuestionState) => {
    if (question.flagged) {
      return <FlagIcon size={16} color={UI.info} />;
    }
    
    switch (question.status) {
      case 'answered':
        return <CheckCircleIcon size={16} color={UI.success} />;
      case 'unanswered':
        return <XCircleIcon size={16} color={UI.error} />;
      case 'skipped':
        return <SkipForwardIcon size={16} color={UI.warning} />;
      default:
        return null;
    }
  };

  const getQuestionColor = (question: ReviewQuestionState) => {
    if (question.flagged) return UI.info;
    
    switch (question.status) {
      case 'answered': return UI.success;
      case 'unanswered': return UI.error;
      case 'skipped': return UI.warning;
      default: return UI.subtext;
    }
  };

  const getQuestionBgColor = (question: ReviewQuestionState) => {
    if (question.flagged) return UI.infoTint;
    
    switch (question.status) {
      case 'answered': return UI.successTint;
      case 'unanswered': return UI.errorTint;
      case 'skipped': return UI.warningTint;
      default: return '#F8FAFC';
    }
  };

  const handleJumpToQuestion = (questionNumber: number) => {
    onJumpTo(questionNumber);
    onClose();
  };

  const handleSubmit = () => {
    onClose();
    if (onSubmit) {
      onSubmit();
    }
  };

  const filteredQuestions = getFilteredQuestions();
  const hasWarnings = snapshot.unanswered > 0 || snapshot.flagged > 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : '480px',
          maxWidth: '100vw',
          height: '100%',
          fontFamily: inter.style.fontFamily
        }
      }}
      data-testid="ap-review-drawer"
    >
      <Box
        ref={drawerRef}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: UI.card
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 3,
          borderBottom: `1px solid ${UI.border}`,
          backgroundColor: '#F8FAFF'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: inter.style.fontFamily,
                fontWeight: '700',
                color: UI.text,
                fontSize: '20px'
              }}
            >
              Review your answers
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: UI.subtext,
                '&:hover': { backgroundColor: UI.border }
              }}
              data-testid="ap-review-close"
              aria-label="Close review panel"
            >
              <XIcon size={20} />
            </IconButton>
          </Box>
          
          {/* Timer */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}>
            <ClockIcon size={16} color={UI.primary} />
            <Typography
              sx={{
                fontFamily: inter.style.fontFamily,
                fontWeight: '600',
                color: UI.primary,
                fontSize: '16px'
              }}
            >
              Time Left: {timeLeft}
            </Typography>
          </Box>

          {/* Summary Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Total: ${snapshot.total}`}
              size="small"
              variant="outlined"
              sx={{ fontFamily: inter.style.fontFamily }}
            />
            <Chip
              label={`Answered: ${snapshot.answered}`}
              size="small"
              color="success"
              variant="outlined"
              data-testid="ap-review-summary-answered"
              sx={{ fontFamily: inter.style.fontFamily }}
            />
            <Chip
              label={`Unanswered: ${snapshot.unanswered}`}
              size="small"
              color="error"
              variant="outlined"
              data-testid="ap-review-summary-unanswered"
              sx={{ fontFamily: inter.style.fontFamily }}
            />
            <Chip
              label={`Flagged: ${snapshot.flagged}`}
              size="small"
              color="info"
              variant="outlined"
              data-testid="ap-review-summary-flagged"
              sx={{ fontFamily: inter.style.fontFamily }}
            />
          </Box>
        </Box>

        {/* Warnings */}
        {hasWarnings && (
          <Box sx={{ p: 3, pb: 0 }}>
            <Alert
              severity="warning"
              icon={<AlertTriangleIcon size={20} />}
              sx={{
                fontFamily: inter.style.fontFamily,
                '& .MuiAlert-message': {
                  fontSize: '14px'
                }
              }}
            >
              You have {snapshot.unanswered} unanswered and {snapshot.flagged} flagged questions.
            </Alert>
          </Box>
        )}

        {/* Filters and Search */}
        <Box sx={{ p: 3, pt: hasWarnings ? 2 : 3 }}>
          <Tabs
            value={activeFilter}
            onChange={(_, value) => setActiveFilter(value)}
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                fontFamily: inter.style.fontFamily,
                fontWeight: '600',
                textTransform: 'none',
                minHeight: '40px'
              }
            }}
          >
            <Tab 
              label="All" 
              value="all" 
              data-testid="ap-review-filter-all"
            />
            <Tab 
              label="Answered" 
              value="answered" 
              data-testid="ap-review-filter-answered"
            />
            <Tab 
              label="Unanswered" 
              value="unanswered" 
              data-testid="ap-review-filter-unanswered"
            />
            <Tab 
              label="Flagged" 
              value="flagged" 
              data-testid="ap-review-filter-flagged"
            />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            placeholder="Search by question number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={16} color={UI.subtext} />
                </InputAdornment>
              )
            }}
            sx={{
              fontFamily: inter.style.fontFamily,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Box>

        {/* Question Grid */}
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          pt: 0, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: UI.border
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: UI.subtext,
            borderRadius: '3px'
          }
        }}>
          <Grid container spacing={1} data-testid="ap-review-grid">
            {filteredQuestions.map((question) => (
              <Grid item xs={6} sm={4} key={question.id}>
                <Box
                  onClick={() => handleJumpToQuestion(question.number)}
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    border: `1px solid ${getQuestionColor(question)}`,
                    backgroundColor: getQuestionBgColor(question),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${UI.primary}`,
                      outlineOffset: '2px'
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Question ${question.number} - ${question.status}${question.flagged ? ', flagged' : ''}`}
                  data-testid={`ap-review-jump-btn-${question.number}`}
                >
                  {getQuestionIcon(question)}
                  <Typography
                    sx={{
                      fontFamily: inter.style.fontFamily,
                      fontWeight: '600',
                      color: getQuestionColor(question),
                      fontSize: '14px'
                    }}
                  >
                    {question.number}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {filteredQuestions.length === 0 && (
            <Box sx={{
              textAlign: 'center',
              py: 4,
              color: UI.subtext
            }}>
              <Typography sx={{ fontFamily: inter.style.fontFamily }}>
                No questions found matching your criteria.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{
          p: 3,
          borderTop: `1px solid ${UI.border}`,
          backgroundColor: '#F8FAFF'
        }}>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth
              sx={{
                fontFamily: inter.style.fontFamily,
                fontWeight: '600',
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Back to Exam
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              fullWidth
              sx={{
                fontFamily: inter.style.fontFamily,
                fontWeight: '600',
                textTransform: 'none',
                borderRadius: '8px',
                backgroundColor: UI.primary,
                '&:hover': {
                  backgroundColor: UI.primaryHover
                }
              }}
              data-testid="ap-review-submit"
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
