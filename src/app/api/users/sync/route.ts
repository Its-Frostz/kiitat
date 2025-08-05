import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, name, role, year, section } = await req.json();
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing user ID or email' }, { status: 400 });
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name: name || existingUser.name,
          role: role || existingUser.role,
          year: year ? parseInt(year) : existingUser.year,
          section: section || existingUser.section,
        },
      });
      return NextResponse.json({ success: true, user: updatedUser });
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: name || email.split('@')[0],
          role: role || 'STUDENT',
          year: year ? parseInt(year) : null,
          section: section || null,
        },
      });
      return NextResponse.json({ success: true, user: newUser });
    }
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
