import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check if violation_notifications table exists
    const { data: violationNotifications, error: violationError } = await supabase
      .from('violation_notifications')
      .select('*')
      .limit(1);
    
    // Check if violation_queries table exists
    const { data: violationQueries, error: queryError } = await supabase
      .from('violation_queries')
      .select('*')
      .limit(1);
    
    // Check if quizzes table exists (for reference)
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
    
    // Check if users table exists (for reference)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    const schemaStatus = {
      violation_notifications: {
        exists: !violationError,
        error: violationError?.message,
        sampleData: violationNotifications
      },
      violation_queries: {
        exists: !queryError,
        error: queryError?.message,
        sampleData: violationQueries
      },
      quizzes: {
        exists: !quizError,
        error: quizError?.message,
        sampleData: quizzes
      },
      users: {
        exists: !userError,
        error: userError?.message,
        sampleData: users
      }
    };

    console.log('📊 Schema check results:', schemaStatus);

    return NextResponse.json({
      success: true,
      schema: schemaStatus,
      message: 'Schema check completed'
    });

  } catch (error) {
    console.error('❌ Error checking schema:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
