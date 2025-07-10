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

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: '1000px',
        mx: 'auto',
        background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
        minHeight: '100vh',
      }}
    >
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
            <b>Questions:</b> {questionCount}
          </Typography>
          {quizDuration && (
            <Typography variant="body1" color="#37474f">
              <b>Duration:</b> {quizDuration} min
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
            <Box>
              {Array.isArray(q.options) &&
                q.options.map((opt, i) => {
                  const isCorrect =
                    Array.isArray(q.correct_answers) && q.correct_answers.includes(opt.text);
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
                      {isCorrect && (
                        <Chip
                          label="Correct"
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon fontSize="small" />}
                          sx={{ ml: 2, fontWeight: 700, fontSize: '0.85rem', letterSpacing: 0.5 }}
                        />
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
    </Box>
  );
}
