import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test violation...');
    
    // First, let's check if the table exists
    console.log('🔍 Checking if violation_notifications table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('violation_notifications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table check error:', tableError);
      return NextResponse.json(
        { 
          error: `Table does not exist or is not accessible: ${tableError.message}`,
          details: tableError,
          suggestion: 'Please run the minimal_fix.sql script to create the required tables'
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Table exists, proceeding with test violation creation');
    
    // First, check if there are any existing quizzes
    const { data: existingQuizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
    
    let quizId;
    let quizTitle = 'Test Quiz';
    
    if (quizError) {
      console.log('⚠️ Could not check existing quizzes:', quizError.message);
      return NextResponse.json(
        { 
          error: `Cannot access quizzes table: ${quizError.message}`,
          details: quizError,
          suggestion: 'Please ensure the quizzes table exists and is accessible'
        },
        { status: 500 }
      );
    } else if (existingQuizzes && existingQuizzes.length > 0) {
      quizId = existingQuizzes[0].id;
      // Try different possible column names for quiz title
      quizTitle = existingQuizzes[0].title || existingQuizzes[0].name || existingQuizzes[0].quiz_name || 'Existing Quiz';
      console.log('✅ Using existing quiz:', { id: quizId, title: quizTitle, availableColumns: Object.keys(existingQuizzes[0]) });
    } else {
      console.log('⚠️ No existing quizzes found, using fallback quiz_id...');
      
      // Use a fallback quiz_id (1) and let the foreign key constraint handle it
      // If it fails, we'll get a clear error message
      quizId = 1;
      quizTitle = 'Test Quiz (Fallback)';
      console.log('⚠️ Using fallback quiz_id:', quizId);
    }
    
    const testViolation = {
      quiz_id: quizId,
      student_id: 'test_student_123',
      student_name: 'Test Student',
      teacher_id: 'test_teacher_456',
      teacher_email: 'teacher@example.com',
      violation_type: 'TAB_SWITCHING',
      violation_count: 5,
      violation_timestamp: new Date().toISOString(),
      quiz_title: quizTitle,
      student_query: 'This is a test violation query',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Test violation data:', testViolation);

    const { data, error } = await supabase
      .from('violation_notifications')
      .insert([testViolation])
      .select();

    if (error) {
      console.error('❌ Error creating test violation:', error);
      return NextResponse.json(
        { 
          error: `Failed to create test violation: ${error.message}`,
          details: error,
          violationData: testViolation
        },
        { status: 500 }
      );
    }

    console.log('✅ Test violation created:', data);

    return NextResponse.json({
      success: true,
      violation: data[0],
      message: 'Test violation created successfully'
    });

  } catch (error) {
    console.error('❌ Error in test violation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
