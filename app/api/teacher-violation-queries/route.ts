import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Fetch violation queries for the teacher
    const { data: queries, error: queriesError } = await supabase
      .from('violation_queries')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (queriesError) {
      console.error('Error fetching violation queries:', queriesError);
      return NextResponse.json(
        { error: 'Failed to fetch violation queries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queries: queries || []
    });

  } catch (error) {
    console.error('Error in teacher violation queries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
