import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'ExpenseFlow',
    description: 'Smart expense tracking for modern life',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
