import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const timetables = await prisma.timetable.findMany({ orderBy: [{ year: 'asc' }, { section: 'asc' }] });
    return NextResponse.json({ timetables });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
