'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Radio,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  Avatar,
  Tooltip
} from '@mui/material'
import { Inter } from 'next/font/google'
import { Roboto_Slab } from 'next/font/google'

// Font configurations
// UI Color tokens - Clean Modern Exam Interface
const UI = {
  bg: '#E8EAF6',              // page tint
  gridDot: '#C5CAE9',         // dot color
  card: '#FFFFFF',             // white cards (surfaces)
  border: '#E5E7EB',           // border color
  
  primary: '#283593',          // primary indigo
  primaryHover: '#1A237E',     // hover indigo
  focus: '#C5CAE9',            // ring color
  
  answered: '#16A34A',        // green
  notAnswered: '#EF4444',     // red
  review: '#7C3AED',          // purple
  bookmarked: '#F59E0B',      // amber
  flagged: '#DC2626',         // brick
  
  text: '#0F172A',             // main text
  subtext: '#64748B',          // muted text
  
  // Background tints
  primaryTint: '#E8EAF6',      // page tint
  primaryRing: '#C5CAE9',      // ring color
  successTint: '#F0FDF4',      // success tint
  dangerTint: '#FEF2F2',       // danger tint
  reviewTint: '#F3E8FF'        // review tint
};

// Option styling for radio buttons and checkboxes
const optionStyle = (selected: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  py: 2,
  px: 2,
  borderRadius: 8,
  border: selected ? `2px solid ${UI.primary}` : `1px solid ${UI.border}`,
  bgcolor: selected ? '#E9F0FF' : '#FFFFFF',
  cursor: 'pointer',
  '&:hover': { 
    bgcolor: selected ? '#E9F0FF' : '#F6F8FF'
  },
  '&:focus-visible': {
    outline: `2px solid ${UI.focus}`,
    outlineOffset: '2px'
  }
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
})

import { CssBaseline } from '@mui/material'

import { supabase } from '@lib/supabaseClient'

// Debounce utility function with cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}
import { useUser } from '@clerk/nextjs'
import ErrorPopup from '@components/ErrorPopup'
import ReviewButton, { ReviewSnapshot, ReviewQuestionState } from '@components/review/ReviewButton'
import ReviewDrawer from '@components/review/ReviewDrawer'
import {
  Flag as FlagIcon,
  FlagOutlined as FlagOutlinedIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  NavigateBefore as BackIcon,
  NavigateNext as NextIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpOutlineIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  WifiOff as WifiOffIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  List as ListIcon
} from '@mui/icons-material'
import { throttle } from 'lodash'

// Types
interface Option {
  text: string
  isCorrect: boolean
  image?: string | null
}
interface Question {
  id: number
  question_text: string
  image?: string | null
  options: Option[]
  section_id: number
  marks?: number
  question_type: string
  explanation?: string
}
interface Quiz {
  id: number
  quiz_title?: string
  quiz_name?: string
  duration: number
  max_attempts: number
  passing_score?: number
  show_answers?: boolean
  start_time?: string
  end_time?: string
}
interface Section {
  id: number
  name: string
  description?: string
  instructions?: string
  marks?: number
}

// Constants
// Light mode only - no theme switching

// Add navigation and difficulty color constants
const NAV_COLORS = {
  answered: UI.answered,
  unattempted: UI.notAnswered,
  current: UI.primary,
  flagged: UI.flagged,
  bookmarked: '#FB923C',        // orange outline
  markedForReview: UI.review,
  borderAttempted: '#15803D',
  borderUnattempted: '#94A3B8',
  borderCurrent: UI.primary,
  borderMarkedForReview: UI.review,
  borderBookmarked: '#FB923C'
}

const QuestionButton = ({
  q,
  idx,
  isCurrent,
  isAnswered,
  isFlagged,
  isBookmarked,
  isMarkedForReview,
  isVisited,
  onClick,
  disabled
}: {
  q: Question
  idx: number
  isCurrent: boolean
  isAnswered: boolean
  isFlagged: boolean
  isBookmarked: boolean
  isMarkedForReview: boolean
  isVisited: boolean
  onClick: () => void
  disabled: boolean
}) => {
  // Determine color scheme based on TCS iON Console specifications
  let bg = 'transparent', color = UI.subtext, border = `1px solid ${UI.border}`; // Not Visited
  if (isCurrent) { 
    bg = UI.primary; 
    color = '#fff'; 
    border = `2px solid ${UI.primary}`; // Always 2px primary border for current
  }
  else if (isAnswered && isMarkedForReview) { bg = UI.review; color = '#fff'; border = `1px solid ${UI.review}`; }
  else if (isMarkedForReview) { bg = UI.review; color = '#fff'; border = `1px solid ${UI.review}`; }
  else if (isAnswered) { bg = UI.answered; color = '#fff'; border = `1px solid ${UI.answered}`; }
  else if (isVisited && !isAnswered) { bg = UI.notAnswered; color = '#fff'; border = `1px solid ${UI.notAnswered}`; }

  return (
    <Box position="relative" sx={{ display: 'inline-block' }}>
      <Button
        size="small"
        variant="contained"
        sx={{
          width: 36, height: 36, minWidth: 36, minHeight: 36,
          borderRadius: '50%',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1,
          bgcolor: bg,
          color,
          border,
          boxShadow: 'none',
          '&:hover': { filter: 'brightness(.95)' },
          '&:focus-visible': { outline: `2px solid ${UI.focus}`, outlineOffset: 1 }
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {idx + 1}
      </Button>
      
      {/* Status indicators */}
      {isFlagged && (
        <Box sx={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          backgroundColor: UI.flagged,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }} />
      )}
      
      {isBookmarked && (
        <Box sx={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          backgroundColor: UI.bookmarked,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }} />
      )}
      
      {isMarkedForReview && (
        <Box sx={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          backgroundColor: UI.review,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }} />
      )}
    </Box>
  )
}

// Wrapper component to handle Suspense for useParams
function AttemptQuizWrapper() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    }>
      <AttemptQuizPage />
    </Suspense>
  );
}

export default AttemptQuizWrapper;

