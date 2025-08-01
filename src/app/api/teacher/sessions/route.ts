import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');
  if (!teacherId) return NextResponse.json({ sessions: [] });
  try {
    const sessions = await prisma.qrSession.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        attendances: true,
      },
    });
    const result = (sessions as any[]).map((s) => ({
      ...s,
      attendanceCount: s.attendances.length,
    }));
    return NextResponse.json({ sessions: result });
  } catch (e) {
    return NextResponse.json({ sessions: [] });
  }
}
