'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Paper,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { supabase } from '@/utils/supabaseClient';

interface Attempt {
  id: number;
  quiz_id: number;
  user_id: string;
  user_name: string;
  score: number;
  submitted_at: string;
  marked_for_review?: Record<string, boolean>;
  marked_questions?: Record<string, boolean>;
  answers?: Record<string, any>; // Added for new table display
  total_marks?: number; // Add this line
  percentage?: number; // Add this line
}

interface Question {
  id: number;
  question_text: string;
  sno?: number;
  options?: { text: string; isCorrect?: boolean }[]; // Added for new table display
  correct_answers?: any[]; // Added for new table display
  marks?: number; // Added for new table display
}

export default function QuizResultsPage() {
  const { quizId } = useParams() as { quizId: string };
  const router = useRouter();

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editScore, setEditScore] = useState<number>(0);
  const [editingAttemptId, setEditingAttemptId] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) return;

    async function fetchAttempts() {
      setLoading(true);

      const { data, error } = await supabase
        .from('attempts')
        .select(`
          id,
          quiz_id,
          user_id,
          user_name,
          score,
          submitted_at,
          marked_for_review,
          marked_questions,
          answers,
          total_marks,
          percentage
        `)
        .eq('quiz_id', Number(quizId))
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error);
        setAttempts([]);
      } else {
        setAttempts(data || []);
      }

      setLoading(false);
    }

    fetchAttempts();
  }, [quizId]);

  useEffect(() => {
    if (!quizId) return;
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, sno, options, correct_answers, marks')
        .eq('quiz_id', Number(quizId))
        .order('sno', { ascending: true })
        .order('id', { ascending: true });
      if (!error && data) {
        setQuestions(data);
      }
    }
    fetchQuestions();
  }, [quizId]);

  const questionMap = questions.reduce<{ [id: string]: { quizOrder: number; text: string } }>((acc, q, idx) => {
    acc[q.id.toString()] = { quizOrder: idx + 1, text: q.question_text };
    return acc;
  }, {});

  const avgScore =
    attempts.length > 0
      ? attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length
      : 0;

  const handleOpenEdit = (attemptId: number, currentScore: number) => {
    setEditingAttemptId(attemptId);
    setEditScore(currentScore);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingAttemptId === null) return;

    const { error } = await supabase
      .from('attempts')
      .update({ score: editScore })
      .eq('id', editingAttemptId);

    if (error) {
      alert('Failed to update score');
      console.error(error);
    } else {
      setAttempts((prev) =>
        prev.map((a) => (a.id === editingAttemptId ? { ...a, score: editScore } : a))
      );
      setEditOpen(false);
      setEditingAttemptId(null);
    }
  };

  if (loading) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Results for Quiz ID: {quizId}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Total Attempts: {attempts.length}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Average Score: {avgScore.toFixed(2)}
      </Typography>

      {attempts.length === 0 ? (
        <Typography sx={{ mt: 3 }}>No attempts found for this quiz yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Attempt ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Total Qs</TableCell>
                <TableCell>Correct</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>%</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Marked for Review</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((attempt) => {
                const totalQuestions = questions.length;
                // Parse answers if string
                const parsedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers || '{}') : attempt.answers || {};
                let totalMarks = 0;
                let obtainedMarks = 0;
                let correctAnswers = 0;
                questions.forEach(q => {
                  // Parse options as array of objects with isCorrect
                  const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options || [];
                  const mappedOptions = options.map((opt: any) => ({
                    text: typeof opt === 'string' ? opt : opt?.text || '',
                    isCorrect: typeof opt.is_correct !== 'undefined' ? !!opt.is_correct : !!opt.isCorrect,
                  }));
                  let userIndices = parsedAnswers?.[String(q.id)] ?? [];
                  if (userIndices.length && typeof userIndices[0] === 'string') {
                    userIndices = userIndices.map((val: string) => {
                      const foundIdx = mappedOptions.findIndex((opt: any) => opt.text === val);
                      return foundIdx !== -1 ? foundIdx : null;
                    }).filter((idx: number | null) => idx !== null);
                  }
                  const correctIndices = mappedOptions
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
                      correctAnswers += 1; // full correct
                    }
                  }
                });
                const safeObtainedMarks = isNaN(obtainedMarks) ? 0 : Math.round(obtainedMarks * 100) / 100;
                const safeTotalMarks = isNaN(totalMarks) ? 0 : totalMarks;
                const percentage = safeTotalMarks > 0 ? ((safeObtainedMarks / safeTotalMarks) * 100).toFixed(2) : '0.00';
                return (
                  <TableRow key={attempt.id}>
                    <TableCell>{attempt.id}</TableCell>
                    <TableCell>{attempt.user_name}</TableCell>
                    <TableCell>{totalQuestions}</TableCell>
                    <TableCell>{correctAnswers}</TableCell>
                    <TableCell>{safeObtainedMarks}</TableCell>
                    <TableCell>{safeTotalMarks}</TableCell>
                    <TableCell>{percentage}%</TableCell>
                    <TableCell>{new Date(attempt.submitted_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {attempt.marked_for_review && Object.keys(attempt.marked_for_review).length > 0 ?
                        Object.keys(attempt.marked_for_review)
                          .filter(qid => attempt.marked_for_review && attempt.marked_for_review[qid])
                          .map((qid, idx) => `Q${Number(qid) + 1}`)
                          .join(', ')
                        : 'None'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/result/${attempt.id}`)}
                      >
                        View Submission
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenEdit(attempt.id, attempt.score)}
                        sx={{ ml: 1 }}
                      >
                        Edit Score
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Score</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="New Score"
            type="number"
            fullWidth
            value={editScore}
            onChange={(e) => setEditScore(parseInt(e.target.value, 10))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
