import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function GET() {
  try {
    const departments = mockDb.getDepartments();
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
