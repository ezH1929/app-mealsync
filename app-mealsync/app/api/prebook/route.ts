import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');
  
  try {
    const prebooks = mockDb.getPrebooks(
      userId || undefined,
      date || undefined
    );
    return NextResponse.json({ prebooks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prebooks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const prebook = mockDb.createPrebook(data);
    return NextResponse.json({ 
      prebook,
      message: 'Pre-booked for tomorrow'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prebook' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Prebook ID required' }, { status: 400 });
  }
  
  try {
    const success = mockDb.deletePrebook(id);
    if (!success) {
      return NextResponse.json({ error: 'Prebook not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Prebook cancelled' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prebook' }, { status: 500 });
  }
}