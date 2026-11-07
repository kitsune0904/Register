import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { nationalId, password } = await req.json();

    if (!nationalId || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกเลขประจำตัวและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const staff = mockDb.authenticateStaff(nationalId, password);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง (สำหรับทดสอบ: 11999 / 090450)' },
        { status: 401 }
      );
    }

    // Return authenticated staff profile
    return NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: staff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
