import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { generateApplicationPdf } from '@/lib/pdf-generator';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const app = mockDb.getApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ success: false, message: 'ไม่พบใบสมัคร' }, { status: 404 });
    }

    const pdfBytes = await generateApplicationPdf(app);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="application_${app.application_no}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
