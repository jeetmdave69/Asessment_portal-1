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

const PASS_THRESHOLD = 60;

type SectionKey = string;
type SectionQuestionsMap = { [section: SectionKey]: any[] };
type SectionScoresMap = { [section: SectionKey]: { correct: number; total: number } };

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();

  const attemptId = Number(Array.isArray(params?.attemptId) ? params.attemptId[0] : params?.attemptId);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [showBackWarning, setShowBackWarning] = useState(false);
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
      setShowBackWarning(true);
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
  const needsImprovementSections = sectionList.filter(([_, v]) => v.percentage < 60).map(([k]) => k);
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

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f4f6f8 0%, #e3eafc 100%)', py: 4 }}>
        <Container maxWidth="md">
          {showBackWarning && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              ⚠️ You cannot go back to the quiz page after submission.
            </Alert>
          )}

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
              border: '1px solid #e0e0e0',
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
                  <Box mb={4} display="flex" justifyContent="center">
                    <Paper elevation={2} sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      minWidth: 320,
                      maxWidth: 700,
                      width: '100%',
                      background: '#f8fafc',
                      boxShadow: 2,
                      fontFamily: 'Poppins, sans-serif',
                    }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main" mb={2} align="center">
                        Section Performance Summary
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap" mb={1}>
                        <Typography variant="subtitle2" fontWeight={600} color="success.main">
                          <EmojiEventsIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                          Best Section{bestSections.length > 1 ? 's' : ''}:
                        </Typography>
                        {bestSections.map((s, i) => (
                          <Chip key={s} label={s} color="success" size="small" sx={{ fontWeight: 600, fontSize: 14, mx: 0.5 }} />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap" mb={1}>
                        <Typography variant="subtitle2" fontWeight={600} color="error.main">
                          <ErrorOutlineIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                          Weakest Section{weakestSections.length > 1 ? 's' : ''}:
                        </Typography>
                        {weakestSections.map((s, i) => (
                          <Chip key={s} label={s} color="error" size="small" sx={{ fontWeight: 600, fontSize: 14, mx: 0.5 }} />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap" mb={1}>
                        <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                          Needs Improvement:
                        </Typography>
                        {needsImprovementSections.map((s, i) => (
                          <Chip key={s} label={s} color="warning" size="small" sx={{ fontWeight: 600, fontSize: 14, mx: 0.5 }} />
                        ))}
                        {needsImprovementSections.length === 0 && (
                          <Chip label="None" color="success" size="small" sx={{ fontWeight: 600, fontSize: 14, mx: 0.5 }} />
                        )}
                      </Stack>
                      <Box mt={2}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1}>
                          Section Ranking:
                        </Typography>
                        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 1 }}>
                          {rankedSections.map(([name, v], idx) => {
                            let chipColor: 'success' | 'warning' | 'error' | 'default' = 'default';
                            if (v.percentage >= 80) chipColor = 'success';
                            else if (v.percentage >= 60) chipColor = 'warning';
                            else if (v.percentage >= 40) chipColor = 'error';
                            else chipColor = 'default';
                            return (
                              <Chip
                                key={name}
                                label={`${idx + 1}. ${name} (${v.percentage}%)`}
                                color={chipColor}
                                size="medium"
                                sx={{ fontWeight: 600, fontSize: 15, mx: 0.5, mb: 0.5, background: chipColor === 'default' ? '#eee' : undefined, color: chipColor === 'default' ? '#333' : undefined }}
                              />
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
                            {isWeakest && <Chip label="Weakest Section" color="error" size="small" />}
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
      elevation={4}
      sx={{
        borderRadius: 3,
        p: 2,
        mb: 2,
        // Remove border/background highlight
      }}
    >
      <CardContent>
        {sectionName && (
          <Chip label={sectionName} size="small" color="primary" sx={{ mb: 1 }} />
        )}
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Q{idx + 1}
          </Typography>
          <Typography variant="body1" fontWeight={600} color="text.primary">
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
                  p: 1.2,
                  pl: 2,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  background:
                    selected && isOptionCorrect
                      ? '#e3f2fd' // blue for correct+selected
                      : isOptionCorrect
                      ? '#c8e6c9' // green for correct
                      : selected
                      ? '#ffebee' // red for wrong selected
                      : 'inherit',
                  borderColor: selected && isOptionCorrect
                    ? 'primary.main'
                    : isOptionCorrect
                    ? 'success.main'
                    : selected
                    ? 'error.main'
                    : 'divider',
                  borderWidth: 2,
                }}
              >
                <Typography sx={{ flex: 1 }}>
                  {opt.text}
                </Typography>
                {/* Green check for correct, blue for correct+selected, red X for wrong+selected */}
                {isOptionCorrect && selected && (
                  <Chip
                    label="Correct & Your Answer"
                    color="primary"
                    size="small"
                    icon={<Check size={18} color="#1976d2" />}
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                )}
                {isOptionCorrect && !selected && (
                  <Chip
                    label="Correct"
                    color="success"
                    size="small"
                    icon={<Check size={18} />}
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                )}
                {!isOptionCorrect && selected && (
                  <Chip
                    label="Your Answer"
                    color="error"
                    size="small"
                    icon={<X size={18} />}
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                )}
              </Paper>
            );
          })}
        </Box>
        {q.explanation && (
          <Box mt={2} p={2} bgcolor="#fffde7" borderRadius={2} borderLeft="6px solid #ffb300">
            <Typography variant="body2" fontStyle="italic" color="text.secondary">
              <b>Explanation:</b> {q.explanation}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}