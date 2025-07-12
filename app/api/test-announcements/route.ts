import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    console.log('Testing announcements table...');
    
    // Test 1: Check if table exists by trying to select from it
    const { data, error } = await supabase
      .from('announcements')
      .select('id')
      .limit(1);
    
    console.log('Announcements table test result:', { data, error });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }
    
    // Test 2: Check table structure
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'announcements' })
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));
    
    return NextResponse.json({
      success: true,
      message: 'Announcements table is accessible',
      data: data,
      structure: structureData,
      structureError: structureError
    });
    
  } catch (err) {
    console.error('Test announcements error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to test announcements table',
      details: err
    }, { status: 500 });
  }
} 