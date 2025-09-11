-- Fix ALL remaining UUID columns that might be causing issues
-- This script addresses any remaining UUID columns that need to be TEXT

-- First, let's check what columns exist and their types
-- (This is just for reference - we'll fix them directly)

-- Fix attempts table if it has UUID columns for user IDs
-- Note: We need to be careful here as this might affect existing data
-- Let's add new TEXT columns first, then migrate data

-- Add new TEXT columns to attempts table for violation data
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS violation_reason_text TEXT,
ADD COLUMN IF NOT EXISTS violation_count_text TEXT,
ADD COLUMN IF NOT EXISTS tab_switch_count_text TEXT,
ADD COLUMN IF NOT EXISTS last_tab_switch_time_text TEXT,
ADD COLUMN IF NOT EXISTS tab_switch_history_text TEXT;

-- Copy data from existing columns to new TEXT columns
UPDATE attempts 
SET 
  violation_reason_text = violation_reason::text,
  violation_count_text = violation_count::text,
  tab_switch_count_text = tab_switch_count::text,
  last_tab_switch_time_text = last_tab_switch_time::text,
  tab_switch_history_text = tab_switch_history::text
WHERE violation_reason IS NOT NULL;

-- Drop old columns and rename new ones
ALTER TABLE attempts 
DROP COLUMN IF EXISTS violation_reason,
DROP COLUMN IF EXISTS violation_count,
DROP COLUMN IF EXISTS tab_switch_count,
DROP COLUMN IF EXISTS last_tab_switch_time,
DROP COLUMN IF EXISTS tab_switch_history;

-- Rename new columns to original names
ALTER TABLE attempts 
RENAME COLUMN violation_reason_text TO violation_reason;
ALTER TABLE attempts 
RENAME COLUMN violation_count_text TO violation_count;
ALTER TABLE attempts 
RENAME COLUMN tab_switch_count_text TO tab_switch_count;
ALTER TABLE attempts 
RENAME COLUMN last_tab_switch_time_text TO last_tab_switch_time;
ALTER TABLE attempts 
RENAME COLUMN tab_switch_history_text TO tab_switch_history;

-- Now let's ensure all violation tables have TEXT columns
-- (Re-run the column type changes to be sure)

-- Drop any remaining foreign key constraints that might cause issues
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_student_id_fkey;
ALTER TABLE violation_queries DROP CONSTRAINT IF EXISTS violation_queries_teacher_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_student_id_fkey;
ALTER TABLE violation_notifications DROP CONSTRAINT IF EXISTS violation_notifications_teacher_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_student_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_teacher_id_fkey;
ALTER TABLE violation_audit_logs DROP CONSTRAINT IF EXISTS violation_audit_logs_performed_by_fkey;
ALTER TABLE student_notifications DROP CONSTRAINT IF EXISTS student_notifications_student_id_fkey;
ALTER TABLE student_notifications DROP CONSTRAINT IF EXISTS student_notifications_teacher_id_fkey;
ALTER TABLE user_suspensions DROP CONSTRAINT IF EXISTS user_suspensions_student_id_fkey;
ALTER TABLE user_suspensions DROP CONSTRAINT IF EXISTS user_suspensions_suspended_by_fkey;
ALTER TABLE quiz_retakes DROP CONSTRAINT IF EXISTS quiz_retakes_student_id_fkey;
ALTER TABLE quiz_retakes DROP CONSTRAINT IF EXISTS quiz_retakes_retake_allowed_by_fkey;

-- Ensure all ID columns are TEXT
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

-- Recreate only the quiz_id foreign key constraints
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
