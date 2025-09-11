-- Teacher Dashboard Database Setup
-- This script creates additional tables for the teacher violation management system

-- Table for storing student notifications
CREATE TABLE IF NOT EXISTS student_notifications (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('retake_approved', 'temporary_suspended', 'permanently_debarred', 'violation_reviewed', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing user suspensions
CREATE TABLE IF NOT EXISTS user_suspensions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    suspension_type TEXT NOT NULL CHECK (suspension_type IN ('temporary', 'permanent')),
    suspended_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suspension_start TIMESTAMP WITH TIME ZONE NOT NULL,
    suspension_end TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing quiz retake permissions
CREATE TABLE IF NOT EXISTS quiz_retakes (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    retake_reason TEXT NOT NULL,
    retake_allowed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retake_allowed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retake_attempted_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'allowed' CHECK (status IN ('allowed', 'attempted', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_notifications_student_id ON student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_teacher_id ON student_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_status ON student_notifications(status);
CREATE INDEX IF NOT EXISTS idx_student_notifications_created_at ON student_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_suspended_by ON user_suspensions(suspended_by);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_status ON user_suspensions(status);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_suspension_start ON user_suspensions(suspension_start);

CREATE INDEX IF NOT EXISTS idx_quiz_retakes_quiz_id ON quiz_retakes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_retakes_student_id ON quiz_retakes(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_retakes_status ON quiz_retakes(status);
CREATE INDEX IF NOT EXISTS idx_quiz_retakes_retake_allowed_at ON quiz_retakes(retake_allowed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_retakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_notifications
CREATE POLICY "Students can view their own notifications" ON student_notifications
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own notifications" ON student_notifications
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view notifications they sent" ON student_notifications
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "System can insert notifications" ON student_notifications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user_suspensions
CREATE POLICY "Users can view their own suspensions" ON user_suspensions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view suspensions they created" ON user_suspensions
    FOR SELECT USING (auth.uid() = suspended_by);

CREATE POLICY "Admins can view all suspensions" ON user_suspensions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "System can insert suspensions" ON user_suspensions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teachers can update suspensions they created" ON user_suspensions
    FOR UPDATE USING (auth.uid() = suspended_by);

-- RLS Policies for quiz_retakes
CREATE POLICY "Students can view their own retakes" ON quiz_retakes
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view retakes for their quizzes" ON quiz_retakes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_retakes.quiz_id 
            AND quizzes.created_by = auth.uid()
        )
    );

CREATE POLICY "System can insert retakes" ON quiz_retakes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teachers can update retakes for their quizzes" ON quiz_retakes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_retakes.quiz_id 
            AND quizzes.created_by = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_student_notifications_updated_at 
    BEFORE UPDATE ON student_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_suspensions_updated_at 
    BEFORE UPDATE ON user_suspensions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_retakes_updated_at 
    BEFORE UPDATE ON quiz_retakes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_suspensions 
        WHERE user_id = user_uuid 
        AND status = 'active'
        AND (suspension_end IS NULL OR suspension_end > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user suspension details
CREATE OR REPLACE FUNCTION get_user_suspension_details(user_uuid UUID)
RETURNS TABLE (
    suspension_type TEXT,
    reason TEXT,
    suspension_start TIMESTAMP WITH TIME ZONE,
    suspension_end TIMESTAMP WITH TIME ZONE,
    suspended_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.suspension_type,
        us.reason,
        us.suspension_start,
        us.suspension_end,
        us.suspended_by
    FROM user_suspensions us
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND (us.suspension_end IS NULL OR us.suspension_end > NOW())
    ORDER BY us.suspension_start DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE student_notifications IS 'Stores notifications sent to students by teachers';
COMMENT ON TABLE user_suspensions IS 'Stores user suspension records for violations';
COMMENT ON TABLE quiz_retakes IS 'Stores quiz retake permissions granted by teachers';
