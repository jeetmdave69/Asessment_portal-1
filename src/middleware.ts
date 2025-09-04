// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/attempt-quiz(.*)',
  '/result(.*)',
  '/create-quiz(.*)',
  '/edit-quiz(.*)',
  '/preview-quiz(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Never redirect to access-denied for sign-in page
  if (req.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.next();
  }

  // Only protect certain routes
  if (!isProtectedRoute(req)) return NextResponse.next();

  const { userId } = await auth();
  if (!userId) {
    // Redirect to your custom sign-in page instead of Clerk's hosted page
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
