import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalAttendance = await prisma.attendance.count();
    const bySection = await prisma.attendance.groupBy({
      by: ['userId'],
      _count: { userId: true },
    });
    // Map userId to year/section
    const users = await prisma.user.findMany({ select: { id: true, year: true, section: true } });
    const sectionMap: Record<string, { year: number, section: string }> = {};
    const sectionStats: Record<string, { year: number, section: string, count: number }> = {};
    type User = { id: string; year: number | null; section: string | null };
    type SectionRow = { userId: string; _count: { userId: number } };
    (users as User[]).forEach((u) => { if (u.year && u.section) sectionMap[u.id] = { year: u.year, section: u.section }; });
    (bySection as SectionRow[]).forEach((row) => {
      const info = sectionMap[row.userId];
      if (info) {
        const key = `${info.year}-${info.section}`;
        if (!sectionStats[key]) sectionStats[key] = { ...info, count: 0 };
        sectionStats[key].count += row._count.userId;
      }
    });
    return NextResponse.json({
      totalUsers,
      totalAttendance,
      bySection: Object.values(sectionStats),
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
