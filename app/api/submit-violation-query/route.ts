import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const requestId = `submit-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Violation query API called`);
  console.log(`🔍 [${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`🔍 [${requestId}] Environment:`, {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    region: process.env.VERCEL_REGION,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing'
  });
  
  try {
    // Get the raw body first to debug
    const body = await request.text();
    console.log(`📝 [${requestId}] Raw request body (${body.length} chars):`, body);
    
    if (!body || body.trim() === '') {
      console.error(`❌ [${requestId}] Empty request body received`);
      return NextResponse.json(
        { error: 'Empty request body', requestId },
        { status: 400 }
      );
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(body);
      console.log(`✅ [${requestId}] JSON parsed successfully:`, parsedData);
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON parse error:`, {
        error: parseError.message,
        stack: parseError.stack,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 200)
      });
      return NextResponse.json(
        { error: 'Invalid JSON in request body', requestId, details: parseError.message },
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

    console.log(`📝 [${requestId}] Received query data:`, {
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
      const missingFields = [];
      if (!quiz_id) missingFields.push('quiz_id');
      if (!student_id) missingFields.push('student_id');
      if (!student_query) missingFields.push('student_query');
      
      console.error(`❌ [${requestId}] Missing required fields:`, { 
        missingFields, 
        quiz_id: !!quiz_id, 
        student_id: !!student_id, 
        student_query: !!student_query 
      });
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}`, requestId },
        { status: 400 }
      );
    }

    // Get teacher information for the quiz
    console.log(`🔍 [${requestId}] Fetching quiz data for quiz_id: ${quiz_id}`);
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('user_id, quiz_title')
      .eq('id', quiz_id)
      .single();

    if (quizError || !quizData) {
      console.error(`❌ [${requestId}] Quiz not found:`, {
        error: quizError,
        quiz_id,
        hasData: !!quizData
      });
      return NextResponse.json(
        { error: 'Quiz not found', requestId, details: quizError?.message },
        { status: 404 }
      );
    }
    
    console.log(`✅ [${requestId}] Quiz found:`, { 
      user_id: quizData.user_id, 
      quiz_title: quizData.quiz_title 
    });

    // Get teacher details - try multiple approaches
    let teacherData = null;
    let teacherError = null;

    console.log('🔍 Looking up teacher with user_id:', quizData.user_id);

    // Try to get teacher info from Clerk API first
    try {
      const { users } = await import('@clerk/clerk-sdk-node');
      const clerkUser = await users.getUser(quizData.user_id);
      
      if (clerkUser) {
        teacherData = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || 'teacher@example.com',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Teacher'
        };
        console.log('✅ Found teacher via Clerk API:', teacherData);
      }
    } catch (clerkError) {
      console.log('⚠️ Clerk API lookup failed:', clerkError instanceof Error ? clerkError.message : String(clerkError));
    }

    // If Clerk API failed, try database lookups
    if (!teacherData) {
      const quickLookupMethods = [
        {
          name: 'RPC function get_user_by_clerk_id',
          action: async () => {
            const { data, error } = await supabase
              .rpc('get_user_by_clerk_id', { p_clerk_id: quizData.user_id });
            return { data: data?.[0] || null, error };
          }
        },
        {
          name: 'Direct query with users.id as text',
          action: async () => {
            const { data, error } = await supabase
              .from('users')
              .select('id, email, name')
              .eq('id', quizData.user_id)
              .single();
            return { data, error };
          }
        },
        {
          name: 'Query with clerk_id column',
          action: async () => {
            const { data, error } = await supabase
              .from('users')
              .select('id, email, name')
              .eq('clerk_id', quizData.user_id)
              .single();
            return { data, error };
          }
        },
        {
          name: 'Query with external_id column',
          action: async () => {
            const { data, error } = await supabase
              .from('users')
              .select('id, email, name')
              .eq('external_id', quizData.user_id)
              .single();
            return { data, error };
          }
        }
      ];

      for (const method of quickLookupMethods) {
        try {
          const { data, error } = await method.action();
          if (!error && data) {
            teacherData = data;
            console.log(`✅ Found teacher via ${method.name}:`, teacherData);
            break;
          }
        } catch (error) {
          console.log(`⚠️ ${method.name} failed:`, error instanceof Error ? error.message : String(error));
        }
      }
    }

    if (!teacherData) {
      teacherError = new Error('All teacher lookup methods failed');
      console.log('❌ All teacher lookup methods failed');
    }

    if (teacherError || !teacherData) {
      console.error('❌ Teacher not found:', teacherError);
      console.log('⚠️ Proceeding without teacher details - using fallback values');
      
      // Use fallback values when teacher lookup fails
      teacherData = {
        id: quizData.user_id, // Use the Clerk ID as the ID
        email: 'teacher@example.com', // Fallback email
        name: 'Teacher' // Fallback name
      };
    }

    // Insert or update violation query
    console.log(`💾 [${requestId}] Inserting violation query into database...`);
    const queryInsertData = {
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
    };
    
    console.log(`📝 [${requestId}] Query insert data:`, queryInsertData);
    
    const { data: queryData, error: queryError } = await supabase
      .from('violation_queries')
      .upsert(queryInsertData)
      .select()
      .single();

    if (queryError) {
      console.error(`❌ [${requestId}] Error submitting violation query:`, {
        error: queryError,
        code: queryError.code,
        message: queryError.message,
        details: queryError.details,
        hint: queryError.hint,
        insertData: queryInsertData
      });
      return NextResponse.json(
        { 
          error: 'Failed to submit query: ' + queryError.message, 
          requestId,
          details: queryError.details,
          code: queryError.code
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ [${requestId}] Violation query inserted successfully:`, queryData);

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
      console.error(`❌ [${requestId}] Error updating violation notification:`, {
        error: notificationError,
        code: notificationError.code,
        message: notificationError.message
      });
      // Don't fail the request, just log the error
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Violation query submitted successfully in ${totalTime}ms:`, queryData);

    return NextResponse.json({
      success: true,
      message: 'Violation query submitted successfully',
      query_id: queryData.id,
      requestId,
      processingTime: totalTime
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error in submit violation query after ${totalTime}ms:`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      requestId,
      processingTime: totalTime
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message,
        requestId,
        processingTime: totalTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
