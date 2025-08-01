import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const records = await prisma.attendance.findMany({
      include: {
        user: true,
        qrSession: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    const header = 'Email,Role,Year,Section,Session,Date,Latitude,Longitude\n';
    const rows = (records as any[]).map((r) => [
      r.user.email,
      r.user.role,
      r.user.year || '',
      r.user.section || '',
      r.qrSessionId,
      r.timestamp.toISOString(),
      r.latitude,
      r.longitude
    ].join(','));
    const csv = header + rows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="attendance.csv"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
