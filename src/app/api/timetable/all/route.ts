import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const timetables = await prisma.timetable.findMany({ orderBy: [{ year: 'asc' }, { section: 'asc' }] });
    return NextResponse.json({ timetables });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
