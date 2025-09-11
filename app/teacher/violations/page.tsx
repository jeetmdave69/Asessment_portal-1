'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Inter } from 'next/font/google';
import { useUser } from '@clerk/nextjs';
import { 
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Block as DebarIcon,
  Refresh as RetestIcon,
  Assessment as MarksIcon
} from '@mui/icons-material';

const inter = Inter({ subsets: ['latin'] });

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
  student_query?: string;
  status: 'pending' | 'query_submitted' | 'reviewed' | 'resolved';
  teacher_response?: string;
  teacher_action?: 'allow_retake' | 'temporary_suspend' | 'permanent_debar' | 'no_action';
  created_at: string;
  updated_at: string;
}

interface ViolationQuery {
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
  query_submitted: boolean;
  status: 'pending_review' | 'approved' | 'rejected' | 'resolved';
  teacher_response?: string;
  teacher_action?: 'allow_retake' | 'temporary_suspend' | 'permanent_debar' | 'no_action';
  created_at: string;
  updated_at: string;
}

export default function TeacherViolationsPage() {
  const { user } = useUser();
  const [violations, setViolations] = useState<ViolationNotification[]>([]);
  const [queries, setQueries] = useState<ViolationQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<ViolationNotification | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<ViolationQuery | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [teacherResponse, setTeacherResponse] = useState('');
  const [teacherAction, setTeacherAction] = useState<'allow_retake' | 'temporary_suspend' | 'permanent_debar' | 'no_action'>('no_action');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'query_submitted' | 'reviewed' | 'resolved'>('all');
  const [filterType, setFilterType] = useState<'all' | 'TAB_SWITCHING' | 'COPY_PASTE' | 'RIGHT_CLICK' | 'DEV_TOOLS'>('all');

  // Fetch violations and queries
  useEffect(() => {
    if (user?.id) {
      fetchViolations();
      fetchQueries();
    }
  }, [user?.id]);

  const fetchViolations = async () => {
    try {
      const response = await fetch(`/api/teacher-violations?teacher_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setViolations(data.violations || []);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchQueries = async () => {
    try {
      const response = await fetch(`/api/teacher-violation-queries?teacher_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (violation: ViolationNotification) => {
    setSelectedViolation(violation);
    setShowDetailsDialog(true);
  };

  const handleTakeAction = (violation: ViolationNotification) => {
    setSelectedViolation(violation);
    setTeacherResponse('');
    setTeacherAction('no_action');
    setShowActionDialog(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedViolation) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/teacher-violation-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violation_id: selectedViolation.id,
          teacher_id: user?.id,
          teacher_response: teacherResponse,
          teacher_action: teacherAction
        }),
      });

      if (response.ok) {
        // Refresh data
        await fetchViolations();
        await fetchQueries();
        setShowActionDialog(false);
        setSelectedViolation(null);
      } else {
        console.error('Failed to submit action');
      }
    } catch (error) {
      console.error('Error submitting action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'query_submitted': return 'info';
      case 'reviewed': return 'success';
      case 'resolved': return 'default';
      default: return 'default';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow_retake': return 'success';
      case 'temporary_suspend': return 'warning';
      case 'permanent_debar': return 'error';
      case 'no_action': return 'default';
      default: return 'default';
    }
  };

  const filteredViolations = violations.filter(violation => {
    const statusMatch = filterStatus === 'all' || violation.status === filterStatus;
    const typeMatch = filterType === 'all' || violation.violation_type === filterType;
    return statusMatch && typeMatch;
  });

  const filteredQueries = queries.filter(query => {
    const statusMatch = filterStatus === 'all' || query.status === filterStatus;
    const typeMatch = filterType === 'all' || query.violation_type === filterType;
    return statusMatch && typeMatch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, fontFamily: inter.style.fontFamily }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
          🚨 Violation Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Review and manage student violations, queries, and take appropriate actions.
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="query_submitted">Query Submitted</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Violation Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                label="Violation Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="TAB_SWITCHING">Tab Switching</MenuItem>
                <MenuItem value="COPY_PASTE">Copy/Paste</MenuItem>
                <MenuItem value="RIGHT_CLICK">Right Click</MenuItem>
                <MenuItem value="DEV_TOOLS">Dev Tools</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
            Violation Notifications ({filteredViolations.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quiz</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Violation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredViolations.map((violation) => (
                  <TableRow key={violation.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                          {violation.student_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {violation.student_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {violation.quiz_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={violation.violation_type.replace('_', ' ')} 
                        size="small" 
                        color="error"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                        {violation.violation_count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={violation.status.replace('_', ' ')} 
                        size="small" 
                        color={getStatusColor(violation.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {new Date(violation.violation_timestamp).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(violation)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Take Action">
                          <IconButton 
                            size="small" 
                            onClick={() => handleTakeAction(violation)}
                            sx={{ color: '#10b981' }}
                          >
                            <MarksIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Student Queries Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
            Student Queries ({filteredQueries.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quiz</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                          {query.student_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {query.student_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {query.quiz_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {query.student_query}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={query.status.replace('_', ' ')} 
                        size="small" 
                        color={getStatusColor(query.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {new Date(query.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedQuery(query);
                              setShowDetailsDialog(true);
                            }}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Take Action">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedQuery(query);
                              setShowActionDialog(true);
                            }}
                            sx={{ color: '#10b981' }}
                          >
                            <MarksIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }
        }}
      >
        <DialogTitle sx={{ fontFamily: inter.style.fontFamily, fontWeight: 600 }}>
          Violation Details
        </DialogTitle>
        <DialogContent>
          {selectedViolation && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Student Information
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {selectedViolation.student_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedViolation.student_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Student ID: {selectedViolation.student_id}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Violation Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                        Quiz Title
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedViolation.quiz_title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                        Violation Type
                      </Typography>
                      <Chip 
                        label={selectedViolation.violation_type.replace('_', ' ')} 
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                        Violation Count
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#dc2626' }}>
                        {selectedViolation.violation_count}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                        Violation Time
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(selectedViolation.violation_timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {selectedViolation.student_query && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Student Query
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#f8fafc', 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                      }}>
                        <Typography variant="body1">
                          {selectedViolation.student_query}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {selectedViolation.teacher_response && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Teacher Response
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#f0f9ff', 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid #bae6fd'
                      }}>
                        <Typography variant="body1">
                          {selectedViolation.teacher_response}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {selectedViolation.teacher_action && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Teacher Action
                      </Typography>
                      <Chip 
                        label={selectedViolation.teacher_action.replace('_', ' ')} 
                        color={getActionColor(selectedViolation.teacher_action) as any}
                        variant="filled"
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog 
        open={showActionDialog} 
        onClose={() => setShowActionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }
        }}
      >
        <DialogTitle sx={{ fontFamily: inter.style.fontFamily, fontWeight: 600 }}>
          Take Action on Violation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={teacherAction}
                  onChange={(e) => setTeacherAction(e.target.value as any)}
                  label="Action"
                >
                  <MenuItem value="no_action">No Action</MenuItem>
                  <MenuItem value="allow_retake">Allow Retake</MenuItem>
                  <MenuItem value="temporary_suspend">Temporary Suspend</MenuItem>
                  <MenuItem value="permanent_debar">Permanent Debar</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Teacher Response"
                placeholder="Provide your response to the student..."
                value={teacherResponse}
                onChange={(e) => setTeacherResponse(e.target.value)}
              />

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Allow Retake:</strong> Student can retake the quiz<br/>
                  <strong>Temporary Suspend:</strong> Student suspended for a period<br/>
                  <strong>Permanent Debar:</strong> Student permanently debarred from portal
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction}
            variant="contained"
            disabled={actionLoading}
            sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
          >
            {actionLoading ? 'Processing...' : 'Submit Action'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
