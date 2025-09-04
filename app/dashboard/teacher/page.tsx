'use client';

import { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
  Pagination,
  Card,
  CardContent,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Paper,
  CardHeader,
  Divider,
  MenuItem,
  TablePagination,
  IconButton,
  Tooltip,
  Snackbar,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  LinearProgress,
  Badge,
  Fade,
  Grow,
  Slide,
  Zoom
} from '@mui/material';
import { useClerk, useUser } from '@clerk/nextjs';
import { ThemeToggleButton } from '../../../src/components/ThemeToggleButton';
import { supabase } from '../../../src/utils/supabaseClient';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Send as PaperPlaneIcon,
  ShowChart as LineAxisIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Modern thin icons from Lucide/Heroicons style
import {
  Bell as BellIcon,
  LogOut as LogOutIcon,
  CalendarDays as CalendarIcon,
  Menu as MenuIcon
} from 'lucide-react';
import AddExamForm from '../../../components/dashboard/AddExamForm';
import AddQuestionsForm from '../../../components/dashboard/AddQuestionsForm';

import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { withRole } from "../../../components/withRole";
import { SettingsDrawer } from '../../../components/settings/SettingsDrawer';
import { useSettingsContext } from '../../../src/context/settings-context';
import Iconify from '../../../src/components/iconify/Iconify';
import { useTheme } from '@mui/material/styles';

import Skeleton from '@mui/material/Skeleton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LogoutSplash from '../../../components/LogoutSplash';

// Lazy load components
const QuizTable = lazy(() => import('../../../src/components/dashboard/QuizTable'));
const QuizAnalytics = lazy(() => import('../../../src/components/dashboard/QuizAnalytics'));
const AppWelcome = lazy(() => import('../../../src/sections/overview/app-welcome'));
const AppWidgetSummary = lazy(() => import('../../../src/sections/overview/app-widget-summary'));

