'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Paper,
  CardHeader,
  Divider,
  MenuItem,
  TablePagination,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { useClerk, useUser } from '@clerk/nextjs';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { supabase } from '@/utils/supabaseClient';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Send as PaperPlaneIcon,
  ShowChart as LineAxisIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
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
import { useSettingsContext } from '@/context/settings-context';
import Iconify from '@/components/iconify/Iconify';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Lazy load components
const QuizTable = lazy(() => import('@/components/dashboard/QuizTable'));
const QuizAnalytics = lazy(() => import('@/components/dashboard/QuizAnalytics'));
const AppWelcome = lazy(() => import('@/sections/overview/app-welcome'));
const AppWidgetSummary = lazy(() => import('@/sections/overview/app-widget-summary'));

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

export default withRole(TeacherDashboardPage, ["teacher"]);

function TeacherDashboardPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const settings = useSettingsContext();
  const theme = useTheme();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [createAnnouncementOpen, setCreateAnnouncementOpen] = useState(false);

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
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  const fetchQuizzes = async () => {
    if (!user?.id) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
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
      fetchQuizzes();

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
      if (!user?.id) return;
      setStatsLoading(true);
      try {
        // Students (filter by teacher_id if available, else leave as is)
        const { count: students } = await supabase.from('student').select('id', { count: 'exact', head: true });
        setStudentCount(students || 0);
        // Exams (only this teacher's)
        const { count: exams } = await supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
        setExamCount(exams || 0);
        // Results (attempts for this teacher's quizzes)
        const { count: results } = await supabase
          .from('attempts')
          .select('id', { count: 'exact', head: true })
          .in('quiz_id', (
            (await supabase.from('quizzes').select('id').eq('user_id', user.id)).data?.map(q => q.id) || []
          ));
        setResultCount(results || 0);
        // Announcements (already filtered)
        const { count: announcements } = await supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('sender_id', user.id);
        setAnnouncementCount(announcements || 0);
        // Recent results (last 8)
        const { data: recent } = await supabase
          .from('attempts')
          .select(`*, quizzes:quiz_id(quiz_title, total_marks, user_id)`) // include user_id for filtering
          .order('submitted_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8);
        setRecentResults((recent || []).filter(r => r.quizzes?.user_id === user.id));
        setStatsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setExamsLoading(true);
    supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        const teacherExams = (data || []).filter((e: any) => e.user_id === user!.id);
        const quizIds: number[] = teacherExams.map((q: any) => q.id);
        if (quizIds.length === 0) {
          setExams([]);
          setExamsLoading(false);
          return;
        }
        const { data: questions } = await supabase
          .from('questions')
          .select('id, quiz_id');
        const questionCounts: Record<number, number> = {};
        (questions || []).forEach((q: { quiz_id: number }) => {
          if (quizIds.includes(q.quiz_id)) {
            questionCounts[q.quiz_id] = (questionCounts[q.quiz_id] || 0) + 1;
          }
        });
        const teacherExamsWithCounts = teacherExams.map((q: any) => ({
          ...q,
          questions_count: questionCounts[q.id] || 0,
        }));
        setExams(teacherExamsWithCounts);
        setExamsLoading(false);
      });
  }, [user?.id]);

  // Sidebar navigation links
  const sidebarLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, tab: 'dashboard', onClick: () => router.push('/dashboard/teacher?tab=dashboard') },
    { text: 'Exams', icon: <BookIcon />, tab: 'exams', onClick: () => router.push('/dashboard/teacher?tab=exams') },
    { text: 'Results', icon: <BarChartIcon />, tab: 'results', onClick: () => router.push('/dashboard/teacher?tab=results') },
    { text: 'Records', icon: <PersonIcon />, tab: 'records', onClick: () => router.push('/dashboard/teacher?tab=records') },
    { text: 'Messages', icon: <MessageIcon />, tab: 'messages', onClick: () => router.push('/dashboard/teacher?tab=messages') },
    { text: 'Settings', icon: <SettingsIcon />, tab: 'settings', onClick: () => router.push('/dashboard/teacher?tab=settings') },
    { text: 'Help', icon: <HelpIcon />, tab: 'help', onClick: () => router.push('/dashboard/teacher?tab=help') },
    { text: 'Log out', icon: <LogoutIcon />, onClick: () => setLogoutDialogOpen(true), logout: true },
  ];

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

  if (!isLoaded || loading) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
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
    <Box sx={{ display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: 'none',
            minHeight: '100vh',
            boxShadow: '2px 0 8px 0 rgba(0,0,0,0.04)',
            transition: 'all 0.5s',
          },
        }}
      >
        <Box display="flex" alignItems="center" p={2} mb={1}>
          <DashboardIcon sx={{ mr: 1, color: theme.palette.text.primary, fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: 22, letterSpacing: 1 }}>Welcome</Typography>
        </Box>
        <List sx={{ mt: 2 }}>
          {sidebarLinks.map((link, idx) => (
            <ListItem
              button
              key={link.text}
              onClick={link.onClick}
              sx={{
                color: link.logout ? '#ff5252' : theme.palette.text.primary,
                background: link.tab && link.tab === currentTab ? theme.palette.action.selected : 'none',
                borderRadius: '30px 0 0 30px',
                mb: 1,
                fontWeight: link.tab && link.tab === currentTab ? 600 : 400,
                pl: 2,
                pr: 1,
                '&:hover': { background: theme.palette.action.selected },
                transition: 'all 0.4s',
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} sx={{ '.MuiTypography-root': { fontSize: 16, fontWeight: 500 } }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, minHeight: '100vh', background: theme.palette.background.default, fontFamily: 'Poppins, sans-serif' }}>
        {/* Top Bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          p={2}
          borderRadius={2}
          sx={{
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: 'none',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Teacher's Dashboard</Typography>
          <Box>
            <ThemeToggleButton />
          </Box>
        </Box>

        {currentTab === 'dashboard' && (
          <>
            {/* Greeting Section */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              {/* Simple icon based on time of day */}
              <Box>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return <span role="img" aria-label="sun" style={{fontSize: 40}}>🌞</span>;
                  if (hour < 17) return <span role="img" aria-label="afternoon" style={{fontSize: 40}}>🌤️</span>;
                  return <span role="img" aria-label="moon" style={{fontSize: 40}}>🌙</span>;
                })()}
              </Box>
              <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                {getGreeting()}, {user?.firstName || user?.fullName || 'Teacher'}!
              </Typography>
            </Box>
            {/* Overview Boxes Row */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                  <PersonIcon sx={{ color: theme.palette.text.primary, fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color={theme.palette.text.primary}>Records</Typography>
                  <Typography variant="h4" fontWeight={800} color={theme.palette.text.primary}>{statsLoading ? <CircularProgress size={24} /> : studentCount}</Typography>
                  <Typography sx={{ opacity: 0.8, color: theme.palette.text.secondary, fontSize: 15 }}>Total number of students</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                  <BookIcon sx={{ color: '#1565c0', fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#1565c0">Exams</Typography>
                  <Typography variant="h4" fontWeight={800} color="#1565c0">{statsLoading ? <CircularProgress size={24} /> : examCount}</Typography>
                  <Typography sx={{ opacity: 0.8, color: theme.palette.text.secondary, fontSize: 15 }}>Total number of exams</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                  <LineAxisIcon sx={{ color: '#37474f', fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#37474f">Results</Typography>
                  <Typography variant="h4" fontWeight={800} color="#37474f">{statsLoading ? <CircularProgress size={24} /> : resultCount}</Typography>
                  <Typography sx={{ opacity: 0.8, color: theme.palette.text.secondary, fontSize: 15 }}>Number of available results</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                  <PaperPlaneIcon sx={{ color: '#7b1fa2', fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#7b1fa2">Announcements</Typography>
                  <Typography variant="h4" fontWeight={800} color="#7b1fa2">{statsLoading ? <CircularProgress size={24} /> : announcementCount}</Typography>
                  <Typography sx={{ opacity: 0.8, color: theme.palette.text.secondary, fontSize: 15 }}>Total number of messages sent</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Results Table */}
            <Card sx={{ mb: 4, p: 2, boxShadow: 2 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Results</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Exam name</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell>
                      </TableRow>
                    ) : recentResults.length > 0 ? (
                      recentResults.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.submitted_at ? format(new Date(row.submitted_at), 'MMM dd, yyyy') : '-'}</TableCell>
                          <TableCell>{row.user_name || '-'}</TableCell>
                          <TableCell>{row.quizzes?.quiz_title || '-'}</TableCell>
                          <TableCell>{row.score !== undefined && row.quizzes?.total_marks ? `${Math.round((row.score / row.quizzes.total_marks) * 100)}%` : '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No recent results found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2} textAlign="right">
                <Button variant="outlined" onClick={() => router.push('/dashboard/teacher?tab=results')}>See All</Button>
              </Box>
            </Card>

            {/* Exams Section */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 3, boxShadow: 3 }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Manage Quiz</Typography>
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell>Exam no.</TableCell>
                          <TableCell>Exam name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>No. of questions</TableCell>
                          <TableCell>Exam time</TableCell>
                          <TableCell>End time</TableCell>
                          <TableCell>Access Code</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {examsLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell>
                          </TableRow>
                        ) : exams.length > 0 ? (
                          paginatedDashboardExams.map((row, idx) => (
                            <TableRow key={row.id}>
                              <TableCell>{(dashboardExamPage - 1) * dashboardExamsPerPage + idx + 1}</TableCell>
                              <TableCell>{row.quiz_title}</TableCell>
                              <TableCell>{row.description}</TableCell>
                              <TableCell>{row.questions_count ?? '-'}</TableCell>
                              <TableCell>{row.extime ? format(new Date(row.extime), 'yyyy-MM-dd HH:mm') : (row.start_time ? format(new Date(row.start_time), 'yyyy-MM-dd HH:mm') : '-')}</TableCell>
                              <TableCell>{row.end_time ? format(new Date(row.end_time), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography fontFamily="monospace">{row.access_code || '—'}</Typography>
                                  <Tooltip title="Copy Access Code">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        if (row.access_code) {
                                          navigator.clipboard.writeText(row.access_code);
                                          setCopySnackbarOpen(true);
                                        }
                                      }}
                                      disabled={!row.access_code}
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => handleEditExam(row.id, row.nq)} sx={{ mr: 1 }}>
                                  Edit
                                </Button>
                                <Button size="small" variant="outlined" color="info" startIcon={<VisibilityIcon />} onClick={() => router.push(`/preview-quiz/${row.id}`)} sx={{ mr: 1 }}>
                                  Preview
                                </Button>
                                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteExam(row.id)}>
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center">No exams found.</TableCell>
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
                </Card>
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
            <ExamResultsTable />
          </Box>
        )}
        {currentTab === 'records' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Records Section</Typography>
            <RecordsSection />
          </Box>
        )}
        {currentTab === 'messages' && user && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Announcements Section</Typography>
            <AnnouncementsSection user={user} />
          </Box>
        )}
        {currentTab === 'settings' && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Settings Section</Typography>
            <TeacherSettings user={user} />
          </Box>
        )}
        {currentTab === 'help' && (
          helpContent
        )}
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
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLogoutDialogOpen(false);
              signOut();
            }}
            color="error"
            variant="contained"
          >
            Yes, Log me out
          </Button>
        </DialogActions>
      </Dialog>
      {/* Floating Settings Button */}
      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: theme.palette.background.paper,
          boxShadow: 3,
          '&:hover': { bgcolor: theme.palette.primary.light },
        }}
        onClick={settings.onOpenDrawer}
        aria-label="Open settings"
      >
        <Iconify icon="solar:settings-bold" width={28} />
      </IconButton>
      <SettingsDrawer />
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setCopySnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" sx={{ color: '#2e7d32' }} />}
          severity="success"
          sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: 2, fontWeight: 600, boxShadow: 3 }}
          elevation={6}
          variant="filled"
          onClose={() => setCopySnackbarOpen(false)}
        >
          Access code copied to clipboard!
        </Alert>
      </Snackbar>
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

function ExamResultsTable() {
  const { user } = useUser();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  // Filter state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const theme = useTheme();

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
      setQuizzes(quizData || []);
      // Fetch all attempts for quizzes created by this teacher
      const { data, error } = await supabase
        .from('attempts')
        .select(`id, user_name, score, submitted_at, marked_for_review, quiz_id, start_time, quizzes(quiz_title, user_id)`) // use start_time
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
      setLoading(false);
    })();
  }, [user?.id]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
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
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Started At</TableCell>
                  <TableCell>End time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Marked for Review</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map((row, i) => {
                  const startedAt = row.start_time ? new Date(row.start_time) : null;
                  const submittedAt = row.submitted_at ? new Date(row.submitted_at) : null;
                  let duration = '-';
                  if (startedAt && submittedAt && !isNaN(startedAt.getTime()) && !isNaN(submittedAt.getTime())) {
                    let diffMin = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 60000);
                    if (diffMin < 0) diffMin = 0;
                    duration = `${diffMin} min`;
                  }
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.quizzes?.quiz_title || 'Untitled Quiz'}</TableCell>
                      <TableCell>{row.user_name}</TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>{startedAt ? startedAt.toLocaleString() : '-'}</TableCell>
                      <TableCell>{submittedAt ? submittedAt.toLocaleString() : '-'}</TableCell>
                      <TableCell>{duration}</TableCell>
                      <TableCell>
                        {row.marked_for_review && Object.keys(row.marked_for_review).filter(qid => row.marked_for_review[qid]).length > 0
                          ? Object.keys(row.marked_for_review).filter(qid => row.marked_for_review[qid]).map(qid => `Q${Number(qid) + 1}`).join(', ')
                          : 'None'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Box display="flex" justifyContent="center" mt={2}>
              <TablePagination
                component="div"
                count={filteredResults.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                labelRowsPerPage={''}
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        ) : (
          <Typography>No results found.</Typography>
        )}
      </Paper>
    </LocalizationProvider>
  );
}

