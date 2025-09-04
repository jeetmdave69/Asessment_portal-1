'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  TextField,
  Pagination,
  Tabs,
  Tab,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  AppBar,
  Toolbar,
  Badge,
  Skeleton,
  IconButton,
} from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import AppWelcome from '@/sections/overview/app-welcome';
import AppWidgetSummary from '@/sections/overview/app-widget-summary';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  WbSunny as WbSunnyIcon,
  WbTwilight as WbTwilightIcon,
  NightsStay as NightsStayIcon,
  PlayArrow as PlayArrowIcon,
  Replay as ReplayIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Announcement as AnnouncementIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// Modern thin icons from Lucide/Heroicons style
import {
  Bell as BellIcon,
  LogOut as LogOutIcon,
  CalendarDays as CalendarIcon,
  Menu as MenuIcon
} from 'lucide-react';
import SummaryCards from '../../../components/dashboard/SummaryCards';
import { useSettingsContext } from '@/context/settings-context';
import Iconify from '@/components/iconify/Iconify';
import { useTheme } from '@mui/material/styles';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import dayjs from 'dayjs';
import Tooltip from '@mui/material/Tooltip';
import LogoutSplash from '../../../components/LogoutSplash';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

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
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 30px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(16,24,40,.1), 0 2px 4px rgba(16,24,40,.06)',
  },
}));

const formatDateTime = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);

const COMPLETED_PAGE_SIZE = 6;

const instructions = [
  "You are only allowed to start the test at the prescribed time. The timer will start from the current time irrespective of when you start the exam and end when the given time is up.",
  "You can see the history of test taken and scores in the Results section",
  "To start the test, click on 'Start' button in the exam section.",
  "Once the test is started the timer would run irrespective of your logged in or logged out status. So it is recommended not to logout before test completion.",
  "To mark an answer you need to select the option. Upon locking the selected options button will \"blue\".",
  "To reset the form click on the reset button at the bottom.",
                     "The assigned OctoMind tests should be completed within the submission time. Failing to complete the assessment will award you zero marks.",
  "The marks will be calculated and displayed instantly in the result section along with your percentage."
];

const boxStyles = [
  { bg: '#fff', color: '#002366', border: '1px solid #e3e6ef' },
  { bg: '#fff', color: '#1565c0', border: '1px solid #e3e6ef' },
  { bg: '#fff', color: '#37474f', border: '1px solid #e3e6ef' },
];



const professionalBoxSx = (theme: any) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(20, 24, 36, 0.92)'
    : 'linear-gradient(135deg, #f7fafd 0%, #e3eafc 100%)',
  maxWidth: 900,
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

