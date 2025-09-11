-- Minimal fix for tab violation feature
-- Only fix the tables that actually exist and are needed

-- Drop all policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'violation_queries') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON violation_queries';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'violation_notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON violation_notifications';
    END LOOP;
END $$;

-- Drop foreign key constraints that might exist
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_student_id_fkey;
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_teacher_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_student_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_teacher_id_fkey;

-- Only alter columns that we know exist and are needed
ALTER TABLE violation_queries 
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

ALTER TABLE violation_notifications
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

-- Create basic policies for students only
CREATE POLICY "Students can view their own queries" ON violation_queries
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own queries" ON violation_queries
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own violation notifications" ON violation_notifications
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own violation notifications" ON violation_notifications
FOR INSERT WITH CHECK (student_id = auth.uid()::text);
