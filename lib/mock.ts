// Mock data for dashboard components

export const todayStats = {
  submissions: 12,
  pendingReviews: 3,
  averageScore: "88%",
  activeStudents: 45,
  completedExams: 8,
  totalQuestions: 156
};

export const weeklyStats = {
  submissions: 67,
  pendingReviews: 12,
  averageScore: "85%",
  activeStudents: 89,
  completedExams: 34,
  totalQuestions: 892
};

export const monthlyStats = {
  submissions: 234,
  pendingReviews: 28,
  averageScore: "87%",
  activeStudents: 156,
  completedExams: 89,
  totalQuestions: 2340
};

// Mock data for OverviewCard metrics
export const getOverviewMetrics = () => [
  { label: "Today submissions", value: todayStats.submissions },
  { label: "Pending reviews", value: todayStats.pendingReviews },
  { label: "Avg score", value: todayStats.averageScore },
];

export const getOverviewMetricsWithStudents = () => [
  { label: "Active students", value: todayStats.activeStudents },
  { label: "Completed exams", value: todayStats.completedExams },
  { label: "Total questions", value: todayStats.totalQuestions },
];
