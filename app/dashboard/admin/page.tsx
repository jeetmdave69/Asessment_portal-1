"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, TextField, Button, MenuItem, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { supabase } from '@/utils/supabaseClient';
import TablePagination from '@mui/material/TablePagination';
import { SettingsDrawer } from '../../../components/settings/SettingsDrawer';
import { useSettingsContext } from '@/context/settings-context';
import IconButton from '@mui/material/IconButton';
import Iconify from '../../../src/components/iconify/Iconify';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const sidebarLinks = [
  { text: 'Dashboard', icon: <DashboardIcon />, tab: 'dashboard' },
  { text: 'Add User', icon: <GroupIcon />, tab: 'users' },
  { text: 'Manage Users', icon: <AssignmentIcon />, tab: 'manage-users' },
  { text: 'Results', icon: <BarChartIcon />, tab: 'results' },
  { text: 'Announcements', icon: <MessageIcon />, tab: 'announcements' },
  { text: 'Settings', icon: <SettingsIcon />, tab: 'settings' },
  { text: 'Help', icon: <HelpIcon />, tab: 'help' },
  { text: 'Log out', icon: <LogoutIcon />, tab: 'logout' },
];

// New: User management table columns and actions
const userRoleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminDashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [quizCount, setQuizCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userTableLoading, setUserTableLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);

  // User creation form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const settings = useSettingsContext();
  const theme = useTheme();

  // Password validation functions
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = validatePassword(formData.password);
  
  // Calculate password strength
  const getPasswordStrength = () => {
    const validations = Object.values(passwordValidation);
    const metRequirements = validations.filter(Boolean).length;
    const totalRequirements = validations.length;
    const percentage = (metRequirements / totalRequirements) * 100;
    
    if (percentage === 100) return { strength: 'Strong', color: theme.palette.success.main, width: '100%' };
    if (percentage >= 80) return { strength: 'Good', color: theme.palette.warning.main, width: '80%' };
    if (percentage >= 60) return { strength: 'Fair', color: theme.palette.warning.dark, width: '60%' };
    if (percentage >= 40) return { strength: 'Weak', color: theme.palette.error.light, width: '40%' };
    return { strength: 'Very Weak', color: theme.palette.error.main, width: '20%' };
  };
  
  const passwordStrength = getPasswordStrength();

  // Fetch counts and lists from Clerk API and quizzes from Supabase
  const fetchCountsAndLists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-count');
      const data = await res.json();
      setStudentCount(data.studentCount);
      setTeacherCount(data.teacherCount);
      setAdminCount(data.adminCount);

      // Fetch paginated users for the table
      const usersRes = await fetch(`/api/clerk-users?limit=${userRowsPerPage}&offset=${userPage * userRowsPerPage}`);
      const usersData = await usersRes.json();
      setStudents(usersData.filter((u: any) => u.role === 'student'));
      setTeachers(usersData.filter((u: any) => u.role === 'teacher'));
      setAdmins(usersData.filter((u: any) => u.role === 'admin'));
    } catch (err) {
      setStudentCount(0);
      setTeacherCount(0);
      setAdminCount(0);
      setStudents([]);
      setTeachers([]);
      setAdmins([]);
    }
    // Quizzes count (still from quizzes table)
    try {
      const { count: quizzes } = await supabase.from('quizzes').select('id', { count: 'exact', head: true });
      setQuizCount(quizzes || 0);
    } catch (err) {
      setQuizCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCountsAndLists();
  }, [userPage, userRowsPerPage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Creating user...");
    setErrorDetails([]);
    setCreating(true);
    try {
      const res = await fetch("/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("User creation error:", data.error || data.message, data.details);
        setMessage("❌ " + (data.error || data.message || "Unknown error"));
        // If details is an array, show each error message
        if (Array.isArray(data.details)) {
          setErrorDetails(data.details.map((d: any) => d.longMessage || d.message || JSON.stringify(d)));
        } else if (typeof data.details === 'string') {
          setErrorDetails([data.details]);
        } else {
          setErrorDetails([]);
        }
      } else {
        setMessage("✅ User created successfully!");
        setFormData({ firstName: "", lastName: "", username: "", email: "", password: "", role: "student" });
        await fetchCountsAndLists(); // Refresh lists and counts in real time
      }
    } catch (error: any) {
      console.error("Network or unexpected error:", error);
      setMessage("❌ " + (error.message || "Network error"));
      setErrorDetails([]);
    } finally {
      setCreating(false);
    }
  };

  // Sidebar click handler
  const handleSidebarClick = (tab: string) => {
    if (tab === 'logout') {
      setLogoutDialogOpen(true);
    } else {
      setSelectedTab(tab);
    }
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (!user) return "Loading...";
    return (
      user.firstName ||
      user.fullName ||
      user.username ||
      (user.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
      "Admin"
    );
  };

  // New: Render user management table
  const renderUserManagementTable = () => (
    <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Manage Users</Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: theme.palette.text.primary }}>ID</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Name</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Email</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Role</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Created At</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userTableLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : (
              [...students, ...teachers, ...admins].map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{user.id}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{user.fname || user.firstName} {user.lname || user.lastName}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{user.email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={user.role}
                      onChange={async (e) => {
                        setUserTableLoading(true);
                        await fetch('/api/update-user-role', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: user.id, role: e.target.value }),
                        });
                        await fetchCountsAndLists();
                        setUserTableLoading(false);
                      }}
                      size="small"
                      sx={{ minWidth: 100, color: theme.palette.text.primary }}
                    >
                      {userRoleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ color: theme.palette.text.primary }}>{option.label}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {user.created_at ? (
                      <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                        {dayjs(user.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={100} // Clerk's max per page, or replace with total user count if available
        page={userPage}
        onPageChange={(_, newPage) => setUserPage(newPage)}
        rowsPerPage={userRowsPerPage}
        onRowsPerPageChange={e => { setUserRowsPerPage(parseInt(e.target.value, 10)); setUserPage(0); }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            boxSizing: 'border-box',
            background: '#002366',
            color: '#fff',
            border: 'none',
            minHeight: '100vh',
            boxShadow: '2px 0 8px 0 rgba(0,0,0,0.04)',
            transition: 'all 0.5s',
          },
        }}
      >
        <Box display="flex" alignItems="center" p={2} mb={1}>
          <DashboardIcon sx={{ mr: 1, color: '#fff', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: 22, letterSpacing: 1 }}>Admin</Typography>
        </Box>
        <List sx={{ mt: 2 }}>
          {sidebarLinks.map((link) => (
            <ListItem
              button
              key={link.text}
              onClick={() => handleSidebarClick(link.tab)}
              sx={{
                color: link.tab === selectedTab ? '#1565c0' : '#fff',
                background: link.tab === selectedTab ? '#e3e6ef' : 'none',
                borderRadius: '30px 0 0 30px',
                mb: 1,
                fontWeight: link.tab === selectedTab ? 600 : 400,
                pl: 2,
                pr: 1,
                '&:hover': { background: '#001b4e' },
                transition: 'all 0.4s',
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} sx={{ '.MuiTypography-root': { fontSize: 16, fontWeight: 500 } }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, minHeight: '100vh', background: theme.palette.background.default, fontFamily: 'Poppins, sans-serif' }}>
        {/* Top Bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          p={2}
          borderRadius={2}
          sx={{
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: 'none',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Admin Dashboard</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle1" fontWeight={500}>
              {getGreeting()}, {getUserDisplayName()}
            </Typography>
            <ThemeToggleButton />
        </Box>
      </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4, background: theme.palette.primary.light, border: '3px solid #1976d2' }}>
              <GroupIcon sx={{ color: '#1976d2', fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#1976d2">Students</Typography>
              <Typography variant="h2" fontWeight={900} color="#1976d2">{loading ? <CircularProgress size={32} /> : studentCount}</Typography>
              <Typography sx={{ opacity: 0.8, color: '#555', fontSize: 16 }}>Total students</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4, background: theme.palette.secondary.light, border: '3px solid #7b1fa2' }}>
              <GroupIcon sx={{ color: '#7b1fa2', fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#7b1fa2">Teachers</Typography>
              <Typography variant="h2" fontWeight={900} color="#7b1fa2">{loading ? <CircularProgress size={32} /> : teacherCount}</Typography>
              <Typography sx={{ opacity: 0.8, color: '#555', fontSize: 16 }}>Total teachers</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4, background: theme.palette.warning.light, border: '3px solid #fbc02d' }}>
              <GroupIcon sx={{ color: '#fbc02d', fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#fbc02d">Admins</Typography>
              <Typography variant="h2" fontWeight={900} color="#fbc02d">{loading ? <CircularProgress size={32} /> : adminCount}</Typography>
              <Typography sx={{ opacity: 0.8, color: '#555', fontSize: 16 }}>Total admins</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4, border: '3px solid #1565c0' }}>
              <AssignmentIcon sx={{ color: '#1565c0', fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#1565c0">Quizzes</Typography>
              <Typography variant="h2" fontWeight={900} color="#1565c0">{loading ? <CircularProgress size={32} /> : quizCount}</Typography>
              <Typography sx={{ opacity: 0.8, color: '#555', fontSize: 16 }}>Total quizzes</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Main Section Content */}
        {selectedTab === 'dashboard' && (
          <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Welcome to the Admin Dashboard!</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Poppins, sans-serif' }}>Use the sidebar to manage users, view results, send announcements, and more.</Typography>
          </Box>
        )}
        {selectedTab === 'users' && (
          <Box maxWidth={1100} mx="auto">
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Create New User</Typography>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
                />
              </div>
              <TextField
                name="username"
                label="Username (optional)"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
                sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
              />
              <Box sx={{ mb: 1, mt: -2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>
                  Password Requirements:
                </Typography>
                {formData.password && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 1, backgroundColor: theme.palette.grey[50], border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: passwordStrength.color }}>
                        Password Strength: {passwordStrength.strength}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Object.values(passwordValidation).filter(Boolean).length}/5 requirements met
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      backgroundColor: theme.palette.grey[300], 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: passwordStrength.width, 
                        height: '100%', 
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease',
                        borderRadius: 2
                      }} />
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.length ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.length ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.length ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: passwordValidation.length ? 600 : 400
                    }}>
                      At least 8 characters
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.uppercase ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.uppercase ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.uppercase ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: passwordValidation.uppercase ? 600 : 400
                    }}>
                      One uppercase letter (A-Z)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.lowercase ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.lowercase ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.lowercase ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: passwordValidation.lowercase ? 600 : 400
                    }}>
                      One lowercase letter (a-z)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.number ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.number ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.number ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: passwordValidation.number ? 600 : 400
                    }}>
                      One number (0-9)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: passwordValidation.special ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {passwordValidation.special ? '✓' : '!'}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: passwordValidation.special ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: passwordValidation.special ? 600 : 400
                    }}>
                      One special character (!@#$%^&*)
              </Typography>
                  </Box>
                </Box>
              </Box>
              <TextField
                name="role"
                label="Role"
                select
                value={formData.role}
                onChange={handleChange}
                required
                fullWidth
                sx={{ color: theme.palette.text.primary, '& .MuiInputLabel-root': { color: theme.palette.text.secondary }, '& .MuiInputBase-root': { color: theme.palette.text.primary } }}
              >
                <MenuItem value="admin" sx={{ color: theme.palette.text.primary }}>Admin</MenuItem>
                <MenuItem value="teacher" sx={{ color: theme.palette.text.primary }}>Teacher</MenuItem>
                <MenuItem value="student" sx={{ color: theme.palette.text.primary }}>Student</MenuItem>
              </TextField>
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, py: 1.5, color: theme.palette.text.primary, background: theme.palette.primary.main, '&:hover': { background: theme.palette.primary.dark } }} disabled={creating}>
                {creating ? <CircularProgress size={20} sx={{ color: theme.palette.text.primary }} /> : 'Create User'}
              </Button>
            </form>
            {message && <Typography mt={3} align="center" color={message.startsWith("✅") ? "success.main" : "error.main"}>{message}</Typography>}
            {errorDetails.length > 0 && (
              <Box mt={2} sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
                <Typography color="error" fontWeight={600} mb={1} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Please fix the following:</Typography>
                <ul style={{ color: '#d32f2f', margin: 0, paddingLeft: 20 }}>
                  {errorDetails.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </Box>
            )}
            <Box mt={6}>
              <Tabs value={0} aria-label="user type tabs" sx={{ mb: 2 }}>
                <Tab label="Students" sx={{ color: theme.palette.text.primary }} />
                <Tab label="Teachers" sx={{ color: theme.palette.text.primary }} />
              </Tabs>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Student List</Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.palette.text.primary }}>ID</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>Name</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{student.id}</TableCell>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{student.fname || student.firstName} {student.lname || student.lastName}</TableCell>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{student.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Teacher List</Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.palette.text.primary }}>ID</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>Name</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{teacher.id}</TableCell>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{teacher.fname || teacher.firstName} {teacher.lname || teacher.lastName}</TableCell>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{teacher.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
        </Grid>
      </Grid>
            </Box>
          </Box>
        )}
        {selectedTab === 'manage-users' && renderUserManagementTable()}
        {selectedTab === 'results' && (
          <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Results Section</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Poppins, sans-serif' }}>Results management coming soon.</Typography>
          </Box>
        )}
        {selectedTab === 'announcements' && (
          <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Announcements Section</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Poppins, sans-serif' }}>Announcements management coming soon.</Typography>
          </Box>
        )}
        {selectedTab === 'settings' && (
          <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Settings Section</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Poppins, sans-serif' }}>Settings management coming soon.</Typography>
          </Box>
        )}
        {selectedTab === 'help' && (
          <Box sx={{ background: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>Help Section</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Poppins, sans-serif' }}>Help content coming soon.</Typography>
          </Box>
        )}

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
          <Card sx={{ minWidth: 340, p: 2, boxShadow: 0 }}>
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22, textAlign: 'center', color: theme.palette.text.primary }}>Log Out</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 2, color: theme.palette.text.primary }}>
                Are you sure you want to log out?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button onClick={() => setLogoutDialogOpen(false)} variant="outlined" color="primary" sx={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary }}>
                Cancel
              </Button>
              <Button onClick={() => { setLogoutDialogOpen(false); signOut({ redirectUrl: "/sign-in" }); }} variant="contained" color="error" sx={{ ml: 2, color: theme.palette.text.primary, background: theme.palette.error.main, '&:hover': { background: theme.palette.error.dark } }}>
                Log Out
              </Button>
            </DialogActions>
          </Card>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: theme.palette.text.primary }}>Delete User</DialogTitle>
          <DialogContent>
            <Typography color="error" fontWeight={600} mb={2} sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            {userToDelete && (
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>
                <strong>ID:</strong> {userToDelete.id}<br/>
                <strong>Name:</strong> {userToDelete.fname || userToDelete.firstName} {userToDelete.lname || userToDelete.lastName}<br/>
                <strong>Email:</strong> {userToDelete.email}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary" sx={{ color: theme.palette.text.primary, fontFamily: 'Poppins, sans-serif' }}>
              Cancel
            </Button>
            <Button
              color="error"
              onClick={async () => {
                setUserTableLoading(true);
                await fetch('/api/delete-user', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: userToDelete.id }),
                });
                setDeleteDialogOpen(false);
                setUserToDelete(null);
                await fetchCountsAndLists();
                setUserTableLoading(false);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Floating Settings Button */}
      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 3,
          '&:hover': { bgcolor: 'primary.light' },
        }}
        onClick={settings.onOpenDrawer}
        aria-label="Open settings"
      >
        <Iconify icon="solar:settings-bold" width={28} />
      </IconButton>
      <SettingsDrawer />
    </Box>
  );
}
