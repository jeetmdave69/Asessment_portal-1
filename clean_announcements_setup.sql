-- Disable Row Level Security completely
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Teachers can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view relevant announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can update their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can delete their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated users to view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated users to create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow users to update their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow users to delete their own announcements" ON public.announcements;

-- Remove the foreign key constraint first
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_sender_id_fkey;

-- Make sender_id a text field to accept Clerk user IDs
ALTER TABLE public.announcements ALTER COLUMN sender_id TYPE TEXT;

-- Make sender_id nullable
ALTER TABLE public.announcements ALTER COLUMN sender_id DROP NOT NULL;

-- Grant all permissions to authenticated users
GRANT ALL ON public.announcements TO authenticated;
GRANT USAGE ON SEQUENCE public.announcements_id_seq TO authenticated; 