'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Radio,
  RadioGroup,
  Alert,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Fab,
  Collapse,
  Snackbar
} from '@mui/material'
import { Roboto_Slab, Inter, Poppins } from 'next/font/google'

// Font configurations
// UI Color tokens - Professional Exam Portal Theme
const UI = {
  bg: '#F8F9FA',          // light gray background
  card: '#FFFFFF',        // pure white cards
  border: '#DEE2E6',      // subtle gray border
  text: '#212529',        // dark gray text
  subtext: '#6C757D',     // medium gray text
  muted: '#868E96',       // light gray text
  shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',

  // brand - professional blue
  primary: '#0D6EFD',     // Bootstrap blue
  primaryHover: '#0B5ED7',
  focus: '#0D6EFD',

  // timer - professional colors
  danger: '#DC3545',      // Bootstrap red
  timerTrack: '#E9ECEF',
  timerFill: '#0D6EFD',

  // option states - subtle and professional
  optBg: '#F8F9FA',
  optHover: '#E9ECEF',
  optSelectedBg: '#E7F3FF',
  optSelectedBorder: '#0D6EFD',

  // palette status colors - professional palette
  answered: '#198754',    // Bootstrap green
  unanswered: '#6C757D',  // Bootstrap gray
  flagged: '#DC3545',     // Bootstrap red
  review: '#FFC107',      // Bootstrap warning
  current: '#0D6EFD',     // Bootstrap primary
  
  // legacy compatibility
  navy: '#212529',
  deepBlue: '#0D6EFD',
  bookmarked: '#FD7E14',
};

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap'
})

import { CssBaseline } from '@mui/material'
import { motion } from 'framer-motion'
import { supabase } from '@/utils/supabaseClient'
import { useUser } from '@clerk/nextjs'
import ErrorPopup from '@/components/ErrorPopup'
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
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material'
import debounce from 'lodash.debounce'
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
const THEMES = {
  default: {
    primary: '#002366',
    secondary: '#e3e6ef',
    text: '#212121',
    background: '#f7f9fa'
  },
  dark: {
    primary: '#002366',
    secondary: '#222',
    text: '#fff',
    background: '#181c24'
  },
  sepia: {
    primary: '#002366',
    secondary: '#e3e6ef',
    text: '#212121',
    background: '#f7f9fa'
  }
}

