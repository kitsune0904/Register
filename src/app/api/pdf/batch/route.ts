import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { generateBatchApplicationsPdf } from '@/lib/pdf-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('dept');
    const level = searchParams.get('level');
    const status = searchParams.get('status');

    let list = mockDb.getApplications();

    if (deptId) {
      list = list.filter((a) => a.dept_choice_1 === deptId || a.dept_choice_2 === deptId);
    }
    if (level) {
      list = list.filter((a) => a.level === level);
    }
    if (status) {
      list = list.filter((a) => a.status === status);
    }

    if (list.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการใบสมัครตามเงื่อนไข' }, { status: 404 });
    }

    const pdfBytes = await generateBatchApplicationsPdf(list);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="batch_applications_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Batch PDF Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรายการใบสมัคร' }, { status: 400 });
    }

    const all = mockDb.getApplications();
    const list = all.filter((a) => ids.includes(a.id));

    if (list.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการใบสมัคร' }, { status: 404 });
    }

    const pdfBytes = await generateBatchApplicationsPdf(list);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="selected_applications_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
