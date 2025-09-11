-- Violation System Database Setup
-- This script creates the necessary tables for the tab switching violation system

-- Table for storing violation notifications sent to teachers
CREATE TABLE IF NOT EXISTS violation_notifications (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_email TEXT NOT NULL,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('TAB_SWITCHING', 'COPY_PASTE', 'RIGHT_CLICK', 'DEV_TOOLS')),
    violation_count INTEGER NOT NULL DEFAULT 0,
    violation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    quiz_title TEXT NOT NULL,
    student_query TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'query_submitted', 'reviewed', 'resolved')),
    teacher_response TEXT,
    teacher_action TEXT CHECK (teacher_action IN ('allow_retake', 'temporary_suspend', 'permanent_debar', 'no_action')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing student queries regarding violations
CREATE TABLE IF NOT EXISTS violation_queries (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_email TEXT NOT NULL,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('TAB_SWITCHING', 'COPY_PASTE', 'RIGHT_CLICK', 'DEV_TOOLS')),
    violation_count INTEGER NOT NULL DEFAULT 0,
    violation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    quiz_title TEXT NOT NULL,
    student_query TEXT NOT NULL,
    query_submitted BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'resolved')),
    teacher_response TEXT,
    teacher_action TEXT CHECK (teacher_action IN ('allow_retake', 'temporary_suspend', 'permanent_debar', 'no_action')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing violation audit logs
CREATE TABLE IF NOT EXISTS violation_audit_logs (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    violation_type TEXT NOT NULL,
    violation_count INTEGER NOT NULL DEFAULT 0,
    violation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    session_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_violation_notifications_quiz_id ON violation_notifications(quiz_id);
CREATE INDEX IF NOT EXISTS idx_violation_notifications_student_id ON violation_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_violation_notifications_teacher_id ON violation_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_violation_notifications_status ON violation_notifications(status);
CREATE INDEX IF NOT EXISTS idx_violation_notifications_created_at ON violation_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_violation_queries_quiz_id ON violation_queries(quiz_id);
CREATE INDEX IF NOT EXISTS idx_violation_queries_student_id ON violation_queries(student_id);
CREATE INDEX IF NOT EXISTS idx_violation_queries_teacher_id ON violation_queries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_violation_queries_status ON violation_queries(status);
CREATE INDEX IF NOT EXISTS idx_violation_queries_created_at ON violation_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_violation_audit_logs_quiz_id ON violation_audit_logs(quiz_id);
CREATE INDEX IF NOT EXISTS idx_violation_audit_logs_student_id ON violation_audit_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_violation_audit_logs_violation_type ON violation_audit_logs(violation_type);
CREATE INDEX IF NOT EXISTS idx_violation_audit_logs_created_at ON violation_audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE violation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for violation_notifications
CREATE POLICY "Teachers can view their own violation notifications" ON violation_notifications
    FOR SELECT USING (auth.uid()::text = teacher_id);

CREATE POLICY "Teachers can update their own violation notifications" ON violation_notifications
    FOR UPDATE USING (auth.uid()::text = teacher_id);

CREATE POLICY "Students can view their own violation notifications" ON violation_notifications
    FOR SELECT USING (auth.uid()::text = student_id);

-- RLS Policies for violation_queries
CREATE POLICY "Teachers can view queries for their quizzes" ON violation_queries
    FOR SELECT USING (auth.uid()::text = teacher_id);

CREATE POLICY "Teachers can update queries for their quizzes" ON violation_queries
    FOR UPDATE USING (auth.uid()::text = teacher_id);

CREATE POLICY "Students can view their own queries" ON violation_queries
    FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "Students can insert their own queries" ON violation_queries
    FOR INSERT WITH CHECK (auth.uid()::text = student_id);

-- RLS Policies for violation_audit_logs (admin only)
CREATE POLICY "Admins can view all audit logs" ON violation_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_violation_notifications_updated_at 
    BEFORE UPDATE ON violation_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violation_queries_updated_at 
    BEFORE UPDATE ON violation_queries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO violation_notifications (quiz_id, student_id, student_name, teacher_id, teacher_email, violation_type, violation_count, violation_timestamp, quiz_title, student_query, status) 
-- VALUES (1, 'student123', 'John Doe', 'teacher456', 'teacher@example.com', 'TAB_SWITCHING', 5, NOW(), 'Sample Quiz', 'I had technical issues', 'pending');

COMMENT ON TABLE violation_notifications IS 'Stores violation notifications sent to teachers when students exceed limits';
COMMENT ON TABLE violation_queries IS 'Stores student queries explaining their violation actions';
COMMENT ON TABLE violation_audit_logs IS 'Stores detailed audit logs of all violations for security purposes';