// Styled Components for Enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.3)' 
    : '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#E6E8EC'}`,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '&:hover': {
    transform: 'translateY(1px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.4)' 
      : '0 8px 24px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.06)',
    borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#2563EB',
  },
  '&:focus-visible': {
    outline: '2px solid #2563EB',
    outlineOffset: '2px'
  }
}));



const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
    : '#FFFFFF',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#3A3A3A' : '#E6E8EC'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' 
    : '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '&:hover': {
    transform: 'translateY(1px)',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)'
      : '#FFFFFF',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 12px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)' 
      : '0 8px 24px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.06)',
    borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#2563EB',
  },
  '&:focus-visible': {
    outline: '2px solid #2563EB',
    outlineOffset: '2px'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
    borderRadius: '16px 16px 0 0',
  },
}));

export interface Quiz {
  id: number;
  quiz_title: string;
  duration?: number | null;
  is_draft?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string;
  access_code?: string | null;
  total_marks?: number | null;
  shuffle_questions?: boolean | null;
  shuffle_options?: boolean | null;
  max_attempts?: number | null;
  preview_mode?: boolean | null;
  score?: number;
  user_id: string;
  description?: string | null;
  passing_score?: number;
  show_correct_answers?: boolean;
  attempts?: number | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const greetingImg = '/assets/images/background-4.jpg';

// Wrapper component to handle Suspense for useSearchParams
function TeacherDashboardWrapper() {
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
      <TeacherDashboardPage />
    </Suspense>
  );
}

export default withRole(TeacherDashboardWrapper, ["teacher"]);

function TeacherDashboardPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const settings = useSettingsContext();
  const theme = useTheme();
  
  // Inter font configuration
  const interFont = {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [deleteQuizDialogOpen, setDeleteQuizDialogOpen] = useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = useState<number | null>(null);

  // Stats
  const [activeTests, setActiveTests] = useState(0);
  const [upcomingTests, setUpcomingTests] = useState(0);
  const [pastTests, setPastTests] = useState(0);

  // Teacher dashboard stats
  const [studentCount, setStudentCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Enhanced analytics state
  const [performanceData, setPerformanceData] = useState({
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
    activeStudents: 0
  });

  // Exams state
  const [exams, setExams] = useState<any[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  const [editExam, setEditExam] = useState<{ quizId: number, nq: number } | null>(null);

  const addQuestionsQuizId = searchParams ? searchParams.get('quizId') : null;
  const addQuestionsNq = searchParams ? searchParams.get('nq') : null;

  const paginatedQuizzes = quizzes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const [selectedSection, setSelectedSection] = useState('dashboard');

  // Determine the current tab from the URL, default to 'dashboard'
  const currentTab = searchParams?.get('tab') || 'dashboard';
  
  console.log('🔍 Current tab:', currentTab);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [createAnnouncementOpen, setCreateAnnouncementOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [examPage, setExamPage] = useState(1);
  const examsPerPage = 10;
  const paginatedExams = quizzes.slice((examPage - 1) * examsPerPage, examPage * examsPerPage);
  const examPageCount = Math.ceil(quizzes.length / examsPerPage);

  const [dashboardExamPage, setDashboardExamPage] = useState(1);
  const [dashboardExamsPerPage, setDashboardExamsPerPage] = useState(10);
  const dashboardPageCount = Math.ceil(exams.length / dashboardExamsPerPage);
  const paginatedDashboardExams = exams.slice(
    (dashboardExamPage - 1) * dashboardExamsPerPage,
    dashboardExamPage * dashboardExamsPerPage
  );

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [showLogoutSplash, setShowLogoutSplash] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [studentDeleteDialogOpen, setStudentDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [recordsKey, setRecordsKey] = useState(0);

  const [questionsMap, setQuestionsMap] = useState<Record<number, any[]>>({});
  const [sectionNames, setSectionNames] = useState<Record<number, string>>({});



  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    setResults([]);
    (async () => {
      // Fetch all quizzes for the teacher
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('id, quiz_title')
        .eq('user_id', user.id);
      setQuizzes((quizData || []).map(q => ({
        ...q,
        user_id: user.id,
        quiz_title: q.quiz_title || '',
        id: q.id,
      })));
      // Fetch all attempts for quizzes created by this teacher
      const { data, error } = await supabase
        .from('attempts')
        .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, answers, quizzes(quiz_title, user_id)`)
        .order('submitted_at', { ascending: false });
      if (error) {
        setError(error.message || 'Error fetching results');
        setLoading(false);
        return;
      }
      const filtered = (data || []).filter((row: any) => row.quizzes?.user_id === user.id);
      setResults(filtered);
      // Extract unique students
      const uniqueStudents = Array.from(new Set(filtered.map((row: any) => row.user_name)));
      setStudents(uniqueStudents);
      // Fetch all questions for all quizzes
      const quizIds = Array.from(new Set(filtered.map((r: any) => r.quiz_id).filter(Boolean)));
      const map: Record<number, any[]> = {};
      await Promise.all(quizIds.map(async (quizId) => {
        const { data } = await supabase
          .from('questions')
          .select('id, question_text, options, marks, correct_answers')
          .eq('quiz_id', quizId)
          .order('id', { ascending: true });
        if (data) map[quizId] = data;
      }));
      setQuestionsMap(map);
      // After fetching questions, fetch sections for the quiz
      if (quizIds.length > 0) {
        const { data: sections } = await supabase
          .from('sections')
          .select('id, name, quiz_id')
          .in('quiz_id', quizIds);
        if (sections) {
          const mapping: Record<number, string> = {};
          sections.forEach((section: any) => {
            mapping[section.id] = section.name;
          });
          setSectionNames(mapping);
        }
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const handleDeleteStudent = async () => {
    // Log the student object for debugging
    console.log('Deleting student:', studentToDelete);
    // Try all possible id fields
    const clerkId = studentToDelete?.id || studentToDelete?.clerkId || studentToDelete?.userId || studentToDelete?._id;
    if (!clerkId) {
      setError('No valid student id found.');
      return;
    }
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clerkId }),
      });
      if (res.ok) {
        // Refresh the students list directly
        const refreshRes = await fetch('/api/clerk-users?limit=1000');
        const refreshData = await refreshRes.json();
        setStudents(Array.isArray(refreshData) ? refreshData.filter((u: any) => u.role === 'student') : []);
        setStudentDeleteDialogOpen(false);
        setStudentToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        let errorMsg = data.error || data.message || res.statusText || 'Failed to delete student.';
        if (Array.isArray(data.details)) {
          errorMsg = data.details.map((d: any) => d.longMessage || d.message || JSON.stringify(d)).join('\n');
        } else if (typeof data.details === 'string') {
          errorMsg = data.details;
        }
        setError(errorMsg);
        console.error('Failed to delete student:', errorMsg);
      }
    } catch (err: any) {
      setError(err?.message || 'Error deleting student.');
      console.error('Error deleting student:', err);
    } finally {
      setStudentDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const fetchRecentResults = async () => {
    if (!user?.id) return;
    
    try {
      // Get all quiz IDs for this teacher
      const { data: teacherQuizzes } = await supabase
        .from('quizzes')
        .select('id')
        .eq('user_id', user.id);
      
      const quizIds = teacherQuizzes?.map(q => q.id) || [];
      
      if (quizIds.length > 0) {
        const { data: recentAttempts } = await supabase
          .from('attempts')
          .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, answers, quizzes:quiz_id(quiz_title, total_marks, user_id)`)
          .in('quiz_id', quizIds)
          .order('submitted_at', { ascending: false })
          .limit(10);
        
        // Filter and sort to get the most recent results
        const filteredRecentResults = (recentAttempts || [])
          .filter((r: any) => r.quizzes?.user_id === user.id)
          .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          .slice(0, 8);
        
        setRecentResults(filteredRecentResults);
      } else {
        setRecentResults([]);
      }
    } catch (error) {
      console.error('Error fetching recent results:', error);
    }
  };

  const fetchAllResults = async () => {
    if (!user?.id) {
      console.log('🔍 fetchAllResults - No user ID, skipping');
      return;
    }
    
    try {
      console.log('🔍 fetchAllResults - Starting fetch for user:', user.id);
      
      // Get all quiz IDs for this teacher
      const { data: teacherQuizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('user_id', user.id);
      
      if (quizError) {
        console.error('🔍 fetchAllResults - Error fetching quizzes:', quizError);
        return;
      }
      
      const quizIds = teacherQuizzes?.map(q => q.id) || [];
      
      console.log('🔍 fetchAllResults - Quiz IDs:', quizIds);
      
      if (quizIds.length > 0) {
        const { data: allAttempts, error: attemptsError } = await supabase
          .from('attempts')
          .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, answers, quizzes:quiz_id(quiz_title, total_marks, user_id)`)
          .in('quiz_id', quizIds)
          .order('submitted_at', { ascending: false });
        
        if (attemptsError) {
          console.error('🔍 fetchAllResults - Error fetching attempts:', attemptsError);
          return;
        }
        
        console.log('🔍 fetchAllResults - All attempts:', allAttempts?.length || 0);
        
        // Filter to only show results from this teacher's quizzes
        const filteredResults = (allAttempts || [])
          .filter((r: any) => r.quizzes?.user_id === user.id);
        
        console.log('🔍 fetchAllResults - Filtered results:', filteredResults.length);
        console.log('🔍 fetchAllResults - Sample results:', filteredResults.slice(0, 2));
        
        setResults(filteredResults);
      } else {
        console.log('🔍 fetchAllResults - No quiz IDs found');
        setResults([]);
      }
    } catch (error) {
      console.error('🔍 fetchAllResults - Unexpected error:', error);
    }
  };

  const fetchQuizzes = async () => {
    if (!user?.id) return;

    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const processedQuizzes = data?.map(quiz => ({
        ...quiz,
        quiz_title: quiz.quiz_title || 'Untitled Quiz',
        access_code: quiz.access_code || '',
      })) || [];

      setQuizzes(processedQuizzes);
      calculateStats(processedQuizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    }
  };

  const calculateStats = (quizData: Quiz[]) => {
    const now = new Date();
    
    const active = quizData.filter(q => {
      const start = q.start_time ? new Date(q.start_time) : null;
      const end = q.end_time ? new Date(q.end_time) : null;
      return start && end && start <= now && end > now && !q.is_draft;
    }).length;
    
    const upcoming = quizData.filter(q => {
      const start = q.start_time ? new Date(q.start_time) : null;
      return start && start > now && !q.is_draft;
    }).length;
    
    const past = quizData.filter(q => {
      const end = q.end_time ? new Date(q.end_time) : null;
      return end && end <= now && !q.is_draft;
    }).length;

    setActiveTests(active);
    setUpcomingTests(upcoming);
    setPastTests(past);
  };

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const start = quiz.start_time ? new Date(quiz.start_time) : null;
    const end = quiz.end_time ? new Date(quiz.end_time) : null;

    if (quiz.is_draft) return 'Draft';
    if (!start || !end) return 'Unknown';
    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Active';
    return 'Completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Upcoming': return 'info';
      case 'Completed': return 'warning';
      case 'Draft': return 'default';
      default: return 'primary';
    }
  };

  const handleDeleteClick = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizToDelete.id);

      if (error) throw error;

      // Also delete related questions and results in a transaction
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizToDelete.id);

      if (questionsError) throw questionsError;

      // Refresh the quiz list
      await fetchQuizzes();
      await fetchAllResults();
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const handleEditExam = (quizId: number, nq: number) => {
    router.push(`/edit-quiz/${quizId}`);
  };

  const handleDeleteExam = async (quizId: number) => {
    setQuizToDeleteId(quizId);
    setDeleteQuizDialogOpen(true);
  };

  const handleDeleteQuizConfirm = async () => {
    if (!quizToDeleteId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', quizToDeleteId);
      if (error) {
        console.error('Error deleting quiz:', error);
        return;
      }
      setExams(exams => exams.filter(e => e.id !== quizToDeleteId));
      // Also refresh the quizzes list
      fetchQuizzes();
      setDeleteQuizDialogOpen(false);
      setQuizToDeleteId(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteQuizCancel = () => {
    setDeleteQuizDialogOpen(false);
    setQuizToDeleteId(null);
  };

  useEffect(() => {
    setPage(1);
  }, [quizzes]);

  useEffect(() => {
    if (isLoaded && user) {
      // Load quizzes immediately without blocking UI
      fetchQuizzes();

      // Set up real-time subscription
      const subscription = supabase
        .channel('quizzes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quizzes',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            fetchQuizzes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [isLoaded, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchStats = async () => {
      if (!user?.id) {
        console.log('🔍 fetchStats - No user ID, skipping');
        return;
      }
      console.log('🔍 fetchStats - Starting stats calculation for user:', user.id);
      try {
        console.log('🔍 fetchStats - About to fetch quizzes and announcements');
        // Fetch teacher's quizzes first
        const [examsResult, announcementsResult] = await Promise.all([
          supabase.from('quizzes').select('id').eq('user_id', user.id),
          supabase.from('announcements').select('id').eq('sender_id', user.id)
        ]);
        
        console.log('🔍 fetchStats - Queries completed, examsResult:', examsResult);
        console.log('🔍 fetchStats - announcementsResult:', announcementsResult);
        
        // Get total number of students from Clerk
        const clerkUsersRes = await fetch('/api/clerk-users?limit=1000');
        const clerkUsers = await clerkUsersRes.json();
        const studentCount = Array.isArray(clerkUsers) ? clerkUsers.filter((u: any) => u.role === 'student').length : 0;

        console.log('📊 Teacher stats calculated:', {
          studentCount,
          examCount: examsResult.data?.length || 0,
          announcementCount: announcementsResult.data?.length || 0,
          totalClerkUsers: Array.isArray(clerkUsers) ? clerkUsers.length : 0
        });
        
        setStudentCount(studentCount);
        setExamCount(examsResult.data?.length || 0);
        setAnnouncementCount(announcementsResult.data?.length || 0);
        
        // Get quiz IDs for results count
        const quizIds = examsResult.data?.map(q => q.id) || [];
        
        console.log('🔍 fetchStats - Quiz IDs from examsResult:', quizIds.length, quizIds);
        console.log('🔍 fetchStats - examsResult.data:', examsResult.data);
        
        if (quizIds.length > 0) {
          console.log('🔍 fetchStats - Found quiz IDs, fetching results:', quizIds.length);
          const [resultsResult, recentResults, allResults] = await Promise.all([
            supabase
              .from('attempts')
              .select('id', { count: 'exact', head: true })
              .in('quiz_id', quizIds),
            supabase
              .from('attempts')
              .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, answers, quizzes:quiz_id(quiz_title, total_marks, user_id)`)
              .in('quiz_id', quizIds)
              .order('submitted_at', { ascending: false })
              .limit(10),
            supabase
              .from('attempts')
              .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, answers, quizzes:quiz_id(quiz_title, total_marks, user_id)`)
              .in('quiz_id', quizIds)
              .order('submitted_at', { ascending: false })
          ]);
          
          setResultCount(resultsResult.count || 0);
          // Filter to only show results from this teacher's quizzes and ensure they're the most recent
          const filteredRecentResults = (recentResults.data || [])
            .filter((r: any) => r.quizzes?.user_id === user.id)
            .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
            .slice(0, 8); // Take the 8 most recent
          
          setRecentResults(filteredRecentResults);
          
          // Filter all results to only include this teacher's quizzes
          const filteredAllResults = (allResults.data || [])
            .filter((r: any) => r.quizzes?.user_id === user.id);
          
          console.log('🔍 fetchStats - Filtered all results:', filteredAllResults.length);
          console.log('🔍 fetchStats - Sample filtered results:', filteredAllResults.slice(0, 2));
          
          // Calculate performance data using ALL results, not just recent ones
          const totalAttempts = filteredAllResults.length;
          const totalMarks = filteredAllResults.reduce((sum, r) => sum + (r.score || 0), 0);
          const totalPossibleMarks = filteredAllResults.reduce((sum, r) => sum + ((r.quizzes as any)?.total_marks || 100), 0);
          const averageScore = totalAttempts > 0 ? Math.round((totalMarks / totalPossibleMarks) * 100) : 0;
          
          console.log('🔍 fetchStats - Calculation details:', {
            totalAttempts,
            totalMarks,
            totalPossibleMarks,
            averageScore,
            sampleResults: filteredAllResults.slice(0, 2)
          });
          
          // Calculate pass rate (assuming 60% is passing)
          const passingAttempts = filteredAllResults.filter(r => {
            const score = r.score || 0;
            const totalMarks = (r.quizzes as any)?.total_marks || 100;
            return (score / totalMarks) >= 0.6;
          }).length;
          const passRate = totalAttempts > 0 ? Math.round((passingAttempts / totalAttempts) * 100) : 0;
          
          console.log('📊 Performance data calculated:', {
            totalAttempts,
            averageScore,
            passRate,
            totalMarks,
            totalPossibleMarks,
            filteredAllResultsCount: filteredAllResults.length,
            sampleResults: filteredAllResults.slice(0, 2)
          });
          
          setPerformanceData({
            averageScore,
            passRate,
            totalAttempts,
            activeStudents: studentCount
          });
          
          console.log('📊 Performance data set successfully');
        } else {
          setResultCount(0);
          setRecentResults([]);
          setPerformanceData({
            averageScore: 0,
            passRate: 0,
            totalAttempts: 0,
            activeStudents: studentCount
          });
        }
        
        // Also fetch recent results separately to ensure we get the latest
        fetchRecentResults();
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    // Load stats and recent results immediately without blocking UI
    fetchStats();
    fetchRecentResults();
    fetchAllResults();
    
    // Set up polling for real-time stats updates
    const interval = setInterval(fetchStats, 15000); // Poll every 15 seconds
    
    // Set up real-time subscription for new attempts
    const subscription = supabase
      .channel('recent_attempts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attempts'
        },
        (payload) => {
          // Refresh recent results when new attempts are added
          fetchStats();
          fetchAllResults();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchExams = async () => {
      try {
        const { data } = await supabase
      .from('quizzes')
      .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const teacherExams = data || [];
        const quizIds: number[] = teacherExams.map((q: any) => q.id);
        
        if (quizIds.length === 0) {
          setExams([]);
          return;
        }

        const { data: questions } = await supabase
          .from('questions')
          .select('id, quiz_id')
          .in('quiz_id', quizIds);

        const questionCounts: Record<number, number> = {};
        (questions || []).forEach((q: { quiz_id: number }) => {
            questionCounts[q.quiz_id] = (questionCounts[q.quiz_id] || 0) + 1;
        });

        const teacherExamsWithCounts = teacherExams.map((q: any) => ({
          ...q,
          questions_count: questionCounts[q.id] || 0,
        }));
        
        setExams(teacherExamsWithCounts);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setExamsLoading(false);
      }
    };

    // Load exams immediately without blocking UI
    fetchExams();
  }, [user?.id]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .in('target_audience', ['all', 'teachers'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        // Count unread notifications (for demo, we'll consider all as unread)
        setUnreadNotifications(data?.length || 0);
      }
      setNotificationsLoading(false);
    };
    fetchNotifications();
  }, [user]);

  // Handle profile button click
  const handleProfileClick = () => {
    setSelectedSection('settings');
  };

  // Handle notification button click
  const handleNotificationClick = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  // Handle notification item click
  const handleNotificationItemClick = (notification: any) => {
    // Mark as read (you can implement this logic)
    console.log('Notification clicked:', notification);
    // Close dropdown after a short delay
    setTimeout(() => {
      setNotificationDropdownOpen(false);
    }, 200);
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-notification-dropdown]')) {
          setNotificationDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationDropdownOpen]);

  const helpContent = (
    <Box p={{ xs: 2, sm: 3 }} borderRadius={3} boxShadow={1} sx={{ background: theme.palette.background.paper, maxWidth: 900, mx: 'auto', border: 'none', fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
        About & Help
      </Typography>
      <Box mt={3}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 2 }}>How to use</Typography>
        <Box component="ol" sx={{ pl: 3 }}>
          <li><Typography variant="subtitle1" fontWeight={600}>How to logout?</Typography>
            <Typography variant="body2">Click on the logout button at the left bottom on the navigation bar.</Typography></li>
          <li><Typography variant="subtitle1" fontWeight={600}>How to edit my profile details?</Typography>
            <Typography variant="body2">Click on the settings option from the left navigation bar. After filling the required columns, click on update.</Typography></li>
          <li><Typography variant="subtitle1" fontWeight={600}>How to edit, delete or add new student records?</Typography>
            <Typography variant="body2">Click on the records option from the left navigation bar. The list of all the students will be displayed there, you can use the edit or delete button provided along with every student detail column. To add a new student, use the box provided in the right.</Typography></li>
          <li><Typography variant="subtitle1" fontWeight={600}>How to view the results?</Typography>
            <Typography variant="body2">Go to the results option from the left navigation bar to view the results.</Typography></li>
          <li><Typography variant="subtitle1" fontWeight={600}>How to conduct exams?</Typography>
            <Typography variant="body2">Navigate to the exams tab by clicking on the exams button from the left navigation bar. New tests can be added and old ones can also be deleted from here according to your preference. After adding a test, click on the edit icon to add questions.</Typography></li>
        </Box>
        <Box mt={3}>
          <Typography variant="body2" color="error" fontWeight={600}><b>Important notice:</b> Once the test questions has been added once, do not try to update the questions. It can cause error in the functioning of the website. Updating the existing questions feature will be introduced in the future updates.</Typography>
        </Box>
      </Box>
    </Box>
  );

  if (!isLoaded && !loggingOut) { // Only show loading if not logging out
    // Professional skeleton loader for dashboard
    return (
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        sx={{
          background: theme.palette.background.default,
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        {/* Top Bar Skeleton */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          p={3}
          borderRadius={3}
          sx={{
            background: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e3e6ef',
            mt: 4,
            mx: { xs: 2, sm: 6 },
            minHeight: 90,
          }}
        >
          <Box>
            <Skeleton variant="text" width={220} height={38} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={44} height={44} />
            <Skeleton variant="text" width={100} height={28} />
          </Box>
        </Box>

        {/* Overview Cards Skeleton */}
        <Grid container spacing={3} mb={4} px={{ xs: 2, sm: 6 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={80} height={24} />
                <Skeleton variant="rectangular" width={60} height={48} sx={{ my: 1 }} />
                <Skeleton variant="text" width={120} height={18} />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Results Table Skeleton */}
        <Card sx={{ mb: 4, p: 2, boxShadow: 2, mx: { xs: 2, sm: 6 } }}>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {["Date", "Name", "Exam name", "Percentage"].map((col) => (
                    <TableCell key={col}><Skeleton variant="text" width={80} /></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {[1, 2, 3, 4].map((col) => (
                      <TableCell key={col}><Skeleton variant="text" width={80} /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2} textAlign="right">
            <Skeleton variant="rectangular" width={100} height={36} />
          </Box>
        </Card>

        {/* Exams Table Skeleton */}
        <Grid container spacing={3} px={{ xs: 2, sm: 6 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, boxShadow: 3 }}>
              <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      {["Exam no.", "Exam name", "Description", "No. of questions", "Exam time", "End time", "Access Code", "Actions"].map((col) => (
                        <TableCell key={col}><Skeleton variant="text" width={80} /></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        {Array.from({ length: 8 }).map((_, colIdx) => (
                          <TableCell key={colIdx}><Skeleton variant="text" width={70} /></TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" mt={2}>
                <Skeleton variant="rectangular" width={220} height={40} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (loggingOut) {
    return (
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: theme.palette.background.default,
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        <Skeleton variant="circular" width={64} height={64} sx={{ mb: 3 }} />
        <Skeleton variant="text" width={220} height={38} sx={{ mb: 1 }} />
        <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
          Logging out, please wait...
        </Typography>
      </Box>
    );
  }

  if (!user || !user.id) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <Alert severity="error">You must be logged in to view this page</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      ...interFont,
      background: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F7F8FA',
      color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111827'
    }}>
      {/* Main Content */}
      <Box component="main" className="dashboard-inter-font" sx={{ 
        flexGrow: 1, 
        minHeight: '100vh', 
        background: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F7F8FA'
      }}>
        {/* Top Navigation Bar */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 100 }}>
          {/* Top Strip - Greeting and Controls */}
          <Box
            sx={{
              background: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: { xs: 3, sm: 4, md: 6 },
              py: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: 2,
              width: '100%'
            }}
          >
            {/* Left: Portal Branding and Greeting */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Portal Logo and Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  background: theme.palette.background.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                  border: '3px solid #3B82F6'
                }}>
                  <img 
                    src="/Logo.svg" 
                    alt="OctoMind Logo" 
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      filter: 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
                    }} 
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={700} 
                    sx={{ 
                      color: 'text.primary',
                      fontSize: '1.125rem',
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2
                    }}
                  >
                    OctoMind
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Powered by OctoMind
                  </Typography>
                </Box>
              </Box>
              
              {/* Greeting */}
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  sx={{ 
                    color: 'text.primary',
                    fontSize: '1rem',
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  {getGreeting()}, {user?.firstName || user?.fullName || 'Teacher'}!
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  Welcome back to your dashboard.
                </Typography>
              </Box>
            </Box>

            {/* Right: Date/Time and Controls */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, sm: 2 },
                flexWrap: 'nowrap'
              }}
            >
              {/* Date and Time */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  background: theme.palette.mode === 'dark' ? '#1E1E1E' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  minWidth: 'fit-content'
                }}
              >
                <CalendarIcon size={16} color={theme.palette.text.secondary} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })} • {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Typography>
              </Box>

              {/* Theme Toggle */}
              <Box
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary'
                  }
                }}
              >
                <ThemeToggleButton />
              </Box>

              {/* Notification Bell */}
              <Box sx={{ position: 'relative' }} data-notification-dropdown>
                <IconButton
                  size="small"
                  onClick={handleNotificationClick}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#f3f4f6',
                      color: 'text.primary'
                    }
                  }}
                >
                  <BellIcon size={20} />
                </IconButton>
                {unreadNotifications > 0 && (
                  <Badge
                    badgeContent={unreadNotifications}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px'
                      }
                    }}
                  />
                )}
              </Box>

              {/* User Avatar */}
              <Avatar 
                src={user?.imageUrl} 
                alt="Profile" 
                onClick={handleProfileClick}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  border: '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#3b82f6',
                    transform: 'scale(1.05)'
                  }
                }} 
              >
                {user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || 'T'}
              </Avatar>
            </Box>
          </Box>

          {/* Notification Dropdown */}
          {notificationDropdownOpen && (
            <Box
              data-notification-dropdown
              sx={{
                position: 'absolute',
                top: '100%',
                right: { xs: 16, sm: 24, md: 32 },
                zIndex: 1000,
                width: 320,
                maxHeight: 400,
                background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                mt: 1
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#F8FAFC'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Notifications
                </Typography>
              </Box>

              {/* Notifications List */}
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {notificationsLoading ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <Box
                      key={notification.id || index}
                      onClick={() => handleNotificationItemClick(notification)}
                      sx={{
                        p: 2,
                        borderBottom: index < notifications.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#F8FAFC'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        {notification.title || 'Announcement'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 1 }}>
                        {notification.content?.substring(0, 100)}
                        {notification.content?.length > 100 ? '...' : ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(notification.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No notifications
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              {notifications.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#F8FAFC',
                    textAlign: 'center'
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedSection('announcements');
                      setNotificationDropdownOpen(false);
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    View All Announcements
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Menu Strip - Navigation Items */}
          <Box
            sx={{
              background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#0B1220',
              borderBottom: theme.palette.mode === 'dark' ? 'none' : '1px solid #0E1A30',
              px: { xs: 4, sm: 6, md: 8 },
              py: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              width: '100%'
            }}
          >
            {/* Left: Menu Items */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 6
              }}
            >
              {[
                { text: 'Dashboard', tab: 'dashboard', icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
                { text: 'Exams', tab: 'exams', icon: <BookIcon sx={{ fontSize: 18 }} /> },
                { text: 'Results', tab: 'results', icon: <BarChartIcon sx={{ fontSize: 18 }} /> },
                { text: 'Records', tab: 'records', icon: <GroupIcon sx={{ fontSize: 18 }} /> },
                { text: 'Messages', tab: 'messages', icon: <BellIcon size={18} /> },
                { text: 'Proctoring', tab: 'proctoring', icon: <SecurityIcon sx={{ fontSize: 18 }} /> },
                { text: 'Settings', tab: 'settings', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
                { text: 'Help', tab: 'help', icon: <HelpIcon sx={{ fontSize: 18 }} /> }
              ].map((item) => (
                <Box
                  key={item.text}
                  onClick={() => router.push(`/dashboard/teacher?tab=${item.tab}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to ${item.text} section`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/dashboard/teacher?tab=${item.tab}`);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: currentTab === item.tab ? '#FFFFFF' : '#E5E7EB',
                    borderBottom: currentTab === item.tab ? '2px solid #2563EB' : '2px solid transparent',
                    backgroundColor: currentTab === item.tab ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    minHeight: 40,
                    transition: 'all 0.2s ease',
                    border: currentTab === item.tab ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                    '&:hover': {
                      color: '#FFFFFF',
                      backgroundColor: currentTab === item.tab ? 'rgba(37, 99, 235, 0.2)' : '#2A2A2A',
                      borderBottomColor: currentTab === item.tab ? theme.palette.primary.main : theme.palette.primary.light,
                      border: currentTab === item.tab ? `1px solid ${theme.palette.primary.main}` : '1px solid #2A2A2A',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: '2px',
                      backgroundColor: 'rgba(37, 99, 235, 0.12)'
                    }
                  }}
                >
                  {item.icon}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: currentTab === item.tab ? 600 : 500,
                      letterSpacing: '0.025em',
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Mobile Menu Button */}
            <Box 
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center'
              }}
            >
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2A2A2A' : 'rgba(255,255,255,0.1)'
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: '2px'
                  }
                }}
              >
                <MenuIcon size={20} />
              </IconButton>
            </Box>

            {/* Right: Log Out Button */}
            <Button
              variant="contained"
              size="small"
              onClick={() => setLogoutDialogOpen(true)}
              startIcon={<LogOutIcon size={16} />}
              sx={{
                color: '#FFFFFF',
                backgroundColor: '#EF4444',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                px: 2,
                py: 0.75,
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#DC2626',
                  borderColor: '#DC2626',
                  color: '#FFFFFF'
                },
                '&:focus-visible': {
                  outline: `2px solid #EF4444`,
                  outlineOffset: '2px'
                }
              }}
            >
              Log Out
            </Button>
          </Box>
        </Box>

        {/* Content Container */}
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 py-6 space-y-6">

        {currentTab === 'dashboard' && (
          <>
            {/* KPI Cards - Row 1 */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Total Students
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={80} height={60} /> : studentCount}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Active Exams
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={60} height={60} /> : examCount}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BookIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Results Graded
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={80} height={60} /> : resultCount}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>

            {/* KPI Cards - Row 2 */}
            <Grid container spacing={3} mb={6}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Average Score
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={70} height={60} /> : `${performanceData.averageScore}%`}
                        </Typography>
                        <Box sx={{ mt: 1, width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={performanceData.averageScore} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.warning.main,
                                borderRadius: 3
                              }
                            }} 
                          />
                        </Box>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <GradeIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Passing Rate
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={70} height={60} /> : `${performanceData.passRate}%`}
                        </Typography>
                        <Box sx={{ mt: 1, width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={performanceData.passRate} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.success.main,
                                borderRadius: 3
                              }
                            }} 
                          />
                        </Box>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Announcements
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {statsLoading ? <Skeleton variant="text" width={60} height={60} /> : announcementCount}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PaperPlaneIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>

            {/* Recent Results Table */}
            <StyledCard sx={{ mb: 6 }}>
              <CardHeader
                title="Recent Results"
                subheader="Latest submissions from your students"
                titleTypographyProps={{ 
                  variant: 'h6', 
                  fontWeight: 700, 
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary',
                  fontSize: '1.25rem'
                }}
                subheaderTypographyProps={{ 
                  variant: 'body2', 
                  color: theme.palette.mode === 'dark' ? '#E5E7EB' : 'text.secondary',
                  fontSize: '0.875rem'
                }}
                sx={{ 
                  pb: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : 'transparent'
                }}
              />
              <TableContainer sx={{ 
                overflow: 'hidden', 
                borderRadius: '16px', 
                border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#E6E8EC'}`, 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#FBFBFD' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? 'text.primary' : '#0F172A', py: 2 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? 'text.primary' : '#0F172A', py: 2 }}>Exam</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? 'text.primary' : '#0F172A', py: 2 }}>Score</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? 'text.primary' : '#0F172A', py: 2 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ py: 2 }}><Skeleton variant="text" width={120} /></TableCell>
                          <TableCell sx={{ py: 2 }}><Skeleton variant="text" width={150} /></TableCell>
                          <TableCell sx={{ py: 2 }}><Skeleton variant="text" width={60} /></TableCell>
                          <TableCell sx={{ py: 2 }}><Skeleton variant="text" width={80} /></TableCell>
                        </TableRow>
                      ))
                    ) : recentResults.length > 0 ? (
                      recentResults.map((row, idx) => {
                        const studentName = row.user_name || '-';
                        const examName = row.quizzes?.quiz_title || '-';
                        const quizId = row.quiz_id || row.quizzes?.id;
                        const questions = questionsMap && questionsMap[quizId] ? questionsMap[quizId] : [];
                        const totalQuestions = questions.length > 0 ? questions.length : (row.total_questions || 0);
                        // Always define answersObj at the top
                        const answersObj = typeof row.answers === 'string' ? JSON.parse(row.answers || '{}') : row.answers || {};
                        // Recalculate marks if row.score or row.quizzes?.total_marks is missing or zero
                        let marksObtained = typeof row.score === 'number' && row.score > 0 ? row.score : 0;
                        let totalMarks = typeof row.quizzes?.total_marks === 'number' && row.quizzes.total_marks > 0 ? row.quizzes.total_marks : 0;
                        if (totalMarks === 0 && Array.isArray(questions) && questions.length > 0) {
                          totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                        }
                        if (marksObtained === 0 || totalMarks === 0) {
                          // Define answersObj inside this block so it is in scope
                          const answersObj = typeof row.answers === 'string' ? JSON.parse(row.answers || '{}') : row.answers || {};
                          marksObtained = 0;
                          totalMarks = 0;
                          questions.forEach((q: any, idx: number) => {
                            const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options || [];
                            const correctAnswersArr = typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers || '[]') : q.correct_answers;
                            // Try both by question ID and by index
                            let userAns = (answersObj && (answersObj[String(q.id)] ?? answersObj[q.id] ?? answersObj[idx])) || [];
                            let userIndices = Array.isArray(userAns) ? userAns : [];
                            if (userIndices.length && typeof userIndices[0] === 'string' && Array.isArray(options)) {
                              userIndices = userIndices.map((val: string) => {
                                const idx2: number = options.findIndex((opt: any) => opt.text === val);
                                return idx2 !== -1 ? idx2 : null;
                              }).filter((idx2: number | null) => idx2 !== null);
                            }
                            let correctIndices: number[] = [];
                            if (Array.isArray(options) && options.length > 0) {
                              correctIndices = options.map((opt: any, idx: number) => (opt.isCorrect ? idx : null)).filter((idx: number | null) => idx !== null);
                            } else if (Array.isArray(correctAnswersArr)) {
                              correctIndices = correctAnswersArr;
                            }
                            const questionMarks = q.marks || 1;
                            totalMarks += questionMarks;
                            const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
                            if (correctSelected === correctIndices.length && userIndices.length === correctIndices.length) {
                              marksObtained += questionMarks;
                            }
                          });
                        }
                        const safeMarksObtained = isNaN(marksObtained) ? 0 : marksObtained;
                        const safeTotalMarks = isNaN(totalMarks) ? 0 : totalMarks;
                        const percentage = safeTotalMarks > 0 ? ((safeMarksObtained / safeTotalMarks) * 100).toFixed(2) : '0.00';
                        return (
                        <TableRow 
                          key={idx} 
                          hover 
                          sx={{ 
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? (idx % 2 === 0 ? '#1E1E1E' : '#2A2A2A')
                              : (idx % 2 === 0 ? '#FFFFFF' : '#FBFBFD'),
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              background: theme.palette.mode === 'dark' ? '#2E2E2E' : '#F5F7FB',
                              transform: 'scale(1.001)'
                            },
                            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#EDEFF2'}`
                          }}
                        >
                          <TableCell sx={{ py: 2, fontWeight: 500, color: theme.palette.mode === 'dark' ? 'text.primary' : '#111827' }}>
                            {studentName}
                          </TableCell>
                          <TableCell sx={{ py: 2, color: theme.palette.mode === 'dark' ? 'text.primary' : '#111827' }}>
                            {examName}
                          </TableCell>
                          <TableCell sx={{ py: 2, textAlign: 'right' }}>
                            <Typography 
                              variant="body1" 
                              fontWeight={700} 
                              sx={{
                                color: parseFloat(percentage) >= 80 
                                  ? '#16A34A' // Success green
                                  : parseFloat(percentage) >= 50 
                                    ? '#F59E0B' // Warning yellow
                                    : '#DC2626' // Danger red
                              }}
                            >
                              {percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2, color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280', textAlign: 'right' }}>
                            {row.submitted_at ? format(new Date(row.submitted_at), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                        </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Box textAlign="center">
                            <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                              No recent results found
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                              Student submissions will appear here once they complete quizzes
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={3} textAlign="right" sx={{ px: 3, pb: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/dashboard/teacher?tab=results')}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    borderColor: '#d1d5db',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      background: 'rgba(59, 130, 246, 0.04)'
                    }
                  }}
                >
                  View All Results
                </Button>
              </Box>
            </StyledCard>

            {/* Exams Section */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledCard>
                  <CardHeader
                    title="Manage Quizzes"
                    subheader="Create, edit, and monitor your OctoMind assessments"
                    titleTypographyProps={{ 
                      variant: 'h6', 
                      fontWeight: 700, 
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary',
                      fontSize: '1.25rem'
                    }}
                    subheaderTypographyProps={{ 
                      variant: 'body2', 
                      color: theme.palette.mode === 'dark' ? '#E5E7EB' : 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                    sx={{ 
                      pb: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : 'transparent'
                    }}
                  />
                  <TableContainer>
                                      <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ background: theme.palette.mode === 'dark' ? '#2A2A2A' : '#f9fafb' }}>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Exam No.</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Exam Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Description</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Questions</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Start Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>End Time</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary', py: 2 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                      <TableBody>
                        {examsLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell>
                          </TableRow>
                        ) : exams.length > 0 ? (
                          paginatedDashboardExams.map((row, idx) => (
                            <TableRow 
                              key={row.id} 
                              hover 
                              sx={{ 
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? (idx % 2 === 0 ? '#1E1E1E' : '#242424')
                                  : (idx % 2 === 0 ? 'background.paper' : '#f8fafc'),
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  background: theme.palette.mode === 'dark' ? '#2E2E2E' : '#f0f4f8',
                                  transform: 'scale(1.001)'
                                },
                                borderBottom: `1px solid ${theme.palette.divider}`
                              }}
                            >
                              <TableCell align="center" sx={{ py: 2, color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#6b7280', fontWeight: 500 }}>
                                {(dashboardExamPage - 1) * dashboardExamsPerPage + idx + 1}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1a1a1a', py: 2 }}>{row.quiz_title}</TableCell>
                              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#6b7280', py: 2 }}>{row.description || 'No description'}</TableCell>
                              <TableCell align="center" sx={{ py: 2, color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#374151', fontWeight: 500 }}>
                                {row.questions_count ?? '-'}
                              </TableCell>
                              <TableCell sx={{ py: 2, color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#6b7280' }}>
                                {row.start_time ? format(new Date(row.start_time), 'MMM dd, HH:mm') : '-'}
                              </TableCell>
                              <TableCell sx={{ py: 2, color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#6b7280' }}>
                                {row.end_time ? format(new Date(row.end_time), 'MMM dd, HH:mm') : '-'}
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2 }}>
                                <Box display="flex" gap={1} justifyContent="center">
                                  <Tooltip title="Edit Quiz">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditExam(row.id, row.nq)}
                                      sx={{ 
                                        color: theme.palette.mode === 'dark' ? '#60A5FA' : '#3b82f6',
                                        '&:hover': { 
                                          background: theme.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Preview Quiz">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => router.push(`/preview-quiz/${row.id}`)}
                                      sx={{ 
                                        color: theme.palette.mode === 'dark' ? '#34D399' : '#10b981',
                                        '&:hover': { 
                                          background: theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Quiz">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleDeleteExam(row.id)}
                                      sx={{ 
                                        color: theme.palette.mode === 'dark' ? '#F87171' : '#ef4444',
                                        '&:hover': { 
                                          background: theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                              <Box textAlign="center">
                                <BookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                  No exams found
                                </Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
                                  Create your first quiz to get started
                                </Typography>
                                <Button
                                  variant="contained"
                                  startIcon={<AddIcon />}
                                  onClick={() => router.push('/create-quiz')}
                                  sx={{
                                    borderRadius: '12px',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                      transform: 'translateY(-1px)'
                                    }
                                  }}
                                >
                                  Create Quiz
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {dashboardPageCount > 1 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <TablePagination
                        component="div"
                        count={exams.length}
                        page={dashboardExamPage - 1}
                        onPageChange={(event, newPage) => setDashboardExamPage(newPage + 1)}
                        rowsPerPage={dashboardExamsPerPage}
                        onRowsPerPageChange={e => {
                          setDashboardExamsPerPage(parseInt(e.target.value, 10));
                          setDashboardExamPage(1);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage={''}
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </StyledCard>
              </Grid>
            </Grid>
          </>
        )}
        {currentTab === 'exams' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Exams Section</Typography>
            <ExamsSection handleDeleteExam={handleDeleteExam} />
          </Box>
        )}
        {currentTab === 'results' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Results Section</Typography>
            <ExamResultsTable
              results={results}
              students={students}
              quizzes={quizzes}
              questionsMap={questionsMap}
              sectionNames={sectionNames}
            />
          </Box>
        )}
        {currentTab === 'records' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Records Section</Typography>
            <RecordsSection 
              key={recordsKey}
              onDeleteStudent={(student) => {
                setStudentToDelete(student);
                setStudentDeleteDialogOpen(true);
              }}
              onStudentDeleted={(deletedStudentId) => {
                // This will be called after successful deletion
                console.log('Student deleted:', deletedStudentId);
              }}
            />
          </Box>
        )}
        {currentTab === 'messages' && user && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Announcements Section</Typography>
            <AnnouncementsSection user={user} />
          </Box>
        )}
        {currentTab === 'proctoring' && user && (
          <Box>
            <ProctoringSection user={user} />
          </Box>
        )}
        {currentTab === 'settings' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Settings Section</Typography>
            <TeacherSettings user={user} />
          </Box>
        )}
        {currentTab === 'analytics' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>Analytics & Insights</Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2">
                Debug: Current tab: {currentTab}, Results: {results.length}, PerformanceData: {JSON.stringify(performanceData)}
              </Typography>
            </Box>
            <EnhancedAnalytics 
              results={results}
              quizzes={quizzes}
              students={students}
              performanceData={performanceData}
            />
          </Box>
        )}
        {currentTab === 'help' && (
          helpContent
        )}
        
        {/* Footer */}
        <Box sx={{ 
          mt: 8, 
          pt: 6, 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}>
            {/* Left: Portal Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #3B82F6'
              }}>
                <img 
                  src="/Logo.svg" 
                  alt="OctoMind Logo" 
                  style={{ 
                    width: '24px', 
                    height: '24px',
                    filter: 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
                  }} 
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                OctoMind
              </Typography>
            </Box>
            
            {/* Center: Copyright */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.disabled',
                fontSize: '0.875rem',
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              © {new Date().getFullYear()} OctoMind. All rights reserved.
            </Typography>
            
            {/* Right: Version/Support */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.disabled',
                fontSize: '0.875rem',
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              v1.0.0
            </Typography>
          </Box>
        </Box>
        </div>
      </Box>

      {/* Custom Delete Quiz Confirmation Dialog */}
      <Dialog open={deleteQuizDialogOpen} onClose={handleDeleteQuizCancel}>
        <DialogTitle>Delete Quiz?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete this quiz?
            {quizToDeleteId && (
              <><br /><b>Quiz:</b> {exams.find(q => q.id === quizToDeleteId)?.quiz_title || 'Untitled'}</>
            )}
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Deleting this quiz will also remove <b>all associated questions</b> and <b>all student attempts/results</b> for this quiz. This action <b>cannot be undone</b>.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteQuizCancel} disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDeleteQuizConfirm} color="error" variant="contained" disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to log out?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will need to sign in again to access your dashboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLogoutDialogOpen(false)} 
            color="primary"
            sx={{
              color: theme.palette.mode === 'dark' ? '#E5E7EB' : 'inherit',
              borderColor: theme.palette.mode === 'dark' ? '#2A2A2A' : 'inherit',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#2A2A2A' : 'inherit'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLogoutDialogOpen(false);
              setShowLogoutSplash(true);
            }}
            color="error"
            variant="contained"
            sx={{
              backgroundColor: theme.palette.error.main,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: theme.palette.error.dark
              }
            }}
          >
            Yes, Log me out
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={studentDeleteDialogOpen} onClose={() => setStudentDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <b>{studentToDelete?.fname} {studentToDelete?.lname}</b> (<b>{studentToDelete?.email}</b>)?
          </Typography>
          <Alert severity="warning">
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteStudent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {showLogoutSplash && (
        <LogoutSplash
          name={user?.firstName || user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'User'}
          onComplete={() => signOut({ redirectUrl: "/sign-in" })}
        />
      )}
    </Box>
  );
}

function AnnouncementForm({ fname }: { fname: string }) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/add-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fname, feedback }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Error');
    else {
      setSuccess('Message sent successfully!');
      setFeedback('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="fname" value={fname} />
      <Typography fontWeight={600} mb={1}>
        Type your announcement
      </Typography>
      <TextField
        className="msg"
        id="feedback"
        name="feedback"
        multiline
        minRows={4}
        maxRows={8}
        fullWidth
        required
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        inputProps={{ minLength: 4, maxLength: 100 }}
        placeholder="Message"
        sx={{ mb: 3, background: theme.palette.background.paper, borderRadius: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        startIcon={<SendIcon />}
        sx={{ width: '100%', fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 2 }}
      >
        Send
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </form>
  );
}

function ExamResultsTable({
  results,
  students,
  quizzes,
  questionsMap,
  sectionNames
}: {
  results: any[],
  students: any[],
  quizzes: any[],
  questionsMap: Record<number, any[]>,
  sectionNames: Record<number, string>
}) {
  // Shared function to calculate marks consistently
  const calculateQuestionMarks = (q: any, userIndices: number[], correctIndices: number[]) => {
    const questionMarks = q.marks || 1;
    
    if (correctIndices.length > 1) {
      // Multi-select question: if at least 1 correct answer is selected, give full marks
      const correctAnswersSelected = userIndices.filter((idx: number) => correctIndices.includes(idx)).length;
      return correctAnswersSelected > 0 ? questionMarks : 0;
    } else {
      // Single-select question: all-or-nothing
      const isCorrect = userIndices.length === correctIndices.length &&
        userIndices.every((idx: number) => correctIndices.includes(idx)) &&
        correctIndices.every((idx: number) => userIndices.includes(idx));
      return isCorrect ? questionMarks : 0;
    }
  };
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  // New state for details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  const handleOpenDetails = (result: any) => {
    setSelectedResult(result);
    setDetailsDialogOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedResult(null);
  };

  // Filtering logic
  const filteredResults = results.filter((row: any) => {
    let match = true;
    if (selectedQuiz && String(row.quiz_id) !== String(selectedQuiz)) match = false;
    if (selectedStudent && row.user_name !== selectedStudent) match = false;
    if (selectedDate) {
      const submitDate = dayjs(row.submitted_at).format('YYYY-MM-DD');
      if (submitDate !== selectedDate.format('YYYY-MM-DD')) match = false;
    }
    return match;
  });

  const paginatedResults = filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" mb={2}>All Student Results</Typography>
        {/* Filters */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <TextField
            select
            label="Exam"
            value={selectedQuiz}
            onChange={e => { setSelectedQuiz(e.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Exams</MenuItem>
            {quizzes.map(q => (
              <MenuItem key={q.id} value={String(q.id)}>{q.quiz_title}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Student"
            value={selectedStudent}
            onChange={e => { setSelectedStudent(e.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Students</MenuItem>
            {students.map((s: string) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Submit Date"
            value={selectedDate}
            onChange={date => { setSelectedDate(date); setPage(0); }}
            slotProps={{ textField: { size: 'medium', sx: { minWidth: 180 } } }}
          />
          {(selectedQuiz || selectedStudent || selectedDate) && (
            <Button onClick={() => { setSelectedQuiz(''); setSelectedStudent(''); setSelectedDate(null); setPage(0); }} variant="outlined">Clear Filters</Button>
          )}
        </Box>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {filteredResults.length > 0 ? (
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 160, pl: 3 }}>Quiz Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 140 }}>Student Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 90 }}>Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 120 }}>Started At</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 120 }}>End Time</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 110 }}>Duration (min)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 140 }}>Marked for Review</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem', minWidth: 80 }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map((row, i) => {
                  const startedAt = row.start_time ? new Date(row.start_time) : null;
                  const submittedAt = row.submitted_at ? new Date(row.submitted_at) : null;
                  // Accurate calculation logic (copied from student result page)
                  const questions = questionsMap[row.quiz_id] || [];
                  const totalQuestions = questions.length;
                  let correctAnswers = 0;
                  let marksObtained = 0;
                  let totalMarks = 0;
                  if (totalMarks === 0 && Array.isArray(questions) && questions.length > 0) {
                    totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                  }
                  if (marksObtained === 0 || totalMarks === 0) {
                    // Define answersObj inside this block so it is in scope
                    const answersObj = typeof row.answers === 'string' ? JSON.parse(row.answers || '{}') : row.answers || {};
                    marksObtained = 0;
                    totalMarks = 0;
                    questions.forEach((q: any, idx: number) => {
                      const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options || [];
                      const correctAnswersArr = typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers || '[]') : q.correct_answers;
                      // Try both by question ID and by index
                      let userAns = (answersObj && (answersObj[String(q.id)] ?? answersObj[q.id] ?? answersObj[idx])) || [];
                    let userIndices = Array.isArray(userAns) ? userAns : [];
                      if (userIndices.length && typeof userIndices[0] === 'string' && Array.isArray(options)) {
                        userIndices = userIndices.map((val: string) => {
                          const idx2: number = options.findIndex((opt: any) => opt.text === val);
                          return idx2 !== -1 ? idx2 : null;
                        }).filter((idx2: number | null) => idx2 !== null);
                    }
                    let correctIndices: number[] = [];
                      if (Array.isArray(options) && options.length > 0) {
                        correctIndices = options.map((opt: any, idx: number) => (opt.isCorrect ? idx : null)).filter((idx: number | null) => idx !== null);
                      } else if (Array.isArray(correctAnswersArr)) {
                        correctIndices = correctAnswersArr;
                    }
                    const questionMarks = q.marks || 1;
                    totalMarks += questionMarks;
                    const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
                    if (correctSelected === correctIndices.length && userIndices.length === correctIndices.length) {
                      marksObtained += questionMarks;
                    }
                  });
                  }
                  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
                  let duration = '-';
                  if (
                    startedAt &&
                    submittedAt &&
                    !isNaN(startedAt.getTime()) &&
                    !isNaN(submittedAt.getTime()) &&
                    submittedAt > startedAt
                  ) {
                    duration = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 60000).toString();
                  }
                  const safeMarksObtained = isNaN(marksObtained) ? 0 : marksObtained;
                  const safeTotalMarks = isNaN(totalMarks) ? 0 : totalMarks;
                  return (
                    <TableRow key={row.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: theme => theme.palette.action.hover } }}>
                      <TableCell sx={{ pl: 3, fontWeight: 600, fontSize: '0.98rem', verticalAlign: 'middle' }}>{row.quizzes?.quiz_title || 'Untitled Quiz'}</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.98rem', verticalAlign: 'middle' }}>{row.user_name}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.98rem', verticalAlign: 'middle' }}>{(typeof row.score === 'number' ? row.score : 0)}/{totalMarks}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.98rem', verticalAlign: 'middle' }}>{startedAt && !isNaN(startedAt.getTime()) ? startedAt.toLocaleString() : '-'}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.98rem', verticalAlign: 'middle' }}>{submittedAt && !isNaN(submittedAt.getTime()) ? submittedAt.toLocaleString() : '-'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: duration === '-' ? 'text.disabled' : 'primary.main', fontSize: '0.98rem', verticalAlign: 'middle' }}>{duration}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.98rem', verticalAlign: 'middle' }}>
                        {row.marked_for_review && Object.keys(row.marked_for_review).filter(qid => row.marked_for_review[qid]).length > 0
                          ? Object.keys(row.marked_for_review).filter(qid => row.marked_for_review[qid]).map(qid => `Q${Number(qid) + 1}`).join(', ')
                          : 'None'}
                      </TableCell>
                      {/* Details button */}
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                        <Tooltip title="View Details">
                          <IconButton color="primary" onClick={() => handleOpenDetails(row)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No results found.</Typography>
        )}
        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          <DialogTitle>Attempt Details</DialogTitle>
          <DialogContent dividers>
            {selectedResult ? (
              <Box>
                {/* Group questions by section name and render details as before */}
                {(() => {
                  const questionsBySection: Record<string, any[]> = {};
                  (questionsMap[selectedResult.quiz_id] || []).forEach((q: any) => {
                    let section = 'General';
                    if (selectedResult.sections && Object.keys(selectedResult.sections).length > 0) {
                      section = selectedResult.sections[q.id] || 'General';
                    } else if (q.section_id && sectionNames && Object.keys(sectionNames).length > 0) {
                      section = sectionNames[q.section_id] || `Section ${q.section_id}`;
                    }
                    if (!questionsBySection[section]) questionsBySection[section] = [];
                    questionsBySection[section].push(q);
                  });
                  const sectionMarks: Record<string, { obtained: number; total: number }> = {};
                  let overallObtained = 0;
                  let overallTotal = 0;
                  Object.entries(questionsBySection).forEach(([section, qs]) => {
                    let obtained = 0;
                    let total = 0;
                    (qs as any[]).forEach((q: any) => {
                      // Parse answers robustly
                      let answers = selectedResult.answers;
                      if (typeof answers === 'string') {
                        try {
                          answers = JSON.parse(answers);
                        } catch {
                          answers = {};
                        }
                      }
                      
                      // Parse options robustly
                      let options = q.options;
                      if (typeof options === 'string') {
                        try {
                          options = JSON.parse(options);
                        } catch {
                          options = [];
                        }
                      }
                      
                      // Parse correct_answers robustly
                      let correctAnswers = q.correct_answers;
                      if (typeof correctAnswers === 'string') {
                        try {
                          correctAnswers = JSON.parse(correctAnswers);
                        } catch {
                          correctAnswers = [];
                        }
                      }
                      
                      // Determine correct indices
                      let correctIndices: number[] = [];
                      if (Array.isArray(options) && options.length > 0) {
                        correctIndices = options.map((opt: any, i: number) => (opt.isCorrect ? i : null)).filter((i: number | null) => i !== null);
                      } else if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
                        correctIndices = correctAnswers;
                      }
                      
                      // Student's answer indices
                      let userIndices = Array.isArray(answers?.[q.id]) ? answers[q.id] : [];
                      if (userIndices.length && typeof userIndices[0] === 'string' && Array.isArray(options)) {
                        userIndices = userIndices.map((val: string) => {
                          const idx2: number = options.findIndex((opt: any) => opt.text === val);
                          return idx2 !== -1 ? idx2 : null;
                        }).filter((idx2: number | null) => idx2 !== null);
                      }
                      
                      const questionMarks = q.marks || 1;
                      total += questionMarks;
                      overallTotal += questionMarks;
                      
                      // Use shared function for consistent marks calculation
                      const obtainedMarks = calculateQuestionMarks(q, userIndices, correctIndices);
                      
                      obtained += obtainedMarks;
                      overallObtained += obtainedMarks;
                    });
                    sectionMarks[section] = { obtained: Math.round(obtained * 100) / 100, total };
                  });
                  const candidateName = selectedResult.user_name || 'Unknown Candidate';
                  const quizTitle = selectedResult.quizzes?.quiz_title || 'Untitled Quiz';
                  const overallPercent = overallTotal > 0 ? Math.round((overallObtained / overallTotal) * 100) : 0;
                  return (
                    <Box mb={3}>
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 3, background: theme.palette.mode === 'dark' ? 'linear-gradient(120deg, rgba(30, 41, 59, 0.8) 60%, rgba(51, 65, 85, 0.6) 100%)' : 'linear-gradient(120deg, #f8fafc 60%, #e3e8ef 100%)', boxShadow: theme.palette.mode === 'dark' ? '0 4px 24px 0 rgba(0,0,0,0.3)' : '0 4px 24px 0 rgba(30,64,175,0.07)' }}>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2} gap={2}>
                          <Box>
                            <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mb: 0.5, letterSpacing: 0.5 }}>
                              {candidateName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                              Quiz: {quizTitle}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6" fontWeight={700} color="success.main">
                              Total Score: {Math.round(overallObtained * 100) / 100} / {overallTotal}
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight={700}>
                              Percentage: {overallPercent}%
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" fontWeight={700} mb={2} sx={{ letterSpacing: 0.5 }}>
                          Section-wise Marks
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          {Object.entries(sectionMarks)
                            .filter(([section]) => section && section !== 'General')
                            .map(([section, marks]) => (
                              <Box
                                key={section}
                                sx={{
                                  background: theme.palette.mode === 'dark' ? 'linear-gradient(120deg, rgba(30, 41, 59, 0.6) 60%, rgba(51, 65, 85, 0.4) 100%)' : 'linear-gradient(120deg, #e3f2fd 60%, #f1f8e9 100%)',
                                  borderRadius: 3,
                                  boxShadow: 3,
                                  p: 2.5,
                                  minWidth: 170,
                                  mb: 1.5,
                                  mr: 1.5,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  border: '1.5px solid #90caf9',
                                  transition: 'box-shadow 0.2s',
                                  '&:hover': {
                                    boxShadow: 6,
                                    borderColor: '#1976d2',
                                  },
                                }}
                              >
                                <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ fontSize: 18, mb: 0.5, letterSpacing: 0.3 }}>
                                  {section}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="success.main" sx={{ fontSize: 28, mb: 0.5 }}>
                                  {marks.obtained} <span style={{ color: '#888', fontWeight: 500, fontSize: 20 }}>/ {marks.total}</span>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
                                  Marks Scored
                                </Typography>
                              </Box>
                            ))}
                        </Stack>
                      </Paper>
                    </Box>
                  );
                })()}
                {/* Questions List */}
                <Stack spacing={3} mt={2}>
                  {Array.isArray(questionsMap[selectedResult.quiz_id]) && questionsMap[selectedResult.quiz_id].length > 0 ? (
                    questionsMap[selectedResult.quiz_id].map((q: any, idx: number) => {
                      // Parse answers robustly
                      let answers = selectedResult.answers;
                      if (typeof answers === 'string') {
                        try {
                          answers = JSON.parse(answers);
                        } catch {
                          answers = {};
                        }
                      }
                      
                      // Parse options robustly
                      let options = q.options;
                      if (typeof options === 'string') {
                        try {
                          options = JSON.parse(options);
                        } catch {
                          options = [];
                        }
                      }
                      
                      // Parse correct_answers robustly
                      let correctAnswers = q.correct_answers;
                      if (typeof correctAnswers === 'string') {
                        try {
                          correctAnswers = JSON.parse(correctAnswers);
                        } catch {
                          correctAnswers = [];
                        }
                      }
                      
                      // Determine correct indices
                      let correctIndices: number[] = [];
                      if (Array.isArray(options) && options.length > 0) {
                        correctIndices = options.map((opt: any, i: number) => (opt.isCorrect ? i : null)).filter((i: number | null) => i !== null);
                      } else if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
                        correctIndices = correctAnswers;
                      }
                      
                      // Student's answer indices
                      let userIndices = Array.isArray(answers?.[q.id]) ? answers[q.id] : [];
                      if (userIndices.length && typeof userIndices[0] === 'string' && Array.isArray(options)) {
                        userIndices = userIndices.map((val: string) => {
                          const idx2: number = options.findIndex((opt: any) => opt.text === val);
                          return idx2 !== -1 ? idx2 : null;
                        }).filter((idx2: number | null) => idx2 !== null);
                      }
                      
                      // Calculate marks for this question using shared function
                      const questionMarks = q.marks || 1;
                      const obtainedMarks = calculateQuestionMarks(q, userIndices, correctIndices);
                      
                      // Determine if question is completely correct for visual display
                      const isCorrect = userIndices.length === correctIndices.length &&
                        userIndices.every((idx: number) => correctIndices.includes(idx)) &&
                        correctIndices.every((idx: number) => userIndices.includes(idx));
                      return (
                        <Card key={q.id} sx={{
                          mb: 2,
                          borderRadius: 3,
                          borderLeft: `6px solid ${isCorrect ? '#43a047' : '#d32f2f'}`,
                          boxShadow: 2,
                          background: isCorrect ? 'rgba(76, 175, 80, 0.07)' : 'rgba(244, 67, 54, 0.07)',
                          p: 2.5,
                        }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight={700} color={isCorrect ? 'success.main' : 'error.main'}>
                              Q{idx + 1}:
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600} ml={2} color="text.primary">
                              {q.question_text}
                            </Typography>
                          </Box>
                          {/* Question Type Indicator */}
                          <Box ml={2} mb={1}>
                            <Chip 
                              label={correctIndices.length > 1 ? `Multi-select (${correctIndices.length} correct)` : 'Single-select'} 
                              size="small" 
                              color={correctIndices.length > 1 ? 'secondary' : 'primary'}
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.75rem',
                                bgcolor: correctIndices.length > 1 ? '#e3f2fd' : '#f3e5f5',
                                color: correctIndices.length > 1 ? '#1565c0' : '#7b1fa2'
                              }}
                            />
                          </Box>
                          {/* Options List */}
                          <Box ml={2} mb={1}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary" mb={0.5}>
                              Options:
                            </Typography>
                            <Stack spacing={1}>
                              {Array.isArray(options) && options.length > 0 ? (
                                options.map((opt: any, optIdx: number) => {
                                  const isOptionCorrect = correctIndices.includes(optIdx);
                                  const isOptionSelected = userIndices.includes(optIdx);
                                  return (
                                    <Chip
                                      key={optIdx}
                                      label={opt.text}
                                      color={isOptionCorrect ? 'success' : isOptionSelected ? 'primary' : 'default'}
                                      variant={isOptionCorrect || isOptionSelected ? 'filled' : 'outlined'}
                                      sx={{
                                        fontWeight: isOptionCorrect ? 700 : 500,
                                        fontSize: '1rem',
                                        opacity: 1,
                                        minWidth: 80,
                                        letterSpacing: 0.1,
                                        border: isOptionCorrect
                                          ? '2px solid #43a047'
                                          : isOptionSelected
                                          ? '2px solid #1565c0'
                                          : undefined,
                                        color: isOptionCorrect
                                          ? '#2e7d32'
                                          : isOptionSelected
                                          ? '#1565c0'
                                          : undefined,
                                        background: isOptionCorrect
                                          ? 'rgba(46, 125, 50, 0.12)'
                                          : isOptionSelected
                                          ? 'rgba(21, 101, 192, 0.12)'
                                          : undefined,
                                        mr: 1,
                                        mb: 0.5,
                                      }}
                                      icon={isOptionCorrect ? <CheckCircleIcon sx={{ color: '#2e7d32' }} /> : isOptionSelected ? <VisibilityIcon sx={{ color: '#1565c0' }} /> : undefined}
                                    />
                                  );
                                })
                              ) : (
                                <Typography variant="body2" color="error.main">No options found for this question.</Typography>
                              )}
                            </Stack>
                          </Box>
                          {/* Your Answer */}
                          <Box ml={2} mb={1}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              Your Answer:
                            </Typography>
                            {userIndices.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {userIndices.map((ansIdx: number, i: number) => (
                                  <li key={i} style={{ color: correctIndices.includes(ansIdx) ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                                    {Array.isArray(options) && options[ansIdx] ? options[ansIdx].text : 'N/A'}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Box sx={{ 
                                p: 1.5, 
                                borderRadius: 2, 
                                bgcolor: '#fff3cd', 
                                border: '1px solid #ffeaa7',
                                mt: 0.5
                              }}>
                                <Typography variant="body2" color="#856404" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span role="img" aria-label="warning" style={{ fontSize: 16 }}>⚠️</span>
                                  No option was selected for this question
                                </Typography>
                                <Typography variant="caption" color="#856404" sx={{ mt: 0.5, display: 'block' }}>
                                  The student left this question unanswered
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {/* Correct Answer */}
                          <Box ml={2}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              Correct Answer{Array.isArray(correctAnswers) && correctAnswers.length > 1 ? 's' : ''}:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {Array.isArray(correctAnswers) && correctAnswers.length > 0 && Array.isArray(options) ? (
                                correctAnswers.map((ans: number | string, i: number) => {
                                  // If ans is a number and in bounds, show the text
                                  if (typeof ans === 'number' && options[ans]) {
                                    return (
                                      <li key={i} style={{ color: '#2e7d32', fontWeight: 600 }}>
                                        {options[ans].text}
                                      </li>
                                    );
                                  }
                                  // If ans is a string, try to find the option with that text
                                  if (typeof ans === 'string') {
                                    const found = options.find((opt: any) => opt.text === ans);
                                    return (
                                      <li key={i} style={{ color: '#2e7d32', fontWeight: 600 }}>
                                        {found ? found.text : ans}
                                      </li>
                                    );
                                  }
                                  return (
                                    <li key={i} style={{ color: '#2e7d32', fontWeight: 600 }}>
                                      N/A
                                    </li>
                                  );
                                })
                              ) : (
                                <li style={{ color: '#2e7d32', fontWeight: 600 }}>N/A</li>
                              )}
                            </ul>
                            {/* Question Marks */}
                            <Box ml={2} mt={1}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: obtainedMarks > 0 ? '#e8f5e8' : '#ffebee',
                                border: `1px solid ${obtainedMarks > 0 ? '#c8e6c9' : '#ffcdd2'}`
                              }}>
                                <Typography variant="body2" fontWeight={700} color={obtainedMarks > 0 ? 'success.main' : 'error.main'}>
                                  Marks: {obtainedMarks} / {questionMarks}
                                </Typography>
                                {obtainedMarks > 0 && (
                                  <Chip 
                                    label="✓ Correct" 
                                    size="small" 
                                    color="success"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                  />
                                )}
                                {obtainedMarks === 0 && userIndices.length > 0 && (
                                  <Chip 
                                    label="✗ Incorrect" 
                                    size="small" 
                                    color="error"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                  />
                                )}
                                {obtainedMarks === 0 && userIndices.length === 0 && (
                                  <Chip 
                                    label="⏭️ Skipped" 
                                    size="small" 
                                    color="warning"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                            {q.explanation && (
                              <Box ml={2} mt={1}>
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  Explanation: {q.explanation}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      );
                    })
                  ) : (
                    <Typography color="text.secondary">No questions found for this quiz.</Typography>
                  )}
                </Stack>
              </Box>
            ) : (
              <Typography color="text.secondary">No attempt selected.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails} variant="outlined">Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </LocalizationProvider>
  );
}

function RecordsSection({ onDeleteStudent, onStudentDeleted }: { onDeleteStudent: (student: any) => void, onStudentDeleted: (deletedStudentId: number) => void }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: 'student',
    username: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const theme = useTheme();

  // Password validation functions
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = validatePassword(form.password);
  
  // Calculate password strength
  const getPasswordStrength = () => {
    const validations = Object.values(passwordValidation);
    const metRequirements = validations.filter(Boolean).length;
    const totalRequirements = validations.length;
    const percentage = (metRequirements / totalRequirements) * 100;
    
    if (percentage === 100) return { strength: 'Strong', color: theme.palette.success.main, width: '100%' };
    if (percentage >= 80) return { strength: 'Good', color: theme.palette.warning.main, width: '80%' };
    if (percentage >= 60) return { strength: 'Fair', color: theme.palette.warning.dark, width: '60%' };
    if (percentage >= 40) return { strength: 'Weak', color: theme.palette.error.light, width: '40%' };
    return { strength: 'Very Weak', color: theme.palette.error.main, width: '20%' };
  };
  
  const passwordStrength = getPasswordStrength();

  // Fetch Clerk users
  useEffect(() => {
    async function fetchClerkUsers() {
    setLoading(true);
    setError('');
      try {
        const res = await fetch('/api/clerk-users?limit=1000');
    const data = await res.json();
        // Only show users with role === 'student'
        setStudents(Array.isArray(data) ? data.filter((u: any) => u.role === 'student') : []);
      } catch (err) {
        setError('Failed to fetch students from Clerk.');
      } finally {
    setLoading(false);
      }
    }
    fetchClerkUsers();
  }, []);

  // Add Student to Clerk (same as admin)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    
    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    // Additional validation
    if (!form.email || !form.email.includes('@')) {
      setFormError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      setSubmitting(false);
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('First name and last name are required');
      setSubmitting(false);
      return;
    }

    try {
      // Add student to Clerk using the same API as admin
      const res = await fetch('/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          username: form.username?.trim() || null
        }),
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (!res.ok) {
        // Prefer detailed error messages
        let errorMsg = data.error || data.message || res.statusText || 'Error adding student';
        // If details is an array, show all messages
        if (Array.isArray(data.details)) {
          errorMsg = data.details.map((d: any) => d.longMessage || d.message || JSON.stringify(d)).join('\n');
        } else if (typeof data.details === 'string') {
          errorMsg = data.details;
        }
        // Clerk pwned password error
        if (data?.details?.errors && Array.isArray(data.details.errors)) {
          const pwnedError = data.details.errors.find((err: any) => err.code === 'form_password_pwned');
          if (pwnedError) {
            setFormError('This password has been found in a data breach. Please choose a different, stronger password for your safety.');
            setIsPwnedPassword(true);
            setSubmitting(false);
            return;
          }
        }
        setFormError(errorMsg);
        setIsPwnedPassword(false);
      } else {
        setFormSuccess('Student added successfully!');
        setSuccessSnackbarOpen(true);
        setTimeout(() => setAddOpen(false), 500); // Delay closing dialog
        setForm({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          password: '', 
          confirmPassword: '', 
          role: 'student',
          username: ''
        });
        // Re-fetch Clerk users to show the new student
        const refreshRes = await fetch('/api/clerk-users?limit=1000');
        const refreshData = await refreshRes.json();
        setStudents(Array.isArray(refreshData) ? refreshData.filter((u: any) => u.role === 'student') : []);
      }
    } catch (err: any) {
      console.error('Error adding student:', err);
      setFormError(err?.message || 'Failed to add student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ... inside RecordsSection, after other useState hooks ...
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  const filteredStudents = students.filter(stu => {
    const name = ((stu.firstName || stu.first_name || stu.fname || '') + ' ' + (stu.lastName || stu.last_name || stu.lname || '')).toLowerCase();
    const email = (stu.email || '').toLowerCase();
    const role = (stu.role || '').toLowerCase();
    const search = filter.toLowerCase();
    return name.includes(search) || email.includes(search) || role.includes(search);
  });
  
  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  // ...
  // Remove any other declarations of filter, setFilter, page, setPage, rowsPerPage in RecordsSection.

  // ... after other useState hooks in RecordsSection ...
  const [isPwnedPassword, setIsPwnedPassword] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  // Auto-close logic for 2.5s
  useEffect(() => {
    if (successSnackbarOpen) {
      const timer = setTimeout(() => setSuccessSnackbarOpen(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [successSnackbarOpen]);

  // ... after the useEffect for add success ...
  const [studentDeleteDialogOpen, setStudentDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  const handleDeleteStudent = async () => {
    // Log the student object for debugging
    console.log('Deleting student:', studentToDelete);
    // Try all possible id fields
    const clerkId = studentToDelete?.id || studentToDelete?.clerkId || studentToDelete?.userId || studentToDelete?._id;
    if (!clerkId) {
      setError('No valid student id found.');
      return;
    }
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clerkId }),
      });
      if (res.ok) {
        // Refresh the students list directly
        const refreshRes = await fetch('/api/clerk-users?limit=1000');
        const refreshData = await refreshRes.json();
        setStudents(Array.isArray(refreshData) ? refreshData.filter((u: any) => u.role === 'student') : []);
        setStudentDeleteDialogOpen(false);
        setStudentToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        let errorMsg = data.error || data.message || res.statusText || 'Failed to delete student.';
        if (Array.isArray(data.details)) {
          errorMsg = data.details.map((d: any) => d.longMessage || d.message || JSON.stringify(d)).join('\n');
        } else if (typeof data.details === 'string') {
          errorMsg = data.details;
        }
        setError(errorMsg);
        console.error('Failed to delete student:', errorMsg);
      }
    } catch (err: any) {
      setError(err?.message || 'Error deleting student.');
      console.error('Error deleting student:', err);
    } finally {
      setStudentDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  // ... after the useEffect for add success ...
  useEffect(() => {
    if (successSnackbarOpen) {
      const timer = setTimeout(() => setSuccessSnackbarOpen(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [successSnackbarOpen]);

  // Professional Green Success Dialog
  return (
    <Box sx={{ 
      background: theme.palette.background.paper, 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      border: `1px solid ${theme.palette.divider}`,
      overflow: 'hidden',
      fontFamily: 'Poppins, sans-serif' 
    }}>
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(120deg, ${theme.palette.background.paper} 60%, ${theme.palette.background.default} 100%)`,
          color: theme.palette.text.primary,
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(0,0,0,0.22)'
            : '0 4px 16px rgba(30,64,175,0.10)',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 6px 20px rgba(0,0,0,0.28)'
              : '0 6px 20px rgba(30,64,175,0.13)'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>
                Student Records
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage and monitor student accounts
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              background: theme.palette.primary.main,
              color: '#fff',
              boxShadow: 'none',
              '&:hover': {
                background: theme.palette.primary.dark,
              },
              transition: 'all 0.3s ease'
            }}
          >
            Add New Student
          </Button>
        </Box>
        <Divider sx={{ my: 1, borderColor: theme.palette.primary.light, opacity: 0.3 }} />
      </Box>

      {/* Content Section */}
      <Box p={3}>
        {/* Filter input */}
        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search by name, email, or role"
            variant="outlined"
            size="small"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 300 }}
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Box textAlign="center">
              <CircularProgress size={48} sx={{ color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading student records...
              </Typography>
            </Box>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {error}
            </Typography>
          </Alert>
        ) : (
          <TableContainer sx={{ 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
          <Table>
            <TableHead>
                <TableRow sx={{ background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((stu: any, index: number) => (
                    <TableRow key={stu.id} sx={{ 
                      backgroundColor: theme.palette.mode === 'dark'
                        ? (index % 2 === 0 ? theme.palette.background.paper : theme.palette.grey[900])
                        : (index % 2 === 0 ? 'background.paper' : theme.palette.grey[50]),
                      '&:hover': { 
                        backgroundColor: theme.palette.action.hover,
                        transform: 'scale(1.001)',
                        transition: 'all 0.2s ease'
                      },
                      transition: 'all 0.2s ease'
                    }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        #{stu.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.95rem' }}>
                        <Typography sx={{ color: theme.palette.text.primary }}>
                          {(stu.firstName || stu.first_name || stu.fname || '') + ' ' + (stu.lastName || stu.last_name || stu.lname || '')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                        {stu.username || stu.uname || '-'}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                        {stu.email}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={stu.role} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                        {stu.created_at
                          ? new Date(stu.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete Student" arrow>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => {
                              setStudentToDelete(stu);
                              setStudentDeleteDialogOpen(true);
                            }}
                            sx={{
                              '&:hover': {
                                background: theme.palette.error.light,
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box textAlign="center">
                        <PersonIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600} mb={1}>
                          No Students Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Get started by adding your first student to the system.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAddOpen(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Add First Student
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredStudents.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={() => {}}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage={''}
            />
          </TableContainer>
        )}
      </Box>

      <Dialog 
        open={addOpen} 
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: 6,
            background: theme.palette.background.paper,
            p: 0,
            maxWidth: 540,
            width: '100%',
            m: { xs: 1, sm: 2 },
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 3,
          px: 4,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottom: t => `1px solid ${t.palette.divider}`,
          textAlign: 'left',
          letterSpacing: 0.2
        }}>
          Add New Student
        </DialogTitle>
        <Box sx={{ px: 4, pt: 1, pb: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 15 }}>
            Fill in the details below to create a new student account.
          </Typography>
        </Box>
        <DialogContent sx={{
          p: { xs: 2, sm: 4 },
          background: '#fff',
          minWidth: { xs: 280, sm: 400 },
          maxWidth: 500,
          mx: 'auto',
          width: '100%',
        }}>
          <form onSubmit={handleAddStudent}>
            <Stack spacing={3} divider={<Divider flexItem sx={{ my: 0 }} />}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                <TextField
                  name="firstName"
                  label="First Name"
                  value={form.firstName}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  autoFocus
                  variant="outlined"
                  helperText={!form.firstName ? 'Required' : ''}
                  error={!form.firstName && submitting}
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={form.lastName}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  variant="outlined"
                  helperText={!form.lastName ? 'Required' : ''}
                  error={!form.lastName && submitting}
                />
              </Stack>
              <TextField
                name="username"
                label="Username (optional)"
                value={form.username}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                helperText="Optional: Used for login if provided."
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
                fullWidth
                variant="outlined"
                helperText={!form.email ? 'Required' : (!form.email.includes('@') ? 'Enter a valid email address' : '')}
                error={(!form.email || !form.email.includes('@')) && submitting}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  setIsPwnedPassword(false); // Reset on change
                }}
                required
                fullWidth
                variant="outlined"
                error={isPwnedPassword}
                helperText={isPwnedPassword ? (
                  <Box display="flex" alignItems="center" color="error.main" gap={1}>
                    <WarningAmberIcon fontSize="small" />
                    <span>This password has been found in a data breach. Please choose a different, stronger password for your safety.</span>
                  </Box>
                ) : 'At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Password requirements card */}
              <Box sx={{ mb: 1, mt: -2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>
                  Password Requirements:
                </Typography>
                {form.password && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 1, backgroundColor: 'grey.50', border: t => `1px solid ${t.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: passwordStrength.color }}>
                        Password Strength: {passwordStrength.strength}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Object.values(passwordValidation).filter(Boolean).length}/5 requirements met
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      backgroundColor: 'grey.300', 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: passwordStrength.width, 
                        height: '100%', 
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease',
                        borderRadius: 2
                      }} />
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.length ? 'success.main' : 'grey.300',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.length ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.length ? 'success.main' : 'text.secondary',
                      fontWeight: passwordValidation.length ? 600 : 400
                    }}>
                      At least 8 characters
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.uppercase ? 'success.main' : 'grey.300',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.uppercase ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.uppercase ? 'success.main' : 'text.secondary',
                      fontWeight: passwordValidation.uppercase ? 600 : 400
                    }}>
                      One uppercase letter (A-Z)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.lowercase ? 'success.main' : 'grey.300',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.lowercase ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.lowercase ? 'success.main' : 'text.secondary',
                      fontWeight: passwordValidation.lowercase ? 600 : 400
                    }}>
                      One lowercase letter (a-z)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.number ? 'success.main' : 'grey.300',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.number ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.number ? 'success.main' : 'text.secondary',
                      fontWeight: passwordValidation.number ? 600 : 400
                    }}>
                      One number (0-9)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.special ? 'success.main' : 'grey.300',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.special ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.special ? 'success.main' : 'text.secondary',
                      fontWeight: passwordValidation.special ? 600 : 400
                    }}>
                      One special character (!@#$%^&*)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleFormChange}
                required
                fullWidth
                variant="outlined"
                helperText={!form.confirmPassword ? 'Required' : (form.password !== form.confirmPassword ? 'Passwords do not match' : '')}
                error={(!form.confirmPassword || form.password !== form.confirmPassword) && submitting}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
              {formError && (
                <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>{formError}</Alert>
              )}
            </Stack>
            <DialogActions sx={{ pt: 3, px: 0, pb: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setAddOpen(false)} 
                variant="outlined"
                color="secondary"
                disabled={submitting}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                sx={{ 
                  fontWeight: 700, 
                  py: 1.5, 
                  px: 4,
                  color: 'white', 
                  borderRadius: 2,
                  minWidth: 140,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                  '&:hover': { 
                    background: t => t.palette.primary.dark,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.13)'
                  },
                  '&:disabled': {
                    background: t => t.palette.action.disabledBackground,
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {submitting ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <span>Adding...</span>
                  </Box>
                ) : (
                  'Add Student'
                )}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={successSnackbarOpen}
        onClose={() => setSuccessSnackbarOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: 'none',
            background: theme.palette.success.main,
            color: 'white',
            p: 0,
            minWidth: 0,
            maxWidth: 360,
            mx: 'auto',
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: '24px',
            animation: 'fadeInUp 0.4s',
          },
          '@keyframes fadeInUp': {
            '0%': {
              transform: 'translateY(30px)',
              opacity: 0
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1
            }
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ mb: 1, color: 'white', letterSpacing: 0.2 }}
          >
            Student Added Successfully
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ mb: 2, color: 'white', opacity: 0.92 }}
          >
            The new student account has been created and is ready to use.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setSuccessSnackbarOpen(false)}
            sx={{
              background: 'rgba(255,255,255,0.18)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                background: 'rgba(255,255,255,0.28)',
                color: 'white',
              },
              transition: 'all 0.2s',
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogContent>
        {/* Auto-close indicator (2.5s) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.18)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.7)',
              animation: 'shrinkbar 2.5s linear forwards',
              '@keyframes shrinkbar': {
                '0%': { width: '100%' },
                '100%': { width: '0%' }
              }
            }}
          />
        </Box>
      </Dialog>
      <Dialog
        open={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: 'none',
            background: theme.palette.success.main,
            color: 'white',
            p: 0,
            minWidth: 0,
            maxWidth: 360,
            mx: 'auto',
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: '24px',
            animation: 'fadeInUp 0.4s',
          },
          '@keyframes fadeInUp': {
            '0%': {
              transform: 'translateY(30px)',
              opacity: 0
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1
            }
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ mb: 1, color: 'white', letterSpacing: 0.2 }}
          >
            Student Deleted Successfully
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ mb: 2, color: 'white', opacity: 0.92 }}
          >
            The student account has been deleted from the system.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDeleteSuccessOpen(false)}
            sx={{
              background: 'rgba(255,255,255,0.18)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                background: 'rgba(255,255,255,0.28)',
                color: 'white',
              },
              transition: 'all 0.2s',
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogContent>
        {/* Auto-close indicator (2.5s) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.18)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.7)',
              animation: 'shrinkbar 2.5s linear forwards',
              '@keyframes shrinkbar': {
                '0%': { width: '100%' },
                '100%': { width: '0%' }
              }
            }}
          />
        </Box>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={studentDeleteDialogOpen} onClose={() => setStudentDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <b>{studentToDelete?.firstName || studentToDelete?.first_name || studentToDelete?.fname} {studentToDelete?.lastName || studentToDelete?.last_name || studentToDelete?.lname}</b> (<b>{studentToDelete?.email}</b>)?
          </Typography>
          <Alert severity="warning">
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteStudent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function TeacherSettings({ user }: { user: any }) {
  const [form, setForm] = useState({
    full_name: user?.firstName || '',
    email: user?.email || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    id: user?.id || '',
    profile_picture: user?.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      
      console.log('Uploading to bucket: profile-pictures, filePath:', filePath, 'user:', user);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError, JSON.stringify(uploadError, null, 2));
        setError('Failed to upload image: ' + (uploadError.message || JSON.stringify(uploadError)));
        setLoading(false);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
      console.log('getPublicUrl data:', publicUrlData);
      const publicUrl = publicUrlData?.publicUrl;
      
      if (publicUrl) {
        setForm(prev => ({ ...prev, profile_picture: publicUrl }));
        // Update in DB immediately - use upsert to create record if it doesn't exist
        const { error: dbError } = await supabase.from('teacher').upsert({
          id: user.id,
          profile_picture: publicUrl,
          full_name: user.firstName || user.fullName || '',
          email: user.email || '',
        });
        if (dbError) {
          console.error('Supabase DB update error:', dbError);
          setError('Failed to update profile picture in database: ' + dbError.message);
          setLoading(false);
          return;
        }
        // Update Clerk profile image via backend API
        try {
          await fetch('/api/update-clerk-profile-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, imageUrl: publicUrl }),
          });
        } catch (clerkErr) {
          console.error('Failed to update Clerk profile image:', clerkErr);
        }
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Unexpected error during upload:', err, JSON.stringify(err, null, 2));
      setError('Unexpected error: ' + (err.message || JSON.stringify(err)));
      setLoading(false);
    }
  };

  const handleDeleteProfilePic = async () => {
    if (!user || !form.profile_picture) return;

    setLoading(true);
    setError('');
    try {
      // Extract file name from URL
      const urlParts = form.profile_picture.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      // Remove from storage
      const { error: removeError } = await supabase.storage.from('profile-pictures').remove([fileName]);
      if (removeError) {
        setError('Failed to delete image: ' + removeError.message);
        setLoading(false);
        return;
      }
      
      // Set profile_picture to null in DB - use upsert to create record if it doesn't exist
      const { error: dbError } = await supabase.from('teacher').upsert({
        id: user.id,
        profile_picture: null,
        full_name: user.firstName || user.fullName || '',
        email: user.email || '',
      });
      if (dbError) {
        setError('Failed to update database: ' + dbError.message);
        setLoading(false);
        return;
      }
      
      setForm(prev => ({ ...prev, profile_picture: '' }));
      
      // Remove Clerk profile image via backend API
      try {
        await fetch('/api/update-clerk-profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, imageUrl: null }),
        });
      } catch (clerkErr) {
        console.error('Failed to remove Clerk profile image:', clerkErr);
      }
    } catch (err: any) {
      setError('Unexpected error: ' + (err.message || String(err)));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { full_name, email, dob, gender, profile_picture } = form;
      
      const { error } = await supabase
        .from('teacher')
        .upsert({
          id: user.id,
          full_name,
          email,
          dob,
          gender,
          profile_picture,
        });

      if (error) throw error;

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const professionalBoxSx = (theme: any) => ({
    background: theme.palette.mode === 'dark'
      ? 'rgba(20, 24, 36, 0.92)'
      : 'linear-gradient(135deg, #f7fafd 0%, #e3eafc 100%)',
    maxWidth: 600,
    mx: 'auto',
    border: theme.palette.mode === 'dark'
      ? `2.5px solid ${theme.palette.primary.main}`
      : '1.5px solid #dbeafe',
    borderRadius: 4,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 24px 0 rgba(0,0,0,0.25)'
      : '0 4px 24px 0 rgba(30,64,175,0.07)',
    fontFamily: 'Poppins, sans-serif',
    transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px 0 rgba(0,0,0,0.32)'
        : '0 8px 32px 0 rgba(30,64,175,0.13)',
      borderColor: theme.palette.primary.main,
    },
    p: { xs: 2.5, sm: 4 },
  });

  return (
    <Box sx={professionalBoxSx(theme)}>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
        My Profile
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Avatar 
          src={form.profile_picture || user.imageUrl} 
          alt="profile" 
          sx={{ width: 100, height: 100, border: '3px solid #e3e6ef', mb: 2 }} 
        />
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Uploading...' : 'Change Photo'}
          </Button>
          {form.profile_picture && (
            <Button 
              variant="outlined" 
              size="small" 
              color="error" 
              onClick={handleDeleteProfilePic} 
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Delete Photo
            </Button>
          )}
        </Box>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
        />
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Date of Birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Gender (M or F)"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 1 }}
          required
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            fontWeight: 600, 
            borderRadius: 2, 
            background: theme.palette.primary.main, 
            color: theme.palette.primary.contrastText, 
            py: 1.5,
            '&:hover': { background: theme.palette.primary.dark } 
          }}
          disabled={loading}
        >
          {loading ? 'Updating…' : 'Update Profile'}
        </Button>
      </form>
      
      {/* Snackbar for success */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Snackbar for error */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ExamsSection({ handleDeleteExam }: { handleDeleteExam: (quizId: number) => void }) {
  const { user } = useUser();
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const theme = useTheme();

  const fetchExams = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    
    try {
    const res = await fetch(`/api/exams?user_id=${user.id}`);
    const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Error');
        return;
      }
      
      const exams = data.exams || [];
      if (exams.length === 0) {
        setExams([]);
        return;
      }
      
      // Fetch all questions for these quiz IDs
      const quizIds = exams.map((q: any) => q.id);
      const { data: questions } = await supabase
        .from('questions')
        .select('id, quiz_id')
        .in('quiz_id', quizIds);
        
      const questionCounts: Record<number, number> = {};
      (questions || []).forEach((q: { quiz_id: number }) => {
          questionCounts[q.quiz_id] = (questionCounts[q.quiz_id] || 0) + 1;
      });
      
      const examsWithCounts = exams.map((q: any) => ({
        ...q,
        questions_count: questionCounts[q.id] || 0,
      }));
      
      setExams(examsWithCounts);
    } catch (err) {
      setError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // Load exams immediately without blocking UI
    fetchExams(); 
  }, [user?.id]);

  // Pagination logic
  const pageCount = Math.ceil(exams.length / rowsPerPage);
  const paginatedExams = exams.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#E6E8EC'}`,
        borderRadius: '16px',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)'
      }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon sx={{ fontSize: 20 }} />} 
          onClick={async () => {
            await router.push('/create-quiz');
          }}
          sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
              : 'linear-gradient(135deg, #2563EB 0%, #1E48D6 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            minHeight: 48,
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            textTransform: 'none',
            letterSpacing: '0.025em',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 16px rgba(37, 99, 235, 0.4)'
              : '0 4px 16px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': { 
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1E48D6 0%, #1E40AF 100%)'
                : 'linear-gradient(135deg, #1E48D6 0%, #1D4ED8 100%)',
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(37, 99, 235, 0.5)'
                : '0 8px 24px rgba(37, 99, 235, 0.35)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(37, 99, 235, 0.4)'
                : '0 2px 8px rgba(37, 99, 235, 0.25)',
            },
            '&:focus-visible': {
              outline: '2px solid #2563EB',
              outlineOffset: '2px'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover::before': {
              left: '100%',
            }
          }}
        >
          Create Quiz
        </Button>
      </Paper>
      {loading ? <Typography>Loading...</Typography> : error ? <Alert severity="error">{error}</Alert> : (
        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Exam no.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Exam name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>No. of questions</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Start time</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>End time</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExams.map((exam, i) => (
                <TableRow key={exam.id || i} hover sx={{ transition: 'background 0.2s', '&:hover': { background: theme => theme.palette.action.hover } }}>
                  <TableCell align="center">{(page - 1) * rowsPerPage + i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{exam.quiz_title || '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{exam.description || '-'}</TableCell>
                  <TableCell align="center">{exam.questions_count ?? '-'}</TableCell>
                  <TableCell>{exam.start_time ? format(new Date(exam.start_time), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                  <TableCell>{exam.end_time ? format(new Date(exam.end_time), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => router.push(`/edit-quiz/${exam.id}`)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteExam(exam.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={exams.length}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setPage(1);
              // Optionally, you can allow changing rowsPerPage
              // setRowsPerPage(parseInt(e.target.value, 10));
            }}
            rowsPerPageOptions={[rowsPerPage]}
            labelRowsPerPage={''}
          />
        </Paper>
      )}
    </Box>
  );
}

function CreateAnnouncementForm({ user, onClose }: { user: any, onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 1,
    target_audience: 'all',
    tags: [] as string[],
    expires_at: ''
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('announcements')
        .insert({
          title: form.title.trim(),
          content: form.content.trim(),
          sender_id: user.id,
          sender_name: user.firstName || user.fullName || 'Teacher',
          priority: form.priority,
          target_audience: form.target_audience,
          tags: form.tags.length > 0 ? form.tags : null,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          is_active: true
        });

      if (insertError) throw insertError;

      setSuccess('Announcement created successfully!');
      setForm({
        title: '',
        content: '',
        priority: 1,
        target_audience: 'all',
        tags: [],
        expires_at: ''
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      if (tagInput && tagInput.trim()) {
        const newTag = tagInput.trim();
        // Prevent duplicate tags (case-insensitive)
        if (!form.tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
          setForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        }
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span" fontWeight={600}>Create New Announcement</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <TextField
              label="Title *"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
              placeholder="Enter announcement title"
            />
            
            <TextField
              label="Content *"
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              required
              placeholder="Enter announcement content"
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                fullWidth
              >
                <MenuItem value={1}>Normal</MenuItem>
                <MenuItem value={2}>Important</MenuItem>
                <MenuItem value={3}>Urgent</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Target Audience"
                value={form.target_audience}
                onChange={(e) => setForm(prev => ({ ...prev, target_audience: e.target.value }))}
                fullWidth
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="students">Students Only</MenuItem>
                <MenuItem value="teachers">Teachers Only</MenuItem>
              </TextField>
            </Stack>
            
            <TextField
              label="Expires At (Optional)"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm(prev => ({ ...prev, expires_at: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
                {form.tags.length > 0 && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({form.tags.length} tag{form.tags.length !== 1 ? 's' : ''})
                  </Typography>
                )}
              </Typography>
              <TextField
                value={tagInput || ''}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a tag and press Enter to add..."
                onKeyDown={handleTagInput}
                fullWidth
                size="small"
                helperText="Type and press Enter to add tags"
              />
              {form.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {form.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light,
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
            <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {loading ? 'Creating...' : 'Create Announcement'}
          </Button>
            </DialogActions>
          </form>
      </Dialog>
  );
}

function AnnouncementsSection({ user }: { user: any }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<any>(null);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [tabSwitchData, setTabSwitchData] = useState<any[]>([]);
  const theme = useTheme();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
      
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setAnnouncements([]);
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Load announcements and tab switch data immediately without blocking UI
    fetchAnnouncements();
  }, []);

  // Auto-close success dialog after 2 seconds
  useEffect(() => {
    if (deleteSuccessOpen) {
      const timer = setTimeout(() => setDeleteSuccessOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccessOpen]);

  const handleDeleteClick = (announcement: any) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', announcementToDelete.id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      // Immediately remove from UI for real-time experience
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementToDelete.id));
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
      setDeleteSuccessOpen(true);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      // If deletion failed, refresh the list to show current state
      fetchAnnouncements();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#d32f2f';
      case 2: return '#f57c00';
      default: return '#1976d2';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return 'URGENT';
      case 2: return 'IMPORTANT';
      default: return 'NORMAL';
    }
  };

  return (
    <Box p={{ xs: 2, sm: 3 }} borderRadius={3} boxShadow={1} sx={{ background: theme.palette.background.paper, width: '100%', mx: 0, border: 'none', fontFamily: 'Poppins, sans-serif' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          Announcements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ 
            background: theme.palette.primary.main, 
            color: theme.palette.primary.contrastText, 
            borderRadius: 2, 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { background: theme.palette.primary.dark }
          }}
        >
          Create Announcement
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={600}>
            {error}
          </Typography>
        </Alert>
      )}

      <TableContainer component={Paper} sx={{
        boxShadow: '0 4px 24px 0 rgba(30,64,175,0.07)',
        background: theme.palette.background.paper,
        borderRadius: 4,
        border: 'none',
        p: 0,
        width: '100%',
        minWidth: 0,
        overflowX: 'auto',
        mx: 0,
      }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow sx={{ background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50], height: 68 }}>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '0.98rem', color: theme.palette.text.primary, py: 1.5, px: 3, border: 'none' }}>Priority</TableCell>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '0.98rem', color: theme.palette.text.primary, maxWidth: 180, wordBreak: 'break-word', py: 1.5, px: 3, border: 'none' }}>Title</TableCell>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, color: theme.palette.text.primary, maxWidth: 260, wordBreak: 'break-word', fontSize: '0.98rem', py: 1.5, px: 3, border: 'none' }}>Content</TableCell>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.12rem', color: theme.palette.text.primary, py: 2.5, px: 3, border: 'none' }}>Target</TableCell>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.12rem', color: theme.palette.text.primary, py: 2.5, px: 3, border: 'none' }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.12rem', color: theme.palette.text.primary, py: 2.5, px: 3, border: 'none', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, border: 'none' }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <TableRow key={announcement.id} hover sx={{
                  background: theme.palette.background.paper,
                  transition: 'background 0.2s',
                  '&:hover': { background: theme.palette.action.hover, boxShadow: '0 2px 12px 0 rgba(30,64,175,0.08)' },
                  height: 72,
                  borderRadius: 3,
                  boxShadow: 'none',
                  border: 'none',
                }}>
                  <TableCell sx={{ py: 2.2, px: 3, border: 'none' }}>
                    <Chip
                      label={getPriorityText(announcement.priority)}
                      size="medium"
                      sx={{
                        backgroundColor: getPriorityColor(announcement.priority),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.01rem',
                        letterSpacing: 0.7,
                        height: 36,
                        borderRadius: 99,
                        px: 2.5,
                        boxShadow: '0 1px 4px 0 rgba(30,64,175,0.08)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, maxWidth: 180, wordBreak: 'break-word', fontSize: '0.95rem', py: 1.2, px: 3, border: 'none' }}>{announcement.title}</TableCell>
                  <TableCell sx={{ maxWidth: 260, wordBreak: 'break-word', color: theme.palette.text.secondary, fontSize: '0.95rem', py: 1.2, px: 3, border: 'none' }}>
                    <Tooltip title={announcement.content} placement="top" arrow>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, cursor: 'pointer' }}>
                        {announcement.content}
                      </Typography>
                    </Tooltip>
                    {announcement.tags && announcement.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {announcement.tags.map((tag: string, tagIdx: number) => (
                          <Chip
                            key={tagIdx}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.9rem', borderRadius: 99, color: theme.palette.primary.main, borderColor: theme.palette.primary.light, px: 1.5, height: 26 }}
                          />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.2, px: 3, border: 'none' }}>
                    <Chip
                      label={announcement.target_audience.toUpperCase()}
                      size="medium"
                      variant="outlined"
                      color={announcement.target_audience === 'all' ? 'default' : announcement.target_audience === 'students' ? 'success' : 'info'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        borderRadius: 99,
                        height: 32,
                        px: 2,
                        boxShadow: 'none',
                        backgroundColor: 'transparent',
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '1.04rem', minWidth: 120, py: 2.2, px: 3, border: 'none' }}>
                    {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : ''}
                  </TableCell>
                  <TableCell sx={{ py: 2.2, px: 3, border: 'none', textAlign: 'center' }}>
                    <Tooltip title="Delete Announcement">
                      <IconButton color="error" onClick={() => handleDeleteClick(announcement)} size="medium" sx={{ borderRadius: 99, transition: 'background 0.2s', '&:hover': { background: theme.palette.error.light } }}>
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, border: 'none' }}>No announcements found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {createOpen && (
        <CreateAnnouncementForm 
          user={user} 
          onClose={() => {
            setCreateOpen(false);
            fetchAnnouncements();
          }} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
          Confirm Delete Announcement
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the announcement <b>"{announcementToDelete?.title}"</b>?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action will deactivate the announcement. It can be reactivated later if needed.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Announcement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog
        open={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: 'none',
            background: theme.palette.success.main,
            color: 'white',
            p: 0,
            minWidth: 0,
            maxWidth: 360,
            mx: 'auto',
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: '24px',
            animation: 'fadeInUp 0.4s',
          },
          '@keyframes fadeInUp': {
            '0%': {
              transform: 'translateY(30px)',
              opacity: 0
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1
            }
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ mb: 1, color: 'white', letterSpacing: 0.2 }}
          >
            Announcement Deleted
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ mb: 2, color: 'white', opacity: 0.92 }}
          >
            The announcement has been successfully deleted.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDeleteSuccessOpen(false)}
            sx={{
              background: 'rgba(255,255,255,0.18)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                background: 'rgba(255,255,255,0.28)',
                color: 'white',
              },
              transition: 'all 0.2s',
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogContent>
        {/* Auto-close indicator (2s) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.18)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.7)',
              animation: 'shrinkbar 2s linear forwards',
              '@keyframes shrinkbar': {
                '0%': { width: '100%' },
                '100%': { width: '0%' }
              }
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
}

// Enhanced Analytics Component
function EnhancedAnalytics({ results, quizzes, students, performanceData }: {
  results: any[];
  quizzes: any[];
  students: any[];
  performanceData: any;
}) {
  console.log('🔍 EnhancedAnalytics component is rendering!');
  const theme = useTheme();

  // Calculate analytics data
  const calculateAnalytics = () => {
    console.log('🔍 EnhancedAnalytics - Data received:', {
      resultsLength: results.length,
      quizzesLength: quizzes.length,
      performanceData,
      resultsSample: results.slice(0, 2),
      hasResults: results.length > 0,
      hasPerformanceData: performanceData && performanceData.totalAttempts > 0
    });
    
    // Use results if available, otherwise fall back to performanceData
    if (results.length > 0) {
      console.log('🔍 Using results data for calculation');
      const totalAttempts = results.length;
      const totalMarks = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const totalPossibleMarks = results.reduce((sum, r) => sum + ((r.quizzes as any)?.total_marks || 100), 0);
      const averageScore = totalAttempts > 0 ? (totalMarks / totalPossibleMarks) * 100 : 0;
      
      // Calculate pass rate (assuming 60% is passing)
      const passingAttempts = results.filter(r => {
        const score = r.score || 0;
        const totalMarks = (r.quizzes as any)?.total_marks || 100;
        return (score / totalMarks) >= 0.6;
      }).length;
      const passRate = totalAttempts > 0 ? (passingAttempts / totalAttempts) * 100 : 0;

      // Quiz performance breakdown
      const quizPerformance = quizzes.map(quiz => {
        const quizResults = results.filter(r => r.quiz_id === quiz.id);
        const totalQuizMarks = quizResults.reduce((sum, r) => sum + (r.score || 0), 0);
        const totalPossibleMarks = quizResults.reduce((sum, r) => sum + ((r.quizzes as any)?.total_marks || 100), 0);
        const avgScore = quizResults.length > 0 && totalPossibleMarks > 0
          ? (totalQuizMarks / totalPossibleMarks) * 100
          : 0;
        return {
          id: quiz.id,
          title: quiz.quiz_title,
          attempts: quizResults.length,
          averageScore: avgScore,
          totalMarks: quiz.total_marks || 100
        };
      });

      const analyticsResult = {
        totalAttempts,
        averageScore,
        passRate,
        quizPerformance
      };
      
      console.log('🔍 EnhancedAnalytics - Calculated from results:', analyticsResult);
      
      return analyticsResult;
    } else {
      // Fall back to performanceData when results are not available
      console.log('🔍 Using performanceData fallback for calculation');
      const fallbackResult = {
        totalAttempts: performanceData.totalAttempts || 0,
        averageScore: performanceData.averageScore || 0,
        passRate: performanceData.passRate || 0,
        quizPerformance: []
      };
      
      console.log('🔍 EnhancedAnalytics - Using fallback performanceData:', fallbackResult);
      
      return fallbackResult;
    }
  };

  const analytics = calculateAnalytics();

  return (
    <Box>
      {/* Debug Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug: Results: {results.length}, PerformanceData: {JSON.stringify(performanceData)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Direct values: totalAttempts={analytics?.totalAttempts || 0}, averageScore={analytics?.averageScore || 0}, passRate={analytics?.passRate || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Raw performanceData: totalAttempts={performanceData?.totalAttempts || 0}, averageScore={performanceData?.averageScore || 0}, passRate={performanceData?.passRate || 0}
        </Typography>
      </Box>
      
      {/* Analytics Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : '#F3F6FF',
                border: theme.palette.mode === 'dark' ? 'none' : '1px solid #DCE6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <TrendingUpIcon sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : '#2563EB', 
                  fontSize: 28 
                }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color={theme.palette.mode === 'dark' ? '#60A5FA' : '#2563EB'} gutterBottom sx={{ fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {analytics?.totalAttempts || performanceData?.totalAttempts || 0}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color={theme.palette.mode === 'dark' ? '#FFFFFF' : '#0F172A'}>
                Results Graded
              </Typography>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#E5E7EB' : '#6B7280'}>
                Across all quizzes
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : '#F0FDF4',
                border: theme.palette.mode === 'dark' ? 'none' : '1px solid #DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <GradeIcon sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : '#16A34A', 
                  fontSize: 28 
                }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color={theme.palette.mode === 'dark' ? '#34D399' : '#16A34A'} gutterBottom sx={{ fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {analytics?.averageScore ? Math.round(analytics.averageScore) : (performanceData?.averageScore || 0)}%
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color={theme.palette.mode === 'dark' ? '#FFFFFF' : '#0F172A'}>
                Average Score
              </Typography>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#E5E7EB' : '#6B7280'}>
                Per attempt
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : '#FFFBEB',
                border: theme.palette.mode === 'dark' ? 'none' : '1px solid #FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <SchoolIcon sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : '#F59E0B', 
                  fontSize: 28 
                }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color={theme.palette.mode === 'dark' ? '#FACC15' : '#F59E0B'} gutterBottom sx={{ fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {analytics?.passRate ? Math.round(analytics.passRate) : (performanceData?.passRate || 0)}%
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color={theme.palette.mode === 'dark' ? '#FFFFFF' : '#0F172A'}>
                Passing Rate
              </Typography>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#E5E7EB' : '#6B7280'}>
                Students passing
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  : '#F3F6FF',
                border: theme.palette.mode === 'dark' ? 'none' : '1px solid #DCE6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <GroupIcon sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : '#2563EB', 
                  fontSize: 28 
                }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color={theme.palette.mode === 'dark' ? '#A78BFA' : '#2563EB'} gutterBottom sx={{ fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {students.length}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color={theme.palette.mode === 'dark' ? '#FFFFFF' : '#0F172A'}>
                Active Students
              </Typography>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#E5E7EB' : '#6B7280'}>
                In your classes
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Quiz Performance Table */}
      <StyledCard sx={{ mb: 4 }}>
        <CardHeader
          title="Quiz Performance Breakdown"
          subheader="Detailed analysis of each quiz's performance"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary',
            fontSize: '1.25rem'
          }}
          subheaderTypographyProps={{ 
            variant: 'body2', 
            color: theme.palette.mode === 'dark' ? '#E5E7EB' : 'text.secondary',
            fontSize: '0.875rem'
          }}
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : 'transparent'
          }}
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Quiz Title</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Attempts</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Average Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Pass Rate</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.quizPerformance && analytics.quizPerformance.length > 0 ? (
                  analytics.quizPerformance.map((quiz: any) => {
                    const passRate = quiz.totalMarks > 0 
                      ? (quiz.averageScore / quiz.totalMarks) >= 0.6 ? 'Good' : 'Needs Improvement'
                      : 'N/A';
                    
                    return (
                      <TableRow key={quiz.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{quiz.title}</TableCell>
                        <TableCell align="center">{quiz.attempts}</TableCell>
                        <TableCell align="center">
                          {Math.round(quiz.averageScore)} / {quiz.totalMarks}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={passRate} 
                            color={passRate === 'Good' ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={quiz.totalMarks > 0 ? (quiz.averageScore / quiz.totalMarks) * 100 : 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {quiz.totalMarks > 0 ? Math.round((quiz.averageScore / quiz.totalMarks) * 100) : 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No quiz data available for analysis
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>

      {/* Recent Activity */}
      <StyledCard>
        <CardHeader
          title="Recent Activity"
          subheader="Latest student attempts and submissions"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'text.primary',
            fontSize: '1.25rem'
          }}
          subheaderTypographyProps={{ 
            variant: 'body2', 
            color: theme.palette.mode === 'dark' ? '#E5E7EB' : 'text.secondary',
            fontSize: '0.875rem'
          }}
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : 'transparent'
          }}
        />
        <CardContent>
          {results.length > 0 ? (
            <Stack spacing={2}>
              {results.slice(0, 5).map((result, index) => (
                <Box
                  key={result.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {result.user_name} completed {result.quizzes?.quiz_title || 'Quiz'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.submitted_at ? format(new Date(result.submitted_at), 'MMM dd, yyyy HH:mm') : 'Unknown time'}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Score: ${result.score || 0}`}
                    color={result.score && result.score > 60 ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No recent activity to display
            </Typography>
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );
}

function ProctoringSection({ user }: { user: any }) {
  const [tabSwitchData, setTabSwitchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  // Inter font configuration
  const interFont = {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const fetchTabSwitchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching tab switch data for teacher:', user?.id);
      
      // First, get quizzes created by this teacher
      const { data: teacherQuizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('user_id', user?.id);
      
      if (quizzesError) {
        console.error('Error fetching teacher quizzes:', quizzesError);
        setError(`Failed to load teacher quizzes: ${quizzesError.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      const teacherQuizIds = teacherQuizzes?.map(q => q.id) || [];
      console.log('📚 Teacher quiz IDs:', teacherQuizIds);
      
      if (teacherQuizIds.length === 0) {
        console.log('ℹ️ No quizzes found for this teacher');
        setTabSwitchData([]);
        return;
      }
      
      // Get attempts for quizzes created by this teacher
      const { data: allAttempts, error: allError } = await supabase
        .from('attempts')
        .select(`
          id,
          user_name,
          quiz_id,
          score,
          submitted_at
        `)
        .in('quiz_id', teacherQuizIds)
        .order('submitted_at', { ascending: false });
      
      if (allError) {
        console.error('Error fetching attempts:', allError);
        setError(`Failed to load attempts: ${allError.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      
      console.log('📊 Basic attempts data loaded:', allAttempts?.length || 0, 'attempts for teacher quizzes');
      
      // Check if tab switch columns exist by trying to query them
      const { data: tabSwitchData, error: tabSwitchError } = await supabase
        .from('attempts')
        .select(`
          id,
          tab_switch_count,
          last_tab_switch_time,
          tab_switch_history
        `)
        .in('quiz_id', teacherQuizIds)
        .not('id', 'is', null)
        .limit(1);
      
      if (tabSwitchError) {
        console.warn('Tab switch columns may not exist yet:', tabSwitchError);
        // If tab switch columns don't exist, show basic data with default values
        const basicData = (allAttempts || []).map(attempt => ({
          ...attempt,
          tab_switch_count: 0,
          last_tab_switch_time: null,
          tab_switch_history: null
        }));
        setTabSwitchData(basicData);
        setError('Tab switch monitoring columns not yet added to database. Please run the SQL migration first.');
        return;
      }
      
      // If tab switch columns exist, get the full data for teacher's quizzes only
      const { data: fullData, error: fullError } = await supabase
        .from('attempts')
        .select(`
          id,
          user_name,
          quiz_id,
          score,
          submitted_at,
          tab_switch_count,
          last_tab_switch_time,
          tab_switch_history
        `)
        .in('quiz_id', teacherQuizIds)
        .order('submitted_at', { ascending: false });
      
      if (fullError) {
        console.error('Error fetching full tab switch data:', fullError);
        setError(`Failed to load tab switch data: ${fullError.message}`);
        return;
      }
      
      console.log('✅ Tab switch data loaded successfully:', fullData?.length || 0, 'attempts for teacher quizzes');
      setTabSwitchData(fullData || []);
      
    } catch (err) {
      console.error('Unexpected error fetching tab switch data:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTabSwitchData();
    }
  }, [user?.id]);

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (err) {
      console.error('Database connection test error:', err);
      return false;
    }
  };

  const getRiskLevel = (count: number) => {
    if (count > 10) return { level: 'HIGH_RISK', color: '#d32f2f', label: 'HIGH RISK' };
    if (count > 5) return { level: 'MEDIUM_RISK', color: '#f57c00', label: 'MEDIUM RISK' };
    if (count > 2) return { level: 'LOW_RISK', color: '#f9a825', label: 'LOW RISK' };
    return { level: 'SAFE', color: '#388e3c', label: 'COMPLIANT' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ ...interFont }}>
      {/* Professional Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            mb: 1,
            ...interFont
          }}
        >
          Proctoring & Academic Integrity Monitoring
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.secondary,
            ...interFont
          }}
        >
          Monitor student behavior and detect suspicious activity during your examinations
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography 
              variant="h3" 
              color="primary" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                ...interFont
              }}
            >
              {tabSwitchData.length}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                ...interFont
              }}
            >
              Total Exam Attempts
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontWeight: 400,
                ...interFont
              }}
            >
              {new Set(tabSwitchData.map(attempt => attempt.user_id || attempt.user_name)).size} unique students
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(244, 67, 54, 0.15)'
            }
          }}>
            <Typography 
              variant="h3" 
              color="error" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                ...interFont
              }}
            >
              {tabSwitchData.filter(item => item.tab_switch_count > 10).length}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                ...interFont
              }}
            >
              High Risk Students
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(255, 152, 0, 0.15)'
            }
          }}>
            <Typography 
              variant="h3" 
              color="warning.main" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                ...interFont
              }}
            >
              {tabSwitchData.filter(item => item.tab_switch_count > 5 && item.tab_switch_count <= 10).length}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                ...interFont
              }}
            >
              Medium Risk Students
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(76, 175, 80, 0.15)'
            }
          }}>
            <Typography 
              variant="h3" 
              color="success.main" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                ...interFont
              }}
            >
              {tabSwitchData.filter(item => item.tab_switch_count <= 2).length}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                ...interFont
              }}
            >
              Compliant Students
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Professional Data Table */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <CardHeader 
          title={
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                ...interFont
              }}
            >
              Student Behavior Analysis
            </Typography>
          }
          subheader={
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                ...interFont
              }}
            >
              Comprehensive monitoring of student activity during examinations
            </Typography>
          }
          action={
            <Button 
              variant="outlined" 
              onClick={async () => {
                console.log('🔄 Refreshing tab switch data...');
                await testDatabaseConnection();
                await fetchTabSwitchData();
              }}
              startIcon={<RefreshIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                ...interFont
              }}
            >
              Refresh Data
            </Button>
          }
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Student Information
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Exam Details
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Performance
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Tab Activity
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Risk Assessment
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Timeline
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary,
                    ...interFont
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tabSwitchData.map((attempt) => {
                  const risk = getRiskLevel(attempt.tab_switch_count);
                  return (
                    <TableRow 
                      key={attempt.id} 
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: theme.palette.primary.main,
                            fontWeight: 600,
                            ...interFont
                          }}>
                            {attempt.user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="body1" 
                              fontWeight={600}
                              sx={{ ...interFont }}
                            >
                              {attempt.user_name || 'Unknown Student'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ ...interFont }}
                            >
                              Student ID: {attempt.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          sx={{ ...interFont }}
                        >
                          Quiz #{attempt.quiz_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="h6" 
                          fontWeight={700}
                          color={attempt.score >= 80 ? 'success.main' : attempt.score >= 60 ? 'warning.main' : 'error.main'}
                          sx={{ ...interFont }}
                        >
                          {attempt.score || 0}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight={700}
                            color={attempt.tab_switch_count > 5 ? 'error.main' : 'text.primary'}
                            sx={{ ...interFont }}
                          >
                            {attempt.tab_switch_count}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ ...interFont }}
                          >
                            switches
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.label}
                          size="medium"
                          sx={{
                            backgroundColor: risk.color,
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            ...interFont
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight={500}
                            sx={{ ...interFont }}
                          >
                            {attempt.last_tab_switch_time ? 
                              new Date(attempt.last_tab_switch_time).toLocaleDateString() : 
                              'N/A'
                            }
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ ...interFont }}
                          >
                            {attempt.submitted_at ? 
                              new Date(attempt.submitted_at).toLocaleTimeString() : 
                              'Not submitted'
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View detailed analysis">
                          <IconButton 
                            size="medium"
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                                color: 'white'
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="medium" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {error && (
            <Box textAlign="center" py={8}>
              <Typography 
                variant="h6" 
                color="error.main"
                sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  ...interFont
                }}
              >
                Database Setup Required
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 3,
                  maxWidth: '600px',
                  mx: 'auto',
                  ...interFont
                }}
              >
                {error}
              </Typography>
              {error.includes('Tab switch monitoring columns not yet added') && (
                <Box sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 3, 
                  borderRadius: 2, 
                  textAlign: 'left',
                  maxWidth: '800px',
                  mx: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ ...interFont }}>
                    Run this SQL in your Supabase SQL Editor:
                  </Typography>
                  <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
{`-- Add tab switch monitoring columns to attempts table
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_tab_switch_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tab_switch_history JSONB DEFAULT '[]'::jsonb;

-- Add tab switch monitoring columns to quiz_progress table  
ALTER TABLE quiz_progress
ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_tab_switch_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tab_switch_history JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attempts_tab_switch_count 
ON attempts(tab_switch_count DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_progress_tab_switch_count 
ON quiz_progress(tab_switch_count DESC);`}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {!error && tabSwitchData.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  mb: 1,
                  ...interFont
                }}
              >
                No examination data available
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ ...interFont }}
              >
                Student activity will appear here once students complete your quizzes
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}