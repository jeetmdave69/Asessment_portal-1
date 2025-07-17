'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Chip,
  Stack,
  Divider,
  Paper,
  Alert,
  CardActions,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '@mui/material/styles';

const PASS_THRESHOLD = 60;

type SectionKey = string;
type SectionQuestionsMap = { [section: SectionKey]: any[] };
type SectionScoresMap = { [section: SectionKey]: { correct: number; total: number } };

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();

  const attemptId = Number(Array.isArray(params?.attemptId) ? params.attemptId[0] : params?.attemptId);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  // Add state for view mode
  const [viewMode, setViewMode] = useState<'all' | 'section'>('all');
  const [sections, setSections] = useState<any[]>([]); // <-- add state for sections

  // Quotes for pass/fail
  const passQuote = {
    text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    author: "Albert Schweitzer"
  };
  const failQuote = {
    text: "Failure is simply the opportunity to begin again, this time more intelligently.",
    author: "Henry Ford"
  };

  // Fetch attempt and quiz summary first
  useEffect(() => {
    const fetchSummary = async () => {
      if (!attemptId || isNaN(attemptId)) return;
      setLoading(true);
      const { data: attemptData } = await supabase
        .from('attempts')
        .select('id,quiz_id,user_name,score,correct_answers,answers,sections,marked_for_review,start_time,submitted_at')
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
      setAttempt({
        ...attemptData,
        answers: typeof attemptData.answers === 'string' ? JSON.parse(attemptData.answers || '{}') : attemptData.answers || {},
        correct_answers: typeof attemptData.correct_answers === 'string' ? JSON.parse(attemptData.correct_answers || '{}') : attemptData.correct_answers || {},
        sections: typeof attemptData.sections === 'string' ? JSON.parse(attemptData.sections || '{}') : attemptData.sections || {},
      });
      setLoading(false);
    };
    fetchSummary();
  }, [attemptId]);

  // Fetch all sections for the quiz (for section descriptions/instructions)
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

  // Fetch questions for review in background
  useEffect(() => {
    if (!attempt || !attempt.quiz_id) return;
    setReviewLoading(true);
    const fetchQuestions = async () => {
      const { data: questionData } = await supabase
        .from('questions')
        .select('id,question_text,options,correct_answers,explanation,section_id,marks') // <-- add marks
        .eq('quiz_id', attempt.quiz_id);
      const parsedQuestions = (questionData || []).map((q: any) => {
        const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options || [];
        return {
          id: q.id,
          question_text: q.question_text,
          explanation: q.explanation || '',
          section_id: q.section_id,
          marks: q.marks || 1, // <-- use marks, default 1
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

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const normalize = (val: any) =>
    typeof val === 'string'
      ? val.trim().toLowerCase()
      : val?.text?.trim().toLowerCase() || '';

  if (loading || redirecting) {
    return (
      <Box height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <CelebrationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, animation: 'spin 2s linear infinite' }} />
        <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
          {redirecting ? 'Redirecting to dashboard...' : 'Preparing your result...'}
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

  // DEBUG: Log answers and questions mapping
  console.log('DEBUG: attempt.answers', attempt.answers);
  console.log('DEBUG: questions', questions);
  questions.forEach((q, idx) => {
    const userIndices = attempt.answers?.[q.id] ?? [];
    console.log(`Q${idx + 1} (id=${q.id}): userIndices=`, userIndices, 'options=', q.options);
  });

  // Calculate score using indices
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
    // PARTIAL CREDIT: count number of correct options selected
    const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
    const totalCorrect = correctIndices.length;
    if (totalCorrect > 0) {
      const partialMark = (correctSelected / totalCorrect) * (questionMarks || 0);
      obtainedMarks += partialMark;
      if (correctSelected === totalCorrect && userIndices.length === totalCorrect) {
        score += 1; // full correct
      }
    }
  });
  const percentage = Math.round((obtainedMarks / (totalMarks || 1)) * 100);
  const isPassed = totalMarks > 0 ? obtainedMarks >= (attempt?.passing_score || 0) : false;

  // Calculate time taken (if available)
  let timeTaken = null;
  if (attempt?.start_time && attempt?.submitted_at) {
    const start = new Date(attempt.start_time);
    const end = new Date(attempt.submitted_at);
    const diff = Math.max(0, end.getTime() - start.getTime());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    timeTaken = `${mins}m ${secs}s`;
  }

  // Group questions by section
  const sectionLabels: { [key: string]: string } = {
    qa: 'Quantitative Aptitude',
    lr: 'Logical Reasoning',
    va: 'Verbal Ability',
    di: 'Data Interpretation',
    gk: 'General Knowledge',
  };
  const questionsBySection: SectionQuestionsMap = {};
  questions.forEach((q: any) => {
    let section: SectionKey = 'other';
    if (attempt?.sections && Object.keys(attempt.sections).length > 0) {
      section = attempt.sections[q.id] || 'other';
    } else if (q.section_id && sections.length > 0) {
      // Try to find section name by section_id
      const sec = sections.find(s => s.id === q.section_id);
      section = sec?.name || 'other';
    }
    if (!questionsBySection[section]) questionsBySection[section] = [];
    questionsBySection[section].push(q);
  });
  // Calculate per-section scores and marks
  const sectionScores: SectionScoresMap = {};
  const sectionMarks: { [section: string]: { obtained: number; total: number; percentage: number, avgTime?: number } } = {};
  // If timing data is available, e.g., attempt.question_times = { [questionId]: seconds }
  const questionTimes = attempt?.question_times || {}; // { [questionId]: seconds }
  Object.entries(questionsBySection).forEach(([section, qs]) => {
    let correct = 0;
    let obtained = 0;
    let total = 0;
    let totalTime = 0;
    let timeCount = 0;
    (qs as any[]).forEach((q: any) => {
      let userIndices = attempt.answers?.[q.id] ?? [];
      // If userIndices are text, map to indices
      if (userIndices.length && typeof userIndices[0] === 'string') {
        userIndices = userIndices.map((val: string) => {
          const foundIdx = q.options.findIndex((opt: any) => opt.text === val);
          return foundIdx !== -1 ? foundIdx : null;
        }).filter((idx: number | null) => idx !== null);
      }
      // Find correct indices
      let correctIndices: number[] = [];
      if (q.options && q.options.length > 0) {
        correctIndices = q.options
        .map((opt: any, idx: number) => (opt.isCorrect ? idx : null))
        .filter((idx: number | null) => idx !== null);
      } else if (q.correct_answers && Array.isArray(q.correct_answers)) {
        // Fallback: if correct_answers is present as array of indices
        correctIndices = q.correct_answers;
      }
      // Debug logging
      if (typeof window !== 'undefined') {
        console.log(`Q${q.id}: userIndices=`, userIndices, 'correctIndices=', correctIndices, 'options=', q.options);
      }
      const questionMarks = q.marks || 1;
      total += questionMarks;
      // PARTIAL CREDIT: count number of correct options selected
      const correctSelected = userIndices.filter((a: number) => correctIndices.includes(a)).length;
      const totalCorrect = correctIndices.length;
      if (totalCorrect > 0) {
        const partialMark = (correctSelected / totalCorrect) * (questionMarks || 0);
        obtained += partialMark;
        if (correctSelected === totalCorrect && userIndices.length === totalCorrect) {
          correct += 1; // full correct
        }
      }
      // Time per question
      if (questionTimes && questionTimes[q.id]) {
        totalTime += questionTimes[q.id];
        timeCount++;
      }
    });
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
    const avgTime = timeCount > 0 ? Math.round((totalTime / timeCount) * 10) / 10 : undefined;
    sectionScores[section] = { correct, total: (qs as any[]).length };
    sectionMarks[section] = { obtained: Math.round(obtained * 100) / 100, total, percentage, avgTime };
  });

  // Find weakest section(s), those needing improvement, and ranking
  const sectionList = Object.entries(sectionMarks);
  const minPercentage = sectionList.length > 0 ? Math.min(...sectionList.map(([_, v]) => v.percentage)) : 0;
  const maxPercentage = sectionList.length > 0 ? Math.max(...sectionList.map(([_, v]) => v.percentage)) : 0;
  const weakestSections = sectionList.filter(([_, v]) => v.percentage === minPercentage).map(([k]) => k);
  const bestSections = sectionList.filter(([_, v]) => v.percentage === maxPercentage).map(([k]) => k);
// Only include sections with exactly 0% in Needs Improvement
const needsImprovementSections = sectionList.filter(([_, v]) => v.percentage === 0).map(([k]) => k);
// Ranking: sort sections by percentage descending
const rankedSections = [...sectionList].sort((a, b) => b[1].percentage - a[1].percentage);

  // Suggestion message per section
  function getSectionSuggestion(percentage: number) {
    if (percentage >= 90) return 'Excellent! Keep up the great work.';
    if (percentage >= 75) return 'Good job! A little more practice for perfection.';
    if (percentage >= 60) return 'Fair. Review mistakes to improve further.';
    return 'Needs more practice. Focus on this section.';
  }

  // Helper to flatten all questions for 'all' view
  const allQuestionsFlat = questions;

  // Add debug log before rendering Needs Improvement
  console.log('Needs Improvement Sections:', needsImprovementSections);
  console.log('Section Marks:', sectionMarks);

  const allSame = sectionList.length > 1 && sectionList.every(([_, v]) => v.percentage === maxPercentage);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f4f6f8 0%, #e3eafc 100%)', py: 4 }}>
        <Container maxWidth="md">
          {/* Add Back to Dashboard Button */}
          <Box mb={2} display="flex" justifyContent="flex-start">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ fontWeight: 600, borderRadius: 2 }}
              onClick={() => router.push('/dashboard/student')}
            >
              Back to Dashboard
            </Button>
          </Box>

          {/* Minimal, Professional Congratulations/Encouragement Card */}
          <Box mb={4} display="flex" justifyContent="center">
            <Paper elevation={1} sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              minWidth: 320,
              maxWidth: 500,
              width: '100%',
              background: '#fff',
              border: theme.palette.mode === 'dark' ? `2.5px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Poppins, sans-serif',
            }}>
              <Typography variant="h4" fontWeight={800} color={isPassed ? 'success.main' : 'error.main'} mb={1} align="center">
                    {isPassed ? 'Congratulations!' : 'Better Luck Next Time'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500} align="center">
                {isPassed
                  ? `${attempt.user_name || 'User'}, you passed the quiz!`
                  : `${attempt.user_name || 'User'}, you can always try again.`}
              </Typography>
            </Paper>
          </Box>

          {/* Compact Info Bar below the congratulations/encouragement button */}
          <Box mb={4} display="flex" justifyContent="center">
            <Paper elevation={2} sx={{
              p: 2,
              borderRadius: 3,
              minWidth: 320,
              maxWidth: 600,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 1,
              fontFamily: 'Poppins, sans-serif',
            }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center" width="100%">
                <Typography variant="subtitle1" fontWeight={700}>
                  Score: <Box component="span" color={isPassed ? 'success.main' : 'error.main'}>{Math.round(obtainedMarks * 100) / 100}</Box> / {totalMarks}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Percentage: <Box component="span" color={isPassed ? 'success.main' : 'error.main'}>{percentage}%</Box>
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Candidate: <Box component="span" color="primary.main">{attempt?.user_name ?? 'Unknown'}</Box>
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center" width="100%" mt={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quiz: <Box component="span" color="primary.main">{quizTitle}</Box>
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="subtitle2" color="warning.main">
                  Marked for Review: {
                    attempt?.marked_for_review && Object.keys(attempt.marked_for_review).filter(qid => attempt.marked_for_review[qid]).length > 0
                      ? Object.keys(attempt.marked_for_review)
                          .filter(qid => attempt.marked_for_review[qid])
                          .map(qid => {
                            const idx = questions.findIndex(q => String(q.id) === String(qid));
                            return idx !== -1 ? `Q${idx + 1}` : null;
                          })
                          .filter(Boolean)
                          .join(', ')
                      : 'None'
                  }
                </Typography>
                {timeTaken && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration: <Box component="span" color="primary.main">{timeTaken}</Box>
                    </Typography>
                  </>
                )}
              </Stack>
            </Paper>
          </Box>

          {/* Add Review Mistakes Button next to view mode toggle */}
          <Box mb={4} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              color="primary"
              size="small"
            >
              <ToggleButton value="all">All Questions</ToggleButton>
              <ToggleButton value="section">Section-wise</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Questions Review - load lazily */}
          {reviewLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading detailed review...</Typography>
            </Box>
          ) : (
            <Stack spacing={4}>
              {viewMode === 'all' ? (
                <Stack spacing={4}>
                  {allQuestionsFlat.map((q, idx) => {
                    let userIndices = attempt.answers?.[q.id] ?? [];
                    if (userIndices.length && typeof userIndices[0] === 'string') {
                      userIndices = userIndices.map((val: string) => {
                        const foundIdx = q.options.findIndex((opt: any) => opt.text === val);
                        return foundIdx !== -1 ? foundIdx : null;
                      }).filter((idx: number | null) => idx !== null);
                    }
                    // Find section for this question
                    const sectionKey = attempt?.sections?.[q.id] || 'other';
                    const sectionObj = sections.find(s => s.name === sectionKey || s.id === sectionKey || String(s.id) === String(sectionKey));
                    const sectionName = sectionObj?.name || sectionLabels[sectionKey] || (sectionKey === 'other' ? 'General' : sectionKey);
                    return (
                      <QuestionReviewCard key={q.id} q={q} idx={idx} userIndices={userIndices} sectionName={sectionName} attempt={attempt} />
                    );
                  })}
                </Stack>
              ) : (
                <Stack spacing={4}>
                  {/* Improved Section Performance Summary */}
                  {/* Replace the old section performance summary card with the new professional version */}
                  <Box mb={4} display="flex" justifyContent="center">
              <Paper elevation={0} sx={{
                      p: { xs: 3, sm: 4 },
                borderRadius: 3,
                      width: '100%',
                      maxWidth: 900,
                      background: '#ffffff',
                      border: '1px solid #e8eaed',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                      <Typography variant="h5" fontWeight={600} color="#1a1a1a" mb={4} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          '&:before, &:after': {
                            content: '""',
                            flex: 1,
                            borderBottom: '1px solid #e8eaed',
                            mr: 3,
                            ml: 3,
                          }
                        }}
                      >
                        <BarChartIcon sx={{ mr: 1.5, color: '#1976d2', fontSize: '1.5rem' }} />
                        Performance Analysis
                </Typography>

                      <Grid container spacing={3}>
                        {/* Show only one: Needs Improvement OR Top Performing */}
                        {needsImprovementSections.length > 0 ? (
                          <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{
                              p: 3,
                              height: '100%',
                              borderLeft: '4px solid #ed6c02',
                              background: '#fffbf8',
                              borderRadius: 3,
                              border: '1px solid #fff3e0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(237, 108, 2, 0.1)',
                              }
                            }}>
                              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                <ErrorOutlineIcon sx={{ color: '#ed6c02', fontSize: '1.25rem' }} />
                                <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a">
                                  Needs Improvement
                                </Typography>
                              </Stack>
                              {needsImprovementSections.map((s, i) => (
                                <Box key={s} sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: i < needsImprovementSections.length - 1 ? 1.5 : 0,
                                  p: 1,
                                  borderRadius: 2,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fff3e0'
                                }}>
                                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: '#ed6c02' }}>{s}</Typography>
                                  <Chip 
                                    label={`${sectionMarks[s]?.percentage ?? 0}%`} 
                                    size="small" 
                                    sx={{
                                      backgroundColor: '#ed6c02',
                                      color: '#ffffff',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      height: 24
                                    }} 
                                  />
                                </Box>
                              ))}
                            </Paper>
                          </Grid>
                        ) : (
                          <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{
                              p: 3,
                              height: '100%',
                              borderLeft: '4px solid #2e7d32',
                              background: '#f8fdf8',
                              borderRadius: 3,
                              border: '1px solid #e8f5e9',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
                              }
                            }}>
                              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                <EmojiEventsIcon sx={{ color: '#2e7d32', fontSize: '1.25rem' }} />
                                <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a">
                                  Top Performing
                                </Typography>
                              </Stack>
                              {bestSections.map((s, i) => (
                                <Box key={s} sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: i < bestSections.length - 1 ? 1.5 : 0,
                                  p: 1,
                                  borderRadius: 2,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e8f5e9'
                                }}>
                                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: '#2e7d32' }}>{s}</Typography>
                                  <Chip 
                                    label={`${sectionMarks[s]?.percentage ?? 0}%`} 
                                    size="small" 
                                    sx={{
                                      backgroundColor: '#2e7d32',
                                      color: '#ffffff',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      height: 24
                                    }} 
                                  />
                                </Box>
                              ))}
                            </Paper>
                          </Grid>
                        )}
                        {/* Hide Needs Focus column for simplicity */}
                      </Grid>

                      {/* Section Ranking */}
                      <Box mt={4}>
                        <Typography variant="h6" fontWeight={600} color="#1a1a1a" mb={3} sx={{ textAlign: 'center' }}>
                          Section Ranking
                        </Typography>
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: 'repeat(auto-fit, minmax(280px, 1fr))', sm: 'repeat(auto-fit, minmax(300px, 1fr))' },
                          gap: 2
                        }}>
                          {rankedSections.map(([name, v], idx) => {
                            let chipColor = '';
                            let bgColor = '';
                            let borderColor = '';
                            if (v.percentage >= 80) {
                              chipColor = '#2e7d32';
                              bgColor = '#f8fdf8';
                              borderColor = '#e8f5e9';
                            } else if (v.percentage >= 60) {
                              chipColor = '#ed6c02';
                              bgColor = '#fffbf8';
                              borderColor = '#fff3e0';
                            } else {
                              chipColor = '#d32f2f';
                              bgColor = '#fef8f8';
                              borderColor = '#ffebee';
                            }
                            return (
                              <Paper 
                                key={name} 
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 3,
                                  backgroundColor: bgColor,
                                  border: `1px solid ${borderColor}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              >
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  fontSize: 14, 
                                  mr: 2,
                                  backgroundColor: chipColor,
                                  color: '#ffffff',
                                  fontWeight: 600
                                }}>
                                  {idx + 1}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight={600} color="#1a1a1a" mb={0.5}>{name}</Typography>
                                  <Typography variant="caption" color="#666" sx={{ display: 'block' }}>
                                    {v.obtained}/{v.total} marks
                                  </Typography>
                        </Box>
                        <Typography 
                                  variant="h6" 
                                  fontWeight={700}
                                  sx={{ color: chipColor }}
                                >
                                  {v.percentage}%
                        </Typography>
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                  {Object.entries(questionsBySection).map(([section, qs], idx) => {
                    const sectionInfo = sections.find((s: any) => s.id === Number(section)) || {};
                    const sectionName = sectionInfo.name || section;
                    const marks = sectionMarks[section] || { obtained: 0, total: 0, percentage: 0, avgTime: undefined };
                    const isBest = bestSections.includes(sectionName);
                    const isWeakest = weakestSections.includes(sectionName);
                    const needsImprovement = needsImprovementSections.includes(sectionName);
                    const suggestion = getSectionSuggestion(marks.percentage);
                    return (
                      <Box key={section} mb={3}>
                        <Box display="flex" flexDirection="column" width="100%" mb={1}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6" fontWeight={700} color="#002366">{sectionName}</Typography>
                            {isBest && <Chip label="Best Section" color="success" size="small" />}
                            {isWeakest && !allSame && <Chip label="Weakest Section" color="error" size="small" />}
                            {needsImprovement && <Chip label="Needs Improvement" color="warning" size="small" />}
                            <Box flexGrow={1} />
                            <Typography variant="body2" fontWeight={600} color={marks.percentage >= 60 ? 'success.main' : 'error.main'}>
                              Score: {marks.obtained}/{marks.total} ({marks.percentage}%)
                      </Typography>
                    </Box>
                          {sectionInfo.description && (
                            <Typography variant="body2" color="text.secondary" mt={0.5}>{sectionInfo.description}</Typography>
                          )}
                          {sectionInfo.instructions && (
                            <Box mt={0.5} p={1} bgcolor="#e3f2fd" borderRadius={2}>
                              <Typography variant="body2" color="#1976d2">{sectionInfo.instructions}</Typography>
                            </Box>
                          )}
                          <Typography variant="body2" color="text.secondary" mt={0.5}>{suggestion}</Typography>
                        </Box>
                        <Box>
                          {qs.map((q: any, idx: number) => (
                            <QuestionReviewCard key={q.id} q={q} idx={idx} userIndices={attempt.answers?.[q.id] ?? []} sectionName={sectionName} attempt={attempt} />
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          )}

          <Box mt={6} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', boxShadow: 3 }}
              onClick={() => router.push('/')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
}

// Extracted card for question review
function QuestionReviewCard({ q, idx, userIndices, sectionName, attempt }: { q: any, idx: number, userIndices: number[], sectionName?: string, attempt: any }) {
  const userAnswers = userIndices.map((i: number) => q.options[i]?.text).filter(Boolean);
  const correctAnswers = q.options.map((opt: any) => opt.isCorrect ? opt.text : null).filter(Boolean);
  const correctIndices = q.options
    .map((opt: any, i: number) => (opt.isCorrect ? i : null))
    .filter((i: number | null) => i !== null);
  const isCorrect =
    userIndices.length === correctIndices.length &&
    userIndices.every((idx: number) => correctIndices.includes(idx));
  const isMarked = attempt.marked_for_review && attempt.marked_for_review[q.id];

  return (
    <Card
      id={`question-${q.id}`}
      elevation={2}
      sx={{
      borderRadius: 3,
        p: 2,
        mb: 2,
        borderLeft: isMarked ? '4px solid #FFC107' : 'none',
        background: isMarked ? '#FFF9E6' : 'background.paper',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {sectionName && (
          <Chip 
            label={sectionName} 
            size="small" 
            sx={{ 
              mb: 1.5,
              backgroundColor: '#E3F2FD',
              color: '#1565C0',
              fontWeight: 600,
            }} 
          />
        )}
        
        <Stack direction="row" alignItems="flex-start" spacing={1} mb={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Q{idx + 1}.
            </Typography>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.5 }}>
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
                      p: 1.5,
                  pl: 2.5,
                      display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  background:
                    selected && isOptionCorrect
                      ? '#E8F5E9' // Light green for correct+selected
                      : isOptionCorrect
                      ? '#F1F8E9' // Very light green for correct
                      : selected
                      ? '#FFEBEE' // Light red for wrong selected
                      : 'inherit',
                  borderColor: 
                    selected && isOptionCorrect
                      ? '#4CAF50' // Green border
                      : isOptionCorrect
                      ? '#C8E6C9' // Light green border
                      : selected
                      ? '#EF9A9A' // Light red border
                      : '#E0E0E0', // Default gray border
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
          <Accordion 
            elevation={0}
            sx={{
              backgroundColor: '#F5F5F5',
              borderRadius: '8px !important',
              '&:before': {
                display: 'none',
              },
            }}
          >
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