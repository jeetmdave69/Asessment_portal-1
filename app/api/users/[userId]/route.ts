import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching user info for ID:', userId);

    // Try to get user from Clerk
    try {
      const user = await clerkClient.users.getUser(userId);
      
      if (user) {
        const userInfo = {
          id: user.id,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses?.[0]?.emailAddress,
          imageUrl: user.imageUrl,
        };
        
        console.log('Found user in Clerk:', userInfo);
        return NextResponse.json(userInfo);
      }
    } catch (clerkError) {
      console.log('Clerk error:', clerkError);
    }

    // If not found in Clerk, return default
    return NextResponse.json(
      { 
        id: userId,
        fullName: 'Unknown User',
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown@user.com'
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
}
