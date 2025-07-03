// utils/storageInit.ts
import { supabase } from './supabaseClient';

export async function initializeQuizImageBucket() {
  try {
    // 1. Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    // 2. Create bucket if needed
    if (!buckets?.some(b => b.name === 'quiz-images')) {
      const { error: createError } = await supabase.storage.createBucket('quiz-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB in bytes
      });
      if (createError) throw createError;
      console.log('✅ quiz-images bucket created');
    }

    // 3. Correct way to set CORS configuration
    // Note: This must be done through the REST API
    const { error: corsError } = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/cors`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        body: JSON.stringify({
          allowedOrigins: ['*'], // For production, specify your domains
          allowedMethods: ['GET', 'POST', 'PUT'],
          allowedHeaders: ['*'],
          maxAgeSeconds: 3600,
        }),
      }
    ).then(res => res.json());

    if (corsError) throw corsError;

    console.log('✔ Storage initialized successfully');
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
    throw error;
  }
}

/*
-- DROP ALL EXISTING POLICIES ON storage.objects
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects;';
    END LOOP;
END $$;

-- ENABLE RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ALLOW AUTHENTICATED USERS TO UPLOAD TO profile-pictures
CREATE POLICY "Allow profile picture upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND auth.role() = 'authenticated'
);

-- ALLOW AUTHENTICATED USERS TO UPDATE/DELETE THEIR OWN FILES (optional, for profile picture changes)
CREATE POLICY "Allow profile picture update/delete"
ON storage.objects FOR UPDATE, DELETE
USING (
  bucket_id = 'profile-pictures' AND auth.role() = 'authenticated'
);

-- ALLOW ANYONE TO READ FROM profile-pictures (public read)
CREATE POLICY "Allow read access to profile pictures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-pictures'
);
*/