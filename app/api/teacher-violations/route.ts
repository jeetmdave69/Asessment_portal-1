import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Teacher violations API called');
    
    // Get teacher ID from query params or headers
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    
    console.log('🔍 Teacher ID from query:', teacherId);
    
    if (!teacherId) {
      console.log('❌ No teacher ID provided');
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // First, let's check if the table exists and what data is in it
    console.log('🔍 Checking violation_notifications table...');
    const { data: allViolations, error: allError } = await supabase
      .from('violation_notifications')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Error checking table:', allError);
      return NextResponse.json(
        { error: `Database error: ${allError.message}` },
        { status: 500 }
      );
    }
    
    console.log('📊 Sample violations in table:', allViolations);

    // Fetch violations for this teacher
    const { data: violations, error } = await supabase
      .from('violation_notifications')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching violations:', error);
      return NextResponse.json(
        { error: `Failed to fetch violations: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Fetched violations for teacher:', violations?.length || 0);
    console.log('📋 Violations data:', violations);

    return NextResponse.json({
      success: true,
      violations: violations || []
    });

  } catch (error) {
    console.error('❌ Error in teacher violations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}