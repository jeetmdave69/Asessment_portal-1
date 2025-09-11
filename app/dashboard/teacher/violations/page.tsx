'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  WarningAmber as WarningAmberIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RetakeIcon,
  Refresh as RefreshIcon,
  Block as DebarIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

interface ViolationNotification {
  id: number;
  quiz_id: number;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_email: string;
  violation_type: string;
  violation_count: number;
  violation_timestamp: string;
  quiz_title: string;
  student_query: string;
  status: string;
  teacher_response?: string;
  teacher_action?: string;
  created_at: string;
  updated_at: string;
}

export default function TeacherViolationsDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [violations, setViolations] = useState<ViolationNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<ViolationNotification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [teacherResponse, setTeacherResponse] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{action: string, violation: ViolationNotification} | null>(null);

  // Check if user is a teacher
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch violations
  useEffect(() => {
    if (user) {
      fetchViolations();
    }
  }, [user]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching violations for teacher:', user?.id);
      
      const response = await fetch(`/api/teacher-violations?teacher_id=${user?.id}`);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Violations data:', data);
        setViolations(data.violations || []);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError(`Failed to fetch violations: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Network Error:', err);
      setError('Error fetching violations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewViolation = (violation: ViolationNotification) => {
    console.log('🔍 View violation clicked:', violation);
    setSelectedViolation(violation);
    setViewDialogOpen(true);
  };


  const handleTakeAction = (violation: ViolationNotification) => {
    setSelectedViolation(violation);
    setTeacherResponse('');
    setActionDialogOpen(true);
  };

  const handleQuickAction = (action: string, violation: ViolationNotification) => {
    console.log('⚡ Quick action clicked:', { action, violation: violation.id, status: violation.status });
    if (action === 'debar') {
      setPendingAction({ action, violation });
      setConfirmDialogOpen(true);
    } else {
      executeAction(action, violation, '');
    }
  };

  const executeAction = async (action: string, violation: ViolationNotification, response: string) => {
    try {
      console.log('🚀 Executing action:', { action, violationId: violation.id, teacherId: user?.id });
      setActionLoading(true);
      setError('');

      const response_data = await fetch('/api/teacher-violation-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          violation_id: violation.id,
          action: action,
          teacher_response: response,
          teacher_id: user?.id
        }),
      });

      console.log('📡 API response status:', response_data.status);

      if (response_data.ok) {
        const data = await response_data.json();
        console.log('✅ Action completed:', data);
        
        // Refresh violations list
        await fetchViolations();
        
        // Close dialogs
        setActionDialogOpen(false);
        setConfirmDialogOpen(false);
        setPendingAction(null);
        setTeacherResponse('');
      } else {
        console.error('❌ API Error Response:', {
          status: response_data.status,
          statusText: response_data.statusText,
          headers: Object.fromEntries(response_data.headers.entries())
        });
        
        let errorData;
        try {
          const responseText = await response_data.text();
          console.log('📄 Raw error response:', responseText);
          
          if (responseText) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { error: `Server error (${response_data.status}): ${response_data.statusText}` };
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { 
            error: `Server error (${response_data.status}): ${response_data.statusText}`,
            details: 'Could not parse response as JSON'
          };
        }
        
        console.error('❌ Action failed:', errorData);
        setError(`Failed to ${action}: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError(`Error performing ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction.action, pendingAction.violation, '');
    }
  };

  const handleSubmitAction = async (action: 'approve' | 'retake' | 'debar') => {
    if (!selectedViolation) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/teacher-violation-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violation_id: selectedViolation.id,
          action,
          teacher_response: teacherResponse.trim(),
          teacher_id: user?.id
        })
      });

      if (response.ok) {
        // Refresh violations
        await fetchViolations();
        setActionDialogOpen(false);
        setViewDialogOpen(false);
        setSelectedViolation(null);
        setTeacherResponse('');
      } else {
        setError('Failed to submit action');
      }
    } catch (err) {
      setError('Error submitting action');
      console.error('Error submitting action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'query_submitted': return 'info';
      case 'approved': return 'success';
      case 'retake_allowed': return 'info';
      case 'debarred': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'query_submitted': return 'Awaiting Review';
      case 'approved': return 'Approved';
      case 'retake_allowed': return 'Retake Allowed';
      case 'debarred': return 'Debarred';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getViolationTypeLabel = (violationType: string) => {
    switch (violationType) {
      case 'TAB_SWITCHING': return 'Tab Switching';
      case 'tab_switching': return 'Tab Switching';
      default: return violationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isLoaded || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontWeight: 700,
          color: 'text.primary',
          mb: 1
        }}>
          <Box sx={{ 
            p: 1.5, 
            bgcolor: 'primary.main', 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          Student Violation Management
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ 
          mb: 4, 
          fontSize: '1rem',
          lineHeight: 1.6,
          maxWidth: '700px',
          fontWeight: 400
        }}>
          Monitor and manage student academic integrity violations. Review student explanations 
          and take appropriate disciplinary actions to maintain assessment standards.
        </Typography>

        {/* Professional Info Card */}
        <Card sx={{ 
          mb: 3, 
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ 
                p: 1, 
                bgcolor: 'info.light', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                height: 40
              }}>
                <WarningAmberIcon sx={{ color: 'info.main', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  mb: 1
                }}>
                  Violation Management System
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  The system automatically detects suspicious behavior during assessments. When students exceed the 
                  allowed tab switch limit, their session is terminated and requires manual review. Use the action 
                  buttons to approve submissions, allow retakes, or apply disciplinary measures.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ 
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderRadius: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontSize: '1.25rem'
            }}>
              <Box sx={{ 
                p: 0.5, 
                bgcolor: 'primary.main', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WarningAmberIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              Violation Notifications
              {violations.length > 0 && (
                <Badge 
                  badgeContent={violations.filter(v => v.status === 'pending' || v.status === 'query_submitted').length} 
                  color="error" 
                  sx={{ 
                    ml: 1,
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20
                    }
                  }}
                >
                  <span></span>
                </Badge>
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchViolations}
                disabled={loading}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {violations.length === 0 ? (
            <Box textAlign="center" py={4}>
              <WarningIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No violations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All students are following the rules!
              </Typography>
            </Box>
          ) : (
            <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Quiz</TableCell>
                    <TableCell>Violation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          {violation.student_name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QuizIcon fontSize="small" />
                          {violation.quiz_title}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${getViolationTypeLabel(violation.violation_type)} - ${violation.violation_count} occurrences`}
                          color="error"
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(violation.status)}
                          color={getStatusColor(violation.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" />
                          {formatDate(violation.violation_timestamp)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Details">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleViewViolation(violation)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {/* Show action buttons for all violations, but disable based on status */}
                          <Tooltip title={violation.status !== 'pending' ? `Already ${violation.status}` : "Approve & Release Marks"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleQuickAction('approve', violation)}
                                color="success"
                                disabled={actionLoading || (violation.status !== 'pending' && violation.status !== 'query_submitted')}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={violation.status !== 'pending' ? `Already ${violation.status}` : "Allow Retake"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleQuickAction('retake', violation)}
                                color="info"
                                disabled={actionLoading || (violation.status !== 'pending' && violation.status !== 'query_submitted')}
                              >
                                <RetakeIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={violation.status !== 'pending' ? `Already ${violation.status}` : "Debar Student"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleQuickAction('debar', violation)}
                                color="error"
                                disabled={actionLoading || (violation.status !== 'pending' && violation.status !== 'query_submitted')}
                              >
                                <DebarIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={violation.status !== 'pending' ? `Already ${violation.status}` : "Take Detailed Action"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleTakeAction(violation)}
                                color="primary"
                                disabled={violation.status !== 'pending'}
                              >
                                <WarningIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Violation Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Violation Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedViolation && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Student Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {selectedViolation.student_name}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Student ID:</strong> {selectedViolation.student_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quiz Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Quiz:</strong> {selectedViolation.quiz_title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Quiz ID:</strong> {selectedViolation.quiz_id}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Violation Details
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {getViolationTypeLabel(selectedViolation.violation_type)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Count:</strong> {selectedViolation.violation_count} times
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Timestamp:</strong> {formatDate(selectedViolation.violation_timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Student's Explanation
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body1">
                      {selectedViolation.student_query || 'No explanation provided'}
                    </Typography>
                  </Box>
                </Grid>
                {selectedViolation.teacher_response && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Your Response
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, mb: 2 }}>
                      <Typography variant="body1">
                        {selectedViolation.teacher_response}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedViolation.status)}
                    color={getStatusColor(selectedViolation.status) as any}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedViolation?.status === 'pending' && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleTakeAction(selectedViolation);
              }}
            >
              Take Action
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Take Action on Violation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              How would you like to handle this violation?
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Response to Student"
              value={teacherResponse}
              onChange={(e) => setTeacherResponse(e.target.value)}
              placeholder="Explain your decision to the student..."
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleSubmitAction('approve')}
                disabled={actionLoading}
              >
                Approve & Release Results
              </Button>
              <Button
                variant="contained"
                color="info"
                startIcon={<RetakeIcon />}
                onClick={() => handleSubmitAction('retake')}
                disabled={actionLoading}
              >
                Allow Retake
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DebarIcon />}
                onClick={() => {
                  setActionDialogOpen(false);
                  setPendingAction({ action: 'debar', violation: selectedViolation! });
                  setConfirmDialogOpen(true);
                }}
                disabled={actionLoading}
              >
                Debar Student
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DebarIcon />
          Confirm Debar Action
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to <strong>permanently debar</strong> this student?
            </Typography>
            
            {pendingAction && (
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="error.dark">
                  <strong>Student:</strong> {pendingAction.violation.student_name}<br/>
                  <strong>Quiz:</strong> {pendingAction.violation.quiz_title}<br/>
                  <strong>Violation:</strong> {pendingAction.violation.violation_count} tab switches
                </Typography>
              </Box>
            )}

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action will permanently suspend the student from the platform. 
                This action cannot be undone easily and will require manual intervention to reverse.
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary">
              If you're sure about this decision, click "Confirm Debar" below.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={confirmAction} 
            variant="contained" 
            color="error"
            disabled={actionLoading}
            startIcon={<DebarIcon />}
          >
            {actionLoading ? 'Debarring...' : 'Confirm Debar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
