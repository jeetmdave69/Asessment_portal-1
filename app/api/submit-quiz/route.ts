import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getErrorMessage(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    if ('message' in err && typeof (err as any).message === 'string') return (err as any).message;
    if ('error' in err && typeof (err as any).error === 'string') return (err as any).error;
  }
  return JSON.stringify(err);
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let responded = false;
  const failsafeTimeout = setTimeout(() => {
    if (!responded) {
      console.error('API route failsafe timeout: No response after 10s');
      responded = true;
      return new Response(JSON.stringify({ error: 'Server timeout. Please try again.' }), { status: 504, headers: { 'Content-Type': 'application/json' } });
    }
  }, 10000);
  try {
    console.log('API route: START');
    let body;
    try {
      body = await req.json();
    } catch (jsonErr) {
      console.error('API route error: Invalid JSON', jsonErr);
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    console.log('SUBMIT-QUIZ BODY:', body);
    // Required fields for attempts table
    const requiredFields = [
      'quiz_id', 'user_id', 'user_name', 'answers', 'correct_answers', 'score', 'submitted_at', 'total_marks'
    ];
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === null || body[field] === undefined || (typeof body[field] === 'string' && body[field].trim() === '')) {
        console.error(`Missing or null required field: ${field}`);
        clearTimeout(failsafeTimeout);
        responded = true;
        return new Response(JSON.stringify({ error: `Missing or null required field: ${field}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }
    // Validate types
    if (typeof body.quiz_id !== 'number') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'quiz_id must be a number' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.user_id !== 'string') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'user_id must be a string' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.user_name !== 'string') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'user_name must be a string' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.answers !== 'object') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'answers must be an object' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.correct_answers !== 'object') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'correct_answers must be an object' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.score !== 'number') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'score must be a number' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (typeof body.total_marks !== 'number') {
      clearTimeout(failsafeTimeout);
      responded = true;
      return new Response(JSON.stringify({ error: 'total_marks must be a number' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Prepare insert object
    const insertObj: Record<string, any> = {
      quiz_id: body.quiz_id,
      user_id: body.user_id,
      user_name: body.user_name,
      answers: body.answers,
      correct_answers: body.correct_answers,
      score: body.score,
      submitted_at: body.submitted_at,
      total_marks: body.total_marks
    };
    const optionalFields = [
      'completed_at', 'created_at', 'start_time', 'end_time', 'marked_questions', 'sections',
      'total_questions', 'correct_count', 'percentage', 'status', 'marked_for_review'
    ];
    for (const field of optionalFields) {
      if (field in body && body[field] !== null && body[field] !== undefined) {
        insertObj[field] = body[field];
      }
    }
    console.log('FINAL ATTEMPT INSERT OBJECT:', insertObj);
    // Insert with timeout
    let insertResult: any = null, insertError: any = null;
    const insertPromise = supabase.from('attempts').insert([insertObj]);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase insert timed out')), 9000)
    );
    try {
      console.log('Inserting attempt into Supabase...');
      insertResult = await Promise.race([insertPromise, timeoutPromise]);
      console.log('Supabase insert result:', insertResult);
    } catch (err) {
      insertError = err;
      console.error('Supabase insert error:', err);
    }
    const hasInsertError = !!insertError;
    const hasResultError = insertResult && typeof insertResult === 'object' && 'error' in insertResult && insertResult.error;
    if (hasInsertError || hasResultError) {
      const errorMsg = getErrorMessage(insertError) || getErrorMessage(insertResult?.error) || 'Failed to insert attempt.';
      clearTimeout(failsafeTimeout);
      responded = true;
      console.error('API route: Returning error:', errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const duration = Date.now() - startTime;
    clearTimeout(failsafeTimeout);
    responded = true;
    console.log('Quiz submission successful. Duration:', duration, 'ms');
    console.log('API route: END');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    clearTimeout(failsafeTimeout);
    responded = true;
    console.error('API route error:', error);
    console.error('API route: Returning error:', getErrorMessage(error));
    return new Response(JSON.stringify({ error: getErrorMessage(error) || 'Unexpected error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 