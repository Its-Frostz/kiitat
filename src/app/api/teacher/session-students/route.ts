import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ students: [] });
  try {
    const attendance = await prisma.attendance.findMany({
      where: { qrSessionId: sessionId },
      include: { user: true },
    });
    const students = attendance.map(a => ({ user: a.user }));
    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ students: [] });
  }
}
