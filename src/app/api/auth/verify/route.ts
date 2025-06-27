import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, deleteVerificationToken, markEmailAsVerified } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await markEmailAsVerified(email);

    // Delete the verification token
    await deleteVerificationToken(token);

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        email 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 