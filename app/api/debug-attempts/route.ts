import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Get all attempts
    const { data: allAttempts, error: allError } = await supabase
      .from('attempts')
      .select('*')
      .limit(10);

    if (allError) {
      console.error('Error fetching all attempts:', allError);
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }

    // Get attempts with quiz details
    const { data: attemptsWithQuizzes, error: quizError } = await supabase
      .from('attempts')
      .select(`
        id, 
        user_name, 
        score, 
        submitted_at, 
        quiz_id,
        quizzes:quiz_id(quiz_title, total_marks, user_id)
      `)
      .limit(10);

    if (quizError) {
      console.error('Error fetching attempts with quizzes:', quizError);
      return NextResponse.json({ error: 'Failed to fetch attempts with quizzes' }, { status: 500 });
    }

    // Get all quizzes
    const { data: allQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(10);

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json({
      totalAttempts: allAttempts?.length || 0,
      attemptsWithQuizzes: attemptsWithQuizzes?.length || 0,
      totalQuizzes: allQuizzes?.length || 0,
      sampleAttempts: allAttempts?.slice(0, 3) || [],
      sampleAttemptsWithQuizzes: attemptsWithQuizzes?.slice(0, 3) || [],
      sampleQuizzes: allQuizzes?.slice(0, 3) || []
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