function RecordsSection() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ fname: '', uname: '', dob: '', gender: '', email: '', pword: '', cpword: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const theme = useTheme();

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/students');
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || 'Error');
    else setStudents(data.students || []);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const res = await fetch('/api/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setFormError(data.error || 'Error');
    else {
      setFormSuccess('Student added!');
      setForm({ fname: '', uname: '', dob: '', gender: '', email: '', pword: '', cpword: '' });
      setAddOpen(false);
      fetchStudents();
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => setAddOpen(true)}>Add New Student</Button>
      </Paper>
      {loading ? <Typography>Loading...</Typography> : error ? <Alert severity="error">{error}</Alert> : (
        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>DOB</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(stu => (
                <TableRow key={stu.id}>
                  <TableCell>{stu.id}</TableCell>
                  <TableCell>{stu.fname}</TableCell>
                  <TableCell>{stu.uname}</TableCell>
                  <TableCell>{stu.email}</TableCell>
                  <TableCell>{stu.gender}</TableCell>
                  <TableCell>{stu.dob}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddStudent}>
            <TextField label="Full Name" name="fname" value={form.fname} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Username" name="uname" value={form.uname} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Password" name="pword" type="password" value={form.pword} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Confirm Password" name="cpword" type="password" value={form.cpword} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
            <TextField label="Gender" name="gender" value={form.gender} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            {formError && <Alert severity="error">{formError}</Alert>}
            {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
            <DialogActions>
              <Button onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Add</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function TeacherSettings({ user }: { user: any }) {
  const [form, setForm] = useState({
    fname: user?.firstName || '',
    subject: user?.subject || '',
    uname: user?.username || '',
    email: user?.email || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    id: user?.id || '',
    img: user?.imageUrl || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/update-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Error');
    else setSuccess('Profile updated successfully! Kindly re-login to see the changes.');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" minHeight="60vh">
      <Paper sx={{ width: 400, mt: 6, p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>My Profile</Typography>
        <Avatar src={form.img} alt="pro" sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" name="fname" value={form.fname} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Subject" name="subject" value={form.subject} fullWidth disabled sx={{ mb: 2 }} />
          <TextField label="Username" name="uname" value={form.uname} fullWidth disabled sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} fullWidth required sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Update</Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </form>
      </Paper>
    </Box>
  );
}

function ExamsSection({ handleDeleteExam }: { handleDeleteExam: (quizId: number) => void }) {
  const { user } = useUser();
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const theme = useTheme();

  const fetchExams = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    const res = await fetch(`/api/exams?user_id=${user.id}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || 'Error');
    else {
      const exams = data.exams || [];
      if (exams.length === 0) return setExams([]);
      // Fetch all questions for these quiz IDs
      const quizIds = exams.map((q: any) => q.id);
      const { data: questions } = await supabase
        .from('questions')
        .select('id, quiz_id');
      const questionCounts: Record<number, number> = {};
      (questions || []).forEach((q: { quiz_id: number }) => {
        if (quizIds.includes(q.quiz_id)) {
          questionCounts[q.quiz_id] = (questionCounts[q.quiz_id] || 0) + 1;
        }
      });
      const examsWithCounts = exams.map((q: any) => ({
        ...q,
        questions_count: questionCounts[q.id] || 0,
      }));
      setExams(examsWithCounts);
    }
  };

  useEffect(() => { fetchExams(); }, [user?.id]);

  // Pagination logic
  const pageCount = Math.ceil(exams.length / rowsPerPage);
  const paginatedExams = exams.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={async () => {
            await router.push('/create-quiz');
          }}
          sx={{ 
            background: '#002366', 
            color: '#fff', 
            fontWeight: 600, 
            borderRadius: 2, 
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { background: '#001b4e' } 
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
                <TableCell>Exam no.</TableCell>
                <TableCell>Exam name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>No. of questions</TableCell>
                <TableCell>Exam time</TableCell>
                <TableCell>End time</TableCell>
                <TableCell>Edit</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExams.map((exam, i) => (
                <TableRow key={exam.id || i}>
                  <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                  <TableCell>{exam.quiz_title || '-'}</TableCell>
                  <TableCell>{exam.description || '-'}</TableCell>
                  <TableCell>{exam.questions_count ?? '-'}</TableCell>
                  <TableCell>{exam.duration ? `${exam.duration} min` : '-'}</TableCell>
                  <TableCell>{exam.end_time ? format(new Date(exam.end_time), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => router.push(`/edit-quiz/${exam.id}`)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDeleteExam(exam.id)}>
                      <DeleteIcon />
                    </IconButton>
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
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!form.tags.includes(newTag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      e.currentTarget.value = '';
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
              <Typography variant="subtitle2" gutterBottom>Tags (Press Enter to add)</Typography>
              <TextField
                placeholder="Add tags..."
                onKeyPress={handleTagInput}
                fullWidth
                size="small"
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
  const theme = useTheme();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
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
    <Box p={{ xs: 2, sm: 3 }} borderRadius={3} boxShadow={1} sx={{ background: theme.palette.background.paper, maxWidth: 1200, mx: 'auto', border: 'none', fontFamily: 'Poppins, sans-serif' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          Announcements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ 
            background: '#002366', 
            color: '#fff', 
            borderRadius: 2, 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif',
            '&:hover': { background: '#001b4e' }
          }}
        >
          Create Announcement
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Content</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Target</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <TableRow key={announcement.id} sx={{ 
                  backgroundColor: announcement.priority === 3 ? '#ffebee' : announcement.priority === 2 ? '#fff3e0' : 'inherit'
                }}>
                  <TableCell>
                    <Chip 
                      label={getPriorityText(announcement.priority)} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getPriorityColor(announcement.priority), 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{announcement.title}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                      {announcement.content}
                    </Typography>
                    {announcement.tags && announcement.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {announcement.tags.map((tag: string, tagIdx: number) => (
                          <Chip 
                            key={tagIdx} 
                            label={tag} 
                            size="small" 
                            variant="outlined" 
                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} 
                          />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={announcement.target_audience.toUpperCase()} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(announcement.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No announcements found.</TableCell>
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
    </Box>
  );
}