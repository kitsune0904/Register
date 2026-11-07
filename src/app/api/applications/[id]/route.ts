import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { sendLineBroadcastNotification } from '@/lib/notifications';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const app = mockDb.getApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ success: false, message: 'ไม่พบใบสมัคร' }, { status: 404 });
    }

    const logs = mockDb.getStatusLogsByApplicationId(app.id);
    return NextResponse.json({ success: true, data: { ...app, logs } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // 1. Re-upload files
    if (body.action === 'reupload_files') {
      const updated = mockDb.updateApplicantFiles(params.id, body.files || []);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'ไม่พบใบสมัคร' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'อัปโหลดเอกสารแก้ไขเรียบร้อย สถานะเปลี่ยนเป็นรอตรวจสอบ',
        data: updated,
      });
    }

    // 2. Change status
    if (body.status) {
      const updated = mockDb.updateApplicationStatus(
        params.id,
        body.status,
        body.reject_reason,
        body.changed_by || 'เจ้าหน้าที่งานทะเบียน'
      );

      if (!updated) {
        return NextResponse.json({ success: false, message: 'ไม่พบใบสมัคร' }, { status: 404 });
      }

      // Notify status change
      await sendLineBroadcastNotification({
        title: 'การอัปเดตสถานะใบสมัคร',
        applicantName: updated.full_name,
        applicationNo: updated.application_no,
        level: updated.level,
        major: updated.dept_1?.name || '',
        status: updated.status,
        details: body.reject_reason,
      });

      return NextResponse.json({
        success: true,
        message: 'อัปเดตสถานะเรียบร้อยแล้ว',
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: 'คำขอไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
