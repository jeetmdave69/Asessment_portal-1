'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Chip,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Grid,
} from '@mui/material';
import { supabase } from '@/utils/supabaseClient';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShareIcon from '@mui/icons-material/Share';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTheme } from '@mui/material/styles';
import { SectionBarDatum } from '../../../components/analytics/SectionBar';
import ChartCard from '../../../components/analytics/ChartCard';
import SectionBar from '../../../components/analytics/SectionBar';
import ScoreDonut from '../../../components/analytics/ScoreDonut';
import TimePerQuestionLine from '../../../components/analytics/TimePerQuestionLine';

const PASS_THRESHOLD = 60;

type SectionKey = string;
type SectionQuestionsMap = { [section: SectionKey]: any[] };
type SectionScoresMap = { [section: SectionKey]: { correct: number; total: number } };

// Wrapper component to handle Suspense for useParams
function ResultWrapper() {
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
      <ResultPage />
    </Suspense>
  );
}

export default ResultWrapper;

function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();

  const attemptId = Number(Array.isArray(params?.attemptId) ? params.attemptId[0] : params?.attemptId);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [reviewLoading, setReviewLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'section'>('all');
  const [sections, setSections] = useState<any[]>([]);

  // Fetch attempt and quiz summary first
  useEffect(() => {
    const fetchSummary = async () => {
      if (!attemptId || isNaN(attemptId)) return;
      setLoading(true);
      const { data: attemptData } = await supabase
        .from('attempts')
        .select('id,quiz_id,user_name,score,correct_answers,answers,sections,marked_for_review,start_time,submitted_at,question_time_spent')
        .eq('id', attemptId)
        .single();
      if (!attemptData) {
        setLoading(false);
        return;
      }
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('quiz_title')
        .eq('id', attemptData.quiz_id)
        .single();
      setQuizTitle(quiz?.quiz_title || 'Untitled Quiz');
      const parsedAttempt = {
        ...attemptData,
        answers: typeof attemptData.answers === 'string' ? JSON.parse(attemptData.answers || '{}') : attemptData.answers || {},
        correct_answers: typeof attemptData.correct_answers === 'string' ? JSON.parse(attemptData.correct_answers || '{}') : attemptData.correct_answers || {},
        sections: typeof attemptData.sections === 'string' ? JSON.parse(attemptData.sections || '{}') : attemptData.sections || {},
        question_time_spent: typeof attemptData.question_time_spent === 'string' ? JSON.parse(attemptData.question_time_spent || '{}') : attemptData.question_time_spent || {},
      };
      
      console.log('🔍 Attempt Data Fetched:', {
        raw: attemptData,
        parsed: parsedAttempt,
        questionTimeSpent: parsedAttempt.question_time_spent,
        hasTimingData: Object.keys(parsedAttempt.question_time_spent || {}).length > 0
      });
      
      setAttempt(parsedAttempt);
      setLoading(false);
    };
    fetchSummary();
  }, [attemptId]);

  // Fetch all sections for the quiz
  useEffect(() => {
    if (!attempt || !attempt.quiz_id) return;
    const fetchSections = async () => {
      const { data: sectionData } = await supabase
        .from('sections')
        .select('id, name, description, instructions')
        .eq('quiz_id', attempt.quiz_id)
        .order('"order"', { ascending: true })
        .order('id', { ascending: true });
      setSections(sectionData || []);
    };
    fetchSections();
  }, [attempt]);

  // Fetch questions for review
  useEffect(() => {
    if (!attempt || !attempt.quiz_id) return;
    setReviewLoading(true);
    const fetchQuestions = async () => {
      const { data: questionData } = await supabase
        .from('questions')
        .select('id,question_text,options,correct_answers,explanation,section_id,marks')
        .eq('quiz_id', attempt.quiz_id);
      const parsedQuestions = (questionData || []).map((q: any) => {
        const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options || [];
        return {
          id: q.id,
          question_text: q.question_text,
          explanation: q.explanation || '',
          section_id: q.section_id,
          marks: q.marks || 1,
          options: options.map((opt: any) => ({
            text: typeof opt === 'string' ? opt : opt?.text || '',
            isCorrect: typeof opt.is_correct !== 'undefined' ? !!opt.is_correct : !!opt.isCorrect,
          })),
        };
      });
      setQuestions(parsedQuestions);
      setReviewLoading(false);
    };
    fetchQuestions();
  }, [attempt]);

  if (loading) {
    return (
      <Box height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <CelebrationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, animation: 'spin 2s linear infinite' }} />
        <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
          Preparing your result...
        </Typography>
        <CircularProgress size={48} thickness={4} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
      </Box>
    );
  }

  if (!attempt) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h6">Attempt not found</Typography>
      </Box>
    );
  }

  // Calculate score and performance
  const total = questions.length;
  let score = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;
  questions.forEach(q => {
    let userIndices = attempt.answers?.[q.id] ?? [];
    if (userIndices.length && typeof userIndices[0] === 'string') {
      userIndices = userIndices.map((val: string) => {
        const foundIdx = q.options.findIndex((opt: any) => opt.text === val);
        return foundIdx !== -1 ? foundIdx : null;
      }).filter((idx: number | null) => idx !== null);
    }
    const correctIndices = q.options
      .map((opt: any, idx: number) => (opt.isCorrect ? idx : null))
      .filter((idx: number | null) => idx !== null);
    const questionMarks = q.marks || 1;
    totalMarks += questionMarks || 0;
    const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
    const totalCorrect = correctIndices.length;
    if (totalCorrect > 0) {
      const partialMark = (correctSelected / totalCorrect) * (questionMarks || 0);
      obtainedMarks += partialMark;
      if (correctSelected === totalCorrect && userIndices.length === totalCorrect) {
        score += 1;
      }
    }
  });
  const percentage = Math.round((obtainedMarks / (totalMarks || 1)) * 100);
  const isPassed = totalMarks > 0 ? obtainedMarks >= (attempt?.passing_score || 0) : false;

  // Group questions by section
  const questionsBySection: SectionQuestionsMap = {};
  questions.forEach((q: any) => {
    let section: SectionKey = 'other';
    if (attempt?.sections && Object.keys(attempt.sections).length > 0) {
      section = attempt.sections[q.id] || 'other';
    } else if (q.section_id && sections.length > 0) {
      const sec = sections.find(s => s.id === q.section_id);
      section = sec?.name || 'other';
    }
    if (!questionsBySection[section]) questionsBySection[section] = [];
    questionsBySection[section].push(q);
  });

  // Calculate per-section scores and marks
  const sectionMarks: { [section: string]: { obtained: number; total: number; percentage: number } } = {};
  Object.entries(questionsBySection).forEach(([section, qs]) => {
    let obtained = 0;
    let total = 0;
    (qs as any[]).forEach((q: any) => {
      let userIndices = attempt.answers?.[q.id] ?? [];
      if (userIndices.length && typeof userIndices[0] === 'string') {
        userIndices = userIndices.map((val: string) => {
          const foundIdx = q.options.findIndex((opt: any) => opt.text === val);
          return foundIdx !== -1 ? foundIdx : null;
        }).filter((idx: number | null) => idx !== null);
      }
      let correctIndices: number[] = [];
      if (q.options && q.options.length > 0) {
        correctIndices = q.options
        .map((opt: any, idx: number) => (opt.isCorrect ? idx : null))
        .filter((idx: number | null) => idx !== null);
      }
      const questionMarks = q.marks || 1;
      total += questionMarks;
      const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
      const totalCorrect = correctIndices.length;
      if (totalCorrect > 0) {
        const partialMark = (correctSelected / totalCorrect) * (questionMarks || 0);
        obtained += partialMark;
      }
    });
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
    sectionMarks[section] = { obtained: Math.round(obtained * 100) / 100, total, percentage };
  });

  // Analytics datasets
  const sectionBarData: SectionBarDatum[] = Object.entries(sectionMarks).map(([name, v]) => ({
    section: name, 
    obtained: Math.round(v.obtained * 100) / 100, 
    total: v.total, 
    percentage: v.percentage,
  }));

  // Use the same logic as main percentage calculation for consistency
  let correctCount = 0, incorrectCount = 0, skippedCount = 0;
  questions.forEach((q) => {
    let userIndices = attempt.answers?.[q.id] ?? [];
    if (userIndices.length && typeof userIndices[0] === 'string') {
      userIndices = userIndices.map((val: string) => q.options.findIndex((opt: any) => opt.text === val)).filter((i: number) => i >= 0);
    }
    const correctIndices: number[] = (q.options || []).map((opt:any, i:number)=> (opt.isCorrect? i : -1)).filter((i:number)=>i>=0);
    
    if (!userIndices || userIndices.length === 0) { 
      skippedCount++; 
      return; 
    }
    
    const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
    const totalCorrect = correctIndices.length;
    
    if (totalCorrect > 0) {
      if (correctSelected === totalCorrect && userIndices.length === totalCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    } else {
      incorrectCount++;
    }
  });

  console.log('🔍 Question Analysis:', {
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    skippedCount,
    mainPercentage: percentage,
    donutPercentage: total > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
    attemptAnswers: attempt.answers,
    questions: questions.map(q => ({ id: q.id, options: q.options }))
  });

  const compositionData = [
    { name: 'Correct' as const, value: correctCount },
    { name: 'Incorrect' as const, value: incorrectCount },
    { name: 'Skipped' as const, value: skippedCount },
  ];

  console.log('📊 Composition Data:', compositionData);

  // Check if we have real timing data first
  const hasRealTimingData = questions.some(q => 
    attempt?.question_time_spent?.[q.id] && 
    typeof attempt.question_time_spent[q.id] === 'number' && 
    attempt.question_time_spent[q.id] > 0
  );

  // Generate timing data for questions - Use real data from database
  const tpqData = questions.map((q, i) => {
    // Get actual time spent from the database - direct structure
    const actualTimeSpent = attempt?.question_time_spent?.[q.id];
    
    console.log(`🔍 Question ${q.id}:`, {
      questionId: q.id,
      actualTimeSpent,
      type: typeof actualTimeSpent,
      isNumber: typeof actualTimeSpent === 'number',
      isPositive: actualTimeSpent > 0,
      questionTimeSpent: attempt?.question_time_spent
    });
    
    if (actualTimeSpent && typeof actualTimeSpent === 'number' && actualTimeSpent > 0) {
      // Convert milliseconds to seconds if needed
      const timeInSeconds = actualTimeSpent > 1000 ? Math.round(actualTimeSpent / 1000) : actualTimeSpent;
      console.log(`✅ Using real time for question ${q.id}: ${actualTimeSpent} -> ${timeInSeconds}s`);
      return { q: i + 1, timeSec: timeInSeconds };
    } else {
      // Fallback to estimated time if no real data
      const baseTime = 20 + (i % 3) * 10;
      const randomVariation = Math.random() * 15;
      const estimatedTime = Math.round(baseTime + randomVariation);
      console.log(`⚠️ Using estimated time for question ${q.id}: ${estimatedTime}s (no real data)`);
      return { q: i + 1, timeSec: estimatedTime };
    }
  });

  // Alternative approach: directly create timing data from the database structure
  const directTimingData = attempt?.question_time_spent ? 
    Object.entries(attempt.question_time_spent).map(([questionId, timeSpent], index) => ({
      q: index + 1,
      timeSec: typeof timeSpent === 'number' ? timeSpent : 0
    })) : [];

  console.log('🔍 Direct timing data creation:', {
    directTimingData,
    directTimingDataLength: directTimingData.length,
    rawTimingData: attempt?.question_time_spent
  });

  // Generate sample data for all questions if no real data available
  const sampleTpqData = questions.map((q, i) => ({
    q: i + 1,
    timeSec: 20 + (i % 3) * 10 + Math.random() * 15
  }));

  // Use real data if available, otherwise use sample data for testing
  const finalTpqData = hasRealTimingData ? tpqData : sampleTpqData;
  
  // Force use real data if we have any timing data, regardless of the check
  const forceUseRealData = attempt?.question_time_spent && Object.keys(attempt.question_time_spent).length > 0;
  const finalTpqDataForced = forceUseRealData ? directTimingData : sampleTpqData;
  
  console.log('🔍 Final data decision:', {
    hasRealTimingData,
    forceUseRealData,
    finalTpqDataLength: finalTpqData.length,
    finalTpqDataForcedLength: finalTpqDataForced.length,
    willUseRealData: forceUseRealData
  });

  console.log('⏱️ Time Analysis Data:', {
    hasRealTimingData,
    questionTimeSpent: attempt?.question_time_spent,
    questionTimeSpentKeys: attempt?.question_time_spent ? Object.keys(attempt.question_time_spent) : [],
    questionIds: questions.map(q => q.id),
    tpqData,
    finalTpqData,
    questionsCount: questions.length,
    attemptId: attempt?.id,
    // Debug the data structure
    rawQuestionTimeSpent: attempt?.question_time_spent,
    nestedQuestions: attempt?.question_time_spent?.questions,
    sampleQuestionData: questions.length > 0 ? {
      questionId: questions[0].id,
      timingData: attempt?.question_time_spent?.questions?.[questions[0].id]
    } : null,
    // Additional debugging for ID matching
    timingDataKeys: attempt?.question_time_spent?.questions ? Object.keys(attempt.question_time_spent.questions) : [],
    questionIdsFromQuestions: questions.map(q => q.id),
    idMatchCheck: questions.map(q => ({
      questionId: q.id,
      hasTimingData: attempt?.question_time_spent?.questions?.[q.id] !== undefined,
      timingValue: attempt?.question_time_spent?.questions?.[q.id]
    }))
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.7 }}
    >
                <Box sx={{ 
                  minHeight: '100vh', 
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
                    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        py: 4
      }}>
        <Box sx={{ maxWidth: '1360px', mx: 'auto', px: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
                          color="primary"
              sx={{ mb: 3, px: 3, py: 1, borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
              onClick={() => router.push('/dashboard/student')}
            >
              ← Back to Dashboard
            </Button>
            <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ mb: 1 }}>
              Quiz Results
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              {quizTitle}
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              {attempt?.user_name || 'Unknown Candidate'}
                        </Typography>
          </Box>

          {/* Score Summary */}
                            <Paper sx={{
            p: 4,
            mb: 4,
                              borderRadius: 4,
            textAlign: 'center',
                              background: theme.palette.mode === 'dark' 
                                ? (isPassed 
                                    ? 'linear-gradient(135deg, #1f2937 0%, #064e3b 50%, #065f46 100%)'
                                    : 'linear-gradient(135deg, #1f2937 0%, #7f1d1d 50%, #991b1b 100%)')
                                : (isPassed 
                                    ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)'
                                    : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #fecaca 100%)'),
            border: theme.palette.mode === 'dark' 
              ? '2px solid rgba(255,255,255,0.1)' 
              : '2px solid rgba(15,23,42,0.1)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 12px 40px rgba(0,0,0,.3)' 
              : '0 12px 40px rgba(2,6,23,.12)',
          }}>
            <Typography variant="h2" fontWeight={900} color={isPassed ? 'success.main' : 'error.main'} sx={{ mb: 2 }}>
              {percentage}%
            </Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                                    {isPassed ? '🎉 Excellent Performance!' : '💪 Good Effort!'}
              </Typography>
                                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Score: {Math.round(obtainedMarks * 100) / 100} / {totalMarks} marks
              </Typography>
          </Paper>

          {/* Charts Grid */}
          {!reviewLoading && sectionBarData.length > 0 ? (
            <Box sx={{ mb: 6 }}>
              {/* Premium Dashboard Header */}
              <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  fontWeight={800} 
                  color="text.primary" 
                          sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, #0d9488, #6366f1, #8b5cf6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Performance Analytics
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                          sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                    opacity: 0.8,
                  }}
                >
                  Comprehensive insights into your quiz performance and time management
                                </Typography>
          </Box>

              {/* Premium Charts Grid */}
              <Grid container spacing={4}>
                {/* Section Performance Chart - Full Width */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <Box
                      sx={{
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(15, 23, 42, 0.95)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? `
                            0 4px 6px -1px rgba(0, 0, 0, 0.3),
                            0 10px 15px -3px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                          `
                          : `
                            0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 10px 15px -3px rgba(0, 0, 0, 0.1),
                            0 0 0 1px rgba(255, 255, 255, 0.1)
                          `,
                        p: 4,
                      position: 'relative',
                        overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, #0d9488, #6366f1, #8b5cf6)',
                      },
                      '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? `
                              0 20px 25px -5px rgba(0, 0, 0, 0.4),
                              0 10px 10px -5px rgba(0, 0, 0, 0.2),
                              0 0 0 1px rgba(255, 255, 255, 0.1)
                            `
                            : `
                              0 20px 25px -5px rgba(0, 0, 0, 0.1),
                              0 10px 10px -5px rgba(0, 0, 0, 0.04),
                              0 0 0 1px rgba(255, 255, 255, 0.15)
                            `,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700} 
                          color="text.primary" 
                          sx={{ 
                        mb: 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Section-wise Performance
                </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontWeight: 500,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            opacity: 0.7,
                          }}
                        >
                          Detailed breakdown of your performance across different quiz sections
                </Typography>
                      </Box>
                      <SectionBar data={sectionBarData} height={450} />
                    </Box>
                  </motion.div>
                </Grid>

                {/* Score Composition & Time Analysis - Side by Side */}
                <Grid item xs={12} lg={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  >
                    <Box
                      sx={{
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(15, 23, 42, 0.95)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? `
                            0 4px 6px -1px rgba(0, 0, 0, 0.3),
                            0 10px 15px -3px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                          `
                          : `
                            0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 10px 15px -3px rgba(0, 0, 0, 0.1),
                            0 0 0 1px rgba(255, 255, 255, 0.1)
                          `,
                        p: 4,
                        height: '100%',
                      position: 'relative',
                        overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, #0d9488, #6366f1)',
                      },
                      '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? `
                              0 20px 25px -5px rgba(0, 0, 0, 0.4),
                              0 10px 10px -5px rgba(0, 0, 0, 0.2),
                              0 0 0 1px rgba(255, 255, 255, 0.1)
                            `
                            : `
                              0 20px 25px -5px rgba(0, 0, 0, 0.1),
                              0 10px 10px -5px rgba(0, 0, 0, 0.04),
                              0 0 0 1px rgba(255, 255, 255, 0.15)
                            `,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700} 
                          color="text.primary" 
                          sx={{ 
                            mb: 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Score Composition
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontWeight: 500,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            opacity: 0.7,
                          }}
                        >
                          Breakdown of correct, incorrect, and skipped questions
                            </Typography>
                          </Box>
                      <ScoreDonut data={compositionData} height={350} totalQuestions={totalMarks} />
                          </Box>
                  </motion.div>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  >
                              <Box
                                sx={{
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(15, 23, 42, 0.95)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? `
                            0 4px 6px -1px rgba(0, 0, 0, 0.3),
                            0 10px 15px -3px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                          `
                          : `
                            0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 10px 15px -3px rgba(0, 0, 0, 0.1),
                            0 0 0 1px rgba(255, 255, 255, 0.1)
                          `,
                        p: 4,
                                  height: '100%',
                      position: 'relative',
                        overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      },
                      '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? `
                              0 20px 25px -5px rgba(0, 0, 0, 0.4),
                              0 10px 10px -5px rgba(0, 0, 0, 0.2),
                              0 0 0 1px rgba(255, 255, 255, 0.1)
                            `
                            : `
                              0 20px 25px -5px rgba(0, 0, 0, 0.1),
                              0 10px 10px -5px rgba(0, 0, 0, 0.04),
                              0 0 0 1px rgba(255, 255, 255, 0.15)
                            `,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700} 
                          color="text.primary" 
                          sx={{ 
                            mb: 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Time Analysis
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontWeight: 500,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif',
                            opacity: 0.7,
                          }}
                        >
                          {hasRealTimingData 
                            ? "Actual time spent per question from your attempt" 
                            : "Estimated time per question (no timing data available)"
                          }
                        </Typography>
                </Box>
                                            <TimePerQuestionLine data={finalTpqDataForced} height={350} />
              </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ mb: 4, textAlign: 'center', py: 8 }}>
              <CircularProgress size={48} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading analytics...
              </Typography>
            </Box>
          )}

          {/* View Mode Toggle */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              color="primary"
              size="large"
            >
              <ToggleButton value="all">All Questions</ToggleButton>
              <ToggleButton value="section">Section-wise</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Questions Review */}
          {reviewLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading detailed review...</Typography>
            </Box>
          ) : (
            <Stack spacing={4}>
              {viewMode === 'all' ? (
                <Stack spacing={3}>
                  {questions.map((q, idx) => (
                    <QuestionReviewCard 
                      key={q.id} 
                      q={q} 
                      idx={idx} 
                      userIndices={attempt.answers?.[q.id] ?? []} 
                      attempt={attempt} 
                    />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={4}>
                  {Object.entries(questionsBySection).map(([section, qs]) => (
                    <Box key={section}>
                      <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                        {section} ({qs.length} questions)
                </Typography>
                      {qs.map((q: any, idx: number) => (
                        <QuestionReviewCard 
                          key={q.id} 
                          q={q} 
                          idx={idx} 
                          userIndices={attempt.answers?.[q.id] ?? []} 
                          attempt={attempt} 
                        />
                      ))}
                                </Box>
                              ))}
                </Stack>
              )}
            </Stack>
          )}

          {/* Footer */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
              onClick={() => router.push('/dashboard/student')}
            >
              Back to Dashboard
            </Button>
          </Box>
      </Box>
        </Box>
    </motion.div>
  );
}

// Question Review Card Component
function QuestionReviewCard({ q, idx, userIndices, attempt }: { q: any, idx: number, userIndices: number[], attempt: any }) {
  const userAnswers = userIndices.map((i: number) => q.options[i]?.text).filter(Boolean);
  const correctAnswers = q.options.map((opt: any) => opt.isCorrect ? opt.text : null).filter(Boolean);
  const correctIndices = q.options
    .map((opt: any, i: number) => (opt.isCorrect ? i : null))
    .filter((i: number | null) => i !== null);
  const isCorrect =
    userIndices.length === correctIndices.length &&
    userIndices.every((idx: number) => correctIndices.includes(idx));

  const theme = useTheme();
  
  return (
    <Card elevation={2} sx={{ 
      borderRadius: 3, 
      mb: 2,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
      border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Q{idx + 1}.
            </Typography>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6, flex: 1 }}>
            {q.question_text}
            </Typography>
        </Stack>
        
        <Box mb={2}>
          {q.options.map((opt: any, i: number) => {
            const selected = userIndices.includes(i);
            const isOptionCorrect = opt.isCorrect;
                
                return (
              <Paper
                    key={i}
                variant="outlined"
                    sx={{
                  p: 2,
                  pl: 3,
                      display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  background:
                    selected && isOptionCorrect
                      ? '#E8F5E9'
                      : isOptionCorrect
                      ? '#F1F8E9'
                      : selected
                      ? '#FFEBEE'
                      : 'inherit',
                  borderColor: 
                    selected && isOptionCorrect
                      ? '#4CAF50'
                      : isOptionCorrect
                      ? '#C8E6C9'
                      : selected
                      ? '#EF9A9A'
                      : '#E0E0E0',
                  '&:hover': {
                    borderColor: selected ? 'inherit' : '#90CAF9',
                  },
                }}
              >
                <Typography sx={{ flex: 1, color: 'text.primary' }}>
                      {opt.text}
                    </Typography>
                
                {isOptionCorrect && selected && (
                      <Chip
                    label="Your correct answer"
                        size="small"
                        sx={{ 
                          ml: 1,
                      fontWeight: 600,
                      backgroundColor: '#4CAF50',
                      color: 'white',
                        }}
                    icon={<Check size={18} />}
                      />
                    )}
                {isOptionCorrect && !selected && (
                      <Chip
                    label="Correct answer"
                        size="small"
                        sx={{ 
                          ml: 1,
                      fontWeight: 600,
                      backgroundColor: '#C8E6C9',
                      color: '#2E7D32',
                        }}
                    icon={<Check size={18} />}
                      />
                    )}
                {!isOptionCorrect && selected && (
                      <Chip
                    label="Your answer"
                        size="small"
                        sx={{ 
                          ml: 1,
                      fontWeight: 600,
                      backgroundColor: '#FFCDD2',
                      color: '#C62828',
                        }}
                    icon={<X size={18} />}
                      />
                    )}
              </Paper>
                );
              })}
        </Box>
        
        {q.explanation && (
          <Accordion elevation={0} sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F5F5F5', 
            borderRadius: '8px !important' 
          }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" fontWeight={600}>
                Explanation
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {q.explanation}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}