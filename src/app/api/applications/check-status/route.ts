import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { nationalId, birthDate } = await req.json();

    if (!nationalId) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก' },
        { status: 400 }
      );
    }

    const cleanId = nationalId.replace(/\D/g, '');
    const app = mockDb.getApplicationByCitizenId(cleanId, birthDate);

    if (!app) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลการสมัคร หรือวันเดือนปีเกิดไม่ตรงกับในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง',
        },
        { status: 404 }
      );
    }

    const logs = mockDb.getStatusLogsByApplicationId(app.id);

    return NextResponse.json({
      success: true,
      data: {
        id: app.id,
        application_no: app.application_no,
        full_name: app.full_name,
        level: app.level,
        dept_1: app.dept_1,
        dept_2: app.dept_2,
        status: app.status,
        reject_reason: app.reject_reason,
        created_at: app.created_at,
        files: app.files,
        enrollment: app.enrollment,
        logs,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
