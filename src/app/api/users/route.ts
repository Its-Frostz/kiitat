import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get('role');
  const year = searchParams.get('year');
  const section = searchParams.get('section');
  
  // Validate role parameter
  const role = roleParam && Object.values(Role).includes(roleParam as Role) 
    ? (roleParam as Role) 
    : undefined;
  
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
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
