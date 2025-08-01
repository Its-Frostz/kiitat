import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const year = searchParams.get('year');
  const section = searchParams.get('section');
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(year ? { year: Number(year) } : {}),
        ...(section ? { section } : {}),
      },
      orderBy: { email: 'asc' },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
