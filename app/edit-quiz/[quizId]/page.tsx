"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Paper,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Card,
  LinearProgress
} from "@mui/material";
import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { quizSchema, QuizFormValues } from "@/schemas/quizSchema";
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper to recursively extract error messages with field paths
function getErrorMessages(errors: any, path: string[] = []) {
  let messages: { path: string; message: string }[] = [];
  if (errors) {
    if (Array.isArray(errors)) {
      errors.forEach((err, idx) => {
        if (err) {
          messages = messages.concat(getErrorMessages(err, [...path, `[${idx}]`]));
        }
      });
    } else if (typeof errors === 'object') {
      if ('message' in errors && errors.message) {
        messages.push({ path: path.join('.'), message: errors.message });
      }
      Object.entries(errors).forEach(([key, value]) => {
        if (key !== 'message') {
          messages = messages.concat(getErrorMessages(value, [...path, key]));
        }
      });
    }
  }
  return messages;
}

// Helper to get question-level errors
function getQuestionErrorIndexes(errors: any) {
  if (!errors || !errors.questions || !Array.isArray(errors.questions)) return [];
  return errors.questions.map((qErr: any, idx: number) => qErr ? idx : null).filter((idx: number | null) => idx !== null) as number[];
}

// Helper to get all error messages for a specific question
function getQuestionErrorMessages(errors: any, qIdx: number) {
  const messages: string[] = [];
  if (!errors || !errors.questions || !errors.questions[qIdx]) return messages;
  function recurse(errObj: any, path: string[] = []) {
    if (!errObj) return;
    if (Array.isArray(errObj)) {
      errObj.forEach((e, i) => recurse(e, [...path, `[${i}]`]));
    } else if (typeof errObj === 'object') {
      if ('message' in errObj && errObj.message) messages.push(errObj.message);
      Object.entries(errObj).forEach(([key, value]) => {
        if (key !== 'message') recurse(value, [...path, key]);
      });
    }
  }
  recurse(errors.questions[qIdx]);
  return messages;
}

