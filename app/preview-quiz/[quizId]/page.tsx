'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabaseClient';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Option {
  text: string;
  image: string | null;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question_text: string;
  options: Option[] | string;
  correct_answers: string[] | string;
  explanation: string | null;
  image_url: string | null; // Added image_url to Question interface
}

interface Quiz {
  id: number;
  title: string;
}

export default function PreviewQuizPage() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params.quizId[0] : params?.quizId;
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState<{ open: boolean; src: string | null }>({ open: false, src: null });
  const [copySnackbar, setCopySnackbar] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      const { data: rawQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);
      const parsedQuestions = (rawQuestions || []).map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correct_answers:
          typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers,
      }));
      setQuiz(quizData);
      setQuestions(parsedQuestions);
      setLoading(false);
    };
    fetchData();
  }, [quizId]);

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" color="primary">Loading quiz preview...</Typography>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Quiz not found.</Typography>
      </Box>
    );
  }

  // Quiz metadata helpers
  const questionCount = questions.length;
  const quizDuration = quiz && ('duration' in quiz ? (quiz as any).duration : ('quiz_duration' in quiz ? (quiz as any).quiz_duration : ('time' in quiz ? (quiz as any).time : null)));
  const quizDescription = quiz && ('description' in quiz ? (quiz as any).description : ('quiz_description' in quiz ? (quiz as any).quiz_description : ''));
  const quizStart = quiz && ((quiz as any)['start_time'] || (quiz as any)['start'] || (quiz as any)['quiz_start'] || (quiz as any)['begin_time']);
  const quizEnd = quiz && ((quiz as any)['end_time'] || (quiz as any)['end'] || (quiz as any)['quiz_end'] || (quiz as any)['expiry_time']);
  const quizAccessCode = quiz && ((quiz as any)['access_code'] || (quiz as any)['code'] || (quiz as any)['quiz_code']);

  return (
    <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box maxWidth="900px" mx="auto" px={{ xs: 1, sm: 2 }}>
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4, background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.07)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ fontWeight: 600, borderRadius: 2, mb: { xs: 2, md: 0 } }}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Box display="flex" alignItems="center" gap={2}>
              {quizAccessCode && (
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f1f5fa', border: '1.5px dashed #b6c2d1', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontWeight: 700 }}>
                    ACCESS CODE
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 22, letterSpacing: 2, px: 1, userSelect: 'all' }}
                  >
                    {String(quizAccessCode)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(String(quizAccessCode));
                      setCopySnackbar(true);
                    }}
                    aria-label="Copy access code"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Paper>
              )}
            </Box>
          </Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#002366"
            align="left"
            sx={{ mb: 1, letterSpacing: 1 }}
          >
            {quiz.title || (quiz as any).quiz_title || (quiz as any).name || 'Untitled Quiz'}
          </Typography>
          {quizDescription && (
            <Typography variant="subtitle1" color="text.secondary" mb={1}>
              {quizDescription}
            </Typography>
          )}
          <Box display="flex" gap={3} flexWrap="wrap" mt={1} alignItems="center">
            <Chip label={`Questions: ${questionCount}`} color="primary" sx={{ fontWeight: 600, fontSize: 15 }} />
            {quizDuration && (
              <Chip label={`Duration: ${quizDuration} min`} color="secondary" sx={{ fontWeight: 600, fontSize: 15 }} />
            )}
            {quizStart && (
              <Chip label={`Start: ${dayjs(String(quizStart)).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A [IST]')}`} sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, fontSize: 15 }} />
            )}
            {quizEnd && (
              <Chip label={`End: ${dayjs(String(quizEnd)).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A [IST]')}`} sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600, fontSize: 15 }} />
            )}
            {quiz.id && (
              <Chip label={`Quiz ID: ${quiz.id}`} sx={{ bgcolor: '#ede7f6', color: '#512da8', fontWeight: 600, fontSize: 15 }} />
            )}
          </Box>
        </Paper>

        {/* Questions */}
        {questions.map((q, index) => {
          const isMultiple = Array.isArray(q.correct_answers) && q.correct_answers.length > 1;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
            >
              <Paper
                elevation={6}
                sx={{
                  mb: 4,
                  p: { xs: 2, md: 4 },
                  borderRadius: 4,
                  background: '#fff',
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                  border: '1.5px solid #e3e8ef',
                  position: 'relative',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip label={`Q${index + 1} of ${questionCount}`} color="primary" sx={{ fontWeight: 700, fontSize: 16 }} />
                    <Chip label={isMultiple ? 'Multiple Correct' : 'Single Correct'} color={isMultiple ? 'secondary' : 'success'} sx={{ fontWeight: 700, fontSize: 16 }} />
                  </Box>
                  <Box display="flex" gap={2}>
                    {'marks' in q && (q as any).marks && (
                      <Chip label={`Marks: ${(q as any).marks}`} sx={{ bgcolor: '#ede7f6', color: '#7b1fa2', fontWeight: 700, fontSize: 16 }} />
                    )}
                    {'type' in q && (q as any).type && (
                      <Chip label={`Type: ${(q as any).type}`} sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700, fontSize: 16 }} />
                    )}
                    {'difficulty' in q && (q as any).difficulty && (
                      <Chip label={`Difficulty: ${(q as any).difficulty}`} sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 700, fontSize: 16 }} />
                    )}
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold" color="#002366" mb={1.5}>
                  {q.question_text}
                </Typography>
                {q.image_url && (
                  <Box mt={2} mb={2} display="flex" justifyContent="center">
                    <img
                      src={q.image_url}
                      alt="Question"
                      style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 10, border: '1px solid #e3e8ef', cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                      onClick={() => setImageModal({ open: true, src: q.image_url })}
                    />
                  </Box>
                )}
                <Box mt={2} mb={2}>
                  {Array.isArray(q.options) &&
                    q.options.map((opt, i) => {
                      const isCorrect =
                        (Array.isArray(q.correct_answers) && (
                          q.correct_answers.includes(opt.text) ||
                          q.correct_answers.includes(String(i))
                        )) ||
                        (typeof q.correct_answers === 'string' && q.correct_answers === opt.text) ||
                        (typeof q.correct_answers === 'number' && q.correct_answers === i);
                      return (
                        <Box
                          key={i}
                          display="flex"
                          alignItems="center"
                          mb={1.5}
                          p={1.2}
                          borderRadius={2}
                          sx={{
                            background: isCorrect ? 'rgba(56, 203, 137, 0.13)' : '#f8fafc',
                            border: isCorrect ? '2px solid #38cb89' : '1px solid #e3e8ef',
                            boxShadow: isCorrect ? '0 2px 8px 0 rgba(56,203,137,0.08)' : 'none',
                            transition: 'all 0.2s',
                            cursor: opt.image ? 'pointer' : 'default',
                            '&:hover': {
                              background: isCorrect ? 'rgba(56, 203, 137, 0.18)' : '#f1f5f9',
                            },
                          }}
                          onClick={() => opt.image && setImageModal({ open: true, src: opt.image })}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: isCorrect ? '#38cb89' : '#e3e8ef',
                              color: isCorrect ? '#fff' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 18,
                              mr: 2,
                            }}
                          >
                            {String.fromCharCode(65 + i)}
                          </Box>
                          <Typography
                            variant="body1"
                            color={isCorrect ? 'success.main' : 'text.primary'}
                            fontWeight={isCorrect ? 700 : 400}
                            sx={{ fontSize: 17 }}
                          >
                            {opt.text}
                          </Typography>
                          {opt.image && (
                            <Box ml={2}>
                              <img
                                src={opt.image}
                                alt="option"
                                style={{ maxHeight: 40, maxWidth: 80, borderRadius: 4, border: '1px solid #e3e8ef', cursor: 'pointer' }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setImageModal({ open: true, src: opt.image });
                                }}
                              />
                            </Box>
                          )}
                          {isCorrect && (
                            <Box flex={1} display="flex" justifyContent="flex-end" alignItems="center">
                              <CheckCircleIcon sx={{ color: '#38cb89', fontSize: 28, ml: 2 }} />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                </Box>
                {/* Correct Answer Summary */}
                {q.correct_answers && (
                  <Box mt={2} mb={1}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#e8f5e9', color: '#388e3c', fontWeight: 700, display: 'inline-block' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="#38cb89">
                        Correct Answer{Array.isArray(q.correct_answers) && q.correct_answers.length > 1 ? 's' : ''}: {
                          Array.isArray(q.correct_answers) && Array.isArray(q.options)
                            ? q.correct_answers
                                .map(ans => {
                                  let idx = -1;
                                  if (typeof ans === 'number') {
                                    idx = ans;
                                  } else if (typeof ans === 'string' && Array.isArray(q.options)) {
                                    idx = Array.isArray(q.options) ? q.options.findIndex((opt: any) => opt.text === ans) : -1;
                                    if (idx === -1 && !isNaN(Number(ans))) idx = Number(ans); // fallback if stored as string index
                                  }
                                  if (idx !== -1 && Array.isArray(q.options) && q.options[idx]) {
                                    return `${String.fromCharCode(65 + idx)}. ${q.options[idx].text}`;
                                  }
                                  return ans;
                                })
                                .join(', ')
                            : (Array.isArray(q.options) && typeof q.correct_answers === 'number')
                              ? (() => {
                                  const idx = q.correct_answers;
                                  return q.options[idx] ? `${String.fromCharCode(65 + idx)}. ${q.options[idx].text}` : String.fromCharCode(65 + idx);
                                })()
                              : (Array.isArray(q.options) && typeof q.correct_answers === 'string')
                                ? (() => {
                                    let idx = -1;
                                    if (Array.isArray(q.options)) {
                                      idx = q.options.findIndex((opt: any) => opt.text === q.correct_answers);
                                      if (idx === -1 && !isNaN(Number(q.correct_answers))) idx = Number(q.correct_answers);
                                    }
                                    return idx !== -1 && q.options[idx] ? `${String.fromCharCode(65 + idx)}. ${q.options[idx].text}` : q.correct_answers;
                                  })()
                                : q.correct_answers
                        }
                      </Typography>
                    </Paper>
                  </Box>
                )}
                {/* Explanation Collapsible */}
                {q.explanation && (
                  <Box mt={1.5}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f1f8e9', color: '#33691e', fontStyle: 'italic', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => setExplanationOpen(explanationOpen === index ? null : index)}
                      aria-expanded={explanationOpen === index}
                      tabIndex={0}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Explanation {explanationOpen === index ? '▲' : '▼'}
                      </Typography>
                      {explanationOpen === index && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {q.explanation}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
              </Paper>
              {index < questions.length - 1 && <Divider sx={{ my: 3, borderColor: '#e3e8ef' }} />}
            </motion.div>
          );
        })}
      </Box>
      {/* Image Modal */}
      <Dialog open={imageModal.open} onClose={() => setImageModal({ open: false, src: null })} maxWidth="md">
        <Box position="relative" bgcolor="#000" borderRadius={2}>
          <IconButton
            onClick={() => setImageModal({ open: false, src: null })}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
            aria-label="Close image preview"
          >
            <CloseIcon />
          </IconButton>
          {imageModal.src && (
            <img
              src={imageModal.src}
              alt="Option Preview"
              style={{ maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: 'auto', borderRadius: 8 }}
            />
          )}
        </Box>
      </Dialog>
      {/* Snackbar for copy-to-clipboard */}
      <Snackbar
        open={copySnackbar}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setCopySnackbar(false)}>
          Access code copied!
        </Alert>
      </Snackbar>
    </Box>
  );
}
