import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('⚖️ Teacher violation action API called');
    
    const {
      violation_id,
      action,
      teacher_response,
      teacher_id
    } = await request.json();

    console.log('📝 Action data:', {
      violation_id,
      action,
      teacher_response: teacher_response?.substring(0, 50) + '...',
      teacher_id
    });

    // Validate required fields
    if (!violation_id || !action || !teacher_id) {
      console.error('❌ Missing required fields:', { violation_id, action, teacher_id });
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: { violation_id, action, teacher_id }
        },
        { status: 400 }
      );
    }

    // Update the violation notification
    const { data: updatedViolation, error: updateError } = await supabase
      .from('violation_notifications')
      .update({
        status: action === 'approve' ? 'approved' : 
                action === 'retake' ? 'retake_allowed' : 
                action === 'debar' ? 'debarred' : 'pending',
        teacher_response: teacher_response?.trim() || null,
        teacher_action: action,
        updated_at: new Date().toISOString()
      })
      .eq('id', violation_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating violation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update violation' },
        { status: 500 }
      );
    }

    // Also update the corresponding violation query
    const { error: queryUpdateError } = await supabase
      .from('violation_queries')
      .update({
        status: action === 'approve' ? 'approved' : 
                action === 'retake' ? 'retake_allowed' : 
                action === 'debar' ? 'debarred' : 'pending',
        teacher_response: teacher_response?.trim() || null,
        teacher_action: action,
        updated_at: new Date().toISOString()
      })
      .eq('quiz_id', updatedViolation.quiz_id)
      .eq('student_id', updatedViolation.student_id);

    if (queryUpdateError) {
      console.error('❌ Error updating violation query:', queryUpdateError);
      // Don't fail the request, just log the error
    }

    // If action is approve, update the attempts table to show results
    if (action === 'approve') {
      const { error: attemptsError } = await supabase
        .from('attempts')
        .update({
          violation_reason: null, // Clear violation reason to show results
          updated_at: new Date().toISOString()
        })
        .eq('quiz_id', updatedViolation.quiz_id)
        .eq('user_id', updatedViolation.student_id)
        .eq('violation_reason', 'TAB_SWITCHING');

      if (attemptsError) {
        console.error('❌ Error updating attempts:', attemptsError);
        // Don't fail the request, just log the error
      }
    }

    // If action is retake, create a retake record
    if (action === 'retake') {
      const { error: retakeError } = await supabase
        .from('quiz_retakes')
        .insert({
          quiz_id: updatedViolation.quiz_id,
          student_id: updatedViolation.student_id,
          retake_allowed_by: teacher_id,
          reason: 'Teacher approved retake after violation review',
          status: 'approved',
          created_at: new Date().toISOString()
        });

      if (retakeError) {
        console.error('❌ Error creating retake record:', retakeError);
        // Don't fail the request, just log the error
      }
    }

    // If action is debar, create a suspension record
    if (action === 'debar') {
      const { error: debarError } = await supabase
        .from('user_suspensions')
        .insert({
          user_id: updatedViolation.student_id,
          suspended_by: teacher_id,
          reason: 'Tab switching violation - debarred by teacher',
          violation_id: violation_id,
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: null // Permanent suspension
        });

      if (debarError) {
        console.error('❌ Error creating suspension record:', debarError);
        // Don't fail the request, just log the error
      }
    }

    console.log('✅ Violation action completed:', action);

    return NextResponse.json({
      success: true,
      message: `Violation ${action} successfully`,
      violation: updatedViolation
    });

  } catch (error) {
    console.error('❌ Error in teacher violation action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}