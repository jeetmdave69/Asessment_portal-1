import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('❌ Failed to parse JSON body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  console.log('Received POST /api/quiz-progress body:', body);
  const { quiz_id, user_id, answers, flagged, bookmarked, marked_for_review, start_time, question_id, question_time_spent, tab_switch_count, last_tab_switch_time, tab_switch_history } = body;
  if (!quiz_id || !user_id) {
    return new Response(JSON.stringify({ error: 'quiz_id and user_id required' }), { status: 400 });
  }

  // Fetch existing progress if any
  const { data: existing, error: fetchError } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('quiz_id', quiz_id)
    .eq('user_id', user_id)
    .single();
  if (fetchError && fetchError.code !== 'PGRST116') {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  let newAnswers = {};
  if (existing && existing.answers) {
    newAnswers = { ...existing.answers };
  }
  // If answers is present, merge it in (for partial update)
  if (answers && typeof answers === 'object') {
    newAnswers = { ...newAnswers, ...answers };
  }

  // Only update flagged/bookmarked/marked_for_review/question_time_spent/tab_switch data if present
  const newFlagged = flagged !== undefined ? flagged : (existing?.flagged || {});
  const newBookmarked = bookmarked !== undefined ? bookmarked : (existing?.bookmarked || {});
  const newMarkedForReview = marked_for_review !== undefined ? marked_for_review : (existing?.marked_for_review || {});
  const newQuestionTimeSpent = question_time_spent !== undefined ? question_time_spent : (existing?.question_time_spent || {});
  const newTabSwitchCount = tab_switch_count !== undefined ? tab_switch_count : (existing?.tab_switch_count || 0);
  const newLastTabSwitchTime = last_tab_switch_time !== undefined ? last_tab_switch_time : (existing?.last_tab_switch_time || null);
  const newTabSwitchHistory = tab_switch_history !== undefined ? tab_switch_history : (existing?.tab_switch_history || []);

  // Upsert progress
  const { data, error } = await supabase
    .from('quiz_progress')
    .upsert([
      {
        quiz_id,
        user_id,
        answers: newAnswers,
        flagged: newFlagged,
        bookmarked: newBookmarked,
        marked_for_review: newMarkedForReview,
        question_time_spent: newQuestionTimeSpent,
        tab_switch_count: newTabSwitchCount,
        last_tab_switch_time: newLastTabSwitchTime,
        tab_switch_history: newTabSwitchHistory,
        start_time: start_time || existing?.start_time,
        updated_at: new Date().toISOString(),
      }
    ], { onConflict: 'quiz_id,user_id' })
    .select();
  console.log('Upsert result:', { data, error });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const quiz_id = searchParams.get('quiz_id');
  const user_id = searchParams.get('user_id');
  if (!quiz_id || !user_id) {
    return new Response(JSON.stringify({ error: 'quiz_id and user_id required' }), { status: 400 });
  }
  const { data, error } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('quiz_id', quiz_id)
    .eq('user_id', user_id)
    .single();
  if (error && error.code !== 'PGRST116') {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ data }), { status: 200 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('❌ Failed to parse JSON body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  console.log('Received PATCH /api/quiz-progress body:', body);
  const { quiz_id, user_id, question_time_spent, tab_switch_count, last_tab_switch_time, tab_switch_history, submitted_due_to_violation, violation_timestamp } = body;
  if (!quiz_id || !user_id) {
    return new Response(JSON.stringify({ error: 'quiz_id and user_id required' }), { status: 400 });
  }

  // Fetch existing progress to merge data
  const { data: existing, error: fetchError } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('quiz_id', quiz_id)
    .eq('user_id', user_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('❌ Error fetching existing progress:', fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  // If no existing record, return error
  if (!existing) {
    return new Response(JSON.stringify({ error: 'No existing progress found to update' }), { status: 404 });
  }

  // Merge question_time_spent data
  let mergedQuestionTimeSpent = existing.question_time_spent || {};
  if (question_time_spent && typeof question_time_spent === 'object') {
    // Handle both flat object format and nested format
    const incomingMap = question_time_spent.questions ?? question_time_spent ?? {};
    const existingMap = mergedQuestionTimeSpent.questions ?? mergedQuestionTimeSpent ?? {};
    mergedQuestionTimeSpent = { ...existingMap, ...incomingMap };
  }

  // Prepare update object
  const updateData: any = { 
    updated_at: new Date().toISOString()
  };

  // Only update fields that are provided
  if (question_time_spent !== undefined) {
    updateData.question_time_spent = mergedQuestionTimeSpent;
  }
  if (tab_switch_count !== undefined) updateData.tab_switch_count = tab_switch_count;
  if (last_tab_switch_time !== undefined) updateData.last_tab_switch_time = last_tab_switch_time;
  if (tab_switch_history !== undefined) updateData.tab_switch_history = tab_switch_history;
  if (submitted_due_to_violation !== undefined) updateData.submitted_due_to_violation = submitted_due_to_violation;
  if (violation_timestamp !== undefined) updateData.violation_timestamp = violation_timestamp;

  const { data, error } = await supabase
    .from('quiz_progress')
    .update(updateData)
    .eq('quiz_id', quiz_id)
    .eq('user_id', user_id)
    .select();

  if (error) {
    console.error('❌ Error updating progress:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  
  console.log('✅ Progress updated successfully:', data);
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { quiz_id, user_id } = body;
  if (!quiz_id || !user_id) {
    return new Response(JSON.stringify({ error: 'quiz_id and user_id required' }), { status: 400 });
  }
  const { error } = await supabase
    .from('quiz_progress')
    .delete()
    .eq('quiz_id', quiz_id)
    .eq('user_id', user_id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 