import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendViolationNotificationEmail } from '../../../lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Teacher violation notification API called');
    
    const {
      quiz_id,
      student_id,
      student_name,
      violation_type,
      violation_count,
      violation_timestamp,
      quiz_title,
      student_query
    } = await request.json();

    console.log('📧 Received notification data:', {
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
      console.error('❌ Missing required fields for notification');
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
      console.error('❌ Quiz not found for notification:', quizError);
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
      console.error('❌ Error creating violation notification:', notificationError);
      return NextResponse.json(
        { error: 'Failed to create notification: ' + notificationError.message },
        { status: 500 }
      );
    }

    console.log('✅ Teacher violation notification created:', notificationData);

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

      console.log('📧 Sending email notification...');
      const emailResult = await sendViolationNotificationEmail(emailData);
      console.log('✅ Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError);
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher notification sent successfully',
      notification_id: notificationData.id
    });

  } catch (error) {
    console.error('❌ Error in teacher violation notification:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
