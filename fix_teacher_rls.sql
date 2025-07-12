-- Option 1: Disable RLS completely for the teacher table (simplest solution)
ALTER TABLE teacher DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create proper policies
-- First, enable RLS
-- ALTER TABLE teacher ENABLE ROW LEVEL SECURITY;

-- Then create policies for authenticated users
-- CREATE POLICY "Teachers can view their own profile" ON teacher
--   FOR SELECT USING (auth.uid()::text = id);

-- CREATE POLICY "Teachers can insert their own profile" ON teacher
--   FOR INSERT WITH CHECK (auth.uid()::text = id);

-- CREATE POLICY "Teachers can update their own profile" ON teacher
--   FOR UPDATE USING (auth.uid()::text = id);

-- CREATE POLICY "Teachers can delete their own profile" ON teacher
--   FOR DELETE USING (auth.uid()::text = id);

-- Option 3: If the teacher table doesn't exist yet, create it first
-- CREATE TABLE IF NOT EXISTS teacher (
--   id TEXT PRIMARY KEY,
--   full_name TEXT,
--   email TEXT,
--   dob DATE,
--   gender TEXT,
--   profile_picture TEXT,
--   subject TEXT,
--   username TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Then disable RLS
-- ALTER TABLE teacher DISABLE ROW LEVEL SECURITY; 