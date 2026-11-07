import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { generateApplicantsExcel, REGISTRY_COLUMNS } from '@/lib/excel-export';

export async function GET() {
  return NextResponse.json({
    success: true,
    availableColumns: REGISTRY_COLUMNS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { columns, filters } = await req.json();

    let list = mockDb.getApplications();

    if (filters?.level) {
      list = list.filter((a) => a.level === filters.level);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.dept) {
      list = list.filter((a) => a.dept_choice_1 === filters.dept || a.dept_choice_2 === filters.dept);
    }

    const excelBuffer = await generateApplicantsExcel(list, columns);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="applicants_registry_2570_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Excel Export Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