// Add navigation and difficulty color constants
const NAV_COLORS = {
  answered: UI.answered,
  unattempted: UI.unanswered,
  current: UI.current,
  flagged: UI.flagged,
  bookmarked: '#FB923C',        // orange outline
  markedForReview: UI.review,
  borderAttempted: '#15803D',
  borderUnattempted: '#94A3B8',
  borderCurrent: UI.current,
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
  // Determine color scheme based on new UI system
  let bg = UI.unanswered, color = UI.text, border = `1px solid ${UI.border}`;
  if (isCurrent) { bg = UI.current; color = '#fff'; border = `2px solid ${UI.current}`; }
  else if (isMarkedForReview) { bg = UI.review; color = '#fff'; border = `1px solid ${UI.review}`; }
  else if (isFlagged) { bg = UI.flagged; color = '#fff'; border = `1px solid ${UI.flagged}`; }
  else if (isAnswered) { bg = UI.answered; color = '#fff'; border = `1px solid ${UI.answered}`; }
  else if (isVisited && !isAnswered) { bg = UI.flagged; color = '#fff'; border = `1px solid ${UI.flagged}`; }

  return (
    <Box position="relative" sx={{ display: 'inline-block' }}>
      <Button
        size="small"
        variant="contained"
        sx={{
          width: 40, height: 40, minWidth: 40, minHeight: 40,
          borderRadius: 2,
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1,
          bgcolor: bg,
          color,
          border,
          boxShadow: 'none',
          '&:hover': { filter: 'brightness(.98)' },
          '&:focus-visible': { outline: `3px solid ${UI.focus}`, outlineOffset: 2 }
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
          top: -3,
          right: -3,
          width: 10,
          height: 10,
          backgroundColor: UI.flagged,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      )}
      
      {isBookmarked && (
        <Box sx={{
          position: 'absolute',
          top: -3,
          right: -3,
          width: 10,
          height: 10,
          backgroundColor: UI.bookmarked,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      )}
      
      {isMarkedForReview && (
        <Box sx={{
          position: 'absolute',
          top: -3,
          right: -3,
          width: 10,
          height: 10,
          backgroundColor: UI.review,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      )}
    </Box>
  )
}

export default function AttemptQuizPage() {
  const params = useParams() as { quizId?: string } | null
  const quizId = params?.quizId
  const router = useRouter()
  const { user } = useUser()

  // State management
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [flagged, setFlagged] = useState<Record<number, boolean>>({})
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({})
  const [currentSection, setCurrentSection] = useState<number | null>(null)
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [errorPopup, setErrorPopup] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [timeUpDialogOpen, setTimeUpDialogOpen] = useState(false)
  const [autoSubmitting, setAutoSubmitting] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [fullscreen, setFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [theme, setTheme] = useState<'default' | 'dark' | 'sepia'>('default')
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [showNavigationPanel, setShowNavigationPanel] = useState(true)
  const [showSectionInstructions, setShowSectionInstructions] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)
  const [violationCount, setViolationCount] = useState(0)
  const [submittingModalOpen, setSubmittingModalOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false)
  const [pauseStart, setPauseStart] = useState<number | null>(null)
  const [pausedDuration, setPausedDuration] = useState<number>(0)
  const [showLastMinuteWarning, setShowLastMinuteWarning] = useState(false)
  const [restoredNotification, setRestoredNotification] = useState(false)
  const [showSubmitThankYou, setShowSubmitThankYou] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Refs
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize expanded sections
  useEffect(() => {
    if (sections.length > 0) {
      const initialExpanded: Record<number, boolean> = {}
      sections.forEach(section => {
        initialExpanded[section.id] = true
      })
      setExpandedSections(initialExpanded)
    }
  }, [sections])

  // Toggle section expansion
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

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

        // Initialize time (persistent timer)
        // Ensure duration is positive and valid
        const rawDuration = quizData.duration;
        const validDuration = (rawDuration && rawDuration > 0) ? rawDuration : 30;
        const durationInSeconds = validDuration * 60;
        setTotalTime(durationInSeconds);
        // Always set start time and duration in ms
        const startTimeMs = Date.now();
        localStorage.setItem(`quiz-${quizId}-startTime`, startTimeMs.toString());
        const durationMs = durationInSeconds * 1000;
        localStorage.setItem(`quiz-${quizId}-duration`, durationMs.toString());
        
        // Ensure timer starts immediately
        setTimeLeft(durationInSeconds);
        
        console.log('Timer initialization:', {
          quizDataDuration: quizData.duration,
          durationInSeconds,
          durationMs,
          startTimeMs,
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
    return questions.find(q => q.id === currentQuestionId) || questions[0]
  }, [currentQuestionId, questions])

  // Calculate answered count
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length
  }, [answers])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer progress
  const timerProgress = useMemo(() => {
    if (timeLeft === null || totalTime === 0) return 0
    return ((totalTime - timeLeft) / totalTime) * 100
  }, [timeLeft, totalTime])

  // Current theme
  const currentTheme = THEMES[theme]
  const fontSizeStyles = {
    normal: { fontSize: '1rem' },
    large: { fontSize: '1.2rem' },
    xlarge: { fontSize: '1.4rem' }
  }

  // Navigation handlers
  const goToQuestion = (questionId: number) => {
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
  }

  const goToNextQuestionFlat = () => {
    const idx = questions.findIndex(q => q.id === currentQuestionId);
    if (idx < questions.length - 1) {
      const nextQ = questions[idx + 1];
      setCurrentQuestionId(nextQ.id);
      setCurrentSection(nextQ.section_id);
      // Mark next question as visited
      setVisitedQuestions(prev => ({ ...prev, [nextQ.id]: true }));
    }
  };

  const goToPrevQuestionFlat = () => {
    const idx = questions.findIndex(q => q.id === currentQuestionId);
    if (idx > 0) {
      const prevQ = questions[idx - 1];
      setCurrentQuestionId(prevQ.id);
      setCurrentSection(prevQ.section_id);
      // Mark previous question as visited
      setVisitedQuestions(prev => ({ ...prev, [prevQ.id]: true }));
    }
  };

  // Add handler for Next Section
  const goToNextSection = () => {
    const sectionIds = sections.map(s => s.id);
    const currentSectionIndex = sectionIds.indexOf(currentSection ?? -1);
    if (currentSectionIndex < sectionIds.length - 1) {
      const nextSectionId = sectionIds[currentSectionIndex + 1];
      const nextSectionQuestions = questionsBySection[nextSectionId] || [];
      if (nextSectionQuestions.length > 0) {
        setCurrentSection(nextSectionId);
        setCurrentQuestionId(nextSectionQuestions[0].id);
      }
    }
  };

  // Answer handlers
  const handleOptionSelect = (questionId: number, optionIdx: number, questionType: string) => {
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
      // Persist this change immediately
      if (user?.id && quizId) {
        fetch('/api/quiz-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quizId,
            user_id: user.id,
            question_id: questionId,
            answers: { [questionId]: newAnswers[questionId] },
          })
        });
      }
      return newAnswers;
    });
  }

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

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  // Submit handlers
  const handleSubmit = async () => {
    setConfirmDialogOpen(true)
  }

  // Security: Tab/Window Switch & Fullscreen Exit Detection
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
    const handleFullscreenChange = (e: Event) => {
      if (!document.fullscreenElement) {
        setViolationCount((prev) => {
          const next = prev + 1;
          setErrorPopup('You exited fullscreen. Please return to fullscreen.');
          if (next >= 3 && !submitted) {
            handleSubmit();
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    setConfirmDialogOpen(false)
    setSubmittingModalOpen(true)
    setSubmitted(true)
    // Add a timeout fallback
    const submissionTimeout = setTimeout(() => {
      setSubmittingModalOpen(false);
      setErrorPopup('Submission is taking too long. Please check your connection and try again.');
      setSubmitted(false);
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
        start_time // optional
      }
      console.log('DEBUG: submissionData:', submissionData);
      // Debug log for user ID and payload
      console.log('DEBUG: submitting as user_id:', user?.id);
      console.log('DEBUG: submissionData:', submissionData);
      // Save to database with a 10s timeout
      console.log('DEBUG: Inserting attempt into Supabase...');
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
      console.log('DEBUG: Insert finished', insertResult, insertError);
      if (insertError || (insertResult?.error)) {
        const error = insertError || insertResult?.error;
        // Enhanced error handling for RLS and other errors
        console.error('Submission error:', error, JSON.stringify(error, null, 2));
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
      // After successful submission, delete progress
      console.log('DEBUG: Deleting quiz progress...');
      const deleteRes = await fetch('/api/quiz-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId, user_id: user?.id })
      });
      console.log('DEBUG: quiz-progress delete response:', deleteRes);
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
    setTimeUpDialogOpen(true);
    setAutoSubmitting(true);
    await confirmSubmit();
    setAutoSubmitting(false);
    // setTimeUpDialogOpen(false); // Keep dialog open until redirect for clarity
  }, [confirmSubmit]);

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
        // Clear invalid timer data and reinitialize
        if (duration <= 0) {
          console.log('Clearing invalid duration and reinitializing timer');
          localStorage.removeItem(`quiz-${quizId}-startTime`);
          localStorage.removeItem(`quiz-${quizId}-duration`);
          // Set a default 30-minute timer
          const defaultDurationMs = 30 * 60 * 1000;
          localStorage.setItem(`quiz-${quizId}-startTime`, Date.now().toString());
          localStorage.setItem(`quiz-${quizId}-duration`, defaultDurationMs.toString());
          setTimeLeft(30 * 60); // 30 minutes in seconds
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

  // Set current question to first answered or first question after questions and answers are loaded
  useEffect(() => {
    if (questions.length === 0) return;
    // If currentQuestionId is not set or not in questions, set it
    const validIds = questions.map(q => q.id);
    if (!validIds.includes(currentQuestionId)) {
      // Prefer first answered question
      const answeredQ = Object.keys(answers).map(Number);
      if (answeredQ.length > 0 && validIds.includes(answeredQ[0])) {
        setCurrentQuestionId(answeredQ[0]);
        setCurrentSection(questions.find(q => q.id === answeredQ[0])?.section_id ?? questions[0].section_id);
      } else {
        setCurrentQuestionId(questions[0].id);
        setCurrentSection(questions[0].section_id);
      }
    }
  }, [questions, answers]);

  // Toast notifications for exam progress (reduced frequency)
  useEffect(() => {
    if (!timeLeft || !totalTime) return;
    
    const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;
    const answeredCount = Object.keys(answers).length;
    
    // Only show time warning once at 80% completion
    if (progressPercentage >= 80 && progressPercentage < 81 && !showLastMinuteWarning) {
      const minutesLeft = Math.ceil(timeLeft / 60);
      setToastMessage(`Only ${minutesLeft} minutes left!`);
      setShowLastMinuteWarning(true); // Prevent showing again
    }
    
    // Only show progress message once every 10 questions (instead of 5)
    if (answeredCount > 0 && answeredCount % 10 === 0 && !toastMessage) {
      setToastMessage('Nice work! Keep going.');
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

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextQuestionFlat();
      if (e.key === 'ArrowLeft') goToPrevQuestionFlat();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentQuestionId, questions]);

  // Letter badge component for options
  const letterBadge = (char: string) => (
    <Box sx={{
      width: 36, height: 36, borderRadius: '50%',
      display: 'grid', placeItems: 'center',
      fontWeight: 700, color: UI.text,
      border: `1px solid ${UI.border}`, background: '#FFF', mr: 2
    }}>{char}</Box>
  );

  // Create a helper component for the palette body
  const PaletteBody = () => (
    <Box sx={{ p: 2, backgroundColor: '#F8F9FA' }}>


      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
          pb: 10/8,
          mb: 1,
          borderRadius: 2,
          p: 1.5,
          border: `1px solid ${UI.border}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: inter.style.fontFamily,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: .2,
            color: UI.navy,
            textAlign: 'center',
          }}
        >
          Question Palette
        </Typography>
      </Box>

      {/* Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 6 }}>
        {sections.map((section) => {
          const sectionQuestions = questionsBySection[section.id] || []
          const sectionAnswered = sectionQuestions.filter((q) => answers[q.id]).length
          const sectionMarks =
            typeof section.marks === 'number'
              ? section.marks
              : sectionQuestions.reduce((sum, q) => sum + (typeof q.marks === 'number' ? q.marks : 1), 0)

          return (
            <Box
              key={section.id}
              sx={{
                border: `1px solid ${UI.border}`,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 0,
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {/* Section header (smaller, neutral) */}
              <Box
                onClick={() => toggleSection(section.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1,
                  py: .75,
                  borderRadius: 0,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  border: `1px solid ${UI.border}`,
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: inter.style.fontFamily,
                    fontSize: 13,
                    fontWeight: 700,
                    color: UI.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {section.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: .75 }}>
                  <Chip
                    label={`${sectionAnswered}/${sectionQuestions.length}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      background: 'linear-gradient(135deg, #0B5FFF 0%, #0A53E4 100%)',
                      color: '#ffffff',
                      borderRadius: 0,
                      fontWeight: 700,
                      boxShadow: '0 2px 4px rgba(11, 95, 255, 0.3)',
                    }}
                  />
                                    <Typography variant="caption" sx={{ color: UI.muted, fontSize: 11, fontFamily: inter.style.fontFamily }}>
                            {sectionMarks} Marks
                          </Typography>
                  {expandedSections[section.id] ? (
                    <ExpandMoreIcon sx={{ fontSize: 18, color: UI.muted }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 18, color: UI.muted }} />
                  )}
                </Box>
              </Box>

              {/* EXACT 5-column grid */}
              <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    mt: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 1.5,
                    alignItems: 'start',
                  }}
                >
                                      {sectionQuestions.map((q, idx) => (
                      <QuestionButton
                        key={q.id}
                        q={q}
                        idx={idx}
                        isCurrent={currentQuestionId === q.id}
                        isAnswered={!!answers[q.id]}
                        isFlagged={!!flagged[q.id]}
                        isBookmarked={!!bookmarked[q.id]}
                        isMarkedForReview={!!markedForReview[q.id]}
                        isVisited={!!visitedQuestions[q.id]}
                        onClick={() => goToQuestion(q.id)}
                        disabled={submitted}
                      />
                    ))}
                </Box>
              </Collapse>
            </Box>
          )
        })}
      </Box>

      {/* Sticky footer: actions + legend (tiny) */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(180deg, rgba(241,245,249,0), #f1f5f9 30%)`,
          pt: 1.5,
          borderTop: `1px solid ${UI.border}`,
          borderRadius: '0',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ borderColor: UI.primary, color: UI.primary, fontSize: 12, fontWeight: 700 }}
            onClick={() => {}}
          >
            REVIEW
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            startIcon={<CheckCircleIcon />}
            sx={{ background: UI.primary, '&:hover': { background: UI.primaryHover }, fontSize: 12, fontWeight: 800 }}
          >
            SUBMIT
        </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, mt: 1 }}>
                    {[
            { c: UI.answered, t: 'Answered' },
            { c: UI.flagged, t: 'Unanswered' },
            { c: UI.review, t: 'Review' },
            { c: UI.unanswered, t: 'Not Visited' },
          ].map(({ c, t }) => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: .75 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 3, background: c, border: `1px solid ${UI.border}` }} />
              <Typography variant="caption" sx={{ color: UI.muted, fontSize: 10, fontFamily: inter.style.fontFamily }}>{t}</Typography>
                </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

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
      <Box sx={{ fontFamily: `${inter.style.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial` }}>
        <Box sx={{
          backgroundColor: '#F8F9FA',
          color: UI.text,
          minHeight: '100vh',
          transition: 'background-color 0.3s, color 0.3s',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          position: 'relative',
          zIndex: 0,
        }}>
          {/* Offline Overlay */}
          {isOffline && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOffIcon sx={{ fontSize: 80, color: '#fff', mb: 2 }} />
          <Typography variant="h4" color="#fff" fontWeight={700} mb={2}>
            You are offline
          </Typography>
          <Typography variant="h6" color="#fff" mb={2}>
            The timer is paused. Please check your internet connection.<br />You cannot answer questions until you are back online.
          </Typography>
        </Box>
      )}
      
                    {/* Top bar */}
        <Box sx={{
          backgroundColor: '#495057',
          color: '#ffffff',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: UI.shadow,
          gap: 1,
        }}>
          {/* Quiz Title */}
          <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: inter.style.fontFamily }}>{quiz?.quiz_title || 'Exam'}</Typography>

          {/* Timer - Centered and Compact */}
          <Box sx={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            px: 3, 
            py: 1.5, 
            borderRadius: 3,
            border: '2px solid rgba(255,255,255,.35)',
            backgroundColor: 'rgba(255,255,255,.12)',
            minWidth: 280, 
            justifyContent: 'center',
          }}>
                        <Typography sx={{ 
              fontSize: 14, 
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: inter.style.fontFamily
            }}>
              Time Left
            </Typography>
            <Typography sx={{ 
              fontSize: 20, 
              fontWeight: 700,
              color: UI.danger,
              fontFamily: inter.style.fontFamily
            }}>
              {formatTime(timeLeft || 0)}
                  </Typography>
            <Box sx={{ 
              width: 1, 
              height: 20, 
              backgroundColor: 'rgba(255,255,255,0.4)',
              borderRadius: 1
            }} />
                        <Typography sx={{ 
              fontSize: 16, 
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: inter.style.fontFamily
            }}>
              {formatTime(totalTime || 0)}
                  </Typography>
          </Box>
        </Box>

      {/* Progress: fills left→right */}
      <Box sx={{ height: 4, bgcolor: UI.timerTrack }}>
        <Box sx={{
          height: 4, width: `${timerProgress}%`,
          background: UI.timerFill,
          transition: 'width .4s ease',
          borderTopRightRadius: 4, borderBottomRightRadius: 4
        }} />
      </Box>

              {/* Main Content - Two Column Layout */}
                      <Box 
                        sx={{
            height: 'calc(100vh - 80px)',
                          display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 400px' },
            gap: { xs: 0, md: 2 },
            overflow: 'hidden',
            backgroundColor: '#F8F9FA'
          }}
        >
        {/* Question Area - Left Column */}
        <Box
                sx={{
            gridColumn: '1 / 2',
          overflowY: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#F8F9FA',
          ...fontSizeStyles[fontSize]
          }}
        >
          {/* Current Section Header */}
          {sections.filter((s) => s.id === currentSection).map((section) => (
            <Box key={section.id} sx={{ 
              mb: 3,
              backgroundColor: '#E9ECEF',
              color: UI.text,
              borderRadius: 8,
              boxShadow: 'none',
              border: `1px solid ${UI.border}`,
              p: 2,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontFamily: inter.style.fontFamily, fontSize: 18, fontWeight: 800, color: UI.text }}>
                  {section.name}
                </Typography>
                <Chip 
                  label={`${questionsBySection[section.id]?.length || 0} questions`}
                  size="small"
                  sx={{ 
                    backgroundColor: UI.primary, 
                    color: 'white',
                    fontSize: '10px',
                    height: 20
                  }}
                />
              </Box>
              {section.description && (
                <Typography sx={{ fontSize: 12, color: UI.muted, mt: .5 }}>
                  {section.description}
                </Typography>
              )}
              {section.instructions && showSectionInstructions && (
                <Box sx={{ 
                  mt: 1.5,
                  p: 1.5,
                  backgroundColor: UI.card,
                  borderRadius: 8,
                  border: `1px solid ${UI.border}`
                }}>
                  <Typography 
                    sx={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: UI.text,
                      mb: .5
                    }}
                  >
                    Section Instructions:
                  </Typography>
                  <Typography 
                    sx={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: '11px',
                      fontWeight: 400,
                      color: UI.muted,
                      lineHeight: 1.4
                    }}
                  >
                    {section.instructions}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}

          {/* Progress Bar */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography sx={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: UI.muted, 
              mb: 1,
              fontFamily: inter.style.fontFamily
            }}>
              Progress: {Math.round((Object.keys(answers).length / questions.length) * 100)}%
            </Typography>
            <Box sx={{ 
              width: '100%', 
              maxWidth: 400, 
              height: 8, 
              backgroundColor: UI.border, 
              borderRadius: 4,
              mx: 'auto',
              overflow: 'hidden'
            }}>
              <Box sx={{
                height: '100%',
                width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                backgroundColor: UI.primary,
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }} />
            </Box>
            
            {/* Auto-save Indicator */}
            {isAutoSaving && (
                          <Typography variant="caption" sx={{ 
              color: UI.primary, 
              fontStyle: 'italic',
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              fontFamily: inter.style.fontFamily
            }}>
              <CircularProgress size={12} sx={{ color: UI.primary }} />
              Saving progress...
            </Typography>
            )}
          </Box>

          {/* Question counter */}
          <Typography sx={{ 
            fontSize: 16, 
            fontWeight: 800, 
            color: UI.primary, 
            mb: 2,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: inter.style.fontFamily
          }}>
            Question {questions.findIndex(q => q.id === currentQuestion.id) + 1} of {questions.length}
            {currentQuestion.marks && (
              <Box component="span" sx={{ 
                ml: 1, 
                fontSize: '14px', 
                fontWeight: 600, 
                color: UI.muted,
                textTransform: 'none',
                letterSpacing: 'normal',
                fontFamily: inter.style.fontFamily
              }}>
                • {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
              </Box>
            )}
          </Typography>

          {/* Render only the current question, not all questions in the current section */}
          {currentQuestion && (
            <Box
              key={currentQuestion.id}
              ref={(el: HTMLDivElement | null) => { questionRefs.current[currentQuestion.id] = el; }}
              id={`question-${currentQuestion.id}`}
              sx={{
                mb: { xs: 3, sm: 4 },
                p: { xs: 3, sm: 4 },
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${UI.border}`,
                boxShadow: UI.shadow,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >


              {/* Question Image */}
              {currentQuestion.image && (
                <Box display="flex" justifyContent="center" mb={3}>
                  <img
                    src={currentQuestion.image}
                    alt="Question visual"
                    style={{
                      width: '100%',
                      maxWidth: 360,
                      height: 'auto',
                      borderRadius: 12,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      objectFit: 'contain',
                      background: UI.bg,
                      padding: 12,
                      border: `1px solid ${UI.border}`,
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                </Box>
              )}



              {/* Question controls */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box sx={{ flex: 1, pr: 4 }}>
                  {/* Question Type Badge - Left side */}
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={currentQuestion.question_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                      size="small"
                      sx={{ 
                        backgroundColor: UI.primary, 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 24
                      }}
                    />
                  </Box>
                  <Typography 
                    sx={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: '28px',
                      fontWeight: 800,
                      color: UI.text,
                      lineHeight: 1.4,
                      mb: 3,
                      textAlign: 'center',
                      maxWidth: '800px',
                      mx: 'auto'
                    }}
                  >
                    {currentQuestion.question_text}
                  </Typography>
                </Box>
                
                <Box display="flex" gap={1}>
                  <Tooltip title="Flag question">
                    <IconButton 
                      onClick={() => toggleFlag(currentQuestion.id)} 
                      size="small"
                      sx={{
                        backgroundColor: flagged[currentQuestion.id] ? '#ffebee' : 'transparent',
                        color: flagged[currentQuestion.id] ? '#f44336' : '#666',
                        border: flagged[currentQuestion.id] ? '1px solid #f44336' : '1px solid #e0e0e0',
                        '&:hover': {
                          backgroundColor: flagged[currentQuestion.id] ? '#ffcdd2' : '#f5f5f5'
                        }
                      }}
                    >
                      <FlagIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Bookmark">
                    <IconButton 
                      onClick={() => toggleBookmark(currentQuestion.id)} 
                      size="small"
                      sx={{
                        backgroundColor: bookmarked[currentQuestion.id] ? '#fff8e1' : 'transparent',
                        color: bookmarked[currentQuestion.id] ? '#ffb300' : '#666',
                        border: bookmarked[currentQuestion.id] ? '1px solid #ffb300' : '1px solid #e0e0e0',
                        '&:hover': {
                          backgroundColor: bookmarked[currentQuestion.id] ? '#fff3e0' : '#f5f5f5'
                        }
                      }}
                    >
                      {bookmarked[currentQuestion.id] ? (
                        <BookmarkIcon />
                      ) : (
                        <BookmarkBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Question options */}
              {currentQuestion.options.length === 0 ? (
                <Box sx={{
                  mt: 3,
                  mb: 3,
                  p: 3,
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeeba',
                  borderRadius: 2,
                  color: '#856404',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  ⚠️ No options available for this question. Please contact your instructor or admin.
                </Box>
              ) : currentQuestion.question_type === 'single' ? (
                                <RadioGroup
                  value={typeof answers[currentQuestion.id]?.[0] === 'number' ? answers[currentQuestion.id]?.[0] : ''}
                  onChange={(e) => handleOptionSelect(currentQuestion.id, Number(e.target.value), currentQuestion.question_type)}
                >
                  {currentQuestion.options.map((opt: Option, optIdx: number) => (
                    <Box key={optIdx} sx={{ mb: 2 }}>
                      <FormControlLabel
                        value={optIdx}
                        control={<Radio sx={{ 
                          color: UI.primary,
                          '&.Mui-checked': {
                            color: UI.primary
                          }
                        }} />}
                        label={
                          <Box sx={{ display:'flex', alignItems:'center', width:'100%' }}>
                            {/* Letter square */}
                            <Box sx={{
                              width: 40, height: 40, borderRadius: '8px',
                              display:'grid', placeItems:'center', fontWeight: 800,
                              mr: 2, 
                              border: answers[currentQuestion.id]?.includes(optIdx) ? `2px solid ${UI.optSelectedBorder}` : `1px solid ${UI.border}`,
                              bgcolor: answers[currentQuestion.id]?.includes(optIdx) ? UI.optSelectedBg : '#f1f5f9',
                              color: answers[currentQuestion.id]?.includes(optIdx) ? UI.primary : UI.text,
                            }}>{String.fromCharCode(65 + optIdx)}</Box>

                            {/* Long bar like your sketch */}
                            <Box sx={{
                              flex:1, py: 2, px: 2.5, borderRadius: 0,
                              border: answers[currentQuestion.id]?.includes(optIdx) ? `2px solid ${UI.optSelectedBorder}` : `1px solid ${UI.border}`,
                              bgcolor: answers[currentQuestion.id]?.includes(optIdx) ? UI.optSelectedBg : '#f1f5f9',
                              '&:hover': { bgcolor: UI.optHover },
                              transition: 'all 0.2s ease',
                            }}>
                              <Typography sx={{ fontSize: 16, fontWeight: 500, color: UI.text, fontFamily: inter.style.fontFamily }}>
                                {opt.text}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width:'100%', cursor:'pointer', py:1 }}
                        disabled={submitted}
                      />
                      {opt.image && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <img
                            src={opt.image}
                            alt={`Option ${optIdx + 1}`}
                            style={{
                              width: '100%',
                              maxWidth: 400,
                              height: 'auto',
                              borderRadius: 0,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              objectFit: 'contain',
                              background: '#f8fafc',
                              padding: 12,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                                    {currentQuestion.options.map((opt: Option, optIdx: number) => (
                    <Box key={optIdx} sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={answers[currentQuestion.id]?.includes(optIdx) || false}
                            onChange={() => handleOptionSelect(currentQuestion.id, optIdx, currentQuestion.question_type)}
                            color="primary"
                            sx={{ 
                              color: UI.primary,
                              '&.Mui-checked': {
                                color: UI.primary
                              }
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display:'flex', alignItems:'center', width:'100%' }}>
                            {/* Letter square */}
                            <Box sx={{
                              width: 40, height: 40, borderRadius: '8px',
                              display:'grid', placeItems:'center', fontWeight: 800,
                              mr: 2, 
                              border: answers[currentQuestion.id]?.includes(optIdx) ? `2px solid ${UI.optSelectedBorder}` : `1px solid ${UI.border}`,
                              bgcolor: answers[currentQuestion.id]?.includes(optIdx) ? UI.optSelectedBg : '#f1f5f9',
                              color: answers[currentQuestion.id]?.includes(optIdx) ? UI.primary : UI.text,
                            }}>{String.fromCharCode(65 + optIdx)}</Box>

                            {/* Long bar like your sketch */}
                            <Box sx={{
                              flex:1, py: 2, px: 2.5, borderRadius: 0,
                              border: answers[currentQuestion.id]?.includes(optIdx) ? `2px solid ${UI.optSelectedBorder}` : `1px solid ${UI.border}`,
                              bgcolor: answers[currentQuestion.id]?.includes(optIdx) ? UI.optSelectedBg : '#f1f5f9',
                              '&:hover': { bgcolor: UI.optHover },
                              transition: 'all 0.2s ease',
                            }}>
                              <Typography sx={{ fontSize: 16, fontWeight: 500, color: UI.text, fontFamily: inter.style.fontFamily }}>
                                {opt.text}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width:'100%', cursor:'pointer', py:1 }}
                        disabled={submitted}
                      />
                                              {opt.image && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={opt.image}
                          alt={`Option ${optIdx + 1}`}
                          style={{
                              width: '100%',
                            maxWidth: 400,
                              height: 'auto',
                              borderRadius: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            objectFit: 'contain',
                            background: '#f8fafc',
                            padding: 12,
                              border: '1px solid #e0e0e0'
                          }}
                        />
                        </Box>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              )}
              
              {/* Marks indicator */}
              <Typography 
                sx={{
                  display: 'block',
                  mt: 3,
                  textAlign: 'right',
                  fontStyle: 'italic',
                  fontFamily: inter.style.fontFamily,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: UI.muted
                }}
              >
                Marks: {typeof currentQuestion.marks === 'number' ? currentQuestion.marks : 1}
              </Typography>

              {/* Explanation (visible in review mode or if showAnswerKey is true) */}
              {(reviewMode || showAnswerKey) && currentQuestion.explanation && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: 2,
                  borderLeft: '4px solid #4caf50'
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32">
                    Explanation:
                  </Typography>
                  <Typography variant="body2" color="#2e7d32" sx={{ mt: 1 }}>
                    {currentQuestion.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

                    {/* Section navigation (sticky at bottom of question card) */}
          <Box sx={{
            position:'sticky', bottom: -16, pt: 2, mt: 4,
            background: `linear-gradient(180deg, rgba(255,255,255,0), ${UI.card} 50%)`
          }}>
            <Box display="flex" justifyContent="space-between" sx={{ gap:2, mb:2, flexDirection:{ xs:'column', sm:'row' }}}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={goToPrevQuestionFlat}
                disabled={questions.findIndex(q => q.id === currentQuestionId) === 0}
                sx={{ 
                  fontFamily: inter.style.fontFamily,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  py: { xs: 2, sm: 1.5 },
                  px: { xs: 2, sm: 3 },
                  borderRadius: '8px',
                  borderColor: UI.primary,
                  color: UI.primary,
                  '&:hover': {
                    borderColor: UI.primaryHover,
                    backgroundColor: UI.optHover
                  }
                }}
              >
                Prev
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={goToNextQuestionFlat}
                  disabled={questions.findIndex(q => q.id === currentQuestionId) === questions.length - 1}
                  sx={{ 
                    fontFamily: inter.style.fontFamily,
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    py: { xs: 2, sm: 1.5 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: '8px',
                    borderColor: UI.review,
                    color: UI.review,
                    '&:hover': {
                      borderColor: UI.review,
                      backgroundColor: 'rgba(245, 158, 11, 0.1)'
                    }
                  }}
                >
                  Skip
                </Button>
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  onClick={goToNextQuestionFlat}
                  disabled={questions.findIndex(q => q.id === currentQuestionId) === questions.length - 1}
                  sx={{ 
                    fontFamily: inter.style.fontFamily,
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    py: { xs: 2, sm: 1.5 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: '8px',
                    backgroundColor: UI.primary,
                    '&:hover': {
                      backgroundColor: UI.primaryHover,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(11, 95, 255, 0.3)'
                    }
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
            
            {/* Mark for Review (full width) */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => toggleMarkForReview(currentQuestion.id)}
              sx={{ 
                fontFamily: inter.style.fontFamily,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                py: { xs: 2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                borderRadius: '8px',
                borderColor: markedForReview[currentQuestion.id] ? UI.review : UI.border,
                color: markedForReview[currentQuestion.id] ? UI.review : UI.text,
                backgroundColor: markedForReview[currentQuestion.id] ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                '&:hover': {
                  borderColor: UI.review,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)'
                }
              }}
            >
              {markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
            </Button>

            {/* Keyboard Shortcuts Tip */}
            <Typography variant="caption" sx={{ 
              textAlign: 'center', 
              color: UI.muted, 
              mt: 1,
              display: 'block',
              fontStyle: 'italic',
              fontFamily: inter.style.fontFamily
            }}>
              💡 Tip: Use ← → arrow keys to navigate between questions
            </Typography>
          </Box>
      </Box>

        {/* Question Palette - Right Column (Desktop Only) */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={true}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
              backgroundColor: '#F8F9FA',
              borderLeft: `1px solid ${UI.border}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              padding: '16px',
            }
          }}
        >
          <PaletteBody />
        </Drawer>
      </Box>

      {/* Mobile Bottom Sheet for Question Palette */}
      <Drawer
        anchor="bottom"
        open={showNavigationPanel}
        onClose={() => setShowNavigationPanel(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{ sx: { maxHeight: '75vh', borderTopLeftRadius: 12, borderTopRightRadius: 12 } }}
      >
        <PaletteBody />
      </Drawer>

      {/* Floating Action Buttons */}
      {!showNavigationPanel && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
            backgroundColor: UI.deepBlue,
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 35, 102, 0.3)',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 35, 102, 0.4)'
            }
          }}
          onClick={() => setShowNavigationPanel(true)}
        >
          <VisibilityIcon />
        </Fab>
      )}
      
      <Fab
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: UI.navy,
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(10, 37, 64, 0.3)',
          '&:hover': {
            backgroundColor: '#0a2540',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(10, 37, 64, 0.4)'
          }
        }}
        onClick={() => setSidebarOpen(true)}
      >
        <SettingsIcon />
      </Fab>

      {/* Settings Panel */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: inter.style.fontFamily }}>
            Exam Settings
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: inter.style.fontFamily }}>
            Theme
          </Typography>
          <RadioGroup
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
          >
            <FormControlLabel 
              value="default" 
              control={<Radio />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: THEMES.default.primary
                  }} />
                  <span>Default</span>
                </Box>
              } 
            />
            <FormControlLabel 
              value="dark" 
              control={<Radio />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: THEMES.dark.primary
                  }} />
                  <span>Dark</span>
                </Box>
              } 
            />
            <FormControlLabel 
              value="sepia" 
              control={<Radio />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: THEMES.sepia.primary
                  }} />
                  <span>Sepia</span>
                </Box>
              } 
            />
          </RadioGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: inter.style.fontFamily }}>
            Font Size
          </Typography>
          <RadioGroup
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
          >
            <FormControlLabel value="normal" control={<Radio />} label="Normal" />
            <FormControlLabel value="large" control={<Radio />} label="Large (+20%)" />
            <FormControlLabel value="xlarge" control={<Radio />} label="Extra Large (+40%)" />
          </RadioGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={showSectionInstructions}
                onChange={(e) => setShowSectionInstructions(e.target.checked)}
              />
            }
            label="Show Section Instructions"
          />
          
          {quiz?.show_answers && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                />
              }
              label="Show Answer Key"
            />
          )}
        </Box>
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: inter.style.fontFamily }}>Submit Exam?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: inter.style.fontFamily }}>
            Are you sure you want to submit your exam? You won't be able to make changes after submission.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: inter.style.fontFamily }}>Summary:</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip label={`Answered: ${answeredCount}`} color="success" variant="outlined" />
              <Chip label={`Unanswered: ${questions.length - answeredCount}`} color="warning" variant="outlined" />
              <Chip label={`Flagged: ${Object.values(flagged).filter(Boolean).length}`} color="error" variant="outlined" />
              <Chip label={`Marked for Review: ${Object.values(markedForReview).filter(Boolean).length}`} color="info" variant="outlined" />
            </Box>
            {redirectMessage && (
              <Alert severity="success" sx={{ mt: 3 }}>{redirectMessage}</Alert>
            )}
          </Box>
          {Object.values(flagged).filter(Boolean).length > 0 && (
            <Typography variant="body2" color="error.main">Flagged: {questions.filter(q => flagged[q.id]).map((q, i, arr) => `Q${questions.findIndex(qq => qq.id === q.id) + 1}${i < arr.length - 1 ? ', ' : ''}`)}</Typography>
          )}
          {Object.values(markedForReview).filter(Boolean).length > 0 && (
            <Typography variant="body2" color="info.main">Marked for Review: {questions.filter(q => markedForReview[q.id]).map((q, i, arr) => `Q${questions.findIndex(qq => qq.id === q.id) + 1}${i < arr.length - 1 ? ', ' : ''}`)}</Typography>
          )}
          {Object.values(bookmarked).filter(Boolean).length > 0 && (
            <Typography variant="body2" color="warning.main">Bookmarked: {questions.filter(q => bookmarked[q.id]).map((q, i, arr) => `Q${questions.findIndex(qq => qq.id === q.id) + 1}${i < arr.length - 1 ? ', ' : ''}`)}</Typography>
          )}
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

      {/* Last Minute Warning */}
      <Snackbar
        open={showLastMinuteWarning}
        onClose={() => setShowLastMinuteWarning(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={10000}
      >
        <Alert severity="warning" sx={{ width: '100%', fontWeight: 600, fontSize: '1.1rem' }}>
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
              fontSize: '1rem'
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      )}

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
        </Box>
      </Box>
    </>
  )
}