function StudentDashboardPageContent() {
  const settings = useSettingsContext();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const theme = useTheme();

  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [userAttempts, setUserAttempts] = useState<Record<number, number>>({});
  const [availableTests, setAvailableTests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [completedPage, setCompletedPage] = useState(1);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeMessageType, setCodeMessageType] = useState<'error' | 'success' | 'warning'>('error');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [examsCount, setExamsCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  
  // Additional KPI variables
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<any[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Settings/Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    dob: '',
    gender: '',
    profile_picture: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Messages/Announcements state
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Results state
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [showLogoutSplash, setShowLogoutSplash] = useState(false);

  const [quizProgress, setQuizProgress] = useState<Record<number, boolean>>({});

  // Add a new state for code error Snackbar
  const [showCodeErrorSnackbar, setShowCodeErrorSnackbar] = useState(false);

  // After fetching results, fetch questions for each quiz and store in a map
  const [questionsMap, setQuestionsMap] = useState<Record<number, any[]>>({});

  const now = new Date();
  const classify = (q: any): 'live' | 'upcoming' | 'completed' | 'expired' => {
    const start = new Date(q.start_time);
    const end = new Date(q.end_time);
    const done = (userAttempts[q.id] || 0) >= (q.max_attempts || 1);
    if (done) return 'completed';
    if (now > end) return 'expired';
    if (now < start) return 'upcoming';
    return 'live';
  };
  const liveQuizzes = allQuizzes.filter((q) => classify(q) === 'live');
  const upcomingQuizzesFiltered = allQuizzes.filter((q) => classify(q) === 'upcoming');
  const completedQuizzesFiltered = allQuizzes.filter((q) => ['completed', 'expired'].includes(classify(q)));
  const currentCompleted = completedQuizzesFiltered.slice(
    (completedPage - 1) * COMPLETED_PAGE_SIZE,
    completedPage * COMPLETED_PAGE_SIZE
  );

  // Greeting logic
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      return { greet: 'Good Morning', icon: <WbSunnyIcon sx={{ fontSize: 60, color: '#fbc02d', background: '#fffde7', borderRadius: 2, p: 1 }} /> };
    } else if (hour >= 12 && hour < 17) {
      return { greet: 'Good Afternoon', icon: <WbTwilightIcon sx={{ fontSize: 60, color: '#ff9800', background: '#fff3e0', borderRadius: 2, p: 1 }} /> };
    } else {
      return { greet: 'Good Evening', icon: <NightsStayIcon sx={{ fontSize: 60, color: '#37474f', background: '#eceff1', borderRadius: 2, p: 1 }} /> };
    }
  };
  const { greet, icon } = getGreeting();

  // Motivational quotes with authors
  const quotes = [
    { quote: "Believe in yourself and all that you are. Have a great day of learning!", author: "Christian D. Larson" },
    { quote: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Mistakes are proof that you are trying.", author: "Jennifer Lim" },
    { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { quote: "Your only limit is your mind.", author: "Napoleon Hill" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Les Brown" },
    { quote: "Great things never come from comfort zones.", author: "Roy T. Bennett" },
    { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { quote: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
    { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { quote: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Strive for progress, not perfection.", author: "David Perlmutter" },
    { quote: "If you can dream it, you can do it.", author: "Walt Disney" },
    { quote: "Quality is not an act, it is a habit.", author: "Aristotle" }
  ];
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = Number(today.getTime()) - Number(start.getTime());
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const quoteOfTheDay = quotes[dayOfYear % quotes.length];

  useEffect(() => {
    setMounted(true);
    fetchQuizzes();
  }, [user]);

  // Cleanup redirecting state on unmount
  useEffect(() => {
    return () => {
      setIsRedirecting(false);
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const avail = allQuizzes.filter((q) => {
      const end = new Date(q.end_time);
      return now < end && (userAttempts[q.id] || 0) < (q.max_attempts || 1);
    });
    setAvailableTests(avail.length);
  }, [allQuizzes, userAttempts]);

  useEffect(() => {
    if (typeof window === 'undefined' || !liveQuizzes.length) return;
    liveQuizzes.forEach((q) => {
      if (router.prefetch) router.prefetch(`/pre-exam/${q.id}`);
    });
  }, [liveQuizzes, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => setAttemptsCount(count || 0));
    supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('is_active', true).in('target_audience', ['all', 'students']).then(({ count }) => setAnnouncementsCount(count || 0));
  }, [user]);

  // Set examsCount to number of live quizzes
  useEffect(() => {
    setExamsCount(liveQuizzes.length);
  }, [liveQuizzes]);

  // Fetch profile from Supabase on mount or user change
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('student')
        .select('full_name, email, dob, gender, profile_picture')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileForm({
          full_name: data.full_name || '',
          email: data.email || '',
          dob: data.dob || '',
          gender: data.gender || '',
          profile_picture: data.profile_picture || '',
        });
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (selectedSection !== 'messages') return;
    setMessagesLoading(true);
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .in('target_audience', ['all', 'students'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setMessagesLoading(false);
      });
  }, [selectedSection]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .in('target_audience', ['all', 'students'])
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

  useEffect(() => {
    if (selectedSection !== 'results' || !user) return;
    setResultsLoading(true);
    console.log('Fetching results for user:', user.id);
    
    // First, let's try a simple query to see if we can get any attempts
    supabase
      .from('attempts')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        console.log('Simple attempts query:', { data, error });
        if (error) {
          console.error('Error details:', error);
        }
      });
    
    // Then try the full query with joins
    supabase
      .from('attempts')
      .select(`
        *,
        quizzes:quiz_id(
          quiz_title, 
          total_marks,
          duration
        )
      `)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('Results query response:', { data, error });
        if (error) {
          console.error('Full query error details:', error);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
          console.error('Error hint:', error.hint);
        }
        console.log('Raw results data:', data);
        if (data && data.length > 0) {
          console.log('First result item:', data[0]);
        }
        setResults(data || []);
        setResultsLoading(false);
      });
  }, [selectedSection, user]);

  useEffect(() => {
    if (!user) return;
    // Create student row if not exists
    const createStudentIfNotExists = async () => {
      const { id, fullName, emailAddresses } = user;
      const email = emailAddresses?.[0]?.emailAddress;
      if (!id || !email) return;
      const { data: existing } = await supabase
        .from('student')
        .select('id')
        .eq('id', id)
        .single();
      if (!existing) {
        await supabase.from('student').insert([
          {
            id,
            full_name: fullName || '',
            email,
            // dob, gender, profile_picture can be null/empty at first
          }
        ]);
      }
    };
    createStudentIfNotExists();
  }, [user]);

  // Fetch quiz progress for all live quizzes
  useEffect(() => {
    if (!user || !liveQuizzes.length) return;
    let isMounted = true;
    const fetchProgress = async () => {
      const progressMap: Record<number, boolean> = {};
      await Promise.all(liveQuizzes.map(async (q) => {
        try {
          const res = await fetch(`/api/quiz-progress?quiz_id=${q.id}&user_id=${user.id}`);
          const { data } = await res.json();
          // No need to parse, fields are already objects with jsonb columns
          progressMap[q.id] = !!data;
        } catch {
          progressMap[q.id] = false;
        }
      }));
      if (isMounted) setQuizProgress(progressMap);
    };
    fetchProgress();
    return () => { isMounted = false; };
  }, [user, liveQuizzes]);

  // After fetching results, fetch questions for each quiz and store in a map
  useEffect(() => {
    if (!results || results.length === 0) return;
    const fetchAllQuestions = async () => {
      const quizIds = Array.from(new Set(results.map(r => r.quiz_id || r.quizzes?.id).filter(Boolean)));
      const map: Record<number, any[]> = {};
      await Promise.all(quizIds.map(async (quizId) => {
        const { data } = await supabase
          .from('questions')
          .select('id, question_text, options, marks, correct_answers')
          .eq('quiz_id', quizId)
          .order('id', { ascending: true });
        if (data) {
          map[quizId] = data.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_answers: typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers,
          }));
        }
      }));
      setQuestionsMap(map);
    };
    fetchAllQuestions();
  }, [results]);

  // Update KPI values when results or userAttempts change
  useEffect(() => {
    if (!allQuizzes.length) return;
    
    const now = new Date();
    const completed: any[] = [];
    const upcoming: any[] = [];
    let totalScore = 0;
    let scoreCount = 0;
    let totalAttemptsCount = 0;
    
    allQuizzes.forEach((quiz) => {
      const startTime = new Date(quiz.start_time);
      const attempts = userAttempts[quiz.id] || 0;
      totalAttemptsCount += attempts;
      
      if (attempts > 0) {
        completed.push(quiz);
        // Calculate average score from results
        const quizResults = results.filter(r => r.quiz_id === quiz.id);
        if (quizResults.length > 0) {
          const avgScore = quizResults.reduce((sum, r) => sum + (r.score || 0), 0) / quizResults.length;
          totalScore += avgScore;
          scoreCount++;
        }
      } else if (startTime > now) {
        upcoming.push(quiz);
      }
    });
    
    setCompletedQuizzes(completed);
    setUpcomingQuizzes(upcoming);
    setAverageScore(scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0);
    setTotalAttempts(totalAttemptsCount);
  }, [allQuizzes, userAttempts, results]);

  const fetchQuizzes = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('quizzes').select('*').eq('is_draft', false);
    setAllQuizzes(data ?? []);
    
    // Classify quizzes
    const now = new Date();
    const completed: any[] = [];
    const upcoming: any[] = [];
    let totalScore = 0;
    let scoreCount = 0;
    let totalAttemptsCount = 0;
    
    data?.forEach((quiz) => {
      const startTime = new Date(quiz.start_time);
      const endTime = new Date(quiz.end_time);
      const attempts = userAttempts[quiz.id] || 0;
      totalAttemptsCount += attempts;
      
      if (attempts > 0) {
        completed.push(quiz);
        // Calculate average score from results
        const quizResults = results.filter(r => r.quiz_id === quiz.id);
        if (quizResults.length > 0) {
          const avgScore = quizResults.reduce((sum, r) => sum + (r.score || 0), 0) / quizResults.length;
          totalScore += avgScore;
          scoreCount++;
        }
      } else if (startTime > now) {
        upcoming.push(quiz);
      }
    });
    
    setCompletedQuizzes(completed);
    setUpcomingQuizzes(upcoming);
    setAverageScore(scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0);
    setTotalAttempts(totalAttemptsCount);
    setExamsCount(data?.length || 0);
    
    if (data?.length) fetchAttempts(data.map((q) => q.id));
    setLoading(false);
  };

  const fetchAttempts = async (ids: number[]) => {
    const { data } = await supabase.from('attempts').select('quiz_id').eq('user_id', user!.id);
    const counts: Record<number, number> = {};
    ids.forEach((id) => (counts[id] = data?.filter((a) => a.quiz_id === id).length ?? 0));
    setUserAttempts(counts);
  };

  const handleAccessCodeSubmit = async () => {
    setCodeError('');
    setCodeMessageType('error');
    if (!accessCode.trim()) {
      setCodeError('⚠️ Please enter an access code to continue.');
      setCodeMessageType('warning');
      setShowCodeErrorSnackbar(true);
      return;
    }
    setCodeLoading(true);
    try {
      const { data } = await supabase.from('quizzes').select('*').eq('access_code', accessCode).single();
      if (!data) {
        setCodeError('❌ Invalid access code. Please check the code and try again.');
        setCodeMessageType('error');
        setShowCodeErrorSnackbar(true);
        return;
      }
      
      // Check if user has reached maximum attempts
      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('id')
        .eq('quiz_id', data.id)
        .eq('user_id', user!.id);
      
      const currentAttempts = attemptsData?.length || 0;
      if (currentAttempts >= (data.max_attempts || 1)) {
        setCodeError(`⚠️ Maximum attempts reached for "${data.quiz_title}". You have already completed this quiz.`);
        setCodeMessageType('warning');
        setShowCodeErrorSnackbar(true);
        return;
      }
      
      const now = new Date();
      if (now < new Date(data.start_time)) {
        setCodeError(`⏰ Quiz "${data.quiz_title}" has not started yet. Please wait for the scheduled start time.`);
        setCodeMessageType('warning');
        setShowCodeErrorSnackbar(true);
      } else if (now > new Date(data.end_time)) {
        setCodeError(`⏰ Quiz "${data.quiz_title}" has ended. The submission deadline has passed.`);
        setCodeMessageType('warning');
        setShowCodeErrorSnackbar(true);
      } else {
        // Quiz found and accessible
        setCodeError(`✅ Quiz "${data.quiz_title}" found successfully! Redirecting to exam instructions...`);
        setCodeMessageType('success');
        setShowCodeErrorSnackbar(true);
        // Clear the access code input
        setAccessCode('');
        // Set redirecting state to show skeleton loader
        setIsRedirecting(true);
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push(`/pre-exam/${data.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking access code:', error);
      setCodeError('❌ Unable to verify access code. Please check your connection and try again.');
      setCodeMessageType('error');
      setShowCodeErrorSnackbar(true);
      setIsRedirecting(false); // Reset redirecting state on error
    } finally {
      setCodeLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;
    setProfileLoading(true);
    setProfileError('');
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      console.log('Uploading to bucket: profile-pictures, filePath:', filePath, 'user:', user);
      const { error: uploadError, data: uploadData } = await supabase.storage.from('profile-pictures').upload(filePath, file, { upsert: true });
      if (uploadError) {
        console.error('Supabase upload error:', uploadError, JSON.stringify(uploadError, null, 2));
        setProfileError('Failed to upload image: ' + (uploadError.message || JSON.stringify(uploadError)));
        setProfileLoading(false);
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
      console.log('getPublicUrl data:', publicUrlData);
      const publicUrl = publicUrlData?.publicUrl;
      if (publicUrl) {
        setProfileForm((prev) => ({ ...prev, profile_picture: publicUrl }));
        // Update in DB immediately
        const { error: dbError } = await supabase.from('student').update({ profile_picture: publicUrl }).eq('id', user.id);
        if (dbError) {
          console.error('Supabase DB update error:', dbError);
          setProfileError('Failed to update profile picture in database: ' + dbError.message);
          setProfileLoading(false);
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
      setProfileLoading(false);
    } catch (err: any) {
      console.error('Unexpected error during upload:', err, JSON.stringify(err, null, 2));
      setProfileError('Unexpected error: ' + (err.message || JSON.stringify(err)));
      setProfileLoading(false);
    }
  };

  // Handle delete profile picture
  const handleDeleteProfilePic = async () => {
    if (!user || !profileForm.profile_picture) return;
    setProfileLoading(true);
    setProfileError('');
    try {
      // Extract file name from URL
      const urlParts = profileForm.profile_picture.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      // Remove from storage
      const { error: removeError } = await supabase.storage.from('profile-pictures').remove([fileName]);
      if (removeError) {
        setProfileError('Failed to delete image: ' + removeError.message);
        setProfileLoading(false);
        return;
      }
      // Set profile_picture to null in DB
      const { error: dbError } = await supabase.from('student').update({ profile_picture: null }).eq('id', user.id);
      if (dbError) {
        setProfileError('Failed to update database: ' + dbError.message);
        setProfileLoading(false);
        return;
      }
      setProfileForm((prev) => ({ ...prev, profile_picture: '' }));
      setProfileSuccess('Profile photo deleted.');
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
      setProfileError('Unexpected error: ' + (err.message || String(err)));
    }
    setProfileLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    if (!user) return;
    const { full_name, email, dob, gender, profile_picture } = profileForm;
    const { error } = await supabase.from('student').update({
      full_name,
      email,
      dob,
      gender,
      profile_picture,
    }).eq('id', user.id);
    if (error) {
      setProfileError('Failed to update profile.');
    } else {
      setProfileSuccess('Profile updated successfully!');
    }
    setProfileLoading(false);
  };

  // Add this useEffect to auto-clear success messages
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

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

  if (!mounted || !user) return null;

  // Remove splash/skeleton loader: show minimal spinner on white bg if loading
  if (loading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F8FAFC' }}>
        <CircularProgress />
      </Box>
    );
  }



  const helpContent = (
    <StyledCard>
      <CardHeader
        title="About & Help"
        titleTypographyProps={{ variant: 'h5', fontWeight: 700, color: 'text.primary' }}
        sx={{ pb: 2 }}
      />
      <CardContent>
        <Box mt={2}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 3, fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            How to use
      </Typography>
        <Box component="ol" sx={{ pl: 3 }}>
            <li style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                How to logout?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Click on the logout button at the left bottom on the navigation bar.
              </Typography>
            </li>
            <li style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                How to edit my profile details?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Click on the settings option from the left navigation bar. After filling the required columns, click on update.
              </Typography>
            </li>
            <li style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                How to view the results?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Go to the results option from the left navigation bar to view the results.
              </Typography>
            </li>
            <li style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                How to attempt exams?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Navigate to the exams tab by clicking on the exams button from the left navigation bar. Tests can be attempted from here.
              </Typography>
            </li>
            <li style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                How to view announcements?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Click on the messages option from the left navigation bar.
              </Typography>
            </li>
        </Box>
      </Box>
      </CardContent>
    </StyledCard>
  )

  const settingsContent = (
    <StyledCard>
      <CardHeader
        title="My Profile"
        titleTypographyProps={{ variant: 'h5', fontWeight: 700, color: 'text.primary' }}
        sx={{ pb: 2 }}
      />
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar src={profileForm.profile_picture || user.imageUrl} alt="pro" sx={{ width: 80, height: 80, border: '2px solid #E5E7EB', mb: 2 }} />
        <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={profileLoading}
              sx={{ 
                borderRadius: 2, 
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
              }}
            >
            {profileLoading ? 'Uploading...' : 'Change Photo'}
          </Button>
          {profileForm.profile_picture && (
              <Button 
                variant="outlined" 
                size="small" 
                color="error" 
                onClick={handleDeleteProfilePic} 
                disabled={profileLoading}
                sx={{ 
                  borderRadius: 2, 
                  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
                }}
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
      <form onSubmit={handleProfileSubmit}>
        <TextField
          label="Full Name"
          name="full_name"
          value={profileForm.full_name}
          onChange={handleProfileChange}
          fullWidth
          margin="normal"
          required
            sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        />
        <TextField
          label="Email"
          name="email"
          value={profileForm.email}
          onChange={handleProfileChange}
          fullWidth
          margin="normal"
          required
            sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        />
        <TextField
          label="Date of Birth"
          name="dob"
          type="date"
          value={profileForm.dob}
          onChange={handleProfileChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
            sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        />
        <TextField
          label="Gender (M or F)"
          name="gender"
          value={profileForm.gender}
          onChange={handleProfileChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 1 }}
          required
            sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
            sx={{ 
              mt: 3, 
              fontWeight: 600, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', 
              color: '#fff', 
              fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              '&:hover': { 
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' 
              } 
            }}
          disabled={profileLoading}
        >
          {profileLoading ? 'Updating…' : 'Update'}
        </Button>
      </form>
      {/* Snackbar for success */}
      <Snackbar
        open={!!profileSuccess}
        autoHideDuration={3000}
        onClose={() => setProfileSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setProfileSuccess('')} severity="success" sx={{ width: '100%' }}>
          {profileSuccess}
        </Alert>
      </Snackbar>
      {/* Snackbar for error */}
      <Snackbar
        open={!!profileError}
        autoHideDuration={4000}
        onClose={() => setProfileError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setProfileError('')} severity="error" sx={{ width: '100%' }}>
          {profileError}
        </Alert>
      </Snackbar>
      </CardContent>
    </StyledCard>
  );

  const messagesContent = (
    <Box
      p={{ xs: 2, sm: 3 }}
      borderRadius={4}
      boxShadow={4}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`
          : `linear-gradient(135deg, #e3eafc 0%, #f7fafd 100%)`,
        width: '100%',
        mx: 0,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        fontFamily: 'Poppins, sans-serif',
        minHeight: 320,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 800,
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: 1.2,
        }}
      >
        Announcements
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px 0 rgba(0,0,0,0.3)' 
            : '0 8px 32px 0 rgba(30,64,175,0.10)',
          background: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'transparent',
          borderRadius: 4,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          p: 0,
          width: '100%',
          minWidth: 0,
          overflowX: 'auto',
          mx: 0,
        }}
      >
        <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #1e293b 60%, #334155 100%)'
                  : 'linear-gradient(90deg, #e3eafc 60%, #dbeafe 100%)',
                height: 68,
              }}
            >
              <TableCell align="left" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '1.05rem', color: theme.palette.primary.main, py: 1.5, px: 3, border: 'none' }}>Priority</TableCell>
              <TableCell align="left" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '1.05rem', color: theme.palette.primary.main, maxWidth: 180, wordBreak: 'break-word', py: 1.5, px: 3, border: 'none' }}>Title</TableCell>
              <TableCell align="left" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.9, color: theme.palette.primary.main, maxWidth: 260, wordBreak: 'break-word', fontSize: '1.05rem', py: 1.5, px: 3, border: 'none' }}>Content</TableCell>
              <TableCell align="left" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '1.12rem', color: theme.palette.primary.main, py: 2.5, px: 3, border: 'none' }}>Target</TableCell>
              <TableCell align="left" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '1.12rem', color: theme.palette.primary.main, py: 2.5, px: 3, border: 'none' }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messagesLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, border: 'none' }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : messages.length > 0 ? (
              messages.map((row, idx) => {
                const priorityColor = row.priority === 3 ? '#d32f2f' : row.priority === 2 ? '#f57c00' : '#1976d2';
                const priorityText = row.priority === 3 ? 'URGENT' : row.priority === 2 ? 'IMPORTANT' : 'NORMAL';
                // Use a soft background color for the whole row based on priority
                const rowBg = theme.palette.mode === 'dark' 
                  ? (row.priority === 3 ? '#2d1b1b' : row.priority === 2 ? '#2d2a1b' : '#1a2332')
                  : (row.priority === 3 ? '#ffebee' : row.priority === 2 ? '#fffde7' : '#e3f2fd');
                const hoverBg = theme.palette.mode === 'dark'
                  ? (row.priority === 3 ? '#3d2a2a' : row.priority === 2 ? '#3d3a2a' : '#2a3342')
                  : (row.priority === 3 ? '#ffcdd2' : row.priority === 2 ? '#ffe0b2' : '#bbdefb');
                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      background: rowBg,
                      transition: 'background 0.2s',
                      height: 72,
                      border: 'none',
                      '&:hover': {
                        background: hoverBg,
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2.2, px: 3, border: 'none' }}>
                      <Chip 
                        label={priorityText} 
                        size="medium"
                        sx={{ 
                          backgroundColor: priorityColor, 
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
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, maxWidth: 180, wordBreak: 'break-word', fontSize: '0.95rem', py: 1.2, px: 3, border: 'none' }}>{row.title}</TableCell>
                    <TableCell sx={{ maxWidth: 260, wordBreak: 'break-word', color: theme.palette.text.secondary, fontSize: '0.95rem', py: 1.2, px: 3, border: 'none' }}>
                      <Tooltip title={row.content} placement="top" arrow>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, cursor: 'pointer' }}>
                        {row.content}
                      </Typography>
                      </Tooltip>
                      {row.tags && row.tags.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {row.tags.map((tag: string, tagIdx: number) => (
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
                        label={row.target_audience?.toUpperCase()}
                        size="medium"
                        variant="outlined"
                        color={row.target_audience === 'all' ? 'default' : row.target_audience === 'students' ? 'success' : 'info'}
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
                      {row.created_at ? dayjs(row.created_at).format('YYYY-MM-DD') : ''}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, border: 'none' }}>
                  No announcements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const resultsContent = (
    <Box
      p={{ xs: 2, sm: 3 }}
      borderRadius={3}
      boxShadow={2}
      sx={{
        background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
        width: '100%',
        mx: 0,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        fontFamily: 'Poppins, sans-serif',
        minHeight: 320,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{
          color: '#111',
          fontWeight: 800,
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: 1.2,
        }}
      >
        My Results
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
          borderRadius: 3,
          border: 'none',
          p: 0,
          width: '100%',
          minWidth: 0,
          overflowX: 'auto',
          mx: 0,
          mt: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f5f5', 
              height: 60 
            }}>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Student Name</TableCell>
              <TableCell align="left" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Exam Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Total Qs</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Correct</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Marks</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>%</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Time Taken</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Completed</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Review</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '1.01rem', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111', py: 1.5, px: 3, border: 'none' }}>Marked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultsLoading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5, border: 'none', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111' }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : results.length > 0 ? (
              results.map((row, idx) => {
                const studentName = row.user_name || user?.firstName || '-';
                const examName = row.quizzes?.quiz_title || '-';
                // Defensive: get questions array if available
                const quizId = row.quiz_id || row.quizzes?.id;
                const questions = questionsMap && questionsMap[quizId] ? questionsMap[quizId] : [];
                const totalQuestions = questions.length > 0 ? questions.length : (row.total_questions || 0);
                const correctAnswers = typeof row.correct_count === 'number' ? row.correct_count : (Array.isArray(row.correct_answers) ? row.correct_answers.length : (row.correct_answers ? Object.keys(row.correct_answers).length : 0));
                // Use values from attempts table if present
                const marksObtained = typeof row.score === 'number' ? row.score : 0;
                const totalMarks = typeof row.total_marks === 'number' ? row.total_marks : (row.quizzes?.total_marks || 0);
                const safeMarksObtained = isNaN(marksObtained) ? 0 : marksObtained;
                const safeTotalMarks = isNaN(totalMarks) ? 0 : totalMarks;
                const percentage = typeof row.percentage === 'number'
                  ? row.percentage.toFixed(2)
                  : (safeTotalMarks > 0 ? ((safeMarksObtained / safeTotalMarks) * 100).toFixed(2) : '0.00');
                // Time calculation
                let timeTaken = '-';
                      const startTime = row.start_time ? new Date(row.start_time) : null;
                const endTime = row.completed_at
                  ? new Date(row.completed_at)
                  : row.submitted_at
                    ? new Date(row.submitted_at)
                    : null;

                      if (startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                        const diff = Math.max(0, endTime.getTime() - startTime.getTime());
                        const mins = Math.floor(diff / 60000);
                        const secs = Math.floor((diff % 60000) / 1000) % 60;
                  timeTaken = `${mins}m ${secs}s`;
                }
                const markedForReview = row.marked_for_review || row.marked_questions || {};
                const questionOrderMap = questions.reduce((acc, q, i) => { acc[q.id] = i + 1; return acc; }, {});
                const marked = Object.keys(markedForReview).filter(qid => markedForReview[qid]);
                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, border: 'none', px: 3 }}>{studentName}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, border: 'none', px: 3 }}>{examName}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{totalQuestions}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{correctAnswers}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{safeMarksObtained.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{safeTotalMarks.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.primary }}>{percentage}%</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{timeTaken}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3, color: theme.palette.text.secondary }}>{row.submitted_at ? dayjs(row.submitted_at).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => router.push(`/result/${row.id}`)}
                        sx={{ borderRadius: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif', color: '#111', borderColor: '#bbb', '&:hover': { background: '#eee', borderColor: '#111' } }}
                      >
                        Review
                      </Button>
                    </TableCell>
                    <TableCell align="center" sx={{ border: 'none', px: 3 }}>
                      {marked.length === 0 ? (
                        <Chip label="None" size="small" color="default" variant="outlined" sx={{ color: '#111', borderColor: '#bbb' }} />
                      ) : (
                        <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                            {marked.map(qid => (
                              <Chip
                                key={qid}
                                label={`Q-${questionOrderMap[qid] || qid}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                              sx={{ fontWeight: 600, color: '#111', borderColor: '#bbb', background: 'transparent' }}
                              />
                            ))}
                          </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5, border: 'none', color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#111' }}>
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Main Content */}
      <Box component="main" sx={{ minHeight: '100vh', background: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F8FAFC', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        {/* Top Navigation Bar - Matching Teacher Design */}
        <Box
          sx={{
            background: theme.palette.mode === 'dark' ? '#0B1220' : '#FFFFFF',
            borderBottom: theme.palette.mode === 'dark' ? '1px solid #1E293B' : '1px solid #E5E7EB',
            px: { xs: 4, sm: 6, md: 8 },
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            width: '100%'
          }}
        >
          {/* Left: Logo and Branding */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                borderRadius: '12px',
                background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: theme.palette.mode === 'dark' ? '2px solid #334155' : '2px solid #E5E7EB'
                }}>
                  <img 
                  src="/favicon.svg" 
                    alt="OctoMind Logo" 
                    style={{ 
                    width: '28px', 
                    height: '28px'
                    }} 
                  />
                </Box>
                <Box>
                <Typography variant="h6" fontWeight={700} sx={{ 
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A', 
                  fontSize: '1.25rem',
                  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                    OctoMind
                  </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.mode === 'dark' ? '#94A3B8' : '#6B7280', 
                  fontSize: '0.75rem',
                  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  Student Portal
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
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good Morning';
                    if (hour < 17) return 'Good Afternoon';
                    return 'Good Evening';
                  })()}, {user?.firstName || user?.fullName || 'Student'}!
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
              {user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || 'S'}
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
                    setSelectedSection('messages');
                    setNotificationDropdownOpen(false);
                  }}
                  sx={{ fontSize: '0.875rem' }}
                >
                  View All Messages
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Menu Strip - Navigation Items - Matching Teacher Design */}
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
              { text: 'Messages', tab: 'messages', icon: <BellIcon size={18} /> },
              { text: 'Settings', tab: 'settings', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
              { text: 'Help', tab: 'help', icon: <HelpIcon sx={{ fontSize: 18 }} /> }
            ].map((item) => (
              <Box
                key={item.text}
                onClick={() => setSelectedSection(item.tab)}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${item.text} section`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSection(item.tab);
                  }
                }}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  color: selectedSection === item.tab ? '#FFFFFF' : '#E5E7EB',
                  borderBottom: selectedSection === item.tab ? '2px solid #2563EB' : '2px solid transparent',
                  backgroundColor: selectedSection === item.tab ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                  borderRadius: '8px',
                px: 2,
                py: 1,
                  minHeight: 40,
                  transition: 'all 0.2s ease',
                  border: selectedSection === item.tab ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                '&:hover': {
                    color: '#FFFFFF',
                    backgroundColor: selectedSection === item.tab ? 'rgba(37, 99, 235, 0.2)' : '#2A2A2A',
                    borderBottomColor: selectedSection === item.tab ? theme.palette.primary.main : theme.palette.primary.light,
                    border: selectedSection === item.tab ? `1px solid ${theme.palette.primary.main}` : '1px solid #2A2A2A',
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
                    fontWeight: selectedSection === item.tab ? 600 : 500,
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

        {/* Main Content Container */}
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 py-6 space-y-6">

        {selectedSection === 'dashboard' && (
          <>
            {/* KPI Cards - Row 1 */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Available Exams
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {examsCount}
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
                          Upcoming Exams
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {upcomingQuizzes.length}
              </Typography>
            </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CalendarIcon size={24} color="white" />
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
                          {announcementsCount}
              </Typography>
            </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BellIcon size={24} color="white" />
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
                          Completed Exams
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {completedQuizzes.length}
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
              
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1, color: 'text.secondary' }}>
                          Average Score
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {averageScore}%
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
                          Total Attempts
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: '2.5rem', color: 'text.primary' }}>
                          {totalAttempts}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>

            {/* General Instructions */}
            <StyledCard sx={{ mb: 4, fontFamily: 'Poppins, sans-serif' }}>
              <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" align="center" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                :: General Instructions ::
              </Typography>
              <ul style={{ paddingLeft: 24 }}>
                {instructions.map((ins, idx) => (
                  <li key={idx} style={{ marginBottom: 14, color: theme.palette.text.secondary, fontSize: 16, lineHeight: 1.7, fontFamily: 'Poppins, sans-serif' }}>{ins}</li>
                ))}
              </ul>
              </CardContent>
            </StyledCard>
          </>
        )}

        {selectedSection === 'exams' && (
          <>
            {/* Access Quiz by Code - Redesigned */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                mb: 6,
                px: 2
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 480,
                  background: '#ffffff',
                  borderRadius: 4,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Header Section */}
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: '#ffffff',
                    p: 4,
                    textAlign: 'center'
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.025em',
                      mb: 1
                    }}
                  >
                    Enter Your Exam Code
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#cbd5e1',
                      fontSize: '1rem',
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.6,
                      maxWidth: '400px',
                      mx: 'auto'
                    }}
                  >
                    Please enter the code provided by your instructor to begin your exam.
                  </Typography>
                </Box>

                {/* Form Section */}
                <Box sx={{ p: 4 }}>
                  {isRedirecting ? (
                    // Skeleton Loader for Redirect
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 3,
                      py: 4
                    }}>
                      {/* Success Icon Animation */}
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                          '100%': { transform: 'scale(1)', opacity: 1 }
                        }
                      }}>
                        <Box sx={{ 
                          color: 'white', 
                          fontSize: '2rem',
                          animation: 'bounce 1s infinite',
                          '@keyframes bounce': {
                            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                            '40%': { transform: 'translateY(-10px)' },
                            '60%': { transform: 'translateY(-5px)' }
                          }
                        }}>
                          ✓
                        </Box>
                      </Box>
                      
                      {/* Loading Text */}
                      <Typography variant="h6" sx={{ 
                        color: '#10b981', 
                        fontWeight: 600,
                        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        textAlign: 'center'
                      }}>
                        Quiz Found Successfully!
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280', 
                        textAlign: 'center',
                        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}>
                        Redirecting to exam instructions...
                      </Typography>
                      
                      {/* Progress Bar */}
                      <Box sx={{ 
                        width: '100%', 
                        height: 4, 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: 2,
                        overflow: 'hidden',
                        mt: 2
                      }}>
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          borderRadius: 2,
                          animation: 'progress 2s ease-in-out',
                          '@keyframes progress': {
                            '0%': { transform: 'translateX(-100%)' },
                            '100%': { transform: 'translateX(0%)' }
                          }
                        }} />
                      </Box>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Access Code..."
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAccessCodeSubmit();
                        }
                      }}
                      error={codeMessageType === 'error'}
                      helperText={codeError}
                      disabled={codeLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1.1rem',
                          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                              borderWidth: '2px'
                            }
                          },
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                              borderWidth: '2px',
                              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: 500
                        },
                        '& .MuiFormHelperText-root': {
                          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: codeMessageType === 'success' ? '#16a34a' : 
                                 codeMessageType === 'warning' ? '#f59e0b' : 
                                 codeMessageType === 'error' ? '#ef4444' : '#6b7280'
                        }
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={codeLoading || !accessCode.trim()}
                      onClick={handleAccessCodeSubmit}
                      sx={{
                        height: 56,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        textTransform: 'none',
                        letterSpacing: '0.025em',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.5)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 8px 0 rgba(59, 130, 246, 0.3)'
                        },
                        '&:disabled': {
                          background: '#9ca3af',
                          color: '#ffffff',
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                    >
                      {codeLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          <span>Checking Code...</span>
                        </Box>
                      ) : (
                        'Begin Exam'
                      )}
                    </Button>
                  </Stack>
                  )}
                </Box>
              </Box>
            </Box>
            <Snackbar
              open={showCodeErrorSnackbar}
              autoHideDuration={codeMessageType === 'success' ? 2000 : 3500}
              onClose={() => setShowCodeErrorSnackbar(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                severity={codeMessageType} 
                onClose={() => setShowCodeErrorSnackbar(false)} 
                sx={{ 
                  width: '100%',
                  ...(codeMessageType === 'success' && {
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    color: '#0c4a6e',
                    '& .MuiAlert-icon': {
                      color: '#0ea5e9'
                    },
                    '& .MuiAlert-message': {
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  }),
                  ...(codeMessageType === 'error' && {
                    backgroundColor: '#fef2f2',
                    border: '1px solid #ef4444',
                    color: '#991b1b',
                    '& .MuiAlert-icon': {
                      color: '#ef4444'
                    },
                    '& .MuiAlert-message': {
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  }),
                  ...(codeMessageType === 'warning' && {
                    backgroundColor: '#fffbeb',
                    border: '1px solid #f59e0b',
                    color: '#92400e',
                    '& .MuiAlert-icon': {
                      color: '#f59e0b'
                    },
                    '& .MuiAlert-message': {
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  })
                }}
              >
                {codeError || 'Invalid code.'}
              </Alert>
            </Snackbar>
            {/* All other exam/quiz lists and actions are removed/commented out */}
          </>
        )}

        {/* Settings/Profile Section */}
        {selectedSection === 'settings' && settingsContent}

        {/* Help/About Section */}
        {selectedSection === 'help' && helpContent}

        {/* Messages/Announcements Section */}
        {selectedSection === 'messages' && messagesContent}

        {/* Results Section */}
        {selectedSection === 'results' && resultsContent}
        </div>

        {/* Footer */}
        <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #3B82F6' }}>
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
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                OctoMind
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              © {new Date().getFullYear()} OctoMind. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              v1.0.0
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle sx={{ color: '#002366', fontWeight: 700 }}>
          Log Out
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
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLogoutDialogOpen(false);
              setShowLogoutSplash(true);
            }}
            color="error"
            variant="contained"
          >
            Yes, Log me out
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

export default function StudentDashboardPage() {
  return (
    <ThemeModeProvider>
        <StudentDashboardPageContent />
    </ThemeModeProvider>
  );
}

function QuizCard({
  quiz,
  status,
  attempts,
  hasProgress = false,
  onStart,
}: {
  quiz: any;
  status: 'live' | 'upcoming' | 'completed' | 'expired';
  attempts: number;
  hasProgress?: boolean;
  onStart: () => void;
}) {
  const start = new Date(quiz.start_time);
  const end = new Date(quiz.end_time);
  const theme = useTheme();

  const map = {
    live: { badge: 'LIVE', bg: 'info.light', text: 'info.darker', btn: 'primary', disabled: false },
    upcoming: { badge: 'UPCOMING', bg: 'warning.light', text: 'warning.darker', btn: 'secondary', disabled: true },
    completed: { badge: 'COMPLETED', bg: 'success.light', text: 'success.darker', btn: 'secondary', disabled: true },
    expired: { badge: 'EXPIRED', bg: 'error.light', text: 'error.darker', btn: 'secondary', disabled: true },
  }[status];

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box
        p={3}
        borderRadius={3}
        border="none"
        bgcolor={theme.palette.background.paper}
        boxShadow={2}
        minHeight={310}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        sx={{ '&:hover': { transform: status === 'live' ? 'translateY(-4px)' : undefined }, transition: '.2s', fontFamily: 'Poppins, sans-serif' }}
      >
        <Stack spacing={1}>
          <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>{quiz.quiz_title}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box px={1.5} py={0.4} borderRadius={2} fontSize={12} fontWeight={600} textTransform="uppercase" bgcolor={map.bg} color={map.text} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {map.badge}
            </Box>
            <Typography variant="caption" color="text.secondary">Starts: {formatDateTime(start)}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" ml={6}>Ends: {formatDateTime(end)}</Typography>
          <Typography variant="body2" color="text.secondary">Duration: <strong>{quiz.duration_minutes} min</strong></Typography>
          <Typography variant="body2" color="text.secondary">Attempts: <strong>{attempts}</strong> / {quiz.max_attempts}</Typography>
          <Typography variant="body2" color="text.secondary">Pass: <strong>{quiz.pass_marks}</strong> / {quiz.total_marks}</Typography>
        </Stack>
        <Button
          variant="contained"
          color={map.btn as any}
          disabled={map.disabled}
          onClick={onStart}
          sx={{ mt: 3, textTransform: 'none', fontWeight: 600, borderRadius: 2, background: theme.palette.primary.main, color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', '&:hover': { background: theme.palette.primary.dark } }}
          startIcon={status === 'live' && hasProgress ? <ReplayIcon /> : <PlayArrowIcon />}
        >
          {status === 'live' ? (hasProgress ? 'Resume Quiz' : 'Start Quiz') : map.badge}
        </Button>
      </Box>
    </Grid>
  );
}

export function ExamsPage() {
  const { user } = useUser();
  const theme = useTheme();
  const { signOut } = useClerk();
  const router = useRouter();

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      // Fetch all quizzes (exams) from your schema
      const { data, error } = await supabase.from('quizzes').select('*').eq('is_draft', false);
      setExams(data ?? []);
      setLoading(false);
    };
    fetchExams();
  }, []);

  const sidebarLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => router.push('/dashboard/student') },
    { text: 'Exams', icon: <BookIcon />, onClick: () => {}, active: true },
    { text: 'Results', icon: <BarChartIcon />, onClick: () => router.push('/dashboard/student?tab=results') },
    { text: 'Messages', icon: <MessageIcon />, onClick: () => router.push('/dashboard/student?tab=messages') },
    { text: 'Settings', icon: <SettingsIcon />, onClick: () => router.push('/dashboard/student?tab=settings') },
    { text: 'Help', icon: <HelpIcon />, onClick: () => router.push('/dashboard/student?tab=help') },
    { text: 'Log out', icon: <LogoutIcon />, onClick: () => signOut(), logout: true },
  ];

  return (
    <Box display="flex" sx={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            background: '#002366', // Always dark blue
            color: '#fff', // Always white text
            border: 'none',
            minHeight: '100vh',
            boxShadow: '2px 0 8px 0 rgba(0,0,0,0.04)',
            transition: 'all 0.5s',
          },
        }}
      >
        <Box display="flex" alignItems="center" p={2} mb={1}>
          <DashboardIcon sx={{ mr: 1, color: '#fff', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: 22, letterSpacing: 1 }}>Welcome</Typography>
        </Box>
        <List sx={{ mt: 2 }}>
          {sidebarLinks.map((link, idx) => (
            <ListItem
              button
              key={link.text}
              onClick={link.onClick}
              sx={{
                color: link.logout ? '#ff5252' : '#fff',
                background: link.active ? '#001b4e' : 'none',
                borderRadius: '30px 0 0 30px',
                mb: 1,
                fontWeight: link.active ? 600 : 400,
                pl: 2,
                pr: 1,
                '&:hover': { background: '#001b4e' },
                transition: 'all 0.4s',
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} sx={{ '.MuiTypography-root': { fontSize: 16, fontWeight: 500, color: '#fff' } }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Poppins, sans-serif' }}>
        {/* Top Bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          p={2}
          borderRadius={2}
          sx={{
            background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#002366',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: 'none',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#002366', fontFamily: 'Poppins, sans-serif' }}>Exams</Typography>
          <Box display="flex" alignItems="center">
            <Avatar src={user?.imageUrl} alt="pro" sx={{ mr: 2, border: '2px solid #e3e6ef', width: 44, height: 44 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#002366', fontFamily: 'Poppins, sans-serif' }}>{user?.firstName}</Typography>
          </Box>
        </Box>

        {/* Exams Table */}
        <StyledCard sx={{ fontFamily: 'Poppins, sans-serif', maxWidth: 1200, mx: 'auto' }}>
          <CardContent sx={{ p: 3 }}>
          {loading ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sl.no</TableCell>
                    <TableCell>Exam Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>No. of questions</TableCell>
                    <TableCell>Exam time</TableCell>
                    <TableCell>Submission time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam, idx) => (
                    <TableRow key={exam.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{exam.quiz_title}</TableCell>
                      <TableCell>{exam.description}</TableCell>
                      <TableCell>{exam.subject || '-'}</TableCell>
                      <TableCell>{exam.nq || '-'}</TableCell>
                      <TableCell>{exam.duration} min</TableCell>
                      <TableCell>{exam.end_time ? dayjs(exam.end_time).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => router.push(`/pre-exam/${exam.id}`)}
                          sx={{ borderRadius: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif', background: theme.palette.primary.main, color: '#FFFFFF', '&:hover': { background: theme.palette.primary.dark } }}
                        >
                          Start
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </CardContent>
        </StyledCard>
      </Box>
    </Box>
  );
}