function AttemptQuizPage() {
  const params = useParams() as { quizId?: string } | null
  const quizId = params?.quizId
  const router = useRouter()
  const { user } = useUser()

  // ===== [QTS TIMING • ADDITIVE BLOCK — DO NOT EDIT EXISTING LOGIC] =====
  const [qts, setQts] = useState<Record<string, number>>({});
  const [currentQid, setCurrentQid] = useState<string | null>(null);
  const [tickStart, setTickStart] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // ===== [TAB SWITCHING DETECTION] =====
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState<number | null>(null);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
  const [tabSwitchHistory, setTabSwitchHistory] = useState<Array<{timestamp: number, action: 'hidden' | 'visible'}>>([]);

  // Tab switching detection and tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const isCurrentlyVisible = document.visibilityState === 'visible';
      
      console.log('🔄 Tab visibility changed:', {
        wasVisible: isTabVisible,
        isNowVisible: isCurrentlyVisible,
        timestamp: now
      });

      if (isTabVisible && !isCurrentlyVisible) {
        // Tab became hidden - count as tab switch
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setLastTabSwitchTime(now);
        setIsTabVisible(false);
        
        // Add to history
        setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'hidden' }]);
        
        console.log('🚨 TAB SWITCH DETECTED! Count:', newCount);
        
        // Immediate sync of tab switch data
        syncTabSwitchData(newCount, now);
        
        // Show warning to student
        if (newCount > 0) {
          console.warn(`⚠️ Tab switch detected! Total switches: ${newCount}`);
        }
      } else if (!isTabVisible && isCurrentlyVisible) {
        // Tab became visible again
        setIsTabVisible(true);
        setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'visible' }]);
        
        console.log('✅ Tab became visible again');
      }
    };

    // Focus/blur detection for additional tab switching
    const handleFocus = () => {
      if (!isTabVisible) {
        const now = Date.now();
        setIsTabVisible(true);
        setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'visible' }]);
        console.log('✅ Window focus - tab visible again');
      }
    };

    const handleBlur = () => {
      if (isTabVisible) {
        const now = Date.now();
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setLastTabSwitchTime(now);
        setIsTabVisible(false);
        
        setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'hidden' }]);
        
        console.log('🚨 WINDOW BLUR - TAB SWITCH DETECTED! Count:', newCount);
        syncTabSwitchData(newCount, now);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isTabVisible, tabSwitchCount, quizId, user?.id]);

  // Function to sync tab switch data to database
  const syncTabSwitchData = async (count: number, timestamp: number) => {
    try {
      const response = await fetch('/api/quiz-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: Number(quizId),
          user_id: user?.id,
          tab_switch_count: count,
          last_tab_switch_time: new Date(timestamp).toISOString(),
          tab_switch_history: tabSwitchHistory
        }),
      });

      if (response.ok) {
        console.log('✅ Tab switch data synced successfully');
      } else {
        console.error('❌ Failed to sync tab switch data');
      }
    } catch (error) {
      console.error('❌ Error syncing tab switch data:', error);
    }
  };

  /** Call when a question becomes visible */
  function startTiming(qid: string) {
    console.log('🔍 startTiming called for question:', qid);
    if (currentQid && tickStart != null) {
      const sec = Math.max(0, Math.round((Date.now() - tickStart) / 1000));
      console.log('⏱️ Adding time for question', currentQid, ':', sec, 'seconds');
      setQts(prev => {
        const updated = { ...prev, [currentQid]: (prev[currentQid] || 0) + sec };
        // Immediate sync to ensure no time is lost - include all questions
        const completeQtsForSync: Record<string, number> = {};
        questions.forEach((q) => {
          completeQtsForSync[String(q.id)] = updated[String(q.id)] || 0;
        });
        console.log('🔄 Immediate QTS sync on question change:', { question_time_spent: completeQtsForSync });
        fetch('/api/quiz-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_time_spent: completeQtsForSync }),
        }).then(() => {
          console.log('✅ Immediate QTS sync successful');
        }).catch((error) => {
          console.error('❌ Immediate QTS sync failed:', error);
        });
        return updated;
      });
    }
    setCurrentQid(String(qid));
    setTickStart(Date.now());
    console.log('⏱️ Started timing for question:', qid);
  }

  /** Call right BEFORE navigating away (next/prev/jump/section change) */
  function stopTiming() {
    console.log('🔍 stopTiming called for question:', currentQid);
    if (currentQid && tickStart != null) {
      const sec = Math.max(0, Math.round((Date.now() - tickStart) / 1000));
      console.log('⏱️ Stopping timing for question', currentQid, ':', sec, 'seconds');
      setQts(prev => {
        const updated = { ...prev, [currentQid]: (prev[currentQid] || 0) + sec };
        // Immediate sync to ensure no time is lost - include all questions
        const completeQtsForSync: Record<string, number> = {};
        questions.forEach((q) => {
          completeQtsForSync[String(q.id)] = updated[String(q.id)] || 0;
        });
        console.log('🔄 Immediate QTS sync on stop timing:', { question_time_spent: completeQtsForSync });
        fetch('/api/quiz-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_time_spent: completeQtsForSync }),
        }).then(() => {
          console.log('✅ Immediate QTS sync successful');
        }).catch((error) => {
          console.error('❌ Immediate QTS sync failed:', error);
        });
        return updated;
      });
    }
    setCurrentQid(null);
    setTickStart(null);
  }

  /** High-frequency timer for maximum precision - runs every 100ms */
  useEffect(() => {
    const highFreqTimer = setInterval(() => {
      if (currentQid && tickStart != null) {
        const now = Date.now();
        const elapsedMs = now - tickStart;
        const elapsedSec = Math.floor(elapsedMs / 1000);
        
        // Only update if at least 1 second has passed
        if (elapsedSec > 0) {
          console.log('⏱️ High-freq timer: Adding', elapsedSec, 'seconds to question', currentQid);
          setQts(prev => {
            const updated = { ...prev, [currentQid]: (prev[currentQid] || 0) + elapsedSec };
            setTickStart(now); // Reset tick start to current time
            return updated;
          });
        }
      }
    }, 100); // Check every 100ms for maximum precision

    return () => clearInterval(highFreqTimer);
  }, [currentQid, tickStart]);

  /** Lightweight periodic sync to quiz_progress (additive; does not interfere) */
  useEffect(() => {
    const iv = setInterval(() => {
      console.log('⏱️ Periodic sync - qts state:', qts);
      if (!Object.keys(qts).length) return;
      
      // Capture current question time before syncing
      if (currentQid && tickStart != null) {
        const sec = Math.max(0, Math.round((Date.now() - tickStart) / 1000));
        console.log('⏱️ Capturing current question time before sync:', currentQid, ':', sec, 'seconds');
        setQts(prev => {
          const updated = { ...prev, [currentQid]: (prev[currentQid] || 0) + sec };
          // Sync the updated QTS data - include all questions
          const completeQtsForSync: Record<string, number> = {};
          questions.forEach((q) => {
            completeQtsForSync[String(q.id)] = updated[String(q.id)] || 0;
          });
          console.log('🔄 Syncing QTS data in format:', { question_time_spent: completeQtsForSync });
      fetch('/api/quiz-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question_time_spent: completeQtsForSync }),
          }).then(() => {
            console.log('✅ QTS sync successful');
            setLastSyncTime(Date.now());
          }).catch((error) => {
            console.error('❌ QTS sync failed:', error);
          });
          return updated;
        });
        // Reset tick start for current question
        setTickStart(Date.now());
      } else {
        // Sync existing QTS data - ensure all questions are included
        const completeQtsForSync: Record<string, number> = {};
        questions.forEach((q) => {
          completeQtsForSync[String(q.id)] = qts[String(q.id)] || 0;
        });
        console.log('🔄 Syncing existing QTS data in format:', { question_time_spent: completeQtsForSync });
        fetch('/api/quiz-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_time_spent: completeQtsForSync }),
        }).then(() => {
          console.log('✅ QTS sync successful');
          setLastSyncTime(Date.now());
        }).catch((error) => {
          console.error('❌ QTS sync failed:', error);
        });
      }
    }, 1000); // Sync every 1 second for maximum precision

    const beforeUnload = () => { 
      console.log('🔄 Page unload - capturing final QTS data');
      stopTiming(); 
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Page hidden - capturing current QTS data');
        if (currentQid && tickStart != null) {
          const sec = Math.max(0, Math.round((Date.now() - tickStart) / 1000));
          if (sec > 0) {
            setQts(prev => {
              const updated = { ...prev, [currentQid]: (prev[currentQid] || 0) + sec };
              // Immediate sync when page becomes hidden - include all questions
              const completeQtsForSync: Record<string, number> = {};
              questions.forEach((q) => {
                completeQtsForSync[String(q.id)] = updated[String(q.id)] || 0;
              });
              fetch('/api/quiz-progress', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_time_spent: completeQtsForSync }),
              }).then(() => {
                console.log('✅ QTS sync on page hidden successful');
              }).catch((error) => {
                console.error('❌ QTS sync on page hidden failed:', error);
              });
              return updated;
            });
            setTickStart(Date.now());
          }
        }
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(iv);
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qts, currentQid, tickStart]);
  // ===== [END QTS TIMING BLOCK] =====

  // Function to capture final QTS data before submission
  const captureFinalQTS = () => {
    console.log('🔄 Capturing final QTS data before submission');
    if (currentQid && tickStart != null) {
      const sec = Math.max(0, Math.round((Date.now() - tickStart) / 1000));
      console.log('⏱️ Final capture for question', currentQid, ':', sec, 'seconds');
      setQts(prev => {
        const finalQts = { ...prev, [currentQid]: (prev[currentQid] || 0) + sec };
        console.log('📊 Final QTS data:', finalQts);
        return finalQts;
      });
    }
  };

  // Cleanup effect to capture QTS data on unmount
  useEffect(() => {
    return () => {
      console.log('🔄 Component unmounting - capturing final QTS data');
      captureFinalQTS();
    };
  }, [currentQid, tickStart]);

  // State management
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [flagged, setFlagged] = useState<Record<number, boolean>>({})
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({})
  const [currentSection, setCurrentSection] = useState<number | null>(null)
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [errorPopup, setErrorPopup] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false)
  const [timeUpDialogOpen, setTimeUpDialogOpen] = useState(false)
  const [autoSubmitting, setAutoSubmitting] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)
  const [violationCount, setViolationCount] = useState(0)
  const [submittingModalOpen, setSubmittingModalOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false)
  const [pauseStart, setPauseStart] = useState<number | null>(null)
  const [pausedDuration, setPausedDuration] = useState<number>(0)
  const [showLastMinuteWarning, setShowLastMinuteWarning] = useState(false)
  const [restoredNotification, setRestoredNotification] = useState(false)
  const [showSubmitThankYou, setShowSubmitThankYou] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [showMoreQuestionsIndicator, setShowMoreQuestionsIndicator] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [paletteView, setPaletteView] = useState<'grid' | 'list'>('grid')
  // Removed clickingOption state for instant selection

  // Refs
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionPaletteRef = useRef<HTMLDivElement>(null)
  const timerBackupRef = useRef<NodeJS.Timeout | null>(null)
  const timerProtectionRef = useRef<NodeJS.Timeout | null>(null)
  const lastTimerUpdateRef = useRef<number>(Date.now())
  const timerInitializedRef = useRef<boolean>(false)

  // Set initial question and start timing when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !currentQuestionId) {
      console.log('⏱️ Setting initial question and starting timing');
      const firstQuestionId = questions[0].id;
      setCurrentQuestionId(firstQuestionId);
      setCurrentSection(questions[0].section_id);
      startTiming(String(firstQuestionId));
    }
  }, [questions, currentQuestionId]);

  // Reset timer initialization state when quiz changes
  useEffect(() => {
    timerInitializedRef.current = false;
  }, [quizId]);

  // Function to check if timer should be preserved
  const shouldPreserveTimer = (startTime: number, duration: number) => {
    if (!startTime || !duration) return false;
    
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
    
    // Preserve timer if there's still time left and it's not corrupted
    return remaining > 0 && remaining <= duration / 1000 + 60; // Allow 1 minute buffer
  };



  // Fetch quiz data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()
        console.log('quizData:', quizData, 'quizError:', quizError);
        if (quizError) throw quizError
        if (!quizData) throw new Error('Quiz not found')
        setQuiz(quizData)

        // Fetch sections for this quiz
        const { data: sectionData, error: sectionError } = await supabase
          .from('sections')
          .select('*')
          .eq('quiz_id', quizId)
          .order('id', { ascending: true })
        if (sectionError) throw sectionError
        setSections(sectionData || [])

        // Fetch questions (including options as jsonb)
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('id', { ascending: true })
        console.log('questionData:', questionData, 'questionError:', questionError);
        if (questionError) throw questionError

        const parsedQuestions = (questionData || []).map(q => ({
          id: q.id,
          question_text: q.question_text,
          image: q.image_url || q.image || null,
          options: (() => {
            if (Array.isArray(q.options)) {
              return q.options.map((opt: any) => ({
                text: opt.text,
                isCorrect: opt.is_correct ?? opt.isCorrect,
                image: opt.image || null
              }));
            } else if (typeof q.options === 'string') {
              try {
                const arr = JSON.parse(q.options);
                if (Array.isArray(arr)) {
                  return arr.map((opt: any) => ({
                    text: opt.text,
                    isCorrect: opt.is_correct ?? opt.isCorrect,
                    image: opt.image || null
                  }));
                }
              } catch (e) {
                return [];
              }
            }
            return [];
          })(),
          section_id: q.section_id,
          marks: q.marks || 1,
          question_type: q.question_type || 'single',
          explanation: q.explanation
        }))

        setQuestions(parsedQuestions)

        // Initialize timer (simplified and robust)
        const rawDuration = quizData.duration;
        const validDuration = (rawDuration && rawDuration > 0) ? rawDuration : 30;
        const durationInSeconds = validDuration * 60;
        setTotalTime(durationInSeconds);
        
        // Check if timer should be preserved
        const existingStartTime = Number(localStorage.getItem(`quiz-${quizId}-startTime`));
        const existingDuration = Number(localStorage.getItem(`quiz-${quizId}-duration`));
        
        if (shouldPreserveTimer(existingStartTime, existingDuration)) {
          console.log('🕐 Preserving existing timer - quiz in progress');
          // Calculate remaining time from existing timer
          const elapsed = Date.now() - existingStartTime;
          const remaining = Math.max(0, Math.floor((existingDuration - elapsed) / 1000));
          setTimeLeft(remaining);
          timerInitializedRef.current = true;
          console.log('🕐 Timer preserved:', { remaining, elapsed, existingStartTime, existingDuration });
        } else {
          console.log('🕐 Initializing new timer');
        const startTimeMs = Date.now();
        const durationMs = durationInSeconds * 1000;
          localStorage.setItem(`quiz-${quizId}-startTime`, startTimeMs.toString());
        localStorage.setItem(`quiz-${quizId}-duration`, durationMs.toString());
        setTimeLeft(durationInSeconds);
          timerInitializedRef.current = true;
          console.log('🕐 Timer initialized:', { startTimeMs, durationMs, durationInSeconds });
        }
        
        console.log('Timer initialization:', {
          quizDataDuration: quizData.duration,
          durationInSeconds,
          startTimeKey: `quiz-${quizId}-startTime`,
          durationKey: `quiz-${quizId}-duration`
        });
        


        // Load saved state
        const savedState = localStorage.getItem(`quiz-${quizId}-state`)
        if (savedState) {
          const { answers, flags, bookmarks, reviews, visited } = JSON.parse(savedState)
          // Ensure all indices are numbers
          const fixedAnswers: Record<number, number[]> = {};
          for (const [qid, arr] of Object.entries(answers || {})) {
            fixedAnswers[Number(qid)] = Array.isArray(arr) ? arr.map(Number) : [];
          }
          setAnswers(fixedAnswers);
          setFlagged(typeof flags === 'string' ? JSON.parse(flags) : (flags || {}))
          setBookmarked(typeof bookmarks === 'string' ? JSON.parse(bookmarks) : (bookmarks || {}))
          setMarkedForReview(typeof reviews === 'string' ? JSON.parse(reviews) : (reviews || {}))
          setVisitedQuestions(typeof visited === 'string' ? JSON.parse(visited) : (visited || {}))
          // Don't show restored notification - answers are restored silently
          setRestoredNotification(false);
        } else {
          setRestoredNotification(false);
        }

        if ((sectionData || []).length > 0) {
          setCurrentSection(sectionData[0].id)
        }
      } catch (error) {
        console.error('Error loading quiz:', error, JSON.stringify(error, null, 2));
        setErrorPopup('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false)
      }
    }

    if (quizId) fetchData()
  }, [quizId])

  // Group questions by section_id
  const questionsBySection = useMemo(() => {
    const groups: Record<number, Question[]> = {}
    questions.forEach(q => {
      if (!groups[q.section_id]) groups[q.section_id] = []
      groups[q.section_id].push(q)
    })
    return groups
  }, [questions])

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!currentQuestionId || questions.length === 0) return null;
    return questions.find(q => q.id === currentQuestionId) || questions[0]
  }, [currentQuestionId, questions])

  // Calculate answered count - properly check for valid answers
  const answeredCount = useMemo(() => {
    return questions.filter(q => {
      const questionAnswers = answers[q.id];
      // Check if question has answers and they are not empty
      return questionAnswers && 
             Array.isArray(questionAnswers) && 
             questionAnswers.length > 0 &&
             questionAnswers.some(answer => answer !== null && answer !== undefined);
    }).length;
  }, [answers, questions])

  // Timer progress
  const timerProgress = useMemo(() => {
    if (timeLeft === null || totalTime === 0) return 0
    return ((totalTime - timeLeft) / totalTime) * 100
  }, [timeLeft, totalTime])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }





  // Navigation handlers
  const goToQuestion = (questionId: number) => {
    // [QTS] capture time before leaving current question
    stopTiming();
    setCurrentQuestionId(questionId);
    // Mark question as visited
    setVisitedQuestions(prev => ({ ...prev, [questionId]: true }));
    // Find the section of the selected question
    const q = questions.find(q => q.id === questionId);
    if (q) setCurrentSection(q.section_id);
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    // [QTS] start timing on the new question
    startTiming(String(questionId));
  }

  // Review functionality
  const createReviewSnapshot = (): ReviewSnapshot => {
    const reviewQuestions: ReviewQuestionState[] = questions.map((q, index) => {
      const questionAnswers = answers[q.id];
      const hasAnswer = questionAnswers && 
                       Array.isArray(questionAnswers) && 
                       questionAnswers.length > 0 &&
                       questionAnswers.some(answer => answer !== null && answer !== undefined);
      const isVisited = visitedQuestions[q.id];
      
      let status: 'answered' | 'unanswered' | 'skipped';
      if (hasAnswer) {
        status = 'answered';
      } else if (isVisited) {
        status = 'unanswered';
      } else {
        status = 'skipped';
      }

      return {
        id: q.id.toString(),
        number: index + 1,
        section: sections.find(s => s.id === q.section_id)?.name,
        status,
        flagged: flagged[q.id] || false
      };
    });

    const answered = reviewQuestions.filter(q => q.status === 'answered').length;
    const unanswered = reviewQuestions.filter(q => q.status === 'unanswered').length;
    const skipped = reviewQuestions.filter(q => q.status === 'skipped').length;
    const flaggedCount = reviewQuestions.filter(q => q.flagged).length;

    // Calculate end time based on current time left
    const endTime = new Date(Date.now() + (timeLeft || 0) * 1000);

    return {
      total: questions.length,
      answered,
      unanswered,
      skipped,
      flagged: flaggedCount,
      endsAtISO: endTime.toISOString(),
      questions: reviewQuestions
    };
  };

  const handleReviewJumpTo = (questionNumber: number) => {
    const question = questions[questionNumber - 1];
    if (question) {
      goToQuestion(question.id);
      setReviewDrawerOpen(false); // Close the drawer after navigation
    }
  };

  const handleClearAllFlags = () => {
    setFlagged({});
  };

  const goToNextQuestionFlat = () => {
    // [QTS] capture time before leaving current question
    stopTiming();
    const idx = questions.findIndex(q => q.id === currentQuestionId);
    if (idx < questions.length - 1) {
      const nextQ = questions[idx + 1];
      setCurrentQuestionId(nextQ.id);
      setCurrentSection(nextQ.section_id);
      // Mark next question as visited
      setVisitedQuestions(prev => ({ ...prev, [nextQ.id]: true }));
      // [QTS] start timing on the new question
      startTiming(String(nextQ.id));
    }
  };

  const goToPrevQuestionFlat = () => {
    // [QTS] capture time before leaving current question
    stopTiming();
    const idx = questions.findIndex(q => q.id === currentQuestionId);
    if (idx > 0) {
      const prevQ = questions[idx - 1];
      setCurrentQuestionId(prevQ.id);
      setCurrentSection(prevQ.section_id);
      // Mark previous question as visited
      setVisitedQuestions(prev => ({ ...prev, [prevQ.id]: true }));
      // [QTS] start timing on the new question
      startTiming(String(prevQ.id));
    }
  };

  // Add handler for Next Section
  const goToNextSection = () => {
    // [QTS] capture time before leaving current question
    stopTiming();
    const sectionIds = sections.map(s => s.id);
    const currentSectionIndex = sectionIds.indexOf(currentSection ?? -1);
    if (currentSectionIndex < sectionIds.length - 1) {
      const nextSectionId = sectionIds[currentSectionIndex + 1];
      const nextSectionQuestions = questionsBySection[nextSectionId] || [];
      if (nextSectionQuestions.length > 0) {
        setCurrentSection(nextSectionId);
        setCurrentQuestionId(nextSectionQuestions[0].id);
        // [QTS] start timing on the new question
        startTiming(String(nextSectionQuestions[0].id));
      }
    }
  };

  // Debounced API call for saving progress
  const saveProgressDebounced = useCallback(
    debounce(async (questionId: number, answers: Record<number, number[]>) => {
      if (user?.id && quizId) {
        try {
          await fetch('/api/quiz-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quiz_id: quizId,
              user_id: user.id,
              question_id: questionId,
              answers: { [questionId]: answers[questionId] },
            })
          });
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    }, 100), // 100ms delay for much faster response
    [user?.id, quizId]
  );

  // Answer handlers - INSTANT selection with zero delay
  const handleOptionSelect = useCallback((questionId: number, optionIdx: number, questionType: string) => {
    // INSTANT UI update - no delays, no loading states
    setAnswers(prev => {
      let newAnswers;
      if (questionType === 'single') {
        // For single choice: allow unselecting by clicking the same option again
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(optionIdx)) {
          // If clicking the same option, unselect it
          newAnswers = { ...prev, [questionId]: [] };
        } else {
          // Otherwise, select the new option
          newAnswers = { ...prev, [questionId]: [optionIdx] };
        }
      } else {
        // For multiple choice: toggle selection
        const currentAnswers = prev[questionId] || [];
        newAnswers = {
          ...prev,
          [questionId]: currentAnswers.includes(optionIdx)
            ? currentAnswers.filter(a => a !== optionIdx)
            : [...currentAnswers, optionIdx]
        };
      }
      
      // Debounced API call - completely non-blocking
      saveProgressDebounced(questionId, newAnswers);
      
      return newAnswers;
    });
    
    // No loading state delays - selection is instant
  }, [saveProgressDebounced]);

  // Flag and bookmark handlers
  const toggleFlag = (questionId: number) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const toggleBookmark = (questionId: number) => {
    setBookmarked(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const toggleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  // Handle entering review mode
  const handleReviewMode = () => {
    const markedQuestions = questions.filter(q => markedForReview[q.id])
    setReviewQuestions(markedQuestions)
    setCurrentReviewIndex(0)
    setReviewMode(!reviewMode)
    
    if (markedQuestions.length > 0 && !reviewMode) {
      // Go to first marked question
      setCurrentQuestionId(markedQuestions[0].id)
    }
  }

  // Navigate to next/previous review question
  const navigateReviewQuestion = (direction: 'next' | 'prev') => {
    if (reviewQuestions.length === 0) return
    
    let newIndex = currentReviewIndex
    if (direction === 'next') {
      newIndex = (currentReviewIndex + 1) % reviewQuestions.length
    } else {
      newIndex = currentReviewIndex === 0 ? reviewQuestions.length - 1 : currentReviewIndex - 1
    }
    
    setCurrentReviewIndex(newIndex)
    setCurrentQuestionId(reviewQuestions[newIndex].id)
  }



  // Submit handlers
  const handleSubmit = async () => {
    setConfirmDialogOpen(true)
  }

  // Security: Tab/Window Switch Detection
  useEffect(() => {
    const handleVisibility = (e: Event) => {
      if (document.visibilityState === 'hidden') {
        setViolationCount((prev) => {
          const next = prev + 1;
          setErrorPopup('You switched tabs/windows. This is not allowed during the exam.');
          if (next >= 3 && !submitted) {
            handleSubmit();
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [submitted]);

  // Security: Prevent right-click, copy, cut, paste, and print
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const preventKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Prevent Print
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('keydown', preventKey);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('keydown', preventKey);
    };
  }, []);

  // Add debug logs for answers, questions, and current question
  useEffect(() => {
    console.log('Restored answers state:', answers);
  }, [answers]);

  useEffect(() => {
    console.log('Questions loaded:', questions);
  }, [questions]);

  useEffect(() => {
    if (currentQuestion) {
      console.log('Current question:', currentQuestion.id, currentQuestion.question_text);
      console.log('Selected indices:', answers[currentQuestion.id]);
    }
  }, [currentQuestion, answers]);

  // Restore progress from server on mount, but only after questions are loaded
  useEffect(() => {
    if (!quizId || !user?.id || questions.length === 0) return;
    (async () => {
      try {
        const res = await fetch(`/api/quiz-progress?quiz_id=${quizId}&user_id=${user.id}`);
        const { data } = await res.json();
        if (data) {
          // Ensure all indices are numbers
          const fixedAnswers: Record<number, number[]> = {};
          for (const [qid, arr] of Object.entries(data.answers || {})) {
            fixedAnswers[Number(qid)] = Array.isArray(arr) ? arr.map(Number) : [];
          }
          setAnswers(fixedAnswers);
          setFlagged(data.flagged || {});
          setBookmarked(data.bookmarked || {});
          setMarkedForReview(data.marked_for_review || {});
          if (data.start_time) {
            // Only set start_time in localStorage if it does not already exist
            const key = `quiz-${quizId}-startTime`;
            if (!localStorage.getItem(key)) {
              localStorage.setItem(key, Math.floor(new Date(data.start_time).getTime() / 60000).toString());
            }
          }
          // Set current question to first answered or first question
          const answeredQ = Object.keys(fixedAnswers);
          if (answeredQ.length > 0) {
            const firstQ = questions.find(q => q.id === Number(answeredQ[0]));
            if (firstQ) {
              setCurrentQuestionId(firstQ.id);
              setCurrentSection(firstQ.section_id);
              // [QTS] start timing first visible question
              startTiming(String(firstQ.id));
            }
          }
        }
      } catch (e) {
        // Ignore fetch errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, user?.id, questions]);

  // After quiz and user are loaded, ensure a progress row is created in quiz_progress as soon as the quiz attempt page loads.
  useEffect(() => {
    if (!quizId || !user?.id) return;
    // Only run once on mount
    (async () => {
      try {
        await fetch('/api/quiz-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quizId,
            user_id: user.id,
            answers: answers || {},
            flagged: flagged || {},
            bookmarked: bookmarked || {},
            marked_for_review: markedForReview || {},
            start_time: (() => {
              const startTime = localStorage.getItem(`quiz-${quizId}-startTime`);
              if (!startTime) return undefined;
              const num = Number(startTime);
              if (isNaN(num)) return undefined;
              return new Date(num).toISOString();
            })(),
          })
        });
      } catch (e) {
        // Ignore errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, user?.id]);

  // Debounced server auto-save
  const debouncedSaveProgress = useRef(
    debounce(async (progress) => {
      if (!quizId || !user?.id) return;
      await fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          user_id: user.id,
          answers: progress.answers,
          flagged: progress.flagged,
          bookmarked: progress.bookmarked,
          marked_for_review: progress.markedForReview,
          visited: progress.visited,
          start_time: (() => {
            const startTime = localStorage.getItem(`quiz-${quizId}-startTime`);
            if (!startTime) return undefined;
            const num = Number(startTime);
            if (isNaN(num)) return undefined;
            return new Date(num).toISOString();
          })(),
        })
      });
    }, 5000)
  ).current;

  // Watch for changes and auto-save
  useEffect(() => {
    setIsAutoSaving(true);
    debouncedSaveProgress({ answers, flagged, bookmarked, markedForReview, visited: visitedQuestions });
    // Hide indicator after 2 seconds
    const timer = setTimeout(() => setIsAutoSaving(false), 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, flagged, bookmarked, markedForReview, visitedQuestions, currentQuestionId]);

  // Throttled saveProgress function (at most once every 2 seconds)
  const throttledSaveProgress = useCallback(
    throttle(() => {
      if (!quizId || !user?.id) return;
      const payload = {
        quiz_id: quizId,
        user_id: user.id,
        answers: answers || {},
        flagged: flagged || {},
        bookmarked: bookmarked || {},
        marked_for_review: markedForReview || {},
        visited: visitedQuestions || {},
        start_time: (() => {
          const startTime = localStorage.getItem(`quiz-${quizId}-startTime`);
          if (!startTime) return undefined;
          const num = Number(startTime);
          if (isNaN(num)) return undefined;
          return new Date(num).toISOString();
        })(),
      };
      console.log('Saving quiz progress:', payload);
      fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }, 2000),
    [quizId, user?.id, answers, flagged, bookmarked, markedForReview, visitedQuestions]
  );

  // Save progress (throttled) on any change
  useEffect(() => {
    throttledSaveProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, flagged, bookmarked, markedForReview]);

  // Save progress on page unload (immediate, not throttled)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!quizId || !user?.id) return;
      const payload = {
        quiz_id: quizId,
        user_id: user.id,
        answers: answers || {},
        flagged: flagged || {},
        bookmarked: bookmarked || {},
        marked_for_review: markedForReview || {},
        visited: visitedQuestions || {},
        start_time: (() => {
          const startTime = localStorage.getItem(`quiz-${quizId}-startTime`);
          if (!startTime) return undefined;
          const num = Number(startTime);
          if (isNaN(num)) return undefined;
          return new Date(num).toISOString();
        })(),
      };
      console.log('Saving quiz progress (unload):', payload);
      fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [quizId, user?.id, answers, flagged, bookmarked, markedForReview, visitedQuestions]);

  // Backend validation: On submission, check time and attempt count
  const confirmSubmit = async () => {
    // [QTS] final capture
    captureFinalQTS();
    stopTiming();
    setConfirmDialogOpen(false)
    setSubmittingModalOpen(true)
    setSubmitted(true)
    
    // Add a more generous timeout fallback
    const submissionTimeout = setTimeout(() => {
      setSubmittingModalOpen(false);
      setErrorPopup('Submission is taking too long. Please check your connection and try again.');
      setSubmitted(false);
    }, 30000); // Increased to 30 seconds for better reliability
    try {
      // Prepare correct answers
      const correctAnswers: Record<number, string[]> = {}
      questions.forEach(q => {
        correctAnswers[q.id] = q.options.filter(o => o.isCorrect).map(o => o.text)
      })
      // Convert answers from indices to text for submission
      const answersText: Record<number, string[]> = {}
      Object.entries(answers).forEach(([qid, arr]) => {
        const q = questions.find(qq => qq.id === Number(qid));
        if (q) {
          answersText[q.id] = (arr as number[]).map(idx => q.options[idx]?.text ?? '');
        }
      });
      // Save answers as indices for review page
      const answersIndices: Record<string, number[]> = {};
      Object.entries(answers).forEach(([qid, arr]) => {
        answersIndices[qid] = (arr as number[]).map(Number);
      });
      // Debug logs
      console.log('DEBUG: answers at submit:', answers);
      console.log('DEBUG: questions at submit:', questions);
      // Calculate extra fields
      const totalQuestions = questions.length;
      const scoreObj = calculateScore();
      console.log('DEBUG: scoreObj at submit:', scoreObj);
      const correctCount = scoreObj.score;
      const obtainedMarks = scoreObj.obtainedMarks;
      const totalMarks = scoreObj.totalMarks;
      const percentage = scoreObj.percentage;
      const status = 1;
      // Backend validation: Check time and attempt count
      // Fetch latest attempt count and quiz start time from DB
      console.log('DEBUG: Fetching attempts from Supabase...');
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('attempts')
        .select('id,submitted_at')
        .eq('quiz_id', Number(quizId))
        .eq('user_id', user?.id);
      console.log('DEBUG: attemptsData:', attemptsData, 'attemptsError:', attemptsError);
      if (attemptsError) throw attemptsError;
      if (attemptsData && attemptsData.length >= (quiz?.max_attempts || 1)) {
        setErrorPopup('You have reached the maximum number of attempts for this quiz.');
        setSubmitted(false);
        clearTimeout(submissionTimeout);
        return;
      }
      // Check time (server-side)
      const now = new Date();
      const quizStart = quiz?.start_time ? new Date(quiz.start_time) : null;
      const quizEnd = quiz?.end_time ? new Date(quiz.end_time) : null;
      if (quizStart && now < quizStart) {
        setErrorPopup('Quiz has not started yet.');
        setSubmitted(false);
        clearTimeout(submissionTimeout);
        return;
      }
      if (quizEnd && now > quizEnd) {
        setErrorPopup('Quiz time is over.');
        setSubmitted(false);
        clearTimeout(submissionTimeout);
        return;
      }
      // Prepare submission data
      const startTimeStr = localStorage.getItem(`quiz-${quizId}-startTime`);
      const start_time = startTimeStr ? new Date(Number(startTimeStr)).toISOString() : undefined;
      // Debug logs for timing
      console.log('DEBUG: start_time in localStorage:', startTimeStr, 'as ISO:', start_time);
      console.log('DEBUG: submitted_at:', new Date().toISOString());
      // Ensure all questions have time data (0 for unvisited questions)
      const completeQts: Record<string, number> = {};
      questions.forEach((q, index) => {
        const questionTime = qts[String(q.id)] || 0;
        completeQts[String(q.id)] = questionTime;
        console.log(`📊 QTS for Question ${q.id}: ${questionTime} seconds`);
      });
      
      // Calculate total time spent
      const totalTimeSpent = Object.values(completeQts).reduce((sum, time) => sum + time, 0);
      console.log(`📊 Total time spent across all questions: ${totalTimeSpent} seconds (${Math.round(totalTimeSpent / 60)} minutes)`);

      const submissionData = {
        quiz_id: Number(quizId),
        user_id: user?.id,
        user_name: user?.fullName || 'Anonymous',
        answers: answersIndices,
        correct_answers: correctAnswers,
        submitted_at: new Date().toISOString(),
        score: Math.round(obtainedMarks),
        total_marks: Math.round(totalMarks),
        total_questions: Math.round(totalQuestions), // optional
        correct_count: Math.round(correctCount), // optional
        percentage: Math.round(percentage), // optional
        status: Math.round(status), // optional
        marked_for_review: markedForReview, // optional
        start_time, // optional
        question_time_spent: completeQts,
        tab_switch_count: tabSwitchCount,
        last_tab_switch_time: lastTabSwitchTime ? new Date(lastTabSwitchTime).toISOString() : null,
        tab_switch_history: tabSwitchHistory
      }
      console.log('DEBUG: submissionData:', submissionData);
      console.log('DEBUG: Timing data (qts):', qts);
      console.log('DEBUG: Complete QTS data:', completeQts);
      console.log('DEBUG: QTS format being sent:', { question_time_spent: completeQts });
      console.log('DEBUG: Total questions:', questions.length);
      console.log('DEBUG: QTS entries:', Object.keys(completeQts).length);
      // Debug log for user ID and payload
      console.log('DEBUG: submitting as user_id:', user?.id);
      console.log('DEBUG: submissionData:', submissionData);
      // Save to database with improved error handling
      console.log('DEBUG: Inserting attempt into Supabase...');
      let insertError = null;
      let insertResult: any = undefined;
      
      try {
        // Try the insert with a longer timeout
        const insertPromise = supabase
          .from('attempts')
          .insert([submissionData]);
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase insert timed out')), 20000) // Increased to 20 seconds
        );
        
        insertResult = await Promise.race([insertPromise, timeoutPromise]);
        console.log('DEBUG: Insert successful', insertResult);
      } catch (err) {
        insertError = err;
        console.error('DEBUG: Insert failed', err);
      }
      if (insertError || (insertResult?.error)) {
        const error = insertError || insertResult?.error;
        // Enhanced error handling for RLS and other errors
        console.error('Submission error:', error, JSON.stringify(error, null, 2));
        
        // Try to retry once for network errors
        if (error.message && error.message.includes('timed out')) {
          console.log('DEBUG: Retrying submission due to timeout...');
          try {
            const retryResult = await supabase
              .from('attempts')
              .insert([submissionData]);
            
            if (retryResult.error) {
              throw retryResult.error;
            }
            
            console.log('DEBUG: Retry successful', retryResult);
            // Continue with success flow
          } catch (retryError) {
            console.error('DEBUG: Retry failed', retryError);
            setErrorPopup("Failed to submit after retry. Please check your network connection and try again.");
            setSubmitted(false);
            setSubmittingModalOpen(false);
            setShowSubmitThankYou(false);
            clearTimeout(submissionTimeout);
            return;
          }
        } else {
          // Handle other errors
          if (
            error.message &&
            error.message.toLowerCase().includes('row-level security')
          ) {
            setErrorPopup(
              "You do not have permission to submit this quiz. Please make sure you are logged in with the correct account, and contact support if the problem persists."
            );
          } else if (error.details) {
            setErrorPopup("Failed to submit: " + error.details);
          } else if (error.message) {
            setErrorPopup("Failed to submit: " + error.message);
          } else if (error.code) {
            setErrorPopup("Failed to submit. Error code: " + error.code);
          } else {
            setErrorPopup("Failed to submit. Please check your network connection or try again.");
          }
          setSubmitted(false);
          setSubmittingModalOpen(false);
          setShowSubmitThankYou(false);
          clearTimeout(submissionTimeout);
          return;
        }
      }
      // After successful submission, delete progress (with fallback)
      console.log('DEBUG: Deleting quiz progress...');
      try {
        const deleteRes = await fetch('/api/quiz-progress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quiz_id: quizId, user_id: user?.id })
        });
        console.log('DEBUG: quiz-progress delete response:', deleteRes);
      } catch (deleteError) {
        console.warn('DEBUG: Failed to delete quiz progress, but submission was successful:', deleteError);
        // Don't fail the submission if progress deletion fails
      }
      
      setRedirectMessage('Quiz submitted! Redirecting to dashboard...')
      setShowSubmitThankYou(true)
      setSubmittingModalOpen(false)
      clearTimeout(submissionTimeout);
      setTimeout(() => {
        router.push('/dashboard/student')
      }, 3500)
    } catch (error) {
      setErrorPopup("An unexpected error occurred. Please try again.");
      setSubmittingModalOpen(false);
      setShowSubmitThankYou(false);
      console.error('Submission error:', error, JSON.stringify(error, null, 2));
      setSubmitted(false);
      clearTimeout(submissionTimeout);
    }
  }

  // Score calculation
  const calculateScore = () => {
    let score = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    questions.forEach(q => {
      const userAnswer: number[] = answers[q.id] || [];
      const correctIndices = q.options
        .map((o, idx) => (o.isCorrect ? idx : -1))
        .filter(idx => idx !== -1);
      const questionMarks = q.marks || 1;
      totalMarks += questionMarks || 0;

      // PARTIAL CREDIT: count number of correct options selected
      const correctSelected = userAnswer.filter(a => correctIndices.includes(a)).length;
      const totalCorrect = correctIndices.length;
      // Optionally, subtract for incorrect options selected
      // const incorrectSelected = userAnswer.filter(a => !correctIndices.includes(a)).length;

      // Award partial marks (proportional)
      if (totalCorrect > 0) {
        const partialMark = (correctSelected / totalCorrect) * (questionMarks || 0);
        obtainedMarks += partialMark;
        if (correctSelected === totalCorrect && userAnswer.length === totalCorrect) {
          score += 1; // full correct
        }
      }
    });

    const percentage = Math.round((obtainedMarks / (totalMarks || 1)) * 100);
    const passed = quiz?.passing_score ? obtainedMarks >= (quiz.passing_score || 0) : percentage >= 60;

    return { score, totalMarks, obtainedMarks, percentage, passed };
  }

  // --- TIMER REFACTOR START ---
  // Robust timer state: only set start time if not already set, always use ms
  useEffect(() => {
    if (!quizId || !quiz) return;
    const startKey = `quiz-${quizId}-startTime`;
    const durationKey = `quiz-${quizId}-duration`;
    const pausedKey = `quiz-${quizId}-pausedDuration`;
    // Set start time only if not already set
    if (!localStorage.getItem(startKey)) {
      localStorage.setItem(startKey, Date.now().toString());
    }
    // Set duration (ms) only if not already set
    if (!localStorage.getItem(durationKey)) {
      const durationMs = (quiz.duration && quiz.duration > 0 ? quiz.duration : 30) * 60 * 1000;
      localStorage.setItem(durationKey, durationMs.toString());
    }
    // Set paused duration to 0 if not already set
    if (!localStorage.getItem(pausedKey)) {
      localStorage.setItem(pausedKey, '0');
    }
  }, [quizId, quiz?.id]);

  // --- AUTO SUBMISSION HANDLER ---
  const handleAutoSubmit = useCallback(async () => {
    // [QTS] final capture
    captureFinalQTS();
    stopTiming();
    setTimeUpDialogOpen(true);
    setAutoSubmitting(true);
    setSubmitted(true);
    
    // Add a timeout fallback
    const submissionTimeout = setTimeout(() => {
      setSubmittingModalOpen(false);
      setErrorPopup('Auto-submission is taking too long. Please check your connection and try again.');
      setSubmitted(false);
      setAutoSubmitting(false);
    }, 15000); // 15 seconds
    
    try {
      // Prepare correct answers
      const correctAnswers: Record<number, string[]> = {}
      questions.forEach(q => {
        correctAnswers[q.id] = q.options.filter(o => o.isCorrect).map(o => o.text)
      })
      
      // Convert answers from indices to text for submission
      const answersText: Record<number, string[]> = {}
      Object.entries(answers).forEach(([qid, arr]) => {
        const q = questions.find(qq => qq.id === Number(qid));
        if (q) {
          answersText[q.id] = (arr as number[]).map(idx => q.options[idx]?.text ?? '');
        }
      });
      
      // Save answers as indices for review page
      const answersIndices: Record<string, number[]> = {};
      Object.entries(answers).forEach(([qid, arr]) => {
        answersIndices[qid] = (arr as number[]).map(Number);
      });
      
      // Debug logs
      console.log('DEBUG: Auto-submission - answers:', answers);
      console.log('DEBUG: Auto-submission - questions:', questions);
      
      // Calculate extra fields
      const totalQuestions = questions.length;
      const scoreObj = calculateScore();
      console.log('DEBUG: Auto-submission - scoreObj:', scoreObj);
      const correctCount = scoreObj.score;
      const obtainedMarks = scoreObj.obtainedMarks;
      const totalMarks = scoreObj.totalMarks;
      const percentage = scoreObj.percentage;
      const status = 1;
      
      // Backend validation: Check time and attempt count
      console.log('DEBUG: Auto-submission - Fetching attempts from Supabase...');
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('attempts')
        .select('id,submitted_at')
        .eq('quiz_id', Number(quizId))
        .eq('user_id', user?.id);
      console.log('DEBUG: Auto-submission - attemptsData:', attemptsData, 'attemptsError:', attemptsError);
      
      if (attemptsError) throw attemptsError;
      if (attemptsData && attemptsData.length >= (quiz?.max_attempts || 1)) {
        setErrorPopup('You have reached the maximum number of attempts for this quiz.');
        setSubmitted(false);
        setAutoSubmitting(false);
        clearTimeout(submissionTimeout);
        return;
      }
      
      // Prepare submission data
      const startTimeStr = localStorage.getItem(`quiz-${quizId}-startTime`);
      const start_time = startTimeStr ? new Date(Number(startTimeStr)).toISOString() : undefined;
      
      // Ensure all questions have time data (0 for unvisited questions)
      const completeQts: Record<string, number> = {};
      questions.forEach((q, index) => {
        const questionTime = qts[String(q.id)] || 0;
        completeQts[String(q.id)] = questionTime;
        console.log(`📊 Auto-submit QTS for Question ${q.id}: ${questionTime} seconds`);
      });
      
      // Calculate total time spent
      const totalTimeSpent = Object.values(completeQts).reduce((sum, time) => sum + time, 0);
      console.log(`📊 Auto-submit total time spent: ${totalTimeSpent} seconds (${Math.round(totalTimeSpent / 60)} minutes)`);
      
      const submissionData = {
        quiz_id: Number(quizId),
        user_id: user?.id,
        user_name: user?.fullName || 'Anonymous',
        answers: answersIndices,
        correct_answers: correctAnswers,
        submitted_at: new Date().toISOString(),
        score: Math.round(obtainedMarks),
        total_marks: Math.round(totalMarks),
        total_questions: Math.round(totalQuestions),
        correct_count: Math.round(correctCount),
        percentage: Math.round(percentage),
        status: Math.round(status),
        marked_for_review: markedForReview,
        start_time,
        question_time_spent: completeQts,
        tab_switch_count: tabSwitchCount,
        last_tab_switch_time: lastTabSwitchTime ? new Date(lastTabSwitchTime).toISOString() : null,
        tab_switch_history: tabSwitchHistory
      }
      
      console.log('DEBUG: Auto-submission - submissionData:', submissionData);
      console.log('DEBUG: Auto-submit QTS format being sent:', { question_time_spent: completeQts });
      
      // Save to database with a 10s timeout
      console.log('DEBUG: Auto-submission - Inserting attempt into Supabase...');
      let insertError = null;
      let insertResult: any = undefined;
      const insertPromise = supabase
        .from('attempts')
        .insert([submissionData]);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase insert timed out')), 10000)
      );
      
      try {
        insertResult = await Promise.race([insertPromise, timeoutPromise]);
      } catch (err) {
        insertError = err;
      }
      
      console.log('DEBUG: Auto-submission - Insert finished', insertResult, insertError);
      if (insertError || (insertResult?.error)) {
        const error = insertError || insertResult?.error;
        console.error('Auto-submission error:', error, JSON.stringify(error, null, 2));
        
        if (error.message && error.message.toLowerCase().includes('row-level security')) {
          setErrorPopup("You do not have permission to submit this quiz. Please make sure you are logged in with the correct account, and contact support if the problem persists.");
        } else if (error.details) {
          setErrorPopup("Auto-submission failed: " + error.details);
        } else if (error.message) {
          setErrorPopup("Auto-submission failed: " + error.message);
        } else if (error.code) {
          setErrorPopup("Auto-submission failed. Error code: " + error.code);
        } else {
          setErrorPopup("Auto-submission failed. Please check your network connection or try again.");
        }
        
        setSubmitted(false);
        setAutoSubmitting(false);
        clearTimeout(submissionTimeout);
        return;
      }
      
      // After successful submission, delete progress
      console.log('DEBUG: Auto-submission - Deleting quiz progress...');
      const deleteRes = await fetch('/api/quiz-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId, user_id: user?.id })
      });
      console.log('DEBUG: Auto-submission - quiz-progress delete response:', deleteRes);
      
      setRedirectMessage('Time\'s up! Quiz auto-submitted successfully. Redirecting to dashboard...')
      setShowSubmitThankYou(true)
      setAutoSubmitting(false)
      clearTimeout(submissionTimeout);
      
      setTimeout(() => {
        router.push('/dashboard/student')
      }, 3500)
      
    } catch (error) {
      setErrorPopup("An unexpected error occurred during auto-submission. Please try again.");
      setAutoSubmitting(false);
      setShowSubmitThankYou(false);
      console.error('Auto-submission error:', error, JSON.stringify(error, null, 2));
      setSubmitted(false);
      clearTimeout(submissionTimeout);
    }
  }, [quizId, user?.id, user?.fullName, answers, questions, markedForReview, quiz?.max_attempts]);

  // Timer countdown effect (robust, ms-based)
  const timerWasPositive = useRef(false);
  useEffect(() => {
    console.log('Timer useEffect triggered:', { quizId, quiz: !!quiz, submitted });
    if (!quizId || !quiz) {
      console.log('Timer not starting - missing quizId or quiz');
      return;
    }
    if (submitted) {
      console.log('Timer not starting - already submitted');
      return;
    }
    let timerId: NodeJS.Timeout;
    function tick() {
      const startKey = `quiz-${quizId}-startTime`;
      const durationKey = `quiz-${quizId}-duration`;
      const pausedKey = `quiz-${quizId}-pausedDuration`;
      const pauseStartKey = `quiz-${quizId}-pauseStart`;
      const startTime = Number(localStorage.getItem(startKey));
      const duration = Number(localStorage.getItem(durationKey));
      let pausedDuration = Number(localStorage.getItem(pausedKey) || '0');
      
      // Debug logging
      console.log('Timer Debug:', {
        startTime,
        duration,
        startTimeStr: localStorage.getItem(startKey),
        durationStr: localStorage.getItem(durationKey),
        currentTime: Date.now()
      });
      
      // If currently paused, add current pause duration
      const pauseStartStr = localStorage.getItem(pauseStartKey);
      if (pauseStartStr) {
        const pauseStart = Number(pauseStartStr);
        if (!isNaN(pauseStart)) {
          pausedDuration += Date.now() - pauseStart;
        }
      }
      
      if (!startTime || !duration || duration <= 0) {
        console.log('Timer not initialized properly:', { startTime, duration });
        // Initialize timer if missing and we have quiz data
        if (quiz && !timerInitializedRef.current) {
          console.log('Initializing timer in main timer useEffect');
          const durationInSeconds = quiz.duration * 60;
          const startTimeMs = Date.now();
          localStorage.setItem(`quiz-${quizId}-startTime`, startTimeMs.toString());
          const durationMs = durationInSeconds * 1000;
          localStorage.setItem(`quiz-${quizId}-duration`, durationMs.toString());
          setTimeLeft(durationInSeconds);
          timerInitializedRef.current = true;
          console.log('🕐 Timer initialized in main useEffect:', { startTimeMs, durationMs, durationInSeconds });
        } else {
          console.log('Timer data missing or corrupted, but not reinitializing to preserve existing timer');
        }
        return;
      }
      
      const elapsed = Date.now() - startTime - pausedDuration;
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000)); // in seconds
      
      console.log('Timer calculation:', {
        elapsed,
        remaining,
        duration,
        startTime,
        pausedDuration
      });
      
      setTimeLeft(remaining);
      if (remaining > 0) {
        timerWasPositive.current = true;
      }
      // Only auto-submit if timer was ever positive and now reached 0
      if (remaining <= 0 && timerWasPositive.current) {
        handleAutoSubmit();
        timerWasPositive.current = false;
      }
    }
    timerId = setInterval(tick, 1000);
    tick(); // initial call
    return () => clearInterval(timerId);
  }, [quizId, quiz, submitted, handleAutoSubmit]);
  // --- TIMER REFACTOR END ---

  // Add CSS animation for saved indicator
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        20% { opacity: 0.8; transform: translateY(0); }
        80% { opacity: 0.8; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Ensure timer starts immediately when quiz loads
  useEffect(() => {
    if (quiz && !submitted && !timerInitializedRef.current) {
      const existingStartTime = Number(localStorage.getItem(`quiz-${quizId}-startTime`));
      const existingDuration = Number(localStorage.getItem(`quiz-${quizId}-duration`));
      
      if (shouldPreserveTimer(existingStartTime, existingDuration)) {
        console.log('🕐 Force preserving existing timer');
        const elapsed = Date.now() - existingStartTime;
        const remaining = Math.max(0, Math.floor((existingDuration - elapsed) / 1000));
        setTimeLeft(remaining);
        timerInitializedRef.current = true;
        console.log('🕐 Timer force preserved:', { remaining });
      } else {
        console.log('🕐 Force starting new timer on quiz load');
        const durationInSeconds = quiz.duration * 60;
        const startTimeMs = Date.now();
        localStorage.setItem(`quiz-${quizId}-startTime`, startTimeMs.toString());
        const durationMs = durationInSeconds * 1000;
        localStorage.setItem(`quiz-${quizId}-duration`, durationMs.toString());
        setTimeLeft(durationInSeconds);
        timerInitializedRef.current = true;
        console.log('🕐 Timer force started:', { startTimeMs, durationMs, durationInSeconds });
      }
    }
  }, [quiz, submitted, quizId]);

  // Ensure QTS timing starts for current question
  useEffect(() => {
    if (currentQuestionId && !submitted) {
      console.log('🕐 Starting timing for current question:', currentQuestionId);
      startTiming(String(currentQuestionId));
    }
  }, [currentQuestionId, submitted]);

  // Fallback timer start - ensures timer starts even if other mechanisms fail
  useEffect(() => {
    if (quiz && !submitted && timeLeft === null) {
      const existingStartTime = Number(localStorage.getItem(`quiz-${quizId}-startTime`));
      const existingDuration = Number(localStorage.getItem(`quiz-${quizId}-duration`));
      
      if (shouldPreserveTimer(existingStartTime, existingDuration)) {
        console.log('🕐 Fallback preserving existing timer');
        const elapsed = Date.now() - existingStartTime;
        const remaining = Math.max(0, Math.floor((existingDuration - elapsed) / 1000));
        setTimeLeft(remaining);
        console.log('🕐 Fallback timer preserved:', { remaining });
      } else {
        console.log('🕐 Fallback timer start - timeLeft is null');
        const durationInSeconds = quiz.duration * 60;
        const startTimeMs = Date.now();
        localStorage.setItem(`quiz-${quizId}-startTime`, startTimeMs.toString());
        const durationMs = durationInSeconds * 1000;
        localStorage.setItem(`quiz-${quizId}-duration`, durationMs.toString());
        setTimeLeft(durationInSeconds);
        console.log('🕐 Fallback timer started:', { startTimeMs, durationMs, durationInSeconds });
      }
    }
  }, [quiz, submitted, timeLeft, quizId]);

  // Add a useEffect to always sync isOffline with navigator.onLine on mount and on online/offline events.
  useEffect(() => {
    function syncOnlineStatus() {
      setIsOffline(!navigator.onLine);
    }
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);
    // Initial check
    syncOnlineStatus();
    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, []);

  // Scroll indicator effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show scroll indicator if user is near the top and there's more content below
      setShowScrollIndicator(scrollTop < 100 && documentHeight > windowHeight + 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Set current question to first answered or first question after questions and answers are loaded
  useEffect(() => {
    if (questions.length === 0) return;
    // If currentQuestionId is not set or not in questions, set it
    const validIds = questions.map(q => q.id);
    if (currentQuestionId && !validIds.includes(currentQuestionId)) {
      // Prefer first answered question
      const answeredQ = Object.keys(answers).map(Number);
      if (answeredQ.length > 0 && validIds.includes(answeredQ[0])) {
        setCurrentQuestionId(answeredQ[0]);
        setCurrentSection(questions.find(q => q.id === answeredQ[0])?.section_id ?? questions[0].section_id);
      } else if (questions.length > 0) {
        setCurrentQuestionId(questions[0].id);
        setCurrentSection(questions[0].section_id);
      }
    }
  }, [questions, answers]);

  // Auto-scroll question palette to current section
  useEffect(() => {
    if (currentSection && questionPaletteRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Find the section element in the palette
        const sectionElement = questionPaletteRef.current?.querySelector(`[data-section-id="${currentSection}"]`);
        if (sectionElement) {
          // Scroll the section into view with smooth behavior
          sectionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [currentSection]);

  // TIMER PROTECTION SYSTEM - Ensures timer never stops
  useEffect(() => {
    if (!quizId || !quiz || submitted) return;

    // Primary timer protection - checks every 5 seconds if timer is running
    const timerProtection = () => {
      const startKey = `quiz-${quizId}-startTime`;
      const durationKey = `quiz-${quizId}-duration`;
      const startTime = Number(localStorage.getItem(startKey));
      const duration = Number(localStorage.getItem(durationKey));
      
      if (!startTime || !duration) {
        console.log('🛡️ Timer protection: Timer data missing, not reinitializing to preserve existing timer');
        // Don't reinitialize timer to preserve existing start time
        return;
      }

      // Calculate current time left
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
      
      // If timer seems stuck or corrupted, don't restart it - just log the issue
      if (remaining > duration / 1000 + 10) { // More than 10 seconds over expected
        console.log('🛡️ Timer protection: Timer appears corrupted, but preserving original start time');
        // Don't reset the timer, just use the calculated remaining time
        setTimeLeft(remaining);
      } else {
        setTimeLeft(remaining);
      }
    };

    // Start protection system
    timerProtectionRef.current = setInterval(timerProtection, 5000);
    
    // Backup timer that runs independently every 2 seconds
    const backupTimer = () => {
      const startKey = `quiz-${quizId}-startTime`;
      const durationKey = `quiz-${quizId}-duration`;
      const startTime = Number(localStorage.getItem(startKey));
      const duration = Number(localStorage.getItem(durationKey));
      
      if (startTime && duration) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
        setTimeLeft(remaining);
        
        // Auto-submit if time is up
        if (remaining <= 0) {
          console.log('🛡️ Backup timer: Time up, auto-submitting');
          handleAutoSubmit();
        }
      }
    };

    timerBackupRef.current = setInterval(backupTimer, 2000);

    return () => {
      if (timerProtectionRef.current) {
        clearInterval(timerProtectionRef.current);
      }
      if (timerBackupRef.current) {
        clearInterval(timerBackupRef.current);
      }
    };
  }, [quizId, quiz, submitted, handleAutoSubmit]);

  // ADDITIONAL TIMER PROTECTION - Page visibility and focus events
  useEffect(() => {
    if (!quizId || !quiz || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🛡️ Page hidden - timer continues running');
        // Timer continues running even when page is hidden
        // This is handled by the protection system above
      } else {
        console.log('🛡️ Page visible - ensuring timer is accurate');
        // Recalculate timer when page becomes visible
        const startKey = `quiz-${quizId}-startTime`;
        const durationKey = `quiz-${quizId}-duration`;
        const startTime = Number(localStorage.getItem(startKey));
        const duration = Number(localStorage.getItem(durationKey));
        
        if (startTime && duration) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
          setTimeLeft(remaining);
        }
      }
    };

    const handleFocus = () => {
      console.log('🛡️ Window focused - timer protection active');
      // Ensure timer is accurate when window regains focus
      const startKey = `quiz-${quizId}-startTime`;
      const durationKey = `quiz-${quizId}-duration`;
      const startTime = Number(localStorage.getItem(startKey));
      const duration = Number(localStorage.getItem(durationKey));
      
      if (startTime && duration) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
        setTimeLeft(remaining);
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', () => console.log('🛡️ Window blurred - timer continues'));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [quizId, quiz, submitted]);

  // WATCHDOG TIMER - Monitors if timer gets stuck and restarts it
  useEffect(() => {
    if (!quizId || !quiz || submitted) return;

    const watchdog = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastTimerUpdateRef.current;
      
      // If timer hasn't updated for more than 10 seconds, something is wrong
      if (timeSinceLastUpdate > 10000) {
        console.log('🛡️ WATCHDOG: Timer appears stuck, restarting protection system');
        
        // Force restart timer protection
        const startKey = `quiz-${quizId}-startTime`;
        const durationKey = `quiz-${quizId}-duration`;
        const startTime = Number(localStorage.getItem(startKey));
        const duration = Number(localStorage.getItem(durationKey));
        
        if (startTime && duration) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
          setTimeLeft(remaining);
          lastTimerUpdateRef.current = now;
          
          if (remaining <= 0) {
            console.log('🛡️ WATCHDOG: Time up, auto-submitting');
            handleAutoSubmit();
          }
        } else {
          // Don't reinitialize if corrupted - preserve existing timer
          console.log('🛡️ WATCHDOG: Timer data corrupted, but preserving existing timer');
          // Just set a default time left to prevent errors
          setTimeLeft(quiz.duration * 60);
          lastTimerUpdateRef.current = now;
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(watchdog);
  }, [quizId, quiz, submitted, handleAutoSubmit]);

  // Update last timer update timestamp whenever timeLeft changes
  useEffect(() => {
    if (timeLeft !== null) {
      lastTimerUpdateRef.current = Date.now();
    }
  }, [timeLeft]);

  // Handle question palette scroll to hide/show "More Questions" indicator
  useEffect(() => {
    const paletteElement = questionPaletteRef.current;
    if (!paletteElement) return;

    const handlePaletteScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = paletteElement;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShowMoreQuestionsIndicator(!isAtBottom);
    };

    paletteElement.addEventListener('scroll', handlePaletteScroll);
    
    // Initial check
    handlePaletteScroll();

    return () => {
      paletteElement.removeEventListener('scroll', handlePaletteScroll);
    };
  }, []);

  // Toast notifications for exam progress (reduced frequency)
  useEffect(() => {
    if (!timeLeft || !totalTime) return;
    
    const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;
    const answeredCount = questions.filter(q => {
      const questionAnswers = answers[q.id];
      return questionAnswers && 
             Array.isArray(questionAnswers) && 
             questionAnswers.length > 0 &&
             questionAnswers.some(answer => answer !== null && answer !== undefined);
    }).length;
    
    // Show last minute warning at exactly 1 minute left
    if (timeLeft <= 60 && timeLeft > 59 && !showLastMinuteWarning) {
      setToastMessage('Only 1 minute left!');
      setShowLastMinuteWarning(true); // Prevent showing again
    }
    
    // Only show progress message once every 10 questions (instead of 5)
    if (answeredCount > 0 && answeredCount % 10 === 0 && !toastMessage) {
    }
    
    // Only show motivation message once at 15 min mark
    if (totalTime >= 3600 && timeLeft <= 900 && timeLeft > 840 && !toastMessage) {
      setToastMessage('Breathe & refocus — you\'re doing great.');
    }
  }, [timeLeft, totalTime, answers, showLastMinuteWarning, toastMessage]);

  // Auto-hide toast after 2 seconds (faster)
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Enhanced Keyboard navigation with tooltips and accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Navigation shortcuts
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (reviewMode && reviewQuestions.length > 0) {
          navigateReviewQuestion('next');
        } else {
          goToNextQuestionFlat();
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (reviewMode && reviewQuestions.length > 0) {
          navigateReviewQuestion('prev');
        } else {
          goToPrevQuestionFlat();
        }
      }
      
      // Number keys 1-9 for option selection (single choice only)
      if (currentQuestion && currentQuestion.question_type === 'single') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
          e.preventDefault();
          handleOptionSelect(currentQuestion.id, optionIndex, currentQuestion.question_type);
        }
      }
      
      // Enhanced keyboard shortcuts for actions
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggleMarkForReview(currentQuestion?.id || 0);
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleBookmark(currentQuestion?.id || 0);
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFlag(currentQuestion?.id || 0);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        goToNextQuestionFlat();
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'Enter') {
        e.preventDefault();
        goToNextQuestionFlat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentQuestionId, questions, currentQuestion]);



  // Helper components for clean two-column layout



  const OptionRow = React.memo(({ option, index, isSelected, questionType, questionId }: {
    option: Option;
    index: number;
    isSelected: boolean;
    questionType: string;
    questionId: number;
  }) => {
    const letter = String.fromCharCode(65 + index);
    
    // INSTANT click handler - no delays, no loading states
    const handleClick = useCallback((e?: React.MouseEvent) => {
      // Prevent event bubbling and default behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // INSTANT selection
      handleOptionSelect(questionId, index, questionType);
    }, [questionId, index, questionType, handleOptionSelect]);

    // INSTANT touch handler for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // INSTANT selection
      handleOptionSelect(questionId, index, questionType);
    }, [questionId, index, questionType, handleOptionSelect]);

    // INSTANT mouse down handler
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // INSTANT selection
      handleOptionSelect(questionId, index, questionType);
    }, [questionId, index, questionType, handleOptionSelect]);
    
    // INSTANT key down handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // INSTANT selection
        handleOptionSelect(questionId, index, questionType);
      }
    }, [questionId, index, questionType, handleOptionSelect]);

    return (
      <Box sx={{ mb: 2 }}>
        <Box 
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown} // Add mouse down for instant response
          onTouchStart={handleTouchStart} // Add touch start for mobile instant response
          tabIndex={0}
          role="button"
          aria-pressed={isSelected}
          aria-label={`Option ${letter}: ${option.text}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            minHeight: 64, // Increased height for better click target
            borderRadius: '12px',
            border: isSelected ? `3px solid ${UI.primary}` : `1px solid ${UI.border}`,
            backgroundColor: isSelected ? UI.primaryTint : '#FFFFFF',
            ...(isSelected && {
              boxShadow: `0 0 0 2px ${UI.primaryRing}, inset 0 0 0 1px ${UI.primaryRing}`
            }),
            cursor: 'pointer',
            // INSTANT response - no transitions for immediate feedback
            transition: 'none',
            // Hardware acceleration for smoother animations
            willChange: 'transform, background-color, border-color, box-shadow',
            // Ensure entire area is clickable
            position: 'relative',
            userSelect: 'none', // Prevent text selection for better UX
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            // Professional hover experience - subtle and clean
            '&:hover': { 
              backgroundColor: isSelected ? UI.primaryTint : '#F8FAFF',
              borderColor: isSelected ? UI.primary : '#3B82F6',
              boxShadow: isSelected ? `0 0 0 3px ${UI.primaryRing}` : '0 2px 8px rgba(59, 130, 246, 0.1)',
              transform: 'translateY(-1px) translateZ(0)', // Reduced from -2px to -1px
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)', // Slightly slower for smoother feel
            },
            '&:active': {
              transform: 'scale(0.98) translateZ(0)', // Reduced from 0.96 to 0.98 for less jarring effect
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)', // Reduced shadow intensity
              transition: 'none', // Instant active state
            },
            '&:focus-visible': {
              outline: `2px solid ${UI.focus}`,
              outlineOffset: '2px'
            }
          }}
        >
          {/* Letter Badge */}
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: isSelected ? UI.primary : '#F3F4F6',
            color: isSelected ? '#FFFFFF' : UI.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: inter.style.fontFamily,
            flexShrink: 0,
            border: isSelected ? 'none' : `2px solid ${UI.border}`,
            // INSTANT badge animation - no transitions
            transition: 'none',
            boxShadow: isSelected ? '0 2px 8px rgba(40, 53, 147, 0.3)' : 'none',
            // Hardware acceleration
            willChange: 'transform, background-color, color, box-shadow',
            // Subtle scale animation on selection
            transform: isSelected ? 'scale(1.02)' : 'scale(1)', // Reduced from 1.05 to 1.02
          }}>
            {letter}
          </Box>
          
          {/* Radio/Checkbox */}
          {questionType === 'single' ? (
            <Radio 
              checked={isSelected}
              sx={{ 
                color: isSelected ? UI.primary : '#94A3B8',
                pointerEvents: 'none',
                p: 0.25,
                // INSTANT radio button - no transitions
                transition: 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)', // Reduced from 1.1 to 1.05
                willChange: 'transform, color',
              }}
            />
          ) : (
            <Checkbox 
              checked={isSelected}
              sx={{ 
                color: isSelected ? UI.primary : '#94A3B8',
                pointerEvents: 'none',
                p: 0.25,
                // INSTANT checkbox - no transitions
                transition: 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)', // Reduced from 1.1 to 1.05
                willChange: 'transform, color',
              }}
            />
          )}
          
          {/* Option Text */}
          <Typography sx={{ 
            fontSize: '16px', 
            fontWeight: '400', 
            color: UI.text, 
            flex: 1,
            fontFamily: robotoSlab.style.fontFamily,
            lineHeight: '22px',
            // Clean text styling - no transitions needed
            transition: 'none',
          }}>
            {option.text}
          </Typography>
        </Box>

        {/* Option Image */}
        {option.image && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <img
              src={option.image}
              alt={`Option ${letter}`}
              style={{
                width: '100%',
                maxWidth: 360,
                height: 'auto',
                borderRadius: '6px',
                border: `1px solid ${UI.border}`
              }}
            />
          </Box>
        )}
      </Box>
    );
  });

  OptionRow.displayName = 'OptionRow';

    const Legend = () => (
    <Box sx={{ p: 3, backgroundColor: UI.card, borderTop: `1px solid ${UI.border}` }}>
      <Typography sx={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: UI.text, 
        mb: 2,
        fontFamily: inter.style.fontFamily
      }}>
        Question Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[
          { color: UI.answered, label: 'Answered' },
          { color: '#EF4444', label: 'Not Answered' },
          { color: UI.review, label: 'Marked for Review' },
          { color: 'transparent', label: 'Not Visited', border: true }
        ].map(({ color, label, border }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: color,
                  border: border ? `1px solid ${UI.border}` : 'none',
                borderRadius: 2,
                  flexShrink: 0
                }}
              />
            <Typography sx={{ 
              fontSize: 14, 
              color: UI.subtext,
              fontFamily: inter.style.fontFamily
            }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const QuestionPalette = () => {
    const currentSectionQuestions = questionsBySection[currentSection || sections[0]?.id] || [];
    
    return (
      <Box sx={{ p: 3, backgroundColor: UI.card, flex: 1 }}>
        <Typography sx={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: UI.text, 
          mb: 2,
          fontFamily: inter.style.fontFamily
        }}>
          {sections.find(s => s.id === currentSection)?.name || 'Section'}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Responsive grid layout - 5 columns */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 40px)', 
          gap: 1, 
          mb: 3 
        }}>
          {currentSectionQuestions.map((q, idx) => {
            const isCurrent = currentQuestionId === q.id;
            const questionAnswers = answers[q.id];
            const isAnswered = questionAnswers && 
                             Array.isArray(questionAnswers) && 
                             questionAnswers.length > 0 &&
                             questionAnswers.some(answer => answer !== null && answer !== undefined);
            const isMarked = !!markedForReview[q.id];
            const isVisited = !!visitedQuestions[q.id];
            const isFlagged = !!flagged[q.id];
            const isBookmarked = !!bookmarked[q.id];
            
            // Status determination - Follow the specified color scheme
            let bgColor = 'transparent';    // Not Visited
            let textColor = UI.subtext;
            let borderColor = UI.border;
            let borderWidth = '1px solid';
            
            if (isCurrent) {
              bgColor = UI.primary; 
              textColor = '#FFFFFF'; 
              borderColor = UI.primary;
              borderWidth = '2px solid';
            } else if (isAnswered && isMarked) {
              bgColor = UI.review; 
              textColor = '#FFFFFF'; 
              borderColor = UI.review;
              borderWidth = '1px solid';
            } else if (isMarked) {
              bgColor = UI.review; 
              textColor = '#FFFFFF'; 
              borderColor = UI.review;
              borderWidth = '1px solid';
            } else if (isAnswered) {
              bgColor = UI.answered; 
              textColor = '#FFFFFF'; 
              borderColor = UI.answered;
              borderWidth = '1px solid';
            } else if (isVisited) {
              bgColor = '#EF4444'; 
              textColor = '#FFFFFF'; 
              borderColor = '#EF4444';
              borderWidth = '1px solid';
            }
            
            // Status text for aria-label
            let statusText = 'Not visited';
            if (isCurrent) statusText = 'Current';
            else if (isAnswered && isMarked) statusText = 'Answered and marked for review';
            else if (isMarked) statusText = 'Marked for review';
            else if (isAnswered) statusText = 'Answered';
            else if (isVisited) statusText = 'Not answered';
            
            return (
              <Box key={q.id} sx={{ position: 'relative' }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => goToQuestion(q.id)}
                  disabled={submitted}
                  aria-label={`Question ${idx + 1}, ${statusText}`}
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    minHeight: 40,
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1,
                    backgroundColor: bgColor,
                    color: textColor,
                    border: `${borderWidth} ${borderColor}`,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    '&:hover': { 
                      filter: 'brightness(0.95)',
                      backgroundColor: bgColor
                    },
                    '&:focus-visible': { 
                      outline: `2px solid ${UI.focus}`, 
                      outlineOffset: 1 
                    }
                  }}
                >
                  {idx + 1}
                </Button>
                
                {/* Status indicators */}
                {(isFlagged || isBookmarked) && (
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: isFlagged ? UI.flagged : UI.bookmarked,
                    borderRadius: '50%',
                    border: '1px solid #fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }} />
                )}
                
                {/* Green check icon for "Answered & Marked for Review" */}
                {isAnswered && isMarked && (
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    backgroundColor: UI.answered,
                    borderRadius: '50%',
                    border: '1px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 12, color: '#FFFFFF' }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Section Navigation */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconButton 
              size="small"
              onClick={() => {
                const currentIdx = sections.findIndex(s => s.id === currentSection);
                if (currentIdx > 0) {
                  const prevSection = sections[currentIdx - 1];
                  const prevSectionQuestions = questionsBySection[prevSection.id] || [];
                  if (prevSectionQuestions.length > 0) {
                    setCurrentSection(prevSection.id);
                    goToQuestion(prevSectionQuestions[0].id);
                  }
                }
              }}
              disabled={sections.findIndex(s => s.id === currentSection) === 0}
              sx={{ color: UI.primary, cursor: 'pointer' }}
            >
              <BackIcon />
            </IconButton>
            
            <Select
              value={currentSection ?? sections[0]?.id ?? ''}
              onChange={(e) => {
                const sectionId = Number(e.target.value);
                const sectionQuestions = questionsBySection[sectionId] || [];
                if (sectionQuestions.length > 0) {
                  setCurrentSection(sectionId);
                  goToQuestion(sectionQuestions[0].id);
                }
              }}
              size="small"
              sx={{
                flex: 1,
                fontSize: 12,
                fontFamily: inter.style.fontFamily,
                cursor: 'pointer'
              }}
            >
              {sections.map((section, idx) => (
                <MenuItem key={section.id} value={section.id}>
                  Section {idx + 1}: {section.name}
                </MenuItem>
              ))}
            </Select>
            
            <IconButton 
              size="small"
              onClick={() => {
                const currentIdx = sections.findIndex(s => s.id === currentSection);
                if (currentIdx < sections.length - 1) {
                  const nextSection = sections[currentIdx + 1];
                  const nextSectionQuestions = questionsBySection[nextSection.id] || [];
                  if (nextSectionQuestions.length > 0) {
                    setCurrentSection(nextSection.id);
                    goToQuestion(nextSectionQuestions[0].id);
                  }
                }
              }}
              disabled={sections.findIndex(s => s.id === currentSection) === sections.length - 1}
              sx={{ color: UI.primary, cursor: 'pointer' }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  // Create a helper component for the palette body
  const PaletteBody = () => (
    <Box 
      role="navigation" 
      aria-label="Question palette"
      sx={{ backgroundColor: UI.card, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Timer Card */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${UI.border}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: UI.text,
            fontFamily: inter.style.fontFamily
          }}>
            Timer
          </Typography>
          <Typography sx={{ 
            fontSize: 12, 
            color: UI.subtext,
            fontFamily: inter.style.fontFamily
          }}>
            Total: {formatTime(totalTime)}
          </Typography>
        </Box>
        
        {/* Large Timer Display */}
        <Typography sx={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: UI.text,
          fontFamily: inter.style.fontFamily,
          mb: 2
        }}>
          {formatTime(timeLeft || 0)}
        </Typography>
        
        {/* Progress Bar */}

      </Box>
      
      <QuestionPalette />
      
      {/* Action Buttons - Pinned to bottom */}
      <Box sx={{ p: 3, borderTop: `1px solid ${UI.border}` }}>
        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReviewMode}
            disabled={Object.values(markedForReview).filter(Boolean).length === 0}
            sx={{ 
              borderColor: reviewMode ? UI.review : UI.border,
              color: reviewMode ? UI.review : UI.text,
              backgroundColor: reviewMode ? UI.reviewTint : 'transparent',
              fontSize: 14,
              fontWeight: 600,
              height: 40,
              fontFamily: inter.style.fontFamily,
              cursor: 'pointer',
              borderRadius: 8
            }}
          >
            {reviewMode ? 'EXIT REVIEW' : `REVIEW (${Object.values(markedForReview).filter(Boolean).length})`}
          </Button>
          
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          startIcon={<CheckCircleIcon />}
          sx={{ 
            backgroundColor: UI.primary,
            '&:hover': { backgroundColor: UI.primaryHover },
            fontSize: 14,
              fontWeight: 600,
            height: 40,
            fontFamily: inter.style.fontFamily,
              cursor: 'pointer',
              borderRadius: 8
          }}
        >
            Submit
        </Button>
        </Stack>
      </Box>
    </Box>
  );

  // Cleanup debounced calls on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced API calls
      if (saveProgressDebounced) {
        saveProgressDebounced.cancel?.();
      }
    };
  }, [saveProgressDebounced]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <CssBaseline />
        <Box sx={{
        fontFamily: `${inter.style.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial`,
          height: '100vh',
        width: '100vw',
          display: 'flex',
          flexDirection: 'column',
        backgroundColor: UI.bg,
        backgroundImage: `radial-gradient(${UI.gridDot} 1px, transparent 1px)`,
        backgroundSize: '8px 8px',
        backgroundOpacity: 0.015,
        color: UI.text,
        overflow: 'hidden',
        fontVariantNumeric: 'tabular-nums',
        '@keyframes bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        }
      }}>
                {/* Header - Professional Exam Interface */}
        <Box sx={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: `2px solid ${UI.primary}`,
            display: 'flex',
          justifyContent: 'space-between',
            alignItems: 'center',
          px: 5,
          boxShadow: '0 2px 8px rgba(40, 53, 147, 0.15)',
          position: 'sticky',
            top: 0,
          zIndex: 1000,
          fontFamily: inter.style.fontFamily
        }}>
        
                {/* Micro-feedback - Saving progress indicator - Bottom right corner */}
        {isAutoSaving && (
          <Box sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1001,
            opacity: 0.8,
            animation: 'fadeInOut 2s ease-in-out'
          }}>
            <Typography sx={{
              fontSize: '11px',
              fontStyle: 'italic',
              color: UI.answered,
              fontFamily: inter.style.fontFamily,
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              border: `1px solid ${UI.answered}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              ✓ Auto-saved
                  </Typography>
                </Box>
      )}
          {/* Left - Exam Title */}
          <Typography sx={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: UI.text,
            fontFamily: inter.style.fontFamily
          }}>
            {quiz?.quiz_title || quiz?.quiz_name || 'Online Examination'}
          </Typography>

          {/* Center - Professional Timer Display with Total Time and Time Left */}
          <Box sx={{
                display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            flex: 1,
                justifyContent: 'center',
            maxWidth: '450px'
          }}>
            {/* Timer Icon and Title */}
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 1.5
            }}>
              <TimerIcon sx={{ 
                fontSize: '18px', 
                color: UI.primary,
                opacity: 0.8
              }} />
                            <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: UI.subtext,
                fontFamily: inter.style.fontFamily,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Exam Timer
              </Typography>
              </Box>
              
            {/* Time Display Row */}
                        <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
              gap: 2.5
            }}>
              {/* Total Time */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25
              }}>
                <Typography sx={{ 
                  fontSize: '10px', 
                  color: UI.subtext,
                      fontFamily: inter.style.fontFamily,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  TOTAL TIME
                </Typography>
                <Typography sx={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: UI.subtext,
                  fontFamily: inter.style.fontFamily,
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {formatTime(totalTime)}
                    </Typography>
                </Box>
              
              {/* Divider */}
                <Box sx={{
                width: '1px',
                height: '24px',
                backgroundColor: UI.border,
                opacity: 0.6
              }} />
              
              {/* Time Left - Main display */}
              <Box sx={{
                      display: 'flex',
                flexDirection: 'column',
                      alignItems: 'center',
                gap: 0.25
              }}>
                                <Typography sx={{ 
                  fontSize: '10px', 
                  color: UI.subtext,
                  fontFamily: inter.style.fontFamily,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  TIME LEFT
                </Typography>
                                                <Typography sx={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: (timeLeft && timeLeft <= 300) ? UI.notAnswered : UI.primary,
                  fontFamily: inter.style.fontFamily,
                  fontVariantNumeric: 'tabular-nums',
                  animation: (timeLeft && timeLeft <= 60) ? 'pulse 1s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 }
                  }
                }}>
                  {formatTime(timeLeft || 0)}
                </Typography>
                </Box>
                
                {/* Timer Progress Bar */}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={timerProgress} 
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: '#E6EEE9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: (timeLeft && timeLeft <= 300) ? UI.notAnswered : UI.primary,
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
                
                {/* Timer Progress Bar */}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={timerProgress} 
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: '#E6EEE9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: (() => {
                          if (timeLeft && timeLeft <= 60) return UI.flagged; // red at ≤1:00
                          if (timeLeft && timeLeft <= 300) return UI.bookmarked; // amber at ≤5:00
                          return UI.primary; // indigo otherwise
                        })(),
                        borderRadius: 2,
                        animation: (timeLeft && timeLeft <= 60) ? 'pulse 1s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.7 }
                        }
                      }
                    }}
                  />
                </Box>
            </Box>
            

                </Box>
                
          {/* Right - User Block */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
            gap: 2
          }}>
            <Avatar 
              src={user?.imageUrl} 
                sx={{
                width: 32, 
                height: 32, 
                fontSize: 14, 
                fontWeight: '600',
                fontFamily: inter.style.fontFamily
              }}
            >
              {user?.fullName?.charAt(0) || 'C'}
            </Avatar>
            <Box>
                    <Typography sx={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                      color: UI.text,
                fontFamily: inter.style.fontFamily,
                lineHeight: 1.2
                    }}>
                {user?.fullName || 'Candidate'}
                    </Typography>
                    <Typography sx={{ 
                fontSize: '12px', 
                      color: UI.subtext,
                fontFamily: inter.style.fontFamily
              }}>
                Roll Number: {user?.id?.slice(-6) || 'N/A'}
                    </Typography>
            </Box>
          </Box>
                  </Box>

        {/* Floating Scroll Indicator */}
        {showScrollIndicator && (
          <Box sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            backgroundColor: UI.card,
            border: `1px solid ${UI.border}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.9 },
              '50%': { transform: 'scale(1.05)', opacity: 1 }
            },
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }
          }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            });
          }}
          >
            <Typography sx={{
              fontSize: '12px',
              fontWeight: '600',
              color: UI.text,
              fontFamily: inter.style.fontFamily,
              textAlign: 'center',
              mb: 0.5
            }}>
              Scroll down for more questions
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              animation: 'bounce 1.5s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-4px)' },
                '60%': { transform: 'translateY(-2px)' }
              }
            }}>
              <Box sx={{
                width: '8px',
                height: '8px',
                backgroundColor: UI.primary,
                borderRadius: '50%',
                opacity: 0.8
              }} />
              <Box sx={{
                width: '6px',
                height: '6px',
                backgroundColor: UI.primary,
                borderRadius: '50%',
                opacity: 0.6
              }} />
              <Box sx={{
                width: '4px',
                height: '4px',
                backgroundColor: UI.primary,
                borderRadius: '50%',
                opacity: 0.4
              }} />
            </Box>
          </Box>
        )}

        {/* Main Content Area - 2-column grid, full height */}
                  <Box sx={{
                    display: 'flex',
          flexGrow: 1,
          overflow: 'hidden'
        }}>
                    {/* Left Column - Content (75% width) */}
          <Box sx={{
            flex: '0 0 75%',
            overflowY: 'hidden',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            height: '100%'
          }}>
            {/* Question Card */}
            <Box sx={{
              background: `linear-gradient(135deg, ${UI.card} 0%, ${UI.primaryTint} 100%)`,
                          border: `1px solid ${UI.border}`,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 200px)',
              maxWidth: '100%',
              mx: 0,
              overflow: 'hidden'
            }}>
              {/* Card Header Row */}
              <Box sx={{
                backgroundColor: '#F8FAFF',
                    borderBottom: `1px solid ${UI.border}`,
                px: 4,
                py: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: UI.text,
                      fontFamily: robotoSlab.style.fontFamily
                    }}>
                      Question {questions.findIndex(q => q.id === currentQuestion?.id) + 1} of {questions.length} · {sections.find(s => s.id === currentQuestion?.section_id)?.name || 'Section'}
                    </Typography>
                  </Box>
                  {markedForReview[currentQuestion?.id || 0] && (
                    <Box sx={{
                      backgroundColor: '#F4EFFE',
                      color: UI.review,
                      px: 2,
                      py: 0.5,
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      fontFamily: inter.style.fontFamily,
                      letterSpacing: '0.2px'
                    }}>
                      Marked for Review
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Scroll Down Hint */}
                  {showScrollIndicator && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      opacity: 0.6,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <Typography sx={{
                        fontSize: '10px',
                        fontWeight: '500',
                        color: UI.subtext,
                        fontFamily: inter.style.fontFamily,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Scroll ↓
                      </Typography>
                      <Box sx={{
                        width: '12px',
                        height: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                        animation: 'bounce 2s infinite',
                        '@keyframes bounce': {
                          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                          '40%': { transform: 'translateY(-2px)' },
                          '60%': { transform: 'translateY(-1px)' }
                        }
                      }}>
                        <Box sx={{
                          width: '3px',
                          height: '3px',
                          backgroundColor: UI.primary,
                          borderRadius: '50%',
                          opacity: 0.7
                        }} />
                        <Box sx={{
                          width: '2px',
                          height: '2px',
                          backgroundColor: UI.primary,
                          borderRadius: '50%',
                          opacity: 0.5
                        }} />
                        <Box sx={{
                          width: '1px',
                          height: '1px',
                          backgroundColor: UI.primary,
                          borderRadius: '50%',
                          opacity: 0.3
                        }} />
                      </Box>
                    </Box>
                  )}

                  {/* Marks Chip */}
                  <Box sx={{
                    display: 'flex',
                    gap: 1
                  }}>
                    <Chip
                      label={`+${currentQuestion?.marks || 1}`}
                      size="small"
                      sx={{ 
                        fontSize: '11px',
                        height: '24px',
                        fontFamily: inter.style.fontFamily,
                        backgroundColor: '#E8F5E8',
                        border: `1px solid #10B981`,
                        color: '#10B981',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}
                    />
                    <Chip
                      label={`−0`}
                      size="small"
                      sx={{ 
                        fontSize: '11px',
                        height: '24px',
                        fontFamily: inter.style.fontFamily,
                        backgroundColor: '#FEF2F2',
                        border: `1px solid #EF4444`,
                        color: '#EF4444',
                        borderRadius: '12px',
                        fontWeight: '600'
                        }}
                      />
                    </Box>
                  
                  {/* Bookmark Toggle - Tooltipped */}
                  <IconButton
                    onClick={() => toggleBookmark(currentQuestion?.id || 0)}
                    size="small"
                    sx={{
                      color: bookmarked[currentQuestion?.id || 0] ? UI.bookmarked : '#94A3B8',
                      backgroundColor: bookmarked[currentQuestion?.id || 0] ? '#FEF3C7' : 'transparent',
                      '&:hover': { backgroundColor: bookmarked[currentQuestion?.id || 0] ? '#FEF3C7' : '#F8FAFF' },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                      }
                    }}
                    aria-label={bookmarked[currentQuestion?.id || 0] ? 'Remove bookmark' : 'Add bookmark'}
                    title={bookmarked[currentQuestion?.id || 0] ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {bookmarked[currentQuestion?.id || 0] ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                  
                  {/* Flag Toggle - Tooltipped */}
                  <IconButton
                    onClick={() => toggleFlag(currentQuestion?.id || 0)}
                    size="small"
                    sx={{
                      color: flagged[currentQuestion?.id || 0] ? UI.flagged : '#94A3B8',
                      backgroundColor: flagged[currentQuestion?.id || 0] ? '#FEF2F2' : 'transparent',
                      '&:hover': { backgroundColor: flagged[currentQuestion?.id || 0] ? '#FEF2F2' : '#F8FAFF' },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                      }
                    }}
                    aria-label={flagged[currentQuestion?.id || 0] ? 'Remove flag' : 'Add flag'}
                    title={flagged[currentQuestion?.id || 0] ? 'Remove flag' : 'Add flag'}
                  >
                    {flagged[currentQuestion?.id || 0] ? <FlagIcon /> : <FlagOutlinedIcon />}
                  </IconButton>
                </Box>
              </Box>

                            {/* Question Content */}
              <Box sx={{ p: 5, flex: 1, overflowY: 'auto' }}>
                {currentQuestion && (
                  <Box>
                  {/* Question Text */}
                  <Typography 
                    sx={{
                        fontSize: '16px',
                        fontWeight: '500',
                      color: UI.text,
                      lineHeight: 1.6,
                      mb: 4,
                      fontFamily: robotoSlab.style.fontFamily
                    }}
                  >
                    {currentQuestion.question_text}
                  </Typography>
                  
                    {/* Question Image */}
                    {currentQuestion.image && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <img
                          src={currentQuestion.image}
                          alt="Question visual"
                          style={{
                            width: '100%',
                            maxWidth: 400,
                            height: 'auto',
                            borderRadius: '8px',
                            border: `1px solid ${UI.border}`,
                          }}
                        />
                      </Box>
                    )}

                    {/* Question Options */}
                  {currentQuestion.options.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 4 }}>
                      No options available for this question. Please contact your instructor or admin.
                    </Alert>
                  ) : (
                    <Box sx={{ mb: 4 }}>
                      {currentQuestion.options.map((opt: Option, optIdx: number) => (
                        <OptionRow
                          key={optIdx}
                          option={opt}
                          index={optIdx}
                          isSelected={answers[currentQuestion.id]?.includes(optIdx) || false}
                          questionType={currentQuestion.question_type}
                          questionId={currentQuestion.id}
                        />
                      ))}
                    </Box>
                  )}
                  
                  {/* Helper text */}
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography 
                      sx={{
                          fontSize: '12px',
                        fontStyle: 'italic',
                        color: UI.subtext,
                        fontFamily: inter.style.fontFamily,
                        letterSpacing: '0.02em'
                      }}
                    >
                      Tap anywhere on a row to select
                    </Typography>
                    <Typography 
                      sx={{
                          fontSize: '11px',
                        color: UI.subtext,
                        fontFamily: inter.style.fontFamily,
                        mt: 1,
                        opacity: 0.8,
                        letterSpacing: '0.04em'
                      }}
                    >
                      Press 1–4 to answer · ←/→ to navigate
                    </Typography>
                    </Box>
                  </Box>
                )}
                  </Box>
                  
              {/* Action Footer - Left Column - Sticky to card */}
                  <Box sx={{
                backgroundColor: UI.card,
                    borderTop: `1px solid ${UI.border}`,
                p: 4,
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                position: 'sticky',
                bottom: 0
              }}>
                <Box sx={{
                  display: 'flex',
                  gap: 2.5,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                                      {/* Previous Button - Outlined, neutral */}
                  <Button
                    variant="outlined"
                    onClick={goToPrevQuestionFlat}
                    disabled={questions.findIndex(q => q.id === currentQuestion?.id) === 0}
                    sx={{
                      height: 44,
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'none',
                      borderColor: UI.border,
                      color: UI.subtext,
                      fontFamily: inter.style.fontFamily,
                      borderRadius: '10px',
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                        borderColor: UI.border
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                      }
                    }}
                    title="Previous question (←)"
                  >
                    ← Previous
                  </Button>

                  {/* Next (don't answer) Button - Outlined, neutral */}
                  <Button
                    variant="outlined"
                    onClick={goToNextQuestionFlat}
                    sx={{
                      height: 44,
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'none',
                      borderColor: UI.border,
                      color: UI.subtext,
                      fontFamily: inter.style.fontFamily,
                      borderRadius: '10px',
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                        borderColor: UI.border
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                      }
                    }}
                    title="Next question without answering (Tab)"
                  >
                    Next (don't answer)
                  </Button>

                  {/* Mark for Review & Next - Outlined, purple */}
                    <Button
                      variant="outlined"
                      onClick={() => {
                      toggleMarkForReview(currentQuestion?.id || 0);
                        goToNextQuestionFlat();
                      }}
                      sx={{
                        height: 44,
                      fontSize: '14px',
                      fontWeight: '600',
                        textTransform: 'none',
                        borderColor: UI.review,
                        color: UI.review,
                        fontFamily: inter.style.fontFamily,
                      borderRadius: '10px',
                      px: 3,
                        '&:hover': {
                        backgroundColor: UI.reviewTint,
                          borderColor: UI.review
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                        }
                      }}
                    title="Mark for review and go to next (R)"
                    >
                      Mark for Review & Next
                    </Button>

                  {/* Clear Response - Outlined, red */}
                    <Button
                      variant="outlined"
                      onClick={() => {
                      if (currentQuestion) {
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: [] }));
                      }
                      }}
                      sx={{
                        height: 44,
                      fontSize: '14px',
                      fontWeight: '600',
                        textTransform: 'none',
                      borderColor: UI.notAnswered,
                      color: UI.notAnswered,
                        fontFamily: inter.style.fontFamily,
                      borderRadius: '10px',
                      px: 3,
                        '&:hover': {
                          backgroundColor: UI.dangerTint,
                        borderColor: UI.notAnswered
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                      }
                    }}
                    title="Clear selected answers"
                    >
                      Clear Response
                    </Button>

                                    {/* Save & Next - Contained, indigo primary */}
                    <Button
                      variant="contained"
                      onClick={goToNextQuestionFlat}
                      sx={{
                        height: 44,
                      fontSize: '14px',
                      fontWeight: '600',
                        textTransform: 'none',
                        backgroundColor: UI.primary,
                        fontFamily: inter.style.fontFamily,
                      borderRadius: '10px',
                      px: 3,
                        '&:hover': {
                          backgroundColor: UI.primaryHover
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${UI.focus}`,
                        outlineOffset: '2px',
                        boxShadow: `0 0 0 2px ${UI.focus}`
                        }
                      }}
                    title="Save and go to next (Enter)"
                    >
                      Save & Next →
                    </Button>
                </Box>
              </Box>
            </Box>

            {/* Review Mode Navigation */}
            {reviewMode && (
              <>
                {reviewQuestions.length > 0 ? (
              <Box sx={{
                background: `linear-gradient(135deg, ${UI.reviewTint} 0%, ${UI.card} 100%)`,
                border: `2px solid ${UI.review}`,
                borderRadius: '12px',
                p: 3,
                mb: 3,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
              }}>
                <Typography sx={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: UI.review,
                  mb: 2,
                  fontFamily: inter.style.fontFamily,
                  textAlign: 'center'
                }}>
                  Review Mode - Question {currentReviewIndex + 1} of {reviewQuestions.length}
                </Typography>
                
                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigateReviewQuestion('prev')}
                    disabled={reviewQuestions.length <= 1}
                    sx={{
                      height: 40,
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'none',
                      borderColor: UI.review,
                      color: UI.review,
                      fontFamily: inter.style.fontFamily,
                      borderRadius: '8px',
                      px: 2,
                      '&:hover': {
                        backgroundColor: UI.reviewTint,
                        borderColor: UI.review
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    ← Previous Review
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigateReviewQuestion('next')}
                    disabled={reviewQuestions.length <= 1}
                    sx={{
                      height: 40,
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'none',
                      borderColor: UI.review,
                      color: UI.review,
                      fontFamily: inter.style.fontFamily,
                      borderRadius: '8px',
                      px: 2,
                      '&:hover': {
                        backgroundColor: UI.reviewTint,
                        borderColor: UI.review
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    Next Review →
                  </Button>
                </Box>

                <Typography sx={{
                  fontSize: '12px',
                  color: UI.subtext,
                  mt: 2,
                  textAlign: 'center',
                  fontFamily: inter.style.fontFamily
                }}>
                  Reviewing: {reviewQuestions[currentReviewIndex]?.question_text?.substring(0, 50)}...
                </Typography>
              </Box>
                ) : (
                  <Box sx={{
                    background: `linear-gradient(135deg, ${UI.reviewTint} 0%, ${UI.card} 100%)`,
                    border: `2px solid ${UI.review}`,
                    borderRadius: '12px',
                    p: 3,
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                    textAlign: 'center'
                  }}>
                    <Typography sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: UI.review,
                      mb: 1,
                      fontFamily: inter.style.fontFamily
                    }}>
                      No Questions Marked for Review
                    </Typography>
                    <Typography sx={{
                      fontSize: '14px',
                      color: UI.subtext,
                      fontFamily: inter.style.fontFamily
                    }}>
                      Mark questions for review to use this feature
                    </Typography>
                  </Box>
                )}
              </>
            )}
                  </Box>
                  
          {/* Right Column - Utility Rail (25% width) */}
          <Box sx={{ 
            flex: '0 0 25%',
            backgroundColor: 'transparent',
            pl: 2,
            position: 'sticky',
            top: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>


            

            {/* Question Palette */}
                    <Box sx={{ 
                      background: `linear-gradient(135deg, ${UI.card} 0%, ${UI.primaryTint} 100%)`,
                      border: `2px solid ${UI.border}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(17, 24, 39, 0.12)',
                      mb: 3,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
              {/* Palette Header */}
              <Box sx={{
                p: 3,
                borderBottom: `1px solid ${UI.border}`,
                backgroundColor: '#F8FAFF',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: UI.text,
                      fontFamily: inter.style.fontFamily
                    }}>
                    {reviewMode ? 'Review Mode' : 'Question Palette'}
                    </Typography>
                    {reviewMode && (
                      <Typography sx={{
                        fontSize: '12px',
                        color: UI.review,
                        fontFamily: inter.style.fontFamily,
                        fontWeight: '500'
                      }}>
                        Showing {reviewQuestions.length} marked questions
                      </Typography>
                    )}

                  {/* View Toggle */}
                    <Box sx={{ 
                    display: 'flex', 
                    gap: 0.5,
                    backgroundColor: '#F8FAFF',
                    borderRadius: '8px',
                    p: 0.5,
                      border: `1px solid ${UI.border}`
                    }}>
                    <Tooltip title="Grid View" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setPaletteView('grid')}
                        sx={{
                          color: paletteView === 'grid' ? UI.primary : UI.subtext,
                          backgroundColor: paletteView === 'grid' ? '#FFFFFF' : 'transparent',
                          borderRadius: '6px',
                          width: 28,
                          height: 28,
                          transition: 'all 0.2s ease',
                          boxShadow: paletteView === 'grid' ? '0 1px 3px rgba(46, 125, 109, 0.15)' : 'none',
                          '&:hover': {
                            backgroundColor: paletteView === 'grid' ? '#FFFFFF' : '#F1F5F9'
                          }
                        }}
                      >
                        <DashboardIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List View" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setPaletteView('list')}
                        sx={{
                          color: paletteView === 'list' ? UI.primary : UI.subtext,
                          backgroundColor: paletteView === 'list' ? '#FFFFFF' : 'transparent',
                          borderRadius: '6px',
                          width: 28,
                          height: 28,
                          transition: 'all 0.2s ease',
                          boxShadow: paletteView === 'list' ? '0 1px 3px rgba(46, 125, 109, 0.15)' : 'none',
                          '&:hover': {
                            backgroundColor: paletteView === 'list' ? '#FFFFFF' : '#F1F5F9'
                          }
                        }}
                      >
                        <ListIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    </Box>
                </Box>
                
                {/* Palette Filter */}
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  {['All', 'Unanswered', 'Marked', 'Flagged'].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '11px',
                        height: '24px',
                        fontFamily: inter.style.fontFamily,
                        borderColor: UI.border,
                        color: UI.subtext,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: UI.primaryTint,
                          borderColor: UI.primary,
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0px)',
                          backgroundColor: UI.primary,
                          color: '#FFFFFF',
                          borderColor: UI.primary
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${UI.focus}`,
                          outlineOffset: '2px'
                        }
                      }}
                    />
                  ))}
              </Box>

            </Box>

                            {/* Question Groups */}
              <Box ref={questionPaletteRef} sx={{ p: 3, flex: 1, minHeight: '300px', overflowY: 'auto', position: 'relative' }}>
                {/* Top Fade Gradient with Scroll Up Indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '40px',
                  background: 'linear-gradient(rgba(232, 234, 246, 0.95), transparent)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  pt: 1
                }}>
                  {/* Scroll Up Indicator - Only show when there's content above */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    opacity: 0.6,
                    animation: 'bounceUp 2s infinite',
                    '@keyframes bounceUp': {
                      '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                      '40%': { transform: 'translateY(2px)' },
                      '60%': { transform: 'translateY(1px)' }
                    }
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.25
                    }}>
                      <Box sx={{
                        width: '2px',
                        height: '2px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.4
                      }} />
                      <Box sx={{
                        width: '3px',
                        height: '3px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.6
                      }} />
                      <Box sx={{
                        width: '4px',
                        height: '4px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.8
                      }} />
                    </Box>
                    <Typography sx={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: UI.primary,
                      fontFamily: inter.style.fontFamily,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center'
                    }}>
                      Scroll ↑
                    </Typography>
                  </Box>
                </Box>
                
                {/* Bottom Fade Gradient with Scroll Indicator */}
                {showMoreQuestionsIndicator && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'linear-gradient(transparent, rgba(232, 234, 246, 0.95))',
                    pointerEvents: 'none',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    pb: 1,
                    opacity: showMoreQuestionsIndicator ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}>
                  {/* Scroll Down Indicator */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    opacity: 0.8,
                    animation: 'bounce 2s infinite',
                    '@keyframes bounce': {
                      '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                      '40%': { transform: 'translateY(-3px)' },
                      '60%': { transform: 'translateY(-1px)' }
                    }
                  }}>
                    <Typography sx={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: UI.primary,
                      fontFamily: inter.style.fontFamily,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center'
                    }}>
                      More Questions
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.25
                    }}>
                      <Box sx={{
                        width: '4px',
                        height: '4px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.8
                      }} />
                      <Box sx={{
                        width: '3px',
                        height: '3px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.6
                      }} />
                      <Box sx={{
                        width: '2px',
                        height: '2px',
                        backgroundColor: UI.primary,
                        borderRadius: '50%',
                        opacity: 0.4
                      }} />
                    </Box>
                  </Box>
                </Box>
                )}
                {sections.map((section) => {
                  let sectionQuestions = questionsBySection[section.id] || [];
                  
                  // Filter to show only marked questions in review mode
                  if (reviewMode) {
                    sectionQuestions = sectionQuestions.filter(q => markedForReview[q.id]);
                  }
                  
                  if (sectionQuestions.length === 0) return null;

                  return (
                    <Box key={section.id} data-section-id={section.id} sx={{ mb: 4 }}>
                      <Typography sx={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: UI.text,
                        mb: 3,
                        fontFamily: inter.style.fontFamily
                      }}>
                        {section.name}
                      </Typography>
                      
                      {paletteView === 'grid' ? (
                        /* Grid View - 5 questions per row with better spacing */
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(5, 40px)', 
                          gap: 1.5, 
                          mb: 3,
                          width: '100%',
                          justifyContent: 'center'
                        }}>
                          {sectionQuestions.map((q, idx) => {
                            const isCurrent = currentQuestionId === q.id;
                            const questionAnswers = answers[q.id];
            const isAnswered = questionAnswers && 
                             Array.isArray(questionAnswers) && 
                             questionAnswers.length > 0 &&
                             questionAnswers.some(answer => answer !== null && answer !== undefined);
                            const isMarked = !!markedForReview[q.id];
                            const isVisited = !!visitedQuestions[q.id];
                            const isFlagged = !!flagged[q.id];
                            const isBookmarked = !!bookmarked[q.id];
                            
                            // Status determination - Following new design system
                            let bgColor = '#F1F5F9';    // Not Visited - Light gray fill
                            let textColor = UI.subtext;
                            let borderColor = UI.border;
                            let borderWidth = '1px solid';
                            let ringStyle = {};
                            
                            if (isCurrent) {
                              bgColor = UI.primary;
                              textColor = '#FFFFFF';
                              borderColor = UI.primary;
                              borderWidth = '2px solid';
                            } else if (isAnswered && isMarked) {
                              bgColor = UI.review;
                              textColor = '#FFFFFF';
                              borderColor = UI.review;
                              borderWidth = '2px solid';
                            } else if (isMarked) {
                              bgColor = UI.review;
                              textColor = '#FFFFFF';
                              borderColor = UI.review;
                              borderWidth = '2px solid';
                            } else if (isAnswered) {
                              bgColor = UI.answered;
                              textColor = '#FFFFFF';
                              borderColor = UI.answered;
                              borderWidth = '2px solid';
                            } else if (isVisited) {
                              bgColor = UI.notAnswered;
                              textColor = '#FFFFFF';
                              borderColor = UI.notAnswered;
                              borderWidth: '2px solid';
                            }
                            
                            return (
                              <Box key={q.id} sx={{ position: 'relative' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => goToQuestion(q.id)}
                                  disabled={submitted}
                                  aria-label={`Question ${idx + 1}, ${isCurrent ? 'Current' : isAnswered && isMarked ? 'Answered and Marked for Review' : isMarked ? 'Marked for Review' : isAnswered ? 'Answered' : isVisited ? 'Not Answered' : 'Not Visited'}${isFlagged ? ', Flagged' : ''}${isBookmarked ? ', Bookmarked' : ''}`}
              sx={{
                                    width: 40,
                                    height: 40,
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: '8px',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    border: `${borderWidth} ${borderColor}`,
                                    boxShadow: 'none',
                                    fontVariantNumeric: 'tabular-nums',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'scale(1.01)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      backgroundColor: bgColor
                                    },
                                    '&:active': {
                                      transform: 'scale(0.99)'
                                    },
                                    '&:focus-visible': { 
                                      outline: `2px solid ${UI.focus}`, 
                                      outlineOffset: '2px',
                                      boxShadow: `0 0 0 2px ${UI.focus}`
                                    }
                                  }}
                                >
                                  {idx + 1}
                                </Button>
                                
                                {/* Status indicators */}
                                {(isFlagged || isBookmarked) && (
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 10,
                                    height: 10,
                                    backgroundColor: isFlagged ? UI.flagged : UI.bookmarked,
                                    borderRadius: '50%',
                                    border: '1px solid #fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    animation: 'fadeInScale 0.2s ease-out',
                                    '@keyframes fadeInScale': {
                                      '0%': { opacity: 0, transform: 'scale(0.95)' },
                                      '100%': { opacity: 1, transform: 'scale(1)' }
                                    }
                                  }} />
                                )}
                                
                                {/* Green dot for "Answered & Marked for Review" */}
                                {isAnswered && isMarked && (
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 10,
                                    height: 10,
                                    backgroundColor: UI.answered,
                                    borderRadius: '50%',
                                    border: '1px solid #fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    animation: 'fadeInScale 0.2s ease-out',
                                    '@keyframes fadeInScale': {
                                      '0%': { opacity: 0, transform: 'scale(0.95)' },
                                      '100%': { opacity: 1, transform: 'scale(1)' }
                                    }
                                  }} />
                                )}
            </Box>
                            );
                          })}
          </Box>
                      ) : (
                        /* List View - Enhanced rows with better visual hierarchy */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {sectionQuestions.map((q, idx) => {
                            const isCurrent = currentQuestionId === q.id;
                            const questionAnswers = answers[q.id];
            const isAnswered = questionAnswers && 
                             Array.isArray(questionAnswers) && 
                             questionAnswers.length > 0 &&
                             questionAnswers.some(answer => answer !== null && answer !== undefined);
                            const isMarked = !!markedForReview[q.id];
                            const isVisited = !!visitedQuestions[q.id];
                            const isFlagged = !!flagged[q.id];
                            const isBookmarked = !!bookmarked[q.id];
                            
                            // Status color
                            let statusColor = '#FFFFFF';
                            if (isAnswered && isMarked) statusColor = UI.review;
                            else if (isMarked) statusColor = UI.review;
                            else if (isAnswered) statusColor = UI.answered;
                            else if (isVisited) statusColor = UI.notAnswered;
                            
                            return (
                              <Box
                                key={q.id}
                                onClick={() => goToQuestion(q.id)}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 2.5,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  backgroundColor: isCurrent ? '#F8FAFF' : 'transparent',
                                  border: isCurrent ? `2px solid ${UI.primary}` : `1px solid ${UI.border}`,
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: isCurrent ? '#F8FAFF' : '#F8FAFF',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                  },
                                  '&:focus-visible': {
                                    outline: `2px solid ${UI.focus}`,
                                    outlineOffset: '2px'
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ 
                                    fontSize: '14px', 
                                    fontWeight: isCurrent ? '600' : '500',
            color: UI.text,
            fontFamily: inter.style.fontFamily
          }}>
                                    Question {idx + 1}
          </Typography>
                                  {isFlagged && (
                                    <Box sx={{
                                      width: 8,
                                      height: 8,
                                      backgroundColor: UI.flagged,
                                      borderRadius: '50%',
                                      flexShrink: 0
                                    }} />
                                  )}
                                  {isBookmarked && (
                                    <Box sx={{
                                      width: 8,
                                      height: 8,
                                      backgroundColor: UI.bookmarked,
                                      borderRadius: '50%',
                                      flexShrink: 0
                                    }} />
                                  )}
        </Box>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5
                                }}>
                                  <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: statusColor,
                                    border: statusColor === UI.card ? `1px solid ${UI.border}` : 'none',
                                    flexShrink: 0
                                  }} />
                                  <Typography sx={{ 
                                    fontSize: '11px', 
                                    color: UI.subtext,
                                    fontFamily: inter.style.fontFamily,
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    {isCurrent ? 'Current' : isAnswered && isMarked ? 'Answered & Review' : isMarked ? 'Review' : isAnswered ? 'Answered' : isVisited ? 'Unanswered' : 'Not Visited'}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}
                
                                {/* Fade Gradient - Suggests overflow */}
                  <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40px',
                  background: 'linear-gradient(transparent, rgba(232, 234, 246, 0.9))',
                  pointerEvents: 'none'
                }} />
              </Box>
            </Box>

            {/* Submit Area - Pinned to Rail Bottom */}
            <Box sx={{
              background: `linear-gradient(135deg, ${UI.card} 0%, ${UI.primaryTint} 100%)`,
              border: `1px solid ${UI.border}`,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              p: 3
            }}>
              <Stack spacing={1.5}>
                {/* New Review Button */}
                <ReviewButton
                  snapshot={createReviewSnapshot()}
                  onOpen={() => setReviewDrawerOpen(true)}
                />
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  startIcon={<CheckCircleIcon />}
                  data-testid="submit-exam-button"
        sx={{
                    backgroundColor: UI.answered,
                    color: '#FFFFFF',
          '&:hover': {
                      backgroundColor: '#15803D'
                    },
                    fontSize: '14px',
                    fontWeight: '600',
                    height: 44,
                    fontFamily: inter.style.fontFamily,
                    borderRadius: '10px',
                    textTransform: 'none',
                    '&:focus-visible': {
                      outline: `2px solid ${UI.focus}`,
                      outlineOffset: '2px'
                    }
                  }}
                                  >
                  SUBMIT EXAM
                </Button>
              </Stack>
            </Box>

            {/* Question Status Legend - Under Submit Button */}
                  <Box sx={{
              background: `linear-gradient(135deg, ${UI.card} 0%, ${UI.primaryTint} 100%)`,
              border: `1px solid ${UI.border}`,
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
              mt: 2,
              p: 3
            }}>
              <Typography sx={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: UI.text, 
                mb: 3,
                fontFamily: inter.style.fontFamily
              }}>
                Question Status
          </Typography>
          
                            {/* Status Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: UI.primary,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Current
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: UI.answered,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Answered
          </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: UI.notAnswered,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Not Answered
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: UI.review,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Marked for Review
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${UI.border}`,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Not Visited
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: UI.review,
                    borderRadius: '2px',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 6,
                      height: 6,
                      backgroundColor: UI.answered,
                      borderRadius: '50%',
                      border: '1px solid #fff'
                    }} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: '12px', 
                    color: UI.text,
                    fontFamily: inter.style.fontFamily
                  }}>
                    Answered & Marked
          </Typography>
                </Box>
              </Box>
              
              {/* Overlay Dots Legend */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${UI.border}` }}>
                <Typography sx={{ 
                  fontSize: '11px', 
                  color: UI.subtext,
                  fontFamily: inter.style.fontFamily,
                  mb: 1
                }}>
                  Overlay Indicators:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: UI.bookmarked,
                      borderRadius: '50%',
                      flexShrink: 0
                    }} />
                    <Typography sx={{ 
                      fontSize: '10px', 
                      color: UI.subtext,
                      fontFamily: inter.style.fontFamily
                    }}>
                      Bookmarked
                    </Typography>
        </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', 'gap': 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: UI.flagged,
                      borderRadius: '50%',
                      flexShrink: 0
                    }} />
                    <Typography sx={{ 
                      fontSize: '10px', 
                      color: UI.subtext,
                      fontFamily: inter.style.fontFamily
                    }}>
                      Flagged
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

      {/* Enhanced Confirmation Dialog with inline lists */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: inter.style.fontFamily }}>Submit Exam?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: inter.style.fontFamily }}>
            Are you sure you want to submit your exam? You won't be able to make changes after submission.
          </DialogContentText>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: inter.style.fontFamily, mb: 2 }}>Summary:</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip label={`Answered: ${answeredCount}`} color="success" variant="outlined" />
              <Chip label={`Unanswered: ${questions.length - answeredCount}`} color="warning" variant="outlined" />
              <Chip label={`Flagged: ${Object.values(flagged).filter(Boolean).length}`} color="error" variant="outlined" />
              <Chip label={`Marked for Review: ${Object.values(markedForReview).filter(Boolean).length}`} color="info" variant="outlined" />
              <Chip label={`Bookmarked: ${Object.values(bookmarked).filter(Boolean).length}`} color="warning" variant="outlined" />
            </Box>
            
            {/* Inline flagged questions list */}
          {Object.values(flagged).filter(Boolean).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="error.main" sx={{ mb: 1, fontWeight: 600 }}>
                  Flagged Questions:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {questions.filter(q => flagged[q.id]).map((q, i) => (
                    <Chip 
                      key={q.id}
                      label={`Q${questions.findIndex(qq => qq.id === q.id) + 1}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Inline marked for review questions list */}
          {Object.values(markedForReview).filter(Boolean).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="info.main" sx={{ mb: 1, fontWeight: 600 }}>
                  Marked for Review:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {questions.filter(q => markedForReview[q.id]).map((q, i) => (
                    <Chip 
                      key={q.id}
                      label={`Q${questions.findIndex(qq => qq.id === q.id) + 1}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Inline bookmarked questions list */}
          {Object.values(bookmarked).filter(Boolean).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="warning.main" sx={{ mb: 1, fontWeight: 600 }}>
                  Bookmarked Questions:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {questions.filter(q => bookmarked[q.id]).map((q, i) => (
                    <Chip 
                      key={q.id}
                      label={`Q${questions.findIndex(qq => qq.id === q.id) + 1}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {redirectMessage && (
              <Alert severity="success" sx={{ mt: 3 }}>{redirectMessage}</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmSubmit} 
            variant="contained" 
            color="primary"
            autoFocus
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Up Dialog */}
      <Dialog open={timeUpDialogOpen} onClose={() => {}}>
        <DialogTitle sx={{ fontFamily: inter.style.fontFamily }}>Time's Up!</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: inter.style.fontFamily }}>
            Your time for this exam has ended. Your answers are being submitted automatically.
          </DialogContentText>
          {autoSubmitting && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {redirectMessage && (
            <Alert severity="info" sx={{ mt: 3 }}>{redirectMessage}</Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Modal */}
      <Dialog open={submittingModalOpen} PaperProps={{ sx: { textAlign: 'center', p: 4 } }}>
        <DialogContent>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mt: 2, fontFamily: inter.style.fontFamily }}>
            Submitting your quiz, please wait...
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Error Popup */}
      {errorPopup && (
        <ErrorPopup 
          message={errorPopup} 
          onClose={() => setErrorPopup(null)} 
        />
      )}

      {/* Last Minute Warning - Top center, auto-hide after 5s */}
      <Snackbar
        open={showLastMinuteWarning}
        onClose={() => setShowLastMinuteWarning(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
      >
        <Alert severity="warning" sx={{ 
          width: '100%', 
          fontWeight: 600, 
          fontSize: '14px',
          fontFamily: inter.style.fontFamily
        }}>
          Only 1 minute left! Please review and submit your answers.
        </Alert>
      </Snackbar>

      {/* Restored Notification */}
      <Snackbar
        open={restoredNotification}
        autoHideDuration={3000}
        onClose={() => setRestoredNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Your answers have been restored.
        </Alert>
      </Snackbar>

      {/* Toast Notifications */}
      {toastMessage && (
        <Snackbar
          open={!!toastMessage}
          autoHideDuration={3000}
          onClose={() => setToastMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 2000 }}
        >
          <Alert 
            severity={toastMessage.includes('Only') ? 'warning' : toastMessage.includes('Breathe') ? 'info' : 'success'} 
            sx={{ 
              width: '100%',
              fontFamily: inter.style.fontFamily,
              fontWeight: 600,
                fontSize: '14px'
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      )}

      {/* Enhanced Screen Reader Announcements */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        {currentQuestionId && markedForReview[currentQuestionId] && 'Question marked for review'}
        {currentQuestionId && flagged[currentQuestionId] && 'Question flagged'}
        {currentQuestionId && bookmarked[currentQuestionId] && 'Question bookmarked'}
        {currentQuestionId && answers[currentQuestionId]?.length > 0 && 'Answer saved'}
        {timeLeft && timeLeft <= 60 && 'Time remaining 1 minute'}
      </Box>

      {/* Thank You Card after submission */}
      {showSubmitThankYou && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" position="fixed" top={0} left={0} width="100vw" height="100vh" zIndex={3000} bgcolor="rgba(255,255,255,0.85)">
          <Paper
            elevation={6}
            sx={{
              p: 5,
              borderRadius: 4,
              maxWidth: 420,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#43a047', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: inter.style.fontFamily }}>
              Thank You!
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: inter.style.fontFamily }}>
              Your quiz has been submitted successfully.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 3, fontFamily: inter.style.fontFamily }}>
              You can view your results in the dashboard once they are available.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => router.push('/dashboard/student')}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Box>
      )}

      {/* Review Drawer */}
      <ReviewDrawer
        open={reviewDrawerOpen}
        onClose={() => setReviewDrawerOpen(false)}
        snapshot={createReviewSnapshot()}
        onJumpTo={handleReviewJumpTo}
        onClearAllFlags={handleClearAllFlags}
        onSubmit={handleSubmit}
      />
      </Box>
    </>
  )
}

// Add CSS optimizations for better performance
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* Performance optimizations for option clicks */
    .option-row {
      contain: layout style paint;
      transform: translateZ(0);
    }
    
    .option-row * {
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Smooth scrolling optimization */
    html {
      scroll-behavior: smooth;
    }
    
    /* Hardware acceleration for better performance */
    .option-row:hover {
      transform: translateY(-1px) translateZ(0);
    }
    
    .option-row:active {
      transform: translateY(0px) translateZ(0);
    }
    
    /* Optimize animations */
    @keyframes spin {
      0% { transform: rotate(0deg) translateZ(0); }
      100% { transform: rotate(360deg) translateZ(0); }
    }
    
    /* Ensure entire option area is clickable and responsive */
    .option-row {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    /* INSTANT click response - no delays */
    .option-row:active {
      transform: scale(0.98) translateZ(0); // Reduced from 0.96 to 0.98 for less shaking
      transition: none;
    }
    
    /* Prevent text selection during clicks */
    .option-row * {
      pointer-events: none;
    }
    
    .option-row {
      pointer-events: auto;
    }
  `;
  document.head.appendChild(styleSheet);
}
