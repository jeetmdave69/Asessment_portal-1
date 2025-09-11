import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch notifications for the student
    const { data: notifications, error: notificationsError } = await supabase
      .from('student_notifications')
      .select(`
        *,
        teacher:teacher_id(id, first_name, last_name),
        quiz:quiz_id(id, quiz_title)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error('Error fetching student notifications:', notificationsError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || []
    });

  } catch (error) {
    console.error('Error in student notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notification_id, student_id, status } = await request.json();

    if (!notification_id || !student_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update notification status
    const { data: notificationData, error: notificationError } = await supabase
      .from('student_notifications')
      .update({
        status: status || 'read',
        updated_at: new Date().toISOString()
      })
      .eq('id', notification_id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (notificationError) {
      console.error('Error updating notification:', notificationError);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: notificationData
    });

  } catch (error) {
    console.error('Error in student notifications update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
