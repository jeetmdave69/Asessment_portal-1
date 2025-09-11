import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking if violation tables exist...');
    
    // Check if violation_notifications table exists and get its structure
    const { data: violationNotifications, error: violationError } = await supabase
      .from('violation_notifications')
      .select('*')
      .limit(1);
    
    // Check if violation_queries table exists
    const { data: violationQueries, error: queryError } = await supabase
      .from('violation_queries')
      .select('*')
      .limit(1);
    
    // Check if user_suspensions table exists
    const { data: userSuspensions, error: suspensionError } = await supabase
      .from('user_suspensions')
      .select('*')
      .limit(1);
    
    // Check if quiz_retakes table exists
    const { data: quizRetakes, error: retakeError } = await supabase
      .from('quiz_retakes')
      .select('*')
      .limit(1);

    const tableStatus = {
      violation_notifications: {
        exists: !violationError,
        error: violationError?.message,
        hasData: violationNotifications && violationNotifications.length > 0,
        sampleData: violationNotifications?.[0] || null
      },
      violation_queries: {
        exists: !queryError,
        error: queryError?.message,
        hasData: violationQueries && violationQueries.length > 0
      },
      user_suspensions: {
        exists: !suspensionError,
        error: suspensionError?.message,
        hasData: userSuspensions && userSuspensions.length > 0
      },
      quiz_retakes: {
        exists: !retakeError,
        error: retakeError?.message,
        hasData: quizRetakes && quizRetakes.length > 0
      }
    };

    console.log('📊 Table status:', tableStatus);

    return NextResponse.json({
      success: true,
      tables: tableStatus,
      message: 'Table check completed'
    });

  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
