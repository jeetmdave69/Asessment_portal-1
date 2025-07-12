-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS but create a simpler policy, run this instead:
-- DROP POLICY IF EXISTS "Teachers can view all announcements" ON public.announcements;
-- CREATE POLICY "Allow all authenticated users to view announcements" ON public.announcements
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Test if the table is accessible now
SELECT COUNT(*) FROM public.announcements; 