export default function EditQuizPage() {
  const params = useParams() as { quizId: string };
  const quizId = params.quizId;

  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<QuizFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<number | false>(0);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [addSectionDialog, setAddSectionDialog] = useState<{ open: boolean; qIndex: number | null }>({ open: false, qIndex: null });
  const [newSectionName, setNewSectionName] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      quizTitle: "",
      description: "",
      totalMarks: "0",
      duration: "0",
      startDateTime: new Date(),
      expiryDateTime: new Date(),
      shuffleQuestions: false,
      shuffleOptions: false,
      maxAttempts: "1",
      previewMode: false,
      questions: [],
    },
  });

  const { register, control, handleSubmit, setValue, watch, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  useEffect(() => {
    async function fetchQuizAndSections() {
      setLoading(true);

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      const { data: sectionsData } = await supabase
        .from("sections")
        .select("id, name")
        .eq("quiz_id", quizId);
      setSections(sectionsData || []);

      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("*, section_id")
        .eq("quiz_id", quizId);

      if (quizError || questionsError) {
        setErrorToast(true);
        setLoading(false);
        return;
      }

      if (quiz && questions) {
        const correctMap = (q: any) => {
          let correctAnswers: (string | number)[] = [];
          try {
            if (typeof q.correct_answers === "string") {
              if (q.correct_answers.trim().startsWith("[")) {
                correctAnswers = JSON.parse(q.correct_answers);
              } else if (q.correct_answers.trim() !== "") {
                correctAnswers = [q.correct_answers.trim()];
              }
            } else if (Array.isArray(q.correct_answers)) {
              correctAnswers = q.correct_answers;
            }
          } catch {
            correctAnswers = [];
          }

          let optionsParsed = [];
          try {
            optionsParsed = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
          } catch {
            optionsParsed = [];
          }

          // Debug logging
          console.log('Question:', q.question_text, 'Correct Answers:', correctAnswers, 'Options:', optionsParsed);

          return {
            question: q.question_text,
            image: q.image_url || null,
            explanation: q.explanation || "",
            questionType: q.question_type || 'single',
            section: (sectionsData?.find(s => s.id === q.section_id)?.name) || (sectionsData && sectionsData[0]?.name) || '',
            marks: q.marks ? String(q.marks) : '1',
            options: optionsParsed.map((o: any, idx: number) => {
              const text = typeof o === "string" ? o : o.text;
              // Mark as correct if text matches (case-insensitive) or index matches
              const isCorrect = correctAnswers.some(ans => {
                if (typeof ans === 'number') return ans === idx;
                if (!isNaN(Number(ans))) return Number(ans) === idx;
                return typeof ans === 'string' && ans.trim().toLowerCase() === text.trim().toLowerCase();
              });
              return {
                text,
                image: o.image || null,
                isCorrect,
              };
            }),
          };
        };

        reset({
          quizTitle: quiz.quiz_title || quiz.quiz_name || "",
          description: quiz.description || "",
          totalMarks: quiz.total_marks?.toString() || "0",
          duration: quiz.duration?.toString() || "0",
          startDateTime: quiz.start_time ? new Date(quiz.start_time) : new Date(),
          expiryDateTime: quiz.end_time ? new Date(quiz.end_time) : new Date(),
          shuffleQuestions: quiz.shuffle_questions || false,
          shuffleOptions: quiz.shuffle_options || false,
          maxAttempts: quiz.max_attempts?.toString() || "1",
          previewMode: quiz.preview_mode || false,
          showCorrectAnswers: quiz.show_correct_answers ?? false,
          passingScore: quiz.passing_score?.toString() || "50",
          questions: questions.map(q => ({
            ...correctMap(q),
            section: (sectionsData?.find(s => s.id === q.section_id)?.name) || (sectionsData && sectionsData[0]?.name) || '',
          })),
        });
      }

      setLoading(false);
    }

    fetchQuizAndSections();
  }, [quizId, reset]);

  const handleFormSubmit = (data: QuizFormValues) => {
    console.log('handleFormSubmit called - dialog should open');
    setPendingData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    console.log('handleConfirmSave called', pendingData);
    if (!pendingData) return;
    setSaving(true);
    const data = pendingData;
    // Detailed logging for debugging
    const quizUpdatePayload = {
      quiz_title: data.quizTitle,
        description: data.description,
        total_marks: parseInt(data.totalMarks),
        duration: parseInt(data.duration),
        start_time: data.startDateTime.toISOString(),
        end_time: data.expiryDateTime.toISOString(),
        shuffle_questions: data.shuffleQuestions,
        shuffle_options: data.shuffleOptions,
        max_attempts: parseInt(data.maxAttempts),
        preview_mode: data.previewMode,
      show_correct_answers: data.showCorrectAnswers,
      passing_score: parseInt(data.passingScore),
    };
    console.log('Updating quiz with id:', Number(quizId), 'with data:', quizUpdatePayload);
    const { data: updateResult, error: updateError } = await supabase
      .from("quizzes")
      .update(quizUpdatePayload)
      .eq("id", Number(quizId))
      .select();
    console.log('Supabase update result:', updateResult, 'updateError:', updateError);
    if (updateError) {
      setSaveErrorMessage(
        `Quiz update failed: ${updateError.message || ''} (code: ${updateError.code || 'N/A'})\nPayload: ${JSON.stringify(quizUpdatePayload, null, 2)}`
      );
      setErrorToast(true);
      setSaving(false);
      setConfirmDialogOpen(false);
      setPendingData(null);
      console.error('Quiz update error:', updateError, 'Payload:', quizUpdatePayload);
      return;
    }
    await supabase.from("questions").delete().eq("quiz_id", Number(quizId));
    const questionsPayload = data.questions.map((q) => ({
      quiz_id: Number(quizId),
      quiz_title: data.quizTitle,
      question_text: q.question,
      explanation: q.explanation,
      section_id: sections.find(s => s.name === q.section)?.id || null,
      options: JSON.stringify(q.options.map((o) => ({ text: o.text, image: o.image, isCorrect: o.isCorrect }))),
      correct_answers: JSON.stringify(q.options.filter((o) => o.isCorrect).map((o) => o.text)),
      image_url: q.image || null,
      marks: Number(q.marks) || 1,
      question_type: q.questionType || 'single',
    }));
    console.log('Questions payload for insert:', questionsPayload);
    const { error: insertError } = await supabase.from("questions").insert(questionsPayload);
    if (insertError) {
      setSaveErrorMessage(
        `Questions insert failed: ${insertError.message || ''} (code: ${insertError.code || 'N/A'})\nPayload: ${JSON.stringify(questionsPayload, null, 2)}`
      );
      setErrorToast(true);
      setSaving(false);
      setConfirmDialogOpen(false);
      setPendingData(null);
      console.error('Questions insert error:', insertError, 'Payload:', questionsPayload);
      return;
    }
    setSaving(false);
    setConfirmDialogOpen(false);
    setPendingData(null);
    setShowToast(true);
    setShowSuccessDialog(true);
    setSaveErrorMessage(null);
  };

  if (loading) return <CircularProgress sx={{ mx: "auto", mt: 10, display: "block" }} />;

  const questionErrorIndexes = getQuestionErrorIndexes(methods.formState.errors);

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <FormProvider {...methods}>
            {saving && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="primary" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>
                  Saving quiz...
                </Typography>
              </Box>
            )}
            <form onSubmit={e => {
              setFormSubmitAttempted(true);
              handleSubmit((data) => {
                handleFormSubmit(data);
                // Auto-scroll to first error
                const firstErrorIdx = questionErrorIndexes[0];
                if (typeof firstErrorIdx === 'number') {
                  const el = document.getElementById(`question-accordion-${firstErrorIdx}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              })(e);
            }}>
            <Stack spacing={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, position: 'relative' }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    variant="outlined"
                    sx={{ position: 'absolute', left: 0 }}
                  >
                    Back to Dashboard
                  </Button>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Edit Quiz
                  </Typography>
                </Box>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Quiz Information</Typography>
                <Stack spacing={2}>
                    <TextField
                      label="Quiz Title"
                      {...register("quizTitle")}
                      error={!!methods.formState.errors.quizTitle}
                      helperText={methods.formState.errors.quizTitle?.message || "Enter a descriptive title for your quiz."}
                      fullWidth
                    />
                    <TextField
                      label="Description"
                      {...register("description")}
                      error={!!methods.formState.errors.description}
                      helperText={methods.formState.errors.description?.message || "Describe the quiz for students (optional)."}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Total Marks" type="number" {...register("totalMarks")} fullWidth helperText="Sum of all question marks." />
                    <TextField label="Duration (mins)" type="number" {...register("duration")} fullWidth helperText="How long students have to complete the quiz." />
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={dayjs(watch("startDateTime"))}
                      onChange={(val) => setValue("startDateTime", val?.toDate() || new Date())}
                    />
                    <DateTimePicker
                      label="End Date & Time"
                      value={dayjs(watch("expiryDateTime"))}
                      onChange={(val) => setValue("expiryDateTime", val?.toDate() || new Date())}
                    />
                  </Stack>
                  <TextField label="Max Attempts" type="number" {...register("maxAttempts")} fullWidth helperText="How many times a student can attempt this quiz." />
                  <Stack direction="row" spacing={2}>
                    <FormControlLabel control={<Checkbox {...register("previewMode")} />} label="Enable Preview Mode" />
                    <FormControlLabel control={<Checkbox {...register("shuffleQuestions")} />} label="Shuffle Questions" />
                    <FormControlLabel control={<Checkbox {...register("shuffleOptions")} />} label="Shuffle Options" />
                  </Stack>
                </Stack>
              </Paper>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>Questions</Typography>
              <Stack spacing={2}>
                {fields.map((q, i) => {
                  const opts = watch(`questions.${i}.options`);
                    const hasError = questionErrorIndexes.includes(i);
                    const questionErrorMessages = getQuestionErrorMessages(methods.formState.errors, i);
                  return (
                      <Accordion
                        key={q.id}
                        expanded={expandedPanel === i}
                        onChange={() => setExpandedPanel(expandedPanel === i ? false : i)}
                        sx={{ borderRadius: 2, boxShadow: 2, mb: 1, border: hasError ? '2px solid #d32f2f' : undefined }}
                        id={`question-accordion-${i}`}
                      >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography fontWeight={600} sx={{ color: 'text.primary', mr: 1 }}>
                              {`Q${i + 1}. `}{watch(`questions.${i}.question`) || `Question ${i + 1}`}
                            </Typography>
                            {hasError && <ErrorOutlineIcon color="error" sx={{ ml: 1 }} />}
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                            <Chip label={watch(`questions.${i}.questionType`) === 'multiple' ? 'Multiple' : 'Single'} color="info" size="small" />
                            <Chip label={`Marks: ${watch(`questions.${i}.marks`)}`} color="secondary" size="small" />
                          </Stack>
                        </AccordionSummary>
                        {hasError && questionErrorMessages.length > 0 && (
                          <Box sx={{ px: 3, pt: 1, pb: 0 }}>
                            <ul style={{ color: '#d32f2f', fontWeight: 600, fontSize: 14, margin: 0, paddingLeft: 18 }}>
                              {questionErrorMessages.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                              ))}
                            </ul>
                        </Box>
                        )}
                      <AccordionDetails>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <Select
                                label="Section"
                                value={watch(`questions.${i}.section`) || ''}
                                onChange={e => {
                                  if (e.target.value === '__add_new__') {
                                    setAddSectionDialog({ open: true, qIndex: i });
                                  } else {
                                    setValue(`questions.${i}.section`, e.target.value);
                                  }
                                }}
                                fullWidth
                                required
                              >
                                {sections.map((section) => (
                                  <MenuItem key={section.id} value={section.name}>{section.name}</MenuItem>
                                ))}
                                <MenuItem value="__add_new__" sx={{ fontStyle: 'italic', color: 'primary.main' }}>+ Add new section</MenuItem>
                              </Select>
                          <Controller
                            name={`questions.${i}.question`}
                            control={control}
                            defaultValue={q.question || ''}
                            render={({ field }) => (
                              <TextField
                                label="Question"
                                {...field}
                                fullWidth
                                required
                              />
                            )}
                          />
                            </Stack>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                              <Select label="Type" value={watch(`questions.${i}.questionType`) as "single" | "multiple"} onChange={e => setValue(`questions.${i}.questionType`, e.target.value as "single" | "multiple")}>
                                <MenuItem value="single">Single Choice</MenuItem>
                                <MenuItem value="multiple">Multiple Choice</MenuItem>
                            </Select>
                              <TextField label="Marks" type="number" value={watch(`questions.${i}.marks`)} onChange={e => setValue(`questions.${i}.marks`, e.target.value)} fullWidth />
                            </Stack>
                            <TextField label="Explanation (optional)" {...register(`questions.${i}.explanation`)} fullWidth multiline minRows={2} />
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Options:</Typography>
                              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setValue(`questions.${i}.options`, [...opts, { text: '', image: null, isCorrect: false }])}>Add Option</Button>
                          </Stack>
                          <Stack spacing={1}>
                              {opts.map((opt, optIdx) => (
                                <Stack key={optIdx} direction="row" alignItems="center" spacing={1}>
                                  <TextField
                                    label={`Option ${optIdx + 1}`}
                                    value={opt.text}
                                    onChange={(e) => {
                                      const newOptions = [...opts];
                                      newOptions[optIdx] = { ...newOptions[optIdx], text: e.target.value };
                                      setValue(`questions.${i}.options`, newOptions);
                                    }}
                                    fullWidth
                                  />
                                  <IconButton size="small" onClick={() => {
                                    const newOptions = [...opts];
                                    newOptions.splice(optIdx, 1);
                                    setValue(`questions.${i}.options`, newOptions);
                                  }}>
                                    <DeleteIcon />
                                  </IconButton>
                              </Stack>
                            ))}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Correct Answers:</Typography>
                              {opts.map((opt, optIdx) => (
                                <Chip
                                  key={optIdx}
                                  label={`Option ${optIdx + 1}`}
                                  color={opt.isCorrect ? "success" : "default"}
                                  onClick={() => {
                                    const newOptions = [...opts];
                                    newOptions[optIdx] = { ...newOptions[optIdx], isCorrect: !opt.isCorrect };
                                    setValue(`questions.${i}.options`, newOptions);
                                  }}
                                  sx={{ cursor: "pointer" }}
                                />
                              ))}
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteForeverIcon />}
                                onClick={() => setQuestionToDelete(i)}
                              >
                                Delete Question
                              </Button>
                            </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                {/* Add Question Button */}
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => append({
                      question: '',
                      image: null,
                      explanation: '',
                      questionType: 'single',
                      section: sections[0]?.name || '',
                      marks: '1',
                      options: [
                        { text: '', image: null, isCorrect: false },
                        { text: '', image: null, isCorrect: false }
                      ]
                    })}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    Add Question
                  </Button>
                </Box>
                </Stack>
                <Card elevation={6} sx={{ mt: 4, mb: 2, p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', boxShadow: 6 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <SaveIcon sx={{ mr: 1, color: 'primary.main' }} /> Save Your Quiz
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click below to save all your changes. Make sure all questions are complete!
                    </Typography>
                  </Box>
                  <Button type="submit" variant="contained" size="large" sx={{ px: 5, fontWeight: 700, ml: 3 }}>
                    Save Changes
                </Button>
                </Card>
            </Stack>
          </form>
        </FormProvider>
        </Container>
        <Snackbar open={showToast || errorToast} autoHideDuration={6000} onClose={() => { setShowToast(false); setErrorToast(false); }}>
          <Alert onClose={() => { setShowToast(false); setErrorToast(false); }} severity={errorToast ? "error" : "success"} sx={{ width: '100%' }}>
            {errorToast ? (saveErrorMessage || "Failed to save quiz.") : "Quiz saved successfully!"}
          </Alert>
        </Snackbar>
        <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
          <DialogTitle>Quiz Saved</DialogTitle>
          <DialogContent>
            Your quiz has been saved successfully. You can now preview or publish it.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSuccessDialog(false)} color="primary">OK</Button>
            <Button onClick={() => router.back()} color="primary" variant="outlined" startIcon={<ArrowBackIcon />}>Back to Dashboard</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Save Quiz?</DialogTitle>
          <DialogContent>
            <Typography>Do you want to save this quiz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleConfirmSave} variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={18} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Add Section Dialog */}
        <Dialog open={addSectionDialog.open} onClose={() => setAddSectionDialog({ open: false, qIndex: null })}>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogContent>
            <TextField
              label="Section Name"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddSectionDialog({ open: false, qIndex: null })}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!newSectionName.trim()) return;
                const { data, error } = await supabase
                  .from('sections')
                  .insert({ quiz_id: quizId, name: newSectionName.trim() })
                  .select('id, name')
                  .single();
                if (!error && data) {
                  setSections(prev => [...prev, data]);
                  if (addSectionDialog.qIndex !== null) {
                    setValue(`questions.${addSectionDialog.qIndex}.section`, data.name);
                  }
                  setNewSectionName("");
                  setAddSectionDialog({ open: false, qIndex: null });
                }
              }}
              variant="contained"
              disabled={!newSectionName.trim()}
            >
              Add Section
            </Button>
          </DialogActions>
        </Dialog>
        {/* Confirm Delete Question Dialog */}
        <Dialog open={questionToDelete !== null} onClose={() => setQuestionToDelete(null)}>
          <DialogTitle>Delete Question?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this question? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuestionToDelete(null)}>Cancel</Button>
            <Button onClick={() => {
              if (questionToDelete !== null) remove(questionToDelete);
              setQuestionToDelete(null);
            }} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
    </LocalizationProvider>
    </>
  );
}