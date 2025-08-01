import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Save timetable JSON for a year/section
export async function POST(req: NextRequest) {
  try {
    const { year, section, timetable } = await req.json();
    if (!year || !section || !timetable) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Upsert timetable
    const result = await prisma.timetable.upsert({
      where: { year_section: { year, section } },
      update: { data: timetable },
      create: { year, section, data: timetable },
    });
    return NextResponse.json({ success: true, result });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET: Fetch timetable for a year/section
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get('year'));
  const section = searchParams.get('section');
  if (!year || !section) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  try {
    const timetable = await prisma.timetable.findUnique({ where: { year_section: { year, section } } });
    return NextResponse.json({ timetable });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove timetable for a year/section
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get('year'));
  const section = searchParams.get('section');
  if (!year || !section) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  try {
    await prisma.timetable.delete({ where: { year_section: { year, section } } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
