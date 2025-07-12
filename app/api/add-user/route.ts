import { Clerk } from "@clerk/clerk-sdk-node";
import { NextRequest, NextResponse } from "next/server";

// @ts-ignore
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, firstName, lastName, username } = body;

    console.log('Received data:', { email, password: '***', role, firstName, lastName, username });

    if (!email || !password || !role || !firstName || !lastName) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role, firstName: !!firstName, lastName: !!lastName });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userData: any = {
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: { role },
    };
    if (username && username.trim() !== "") {
      userData.username = username;
    }

    console.log('Creating user with data:', { ...userData, password: '***' });

    const user = await clerk.users.createUser(userData);
    console.log('User created successfully:', user.id);
    return NextResponse.json({ message: "User created successfully", user });
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      message: error?.message,
      errors: error?.errors,
      response: error?.response?.data,
      status: error?.response?.status
    });
    
    let details = error?.errors || error?.response?.data || error;
    let message = error?.message || (Array.isArray(details) && details[0]?.message) || JSON.stringify(details);
    
    return NextResponse.json({ 
      message: "Error creating user", 
      error: message, 
      details: details,
      status: error?.response?.status || 422
    }, { status: 422 });
  }
} 