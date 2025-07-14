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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
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
    <Box minHeight="100vh">
      {/* Main Content full width, no sidebar */}
      <Box sx={{ width: '100%' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, fontWeight: 600, borderRadius: 2 }}
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
        {/* Quiz Title - now above metadata, centered, bold, large */}
        <Typography
          variant="h3"
          fontWeight="bold"
          color="#002366"
          align="center"
          sx={{ mb: 2, letterSpacing: 1 }}
        >
          {quiz.title || (quiz as any).quiz_title || (quiz as any).name || 'Untitled Quiz'}
        </Typography>
        {/* Quiz Metadata */}
        <Paper sx={{ mb: 4, p: 3, borderRadius: 3, background: '#fff', boxShadow: 2 }}>
          {quizDescription && (
            <Typography variant="subtitle1" color="text.secondary" mb={1}>
              {quizDescription}
            </Typography>
          )}
          <Box display="flex" gap={3} flexWrap="wrap" mt={1}>
            <Typography variant="body1" color="#37474f">
              <b>Questions:</b> {questionCount > 0 ? questionCount : '-'}
            </Typography>
            {quizDuration && (
              <Typography variant="body1" color="#37474f">
                <b>Duration:</b> {quizDuration} min
              </Typography>
            )}
            {quizStart && (
              <Typography variant="body1" color="#37474f">
                <b>Start:</b> {dayjs(String(quizStart)).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A [IST]')}
              </Typography>
            )}
            {quizEnd && (
              <Typography variant="body1" color="#37474f">
                <b>End:</b> {dayjs(String(quizEnd)).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A [IST]')}
              </Typography>
            )}
            {quizAccessCode && (
              <Box display="flex" justifyContent="center" alignItems="center" width="100%" my={2}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minWidth: 320, maxWidth: 420, background: '#f8fafc', border: '1.5px solid #e3e8ef', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontWeight: 700, mb: 1 }}>
                    QUIZ ACCESS CODE
                  </Typography>
                  <Divider sx={{ width: '100%', mb: 2 }} />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 24,
                        letterSpacing: 3,
                        px: 2,
                        userSelect: 'all',
                        bgcolor: '#fff',
                        borderRadius: 2,
                        border: '1px dashed #b6c2d1',
                        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
                      }}
                    >
                      {String(quizAccessCode)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(String(quizAccessCode));
                        setCopySnackbar(true);
                      }}
                      sx={{ ml: 0.5 }}
                      aria-label="Copy access code"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            )}
            {quiz.id && (
              <Typography variant="body1" color="#37474f">
                <b>Quiz ID:</b> {quiz.id}
              </Typography>
            )}
          </Box>
        </Paper>
        {/* End Quiz Metadata */}
        {questions.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
          >
            <Paper
              elevation={8}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                border: '1.5px solid #e3e8ef',
                background: '#fff',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.01)',
                  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
                },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="bold" color="#002366">
                  Q{index + 1}. {q.question_text}
                </Typography>
                {/* Question Metadata */}
                <Box display="flex" gap={2}>
                  {'marks' in q && (q as any).marks && (
                    <Typography variant="body2" color="#7b1fa2" fontWeight={600}>
                      Marks: {(q as any).marks}
                    </Typography>
                  )}
                  {'type' in q && (q as any).type && (
                    <Typography variant="body2" color="#1976d2" fontWeight={600}>
                      Type: {(q as any).type}
                    </Typography>
                  )}
                  {'difficulty' in q && (q as any).difficulty && (
                    <Typography variant="body2" color="#f57c00" fontWeight={600}>
                      Difficulty: {(q as any).difficulty}
                    </Typography>
                  )}
                </Box>
              </Box>
              {/* Question Image */}
              {q.image_url && (
                <Box mt={2} mb={2}>
                  <img
                    src={q.image_url}
                    alt="Question"
                    style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, border: '1px solid #e3e8ef', cursor: 'pointer' }}
                    onClick={() => setImageModal({ open: true, src: q.image_url })}
                  />
                </Box>
              )}
              <Box>
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
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ mr: 1.5, fontWeight: 700, color: '#64748b', fontSize: 18 }}
                        >
                          {String.fromCharCode(65 + i)}.
                        </Typography>
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
                              onClick={() => setImageModal({ open: true, src: opt.image })}
                            />
                          </Box>
                        )}
                        {/* Professional tick mark for correct answer */}
                        {isCorrect && (
                          <Box flex={1} display="flex" justifyContent="flex-end" alignItems="center">
                            <CheckCircleIcon sx={{ color: '#38cb89', fontSize: 28, ml: 2 }} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
              </Box>
              {/* Enhanced Correct Answer Summary */}
              {q.correct_answers && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#38cb89">
                    Correct Answer{Array.isArray(q.correct_answers) && q.correct_answers.length > 1 ? 's' : ''}: {
                      Array.isArray(q.correct_answers) && Array.isArray(q.options)
                        ? q.correct_answers
                            .map(ans => {
                              let idx = -1;
                              if (typeof ans === 'number') {
                                idx = ans;
                              } else if (typeof ans === 'string' && Array.isArray(q.options)) {
                                idx = q.options.findIndex((opt: any) => opt.text === ans);
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
                </Box>
              )}
              {q.explanation && (
                <Box mt={1.5}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Explanation: {q.explanation}
                  </Typography>
                </Box>
              )}
            </Paper>
            {index < questions.length - 1 && <Divider sx={{ my: 3, borderColor: '#e3e8ef' }} />}
          </motion.div>
        ))}
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
    </Box>
  );
}
