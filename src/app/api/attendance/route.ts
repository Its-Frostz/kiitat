import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, qrPayload, latitude, longitude } = await req.json();
    if (!userId || !qrPayload || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Validate QR payload
    const { teacherId, year, section, latitude: qrLat, longitude: qrLng, timestamp } = qrPayload;
    // Check QR code is not expired (5 min window)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'QR code expired' }, { status: 400 });
    }
    // Check location (within 50 meters)
    const dist = getDistanceFromLatLonInMeters(latitude, longitude, qrLat, qrLng);
    if (dist > 50) {
      return NextResponse.json({ error: 'Location mismatch' }, { status: 400 });
    }
    // Check user exists and matches year/section
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.year !== year || user.section !== section) {
      return NextResponse.json({ error: 'User not allowed for this QR' }, { status: 400 });
    }
    // Check if already marked
    const already = await prisma.attendance.findFirst({
      where: {
        userId,
        qrSessionId: timestamp.toString(), // Use timestamp as session ID for demo
      },
    });
    if (already) {
      return NextResponse.json({ error: 'Attendance already marked' }, { status: 400 });
    }
    // Mark attendance
    await prisma.attendance.create({
      data: {
        userId,
        qrSessionId: timestamp.toString(),
        latitude,
        longitude,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Haversine formula for distance in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const teacherId = searchParams.get('teacherId');
  try {
    if (userId) {
      // Student: return their attendance records
      const attendance = await prisma.attendance.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      return NextResponse.json({ attendance });
    }
    if (teacherId) {
      // Teacher: return all sessions they created (grouped by session)
      const sessions = await prisma.attendance.findMany({
        where: { qrSession: { teacherId } },
        select: {
          qrSessionId: true,
          _count: { select: { id: true } },
          timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
      });
      return NextResponse.json({ attendance: sessions });
    }
    return NextResponse.json({ attendance: [] });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
