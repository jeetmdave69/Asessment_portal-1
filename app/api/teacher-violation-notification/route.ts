import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendViolationNotificationEmail } from '../../../lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const requestId = `teacher-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Teacher violation notification API called`);
  console.log(`🔍 [${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`🔍 [${requestId}] Environment:`, {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    region: process.env.VERCEL_REGION,
    resendKey: process.env.RESEND_API_KEY ? 'set' : 'missing'
  });
  
  try {
    const body = await request.text();
    console.log(`📝 [${requestId}] Raw request body (${body.length} chars):`, body);
    
    let parsedData;
    try {
      parsedData = JSON.parse(body);
      console.log(`✅ [${requestId}] JSON parsed successfully:`, parsedData);
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON parse error:`, {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        stack: parseError instanceof Error ? parseError.stack : undefined,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 200)
      });
      return NextResponse.json(
        { error: 'Invalid JSON in request body', requestId, details: parseError instanceof Error ? parseError.message : String(parseError) },
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
      student_query
    } = parsedData;

    console.log(`📧 [${requestId}] Received notification data:`, {
      quiz_id,
      student_id,
      student_name,
      violation_type,
      violation_count,
      quiz_title,
      student_query: student_query?.substring(0, 50) + '...'
    });

    // Validate required fields
    if (!quiz_id || !student_id || !student_name || !violation_type) {
      const missingFields = [];
      if (!quiz_id) missingFields.push('quiz_id');
      if (!student_id) missingFields.push('student_id');
      if (!student_name) missingFields.push('student_name');
      if (!violation_type) missingFields.push('violation_type');
      
      console.error(`❌ [${requestId}] Missing required fields for notification:`, { missingFields });
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}`, requestId },
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
      console.error('❌ Quiz not found for notification:', quizError);
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

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
      console.error('❌ Teacher not found for notification:', teacherError);
      console.log('⚠️ Proceeding without teacher details - using fallback values');
      
      // Use fallback values when teacher lookup fails
      teacherData = {
        id: quizData.user_id, // Use the Clerk ID as the ID
        email: 'teacher@example.com', // Fallback email
        name: 'Teacher' // Fallback name
      };
    }

    // Insert violation notification into database
    const { data: notificationData, error: notificationError } = await supabase
      .from('violation_notifications')
      .insert({
        quiz_id,
        student_id,
        student_name,
        teacher_id: teacherData.id,
        teacher_email: teacherData.email,
        violation_type,
        violation_count,
        violation_timestamp,
        quiz_title: quiz_title || quizData.quiz_title,
        student_query: student_query || 'No query submitted',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notificationError) {
      console.error(`❌ [${requestId}] Error creating violation notification:`, {
        error: notificationError,
        code: notificationError.code,
        message: notificationError.message,
        details: notificationError.details
      });
      return NextResponse.json(
        { 
          error: 'Failed to create notification: ' + notificationError.message, 
          requestId,
          details: notificationError.details,
          code: notificationError.code
        },
        { status: 500 }
      );
    }

    console.log(`✅ [${requestId}] Teacher violation notification created:`, notificationData);

    // Send email notification to teacher
    try {
      const emailData = {
        teacherName: teacherData.name || 'Teacher',
        teacherEmail: teacherData.email || 'teacher@example.com',
        studentName: student_name || 'Student',
        quizTitle: quizData.quiz_title || 'Quiz',
        violationCount: violation_count || 5, // Tab switching limit
        violationTimestamp: violation_timestamp || new Date().toISOString(),
        studentQuery: student_query || '',
        reviewLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/teacher/violations`
      };

      console.log(`📧 [${requestId}] Sending email notification:`, emailData);
      const emailResult = await sendViolationNotificationEmail(emailData);
      console.log(`✅ [${requestId}] Email sent successfully:`, emailResult);
    } catch (emailError) {
      console.error(`❌ [${requestId}] Failed to send email notification:`, {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
        name: emailError instanceof Error ? emailError.name : 'Unknown'
      });
      // Don't fail the entire request if email fails
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Teacher notification completed successfully in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Teacher notification sent successfully',
      notification_id: notificationData.id,
      requestId,
      processingTime: totalTime
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error in teacher violation notification after ${totalTime}ms:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      requestId,
      processingTime: totalTime
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)),
        requestId,
        processingTime: totalTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
