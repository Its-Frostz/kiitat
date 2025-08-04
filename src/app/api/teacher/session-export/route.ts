import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  try {
    const attendance = await prisma.attendance.findMany({
      where: { qrSessionId: sessionId },
      include: { user: true },
      orderBy: { timestamp: 'asc' },
    });
    const header = 'Email,Year,Section,Date,Latitude,Longitude\n';
    const rows = attendance.map(a => [
      a.user.email,
      a.user.year || '',
      a.user.section || '',
      a.timestamp.toISOString(),
      a.latitude,
      a.longitude
    ].join(','));
    const csv = header + rows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="attendance-session-${sessionId}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
