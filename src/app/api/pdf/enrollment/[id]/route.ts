import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { generateEnrollmentPdf } from '@/lib/pdf-generator';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const app = mockDb.getApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ success: false, message: 'ไม่พบใบสมัคร' }, { status: 404 });
    }

    if (app.status !== 'passed' && app.status !== 'enrolled') {
      return NextResponse.json(
        { success: false, message: 'ใบสมัครนี้ยังไม่ผ่านการคัดเลือก จึงยังไม่สามารถพิมพ์ใบมอบตัวได้' },
        { status: 400 }
      );
    }

    const pdfBytes = await generateEnrollmentPdf(app);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="enrollment_${app.application_no}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Enrollment PDF Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
