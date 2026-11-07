import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    if (!body.guardian_name || !body.guardian_phone || !body.guardian_relation) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลผู้ปกครองและเบอร์โทรศัพท์ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const updatedApp = mockDb.enrollApplicant(
      params.id,
      {
        guardian_name: body.guardian_name.trim(),
        guardian_relation: body.guardian_relation.trim(),
        guardian_phone: body.guardian_phone.trim(),
        witness_name: body.witness_name?.trim(),
        student_code: body.student_code?.trim(),
        enrollment_date: body.enrollment_date,
        notes: body.notes?.trim(),
      },
      body.changed_by || 'เจ้าหน้าที่งานทะเบียน'
    );

    return NextResponse.json({
      success: true,
      message: 'บันทึกการมอบตัวและออกรหัสนักศึกษาเรียบร้อยแล้ว',
      data: updatedApp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการมอบตัว' },
      { status: 400 }
    );
  }
}
