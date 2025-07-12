-- Create the teacher table with all necessary fields
CREATE TABLE IF NOT EXISTS teacher (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  dob DATE,
  gender TEXT,
  profile_picture TEXT,
  subject TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS to allow teachers to manage their profiles
ALTER TABLE teacher DISABLE ROW LEVEL SECURITY;

-- Create an index on the id field for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_id ON teacher(id);

-- Add a comment to describe the table
COMMENT ON TABLE teacher IS 'Stores teacher profile information'; 