import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  
  try {
    if (date) {
      const menuDay = mockDb.getMenuDay(date);
      const items = mockDb.getMenuItems(date);
      
      return NextResponse.json({
        menuDay,
        items,
      });
    }
    
    const days = mockDb.getMenuDays();
    return NextResponse.json({ days });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}
