import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { itemId, action } = await request.json();
    const user = mockDb.getUser(params.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let bookmarked_items = [...user.bookmarked_items];
    
    if (action === 'add' && !bookmarked_items.includes(itemId)) {
      bookmarked_items.push(itemId);
    } else if (action === 'remove') {
      bookmarked_items = bookmarked_items.filter(id => id !== itemId);
    }
    
    const updatedUser = mockDb.updateUser(params.userId, { bookmarked_items });
    
    return NextResponse.json({ 
      user: updatedUser,
      message: action === 'add' ? 'Saved to favourites' : 'Removed from favourites'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}