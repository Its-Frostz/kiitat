import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Simple health check with connection test
    const start = Date.now();
    
    // Test basic database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const end = Date.now();
    const connectionTime = end - start;
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      connectionTime: `${connectionTime}ms`,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    }, { status: 503 });
  }
}
