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

    // Get teacher details - try multiple approaches
    let teacherData = null;
    let teacherError = null;

    console.log('🔍 Looking up teacher with user_id:', quizData.user_id);

    // First, try the custom function if it exists
    try {
      console.log('🔍 Method 1: Trying RPC function get_user_by_clerk_id...');
      const { data: teacherDataArray, error: rpcError } = await supabase
        .rpc('get_user_by_clerk_id', { p_clerk_id: quizData.user_id });
      
      console.log('🔍 RPC result:', { data: teacherDataArray, error: rpcError });
      
      if (!rpcError && teacherDataArray && teacherDataArray.length > 0) {
        teacherData = teacherDataArray[0];
        console.log('✅ Found teacher via RPC function:', teacherData);
      } else {
        console.log('❌ RPC function failed or returned no data, trying direct query...');
        
        // Fallback: try direct query assuming users.id is the Clerk ID
        console.log('🔍 Method 2: Trying direct query with users.id...');
        const { data: directData, error: directError } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', quizData.user_id)
          .single();
        
        console.log('🔍 Direct query result:', { data: directData, error: directError });
        
        if (!directError && directData) {
          teacherData = directData;
          console.log('✅ Found teacher via direct query:', teacherData);
        } else {
          console.log('❌ Direct query also failed, trying with clerk_id column...');
          
          // Another fallback: try with a clerk_id column if it exists
          console.log('🔍 Method 3: Trying query with clerk_id column...');
          const { data: clerkData, error: clerkError } = await supabase
            .from('users')
            .select('id, email')
            .eq('clerk_id', quizData.user_id)
            .single();
          
          console.log('🔍 Clerk ID query result:', { data: clerkData, error: clerkError });
          
          if (!clerkError && clerkData) {
            teacherData = clerkData;
            console.log('✅ Found teacher via clerk_id column:', teacherData);
          } else {
            teacherError = clerkError || directError || rpcError;
            console.log('❌ All methods failed. Final error:', teacherError);
          }
        }
      }
    } catch (error) {
      console.log('❌ Exception in teacher lookup:', error);
      teacherError = error;
    }

    if (teacherError || !teacherData) {
      console.error('❌ Teacher not found:', teacherError);
      console.log('⚠️ Proceeding without teacher details - using fallback values');
      
      // Use fallback values when teacher lookup fails
      teacherData = {
        id: quizData.user_id, // Use the Clerk ID as the ID
        email: 'teacher@example.com' // Fallback email
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
