-- Grant necessary permissions (if not already granted)
GRANT ALL ON public.announcements TO authenticated;
GRANT USAGE ON SEQUENCE public.announcements_id_seq TO authenticated;

-- Insert sample announcements (optional - you can skip this if you don't want sample data)
INSERT INTO public.announcements (title, content, sender_name, priority, target_audience, tags) VALUES
('Welcome to the New Semester', 'Welcome back everyone! We hope you had a great break. Please check your schedules and be ready for the new semester.', 
 'Admin', 1, 'all', ARRAY['welcome', 'semester']),
('Important: Exam Schedule Update', 'The exam schedule has been updated. Please check the new dates and times for your upcoming exams.', 
 'Admin', 2, 'students', ARRAY['exam', 'schedule', 'important']),
('Teacher Meeting Reminder', 'Reminder: All teachers are required to attend the monthly meeting this Friday at 3 PM.', 
 'Admin', 2, 'teachers', ARRAY['meeting', 'reminder'])
ON CONFLICT DO NOTHING; 