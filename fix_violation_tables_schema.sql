-- Fix violation tables to use TEXT instead of UUID for Clerk IDs
-- This will allow storing Clerk IDs directly without conversion issues

-- Update violation_queries table
ALTER TABLE violation_queries 
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

-- Update violation_notifications table  
ALTER TABLE violation_notifications
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

-- Update violation_audit_logs table
ALTER TABLE violation_audit_logs
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT,
ALTER COLUMN performed_by TYPE TEXT;

-- Update student_notifications table
ALTER TABLE student_notifications
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN teacher_id TYPE TEXT;

-- Update user_suspensions table
ALTER TABLE user_suspensions
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN suspended_by TYPE TEXT;

-- Update quiz_retakes table
ALTER TABLE quiz_retakes
ALTER COLUMN student_id TYPE TEXT,
ALTER COLUMN retake_allowed_by TYPE TEXT;
