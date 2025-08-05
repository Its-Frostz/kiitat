import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { teacherId, year, section, latitude, longitude } = await req.json();
    
    if (!teacherId || !year || !section || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure teacher exists in database
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      // Try to get user info from the request and create the user
      return NextResponse.json({ 
        error: 'Teacher not found in database. Please complete onboarding first.' 
      }, { status: 400 });
    }

    // Create QR session with 5-minute validity
    const validFrom = new Date();
    const validTo = new Date(validFrom.getTime() + 5 * 60 * 1000); // 5 minutes from now

    const qrSession = await prisma.qRSession.create({
      data: {
        teacherId,
        year: parseInt(year),
        section,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        validFrom,
        validTo,
      },
    });

    // Return the session data for QR code generation
    const qrPayload = {
      sessionId: qrSession.id,
      teacherId,
      year: parseInt(year),
      section,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      validFrom: validFrom.getTime(),
      validTo: validTo.getTime(),
    };

    return NextResponse.json({ 
      success: true, 
      qrPayload,
      sessionId: qrSession.id 
    });
  } catch (error) {
    console.error('QR Session creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');
  
  try {
    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    const sessions = await prisma.qRSession.findMany({
      where: { teacherId },
      include: {
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
