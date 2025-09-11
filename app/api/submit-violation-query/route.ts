import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 Violation query API called');
    
    // Get the raw body first to debug
    const body = await request.text();
    console.log('📝 Raw request body:', body);
    
    if (!body || body.trim() === '') {
      console.error('❌ Empty request body received');
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Body content:', body);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const {
      quiz_id,
      student_id,
      student_name,
      violation_type,
      violation_count,
      violation_timestamp,
      quiz_title,
      student_query,
      query_submitted
    } = parsedData;

    console.log('📝 Received query data:', {
      quiz_id,
      student_id,
      student_name,
      violation_type,
      violation_count,
      quiz_title,
      student_query: student_query?.substring(0, 50) + '...'
    });

    // Validate required fields
    if (!quiz_id || !student_id || !student_query) {
      console.error('❌ Missing required fields:', { quiz_id, student_id, student_query: !!student_query });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get teacher information for the quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('user_id, quiz_title')
      .eq('id', quiz_id)
      .single();

    if (quizError || !quizData) {
      console.error('❌ Quiz not found:', quizError);
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Get teacher details - optimized single query approach
    let teacherData = null;
    
    console.log('🔍 Looking up teacher with user_id:', quizData.user_id);

    try {
      // Single optimized query - try direct lookup first (most common case)
      const { data: directData, error: directError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', quizData.user_id)
        .single();
      
      if (!directError && directData) {
        teacherData = directData;
        console.log('✅ Found teacher via direct query:', teacherData);
      } else {
        // Fallback: try RPC function if direct query fails
        const { data: teacherDataArray, error: rpcError } = await supabase
          .rpc('get_user_by_clerk_id', { p_clerk_id: quizData.user_id });
        
        if (!rpcError && teacherDataArray && teacherDataArray.length > 0) {
          teacherData = teacherDataArray[0];
          console.log('✅ Found teacher via RPC function:', teacherData);
        } else {
          console.log('⚠️ Teacher not found, using fallback values');
          teacherData = {
            id: quizData.user_id,
            email: 'teacher@example.com'
          };
        }
      }
    } catch (error) {
      console.log('❌ Exception in teacher lookup:', error);
      teacherData = {
        id: quizData.user_id,
        email: 'teacher@example.com'
      };
    }

    // Insert or update violation query
    const { data: queryData, error: queryError } = await supabase
      .from('violation_queries')
      .upsert({
        quiz_id,
        student_id,
        student_name,
        teacher_id: teacherData.id,
        teacher_email: teacherData.email,
        violation_type,
        violation_count,
        violation_timestamp,
        quiz_title: quiz_title || quizData.quiz_title,
        student_query: student_query.trim(),
        query_submitted: true,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (queryError) {
      console.error('❌ Error submitting violation query:', queryError);
      return NextResponse.json(
        { error: 'Failed to submit query: ' + queryError.message },
        { status: 500 }
      );
    }

    // Also create/update violation notification
    const { data: notificationData, error: notificationError } = await supabase
      .from('violation_notifications')
      .upsert({
        quiz_id,
        student_id,
        student_name,
        teacher_id: teacherData.id,
        teacher_email: teacherData.email,
        violation_type,
        violation_count,
        violation_timestamp,
        quiz_title: quiz_title || quizData.quiz_title,
        student_query: student_query.trim(),
        status: 'query_submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notificationError) {
      console.error('❌ Error updating violation notification:', notificationError);
      // Don't fail the request, just log the error
    }

    console.log('✅ Violation query submitted successfully:', queryData);

    return NextResponse.json({
      success: true,
      message: 'Violation query submitted successfully',
      query_id: queryData.id
    });

  } catch (error) {
    console.error('❌ Error in submit violation query:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
