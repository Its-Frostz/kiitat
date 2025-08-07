import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL environment variable is not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }

    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Try to count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount,
      env: process.env.NODE_ENV,
      databaseUrlExists: !!databaseUrl,
      databaseUrlStart: databaseUrl.substring(0, 20) + '...' // Only show first 20 chars for security
    });
    
  } catch (error: any) {
    console.error('Database debug error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown database error',
      code: error.code,
      env: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}
