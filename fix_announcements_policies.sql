-- Re-enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view relevant announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can update their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can delete their own announcements" ON public.announcements;

-- Create a simple policy that allows all authenticated users to view announcements
-- This is a temporary policy - we can make it more restrictive later
CREATE POLICY "Allow authenticated users to view announcements" ON public.announcements
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to create announcements
CREATE POLICY "Allow authenticated users to create announcements" ON public.announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows users to update their own announcements
CREATE POLICY "Allow users to update their own announcements" ON public.announcements
    FOR UPDATE USING (sender_id = auth.uid());

-- Create a policy that allows users to delete their own announcements
CREATE POLICY "Allow users to delete their own announcements" ON public.announcements
    FOR DELETE USING (sender_id = auth.uid());

-- Test the policies
SELECT COUNT(*) FROM public.announcements; 