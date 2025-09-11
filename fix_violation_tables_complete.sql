-- Fix violation tables to use TEXT instead of UUID for Clerk IDs
-- This script handles RLS policies and foreign key constraints

-- First, drop ALL existing policies on violation tables
DROP POLICY IF EXISTS "Students can view their own queries" ON violation_queries;
DROP POLICY IF EXISTS "Students can insert their own queries" ON violation_queries;
DROP POLICY IF EXISTS "Students can update their own queries" ON violation_queries;
DROP POLICY IF EXISTS "Teachers can view queries for their quizzes" ON violation_queries;
DROP POLICY IF EXISTS "Teachers can insert queries for their quizzes" ON violation_queries;
DROP POLICY IF EXISTS "Teachers can update queries for their quizzes" ON violation_queries;

DROP POLICY IF EXISTS "Students can view their own violation notifications" ON violation_notifications;
DROP POLICY IF EXISTS "Students can insert their own violation notifications" ON violation_notifications;
DROP POLICY IF EXISTS "Students can update their own violation notifications" ON violation_notifications;
DROP POLICY IF EXISTS "Teachers can view notifications for their quizzes" ON violation_notifications;
DROP POLICY IF EXISTS "Teachers can insert notifications for their quizzes" ON violation_notifications;
DROP POLICY IF EXISTS "Teachers can update notifications for their quizzes" ON violation_notifications;

DROP POLICY IF EXISTS "Students can view their own audit logs" ON violation_audit_logs;
DROP POLICY IF EXISTS "Students can insert their own audit logs" ON violation_audit_logs;
DROP POLICY IF EXISTS "Students can update their own audit logs" ON violation_audit_logs;
DROP POLICY IF EXISTS "Teachers can view audit logs for their quizzes" ON violation_audit_logs;
DROP POLICY IF EXISTS "Teachers can insert audit logs for their quizzes" ON violation_audit_logs;
DROP POLICY IF EXISTS "Teachers can update audit logs for their quizzes" ON violation_audit_logs;

DROP POLICY IF EXISTS "Students can view their own notifications" ON student_notifications;
DROP POLICY IF EXISTS "Students can insert their own notifications" ON student_notifications;
DROP POLICY IF EXISTS "Students can update their own notifications" ON student_notifications;
DROP POLICY IF EXISTS "Teachers can view notifications for their students" ON student_notifications;
DROP POLICY IF EXISTS "Teachers can insert notifications for their students" ON student_notifications;
DROP POLICY IF EXISTS "Teachers can update notifications for their students" ON student_notifications;

DROP POLICY IF EXISTS "Students can view their own suspensions" ON user_suspensions;
DROP POLICY IF EXISTS "Students can insert their own suspensions" ON user_suspensions;
DROP POLICY IF EXISTS "Students can update their own suspensions" ON user_suspensions;
DROP POLICY IF EXISTS "Teachers can view suspensions for their students" ON user_suspensions;
DROP POLICY IF EXISTS "Teachers can insert suspensions for their students" ON user_suspensions;
DROP POLICY IF EXISTS "Teachers can update suspensions for their students" ON user_suspensions;

DROP POLICY IF EXISTS "Students can view their own retakes" ON quiz_retakes;
DROP POLICY IF EXISTS "Students can insert their own retakes" ON quiz_retakes;
DROP POLICY IF EXISTS "Students can update their own retakes" ON quiz_retakes;
DROP POLICY IF EXISTS "Teachers can view retakes for their quizzes" ON quiz_retakes;
DROP POLICY IF EXISTS "Teachers can insert retakes for their quizzes" ON quiz_retakes;
DROP POLICY IF EXISTS "Teachers can update retakes for their quizzes" ON quiz_retakes;

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

-- Now alter the column types
ALTER TABLE violation_queries 
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

ALTER TABLE violation_notifications
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

ALTER TABLE violation_audit_logs
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT,
ALTER COLUMN performed_by TYPE TEXT;

ALTER TABLE student_notifications
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

ALTER TABLE user_suspensions
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN suspended_by TYPE TEXT;

ALTER TABLE quiz_retakes
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN retake_allowed_by TYPE TEXT;

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

-- Recreate the policies with TEXT column references
-- Violation Queries policies
CREATE POLICY "Students can view their own queries" ON violation_queries
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own queries" ON violation_queries
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own queries" ON violation_queries
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view queries for their quizzes" ON violation_queries
FOR SELECT USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_queries.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert queries for their quizzes" ON violation_queries
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_queries.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update queries for their quizzes" ON violation_queries
FOR UPDATE USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_queries.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

-- Violation Notifications policies
CREATE POLICY "Students can view their own violation notifications" ON violation_notifications
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own violation notifications" ON violation_notifications
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own violation notifications" ON violation_notifications
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view notifications for their quizzes" ON violation_notifications
FOR SELECT USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert notifications for their quizzes" ON violation_notifications
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update notifications for their quizzes" ON violation_notifications
FOR UPDATE USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

-- Violation Audit Logs policies
CREATE POLICY "Students can view their own audit logs" ON violation_audit_logs
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own audit logs" ON violation_audit_logs
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own audit logs" ON violation_audit_logs
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view audit logs for their quizzes" ON violation_audit_logs
FOR SELECT USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_audit_logs.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert audit logs for their quizzes" ON violation_audit_logs
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_audit_logs.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update audit logs for their quizzes" ON violation_audit_logs
FOR UPDATE USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = violation_audit_logs.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

-- Student Notifications policies
CREATE POLICY "Students can view their own notifications" ON student_notifications
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own notifications" ON student_notifications
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own notifications" ON student_notifications
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view notifications for their students" ON student_notifications
FOR SELECT USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = student_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert notifications for their students" ON student_notifications
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = student_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update notifications for their students" ON student_notifications
FOR UPDATE USING (
  teacher_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = student_notifications.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

-- User Suspensions policies
CREATE POLICY "Students can view their own suspensions" ON user_suspensions
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own suspensions" ON user_suspensions
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own suspensions" ON user_suspensions
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view suspensions for their students" ON user_suspensions
FOR SELECT USING (
  suspended_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = user_suspensions.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert suspensions for their students" ON user_suspensions
FOR INSERT WITH CHECK (
  suspended_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = user_suspensions.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update suspensions for their students" ON user_suspensions
FOR UPDATE USING (
  suspended_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = user_suspensions.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

-- Quiz Retakes policies
CREATE POLICY "Students can view their own retakes" ON quiz_retakes
FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can insert their own retakes" ON quiz_retakes
FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their own retakes" ON quiz_retakes
FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view retakes for their quizzes" ON quiz_retakes
FOR SELECT USING (
  retake_allowed_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = quiz_retakes.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can insert retakes for their quizzes" ON quiz_retakes
FOR INSERT WITH CHECK (
  retake_allowed_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = quiz_retakes.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);

CREATE POLICY "Teachers can update retakes for their quizzes" ON quiz_retakes
FOR UPDATE USING (
  retake_allowed_by = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = quiz_retakes.quiz_id 
    AND quizzes.user_id = auth.uid()::text
  )
);
