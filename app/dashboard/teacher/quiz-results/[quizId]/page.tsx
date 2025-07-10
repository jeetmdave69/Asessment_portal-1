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
}

interface Question {
  id: number;
  question_text: string;
  sno?: number;
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
          marked_questions
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
        .select('id, question_text, sno')
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
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {attempts.map((attempt) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={attempt.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Attempt ID: {attempt.id}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {attempt.user_name}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    Score: {attempt.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submitted: {new Date(attempt.submitted_at).toLocaleString()}
                  </Typography>
                  {(attempt.marked_questions && Object.keys(attempt.marked_questions).length > 0
                    ? attempt.marked_questions
                    : attempt.marked_for_review && Object.keys(attempt.marked_for_review).length > 0
                      ? attempt.marked_for_review
                      : null) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                        Marked for Review:
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxWidth: 500, boxShadow: 0, mb: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Q#</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Question Text</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.keys(attempt.marked_questions && Object.keys(attempt.marked_questions).length > 0
                              ? attempt.marked_questions
                              : attempt.marked_for_review || {})
                              .filter(qid => (attempt.marked_questions && Object.keys(attempt.marked_questions).length > 0
                                ? attempt.marked_questions[qid]
                                : attempt.marked_for_review && attempt.marked_for_review[qid]))
                              .map((qid) => {
                                const qInfo = questionMap[qid];
                                if (!qInfo) return (
                                  <TableRow key={qid}>
                                    <TableCell colSpan={2} sx={{ color: 'red' }}>Unknown question (ID: {qid})</TableCell>
                                  </TableRow>
                                );
                                return (
                                  <TableRow key={qid}>
                                    <TableCell>{`Q${qInfo.quizOrder}`}</TableCell>
                                    <TableCell>{qInfo.text}</TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
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
                  >
                    Edit Score
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
