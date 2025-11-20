import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const user = mockDb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}