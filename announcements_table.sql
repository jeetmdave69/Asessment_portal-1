-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority IN (1, 2, 3)), -- 1=Normal, 2=Important, 3=Urgent
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers')),
    tags TEXT[], -- Array of tags
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_sender_id ON announcements(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for teachers to see all announcements
CREATE POLICY "Teachers can view all announcements" ON announcements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for students to see announcements targeted to them or all users
CREATE POLICY "Students can view relevant announcements" ON announcements
    FOR SELECT USING (
        (target_audience = 'all' OR target_audience = 'students') 
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Policy for teachers to insert announcements
CREATE POLICY "Teachers can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for teachers to update their own announcements
CREATE POLICY "Teachers can update their own announcements" ON announcements
    FOR UPDATE USING (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for teachers to delete their own announcements
CREATE POLICY "Teachers can delete their own announcements" ON announcements
    FOR DELETE USING (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample announcements (optional)
INSERT INTO announcements (title, content, sender_id, sender_name, priority, target_audience, tags) VALUES
('Welcome to the New Semester', 'Welcome back everyone! We hope you had a great break. Please check your schedules and be ready for the new semester.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 1, 'all', ARRAY['welcome', 'semester']),
('Important: Exam Schedule Update', 'The exam schedule has been updated. Please check the new dates and times for your upcoming exams.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 2, 'students', ARRAY['exam', 'schedule', 'important']),
('Teacher Meeting Reminder', 'Reminder: All teachers are required to attend the monthly meeting this Friday at 3 PM.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 2, 'teachers', ARRAY['meeting', 'reminder']);

-- Grant necessary permissions
GRANT ALL ON announcements TO authenticated;
GRANT USAGE ON SEQUENCE announcements_id_seq TO authenticated; 