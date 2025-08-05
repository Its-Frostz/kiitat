import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, qrPayload, latitude, longitude } = await req.json();
    
    if (!userId || !qrPayload || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate QR payload structure
    const { sessionId, year, section, latitude: qrLat, longitude: qrLng, validFrom, validTo } = qrPayload;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Invalid QR code: missing session ID' }, { status: 400 });
    }

    // Check if QR session exists and is valid
    const qrSession = await prisma.qRSession.findUnique({
      where: { id: sessionId }
    });

    if (!qrSession) {
      return NextResponse.json({ error: 'QR session not found' }, { status: 400 });
    }

    // Check QR code is not expired
    const now = new Date();
    if (now < qrSession.validFrom || now > qrSession.validTo) {
      return NextResponse.json({ error: 'QR code expired' }, { status: 400 });
    }

    // Check location (within 50 meters)
    const dist = getDistanceFromLatLonInMeters(latitude, longitude, qrLat, qrLng);
    if (dist > 50) {
      return NextResponse.json({ error: `Location mismatch: ${dist.toFixed(0)}m away` }, { status: 400 });
    }

    // Check user exists and matches year/section
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found in database. Please complete onboarding first.' }, { status: 400 });
    }
    
    if (user.year !== year || user.section !== section) {
      return NextResponse.json({ error: 'User not allowed for this QR (year/section mismatch)' }, { status: 400 });
    }

    // Check if already marked attendance for this session
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        qrSessionId: sessionId,
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already marked for this session' }, { status: 400 });
    }

    // Mark attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        qrSessionId: sessionId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Attendance marked successfully!',
      attendanceId: attendance.id 
    });
  } catch (error) {
    console.error('Attendance marking error:', error);
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
      const sessions = await prisma.attendance.groupBy({
        by: ['qrSessionId', 'timestamp'],
        where: { qrSession: { teacherId } },
        _count: { id: true },
        orderBy: { timestamp: 'desc' },
      });
      return NextResponse.json({ attendance: sessions });
    }
    return NextResponse.json({ attendance: [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
