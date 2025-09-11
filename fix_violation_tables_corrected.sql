-- Fix violation tables to use TEXT instead of UUID for Clerk IDs
-- This script checks for column existence before altering

-- Drop all policies on violation tables using dynamic SQL
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

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'violation_audit_logs') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON violation_audit_logs';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'student_notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON student_notifications';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_suspensions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_suspensions';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quiz_retakes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON quiz_retakes';
    END LOOP;
END $$;

-- Drop all foreign key constraints
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_student_id_fkey;
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_teacher_id_fkey;
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_quiz_id_fkey;

ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_student_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_teacher_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_quiz_id_fkey;

ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_student_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_teacher_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_quiz_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_performed_by_fkey;

ALTER TABLE student_notifications DROP CONSTRAINT IF EXISTS student_notifications_student_id_fkey;
ALTER TABLE student_notifications DROP CONSTRAINT IF EXISTS student_notifications_teacher_id_fkey;
ALTER TABLE student_notifications DROP CONSTRAINT IF EXISTS student_notifications_quiz_id_fkey;

ALTER TABLE user_suspensions DROP CONSTRAINT IF EXISTS user_suspensions_student_id_fkey;
ALTER TABLE user_suspensions DROP CONSTRAINT IF EXISTS user_suspensions_suspended_by_fkey;
ALTER TABLE user_suspensions DROP CONSTRAINT IF EXISTS user_suspensions_quiz_id_fkey;

ALTER TABLE quiz_retakes DROP CONSTRAINT IF EXISTS quiz_retakes_student_id_fkey;
ALTER TABLE quiz_retakes DROP CONSTRAINT IF EXISTS quiz_retakes_retake_allowed_by_fkey;
ALTER TABLE quiz_retakes DROP CONSTRAINT IF EXISTS quiz_retakes_quiz_id_fkey;

-- Alter column types only for columns that exist
-- Check and alter violation_queries
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_queries' AND column_name = 'student_id') THEN
        ALTER TABLE violation_queries ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_queries' AND column_name = 'teacher_id') THEN
        ALTER TABLE violation_queries ALTER COLUMN teacher_id TYPE TEXT;
    END IF;
END $$;

-- Check and alter violation_notifications
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_notifications' AND column_name = 'student_id') THEN
        ALTER TABLE violation_notifications ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_notifications' AND column_name = 'teacher_id') THEN
        ALTER TABLE violation_notifications ALTER COLUMN teacher_id TYPE TEXT;
    END IF;
END $$;

-- Check and alter violation_audit_logs (only columns that exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_audit_logs' AND column_name = 'student_id') THEN
        ALTER TABLE violation_audit_logs ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_audit_logs' AND column_name = 'teacher_id') THEN
        ALTER TABLE violation_audit_logs ALTER COLUMN teacher_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'violation_audit_logs' AND column_name = 'performed_by') THEN
        ALTER TABLE violation_audit_logs ALTER COLUMN performed_by TYPE TEXT;
    END IF;
END $$;

-- Check and alter student_notifications
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_notifications' AND column_name = 'student_id') THEN
        ALTER TABLE student_notifications ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_notifications' AND column_name = 'teacher_id') THEN
        ALTER TABLE student_notifications ALTER COLUMN teacher_id TYPE TEXT;
    END IF;
END $$;

-- Check and alter user_suspensions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_suspensions' AND column_name = 'student_id') THEN
        ALTER TABLE user_suspensions ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_suspensions' AND column_name = 'suspended_by') THEN
        ALTER TABLE user_suspensions ALTER COLUMN suspended_by TYPE TEXT;
    END IF;
END $$;

-- Check and alter quiz_retakes
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_retakes' AND column_name = 'student_id') THEN
        ALTER TABLE quiz_retakes ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_retakes' AND column_name = 'retake_allowed_by') THEN
        ALTER TABLE quiz_retakes ALTER COLUMN retake_allowed_by TYPE TEXT;
    END IF;
END $$;

-- Recreate foreign key constraints (only for quiz_id since that's a valid reference)
ALTER TABLE violation_queries 
ADD CONSTRAINT violation_queries_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

ALTER TABLE violation_notifications 
ADD CONSTRAINT violation_notifications_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

ALTER TABLE violation_audit_logs 
ADD CONSTRAINT violation_audit_logs_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

ALTER TABLE student_notifications 
ADD CONSTRAINT student_notifications_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

ALTER TABLE user_suspensions 
ADD CONSTRAINT user_suspensions_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

ALTER TABLE quiz_retakes 
ADD CONSTRAINT quiz_retakes_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

-- Recreate basic policies (only for columns that exist)
CREATE POLICY "Students can view their own queries" ON violation_queries
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own queries" ON violation_queries
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own violation notifications" ON violation_notifications
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own violation notifications" ON violation_notifications
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own audit logs" ON violation_audit_logs
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own audit logs" ON violation_audit_logs
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own notifications" ON student_notifications
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own notifications" ON student_notifications
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own suspensions" ON user_suspensions
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own suspensions" ON user_suspensions
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own retakes" ON quiz_retakes
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own retakes" ON quiz_retakes
FOR INSERT WITH CHECK (student_id = auth.uid()::text);
