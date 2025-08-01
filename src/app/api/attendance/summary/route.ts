import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const year = Number(searchParams.get('year'));
  const section = searchParams.get('section');
  if (!userId || !year || !section) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  try {
    // Get all QR sessions for this year/section
    const sessions = await prisma.qrSession.findMany({ where: { year, section } });
    const total = sessions.length;
    // Get all attendance records for this user in these sessions
    const sessionIds = (sessions as { id: string }[]).map((s) => s.id);
    const present = await prisma.attendance.count({
      where: {
        userId,
        qrSessionId: { in: sessionIds },
      },
    });
    const percentage = total === 0 ? 0 : (present / total) * 100;
    return NextResponse.json({ summary: { total, present, percentage } });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
