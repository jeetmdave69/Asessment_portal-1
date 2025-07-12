-- Enable Row Level Security (RLS) on the announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for announcements table

-- Policy for teachers to see all announcements
CREATE POLICY "Teachers can view all announcements" ON public.announcements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for students to see announcements targeted to them or all users
CREATE POLICY "Students can view relevant announcements" ON public.announcements
    FOR SELECT USING (
        (target_audience = 'all' OR target_audience = 'students') 
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Policy for teachers to insert announcements
CREATE POLICY "Teachers can create announcements" ON public.announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for teachers to update their own announcements
CREATE POLICY "Teachers can update their own announcements" ON public.announcements
    FOR UPDATE USING (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Policy for teachers to delete their own announcements
CREATE POLICY "Teachers can delete their own announcements" ON public.announcements
    FOR DELETE USING (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'teacher'
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.announcements TO authenticated;
GRANT USAGE ON SEQUENCE public.announcements_id_seq TO authenticated;

-- Insert sample announcements (optional - you can skip this if you don't want sample data)
INSERT INTO public.announcements (title, content, sender_id, sender_name, priority, target_audience, tags) VALUES
('Welcome to the New Semester', 'Welcome back everyone! We hope you had a great break. Please check your schedules and be ready for the new semester.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 1, 'all', ARRAY['welcome', 'semester']),
('Important: Exam Schedule Update', 'The exam schedule has been updated. Please check the new dates and times for your upcoming exams.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 2, 'students', ARRAY['exam', 'schedule', 'important']),
('Teacher Meeting Reminder', 'Reminder: All teachers are required to attend the monthly meeting this Friday at 3 PM.', 
 (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'teacher' LIMIT 1), 
 'Admin', 2, 'teachers', ARRAY['meeting', 'reminder']);

-- If the sample data insert fails due to no teachers existing, insert without sender_id
INSERT INTO public.announcements (title, content, sender_name, priority, target_audience, tags) VALUES
('Welcome to the New Semester', 'Welcome back everyone! We hope you had a great break. Please check your schedules and be ready for the new semester.', 
 'Admin', 1, 'all', ARRAY['welcome', 'semester']),
('Important: Exam Schedule Update', 'The exam schedule has been updated. Please check the new dates and times for your upcoming exams.', 
 'Admin', 2, 'students', ARRAY['exam', 'schedule', 'important']),
('Teacher Meeting Reminder', 'Reminder: All teachers are required to attend the monthly meeting this Friday at 3 PM.', 
 'Admin', 2, 'teachers', ARRAY['meeting', 'reminder'])
ON CONFLICT DO NOTHING; 