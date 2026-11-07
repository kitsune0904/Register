import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { validateThaiNationalId } from '@/lib/thai-utils';
import { sendLineBroadcastNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const level = searchParams.get('level') || '';
    const status = searchParams.get('status') || '';
    const deptId = searchParams.get('dept') || '';

    let list = mockDb.getApplications();

    if (search) {
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(search) ||
          a.national_id.includes(search) ||
          a.application_no.toLowerCase().includes(search) ||
          a.current_school.toLowerCase().includes(search) ||
          a.phone.includes(search)
      );
    }

    if (level) {
      list = list.filter((a) => a.level === level);
    }

    if (status) {
      list = list.filter((a) => a.status === status);
    }

    if (deptId) {
      list = list.filter((a) => a.dept_choice_1 === deptId || a.dept_choice_2 === deptId);
    }

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation
    if (!body.full_name || !body.national_id || !body.level || !body.birth_date) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Check 13-digit ID
    const cleanId = body.national_id.replace(/\D/g, '');
    if (!validateThaiNationalId(cleanId)) {
      return NextResponse.json(
        { success: false, message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการคำนวณ Checksum' },
        { status: 400 }
      );
    }

    // GPAX validation
    const gpaxNum = parseFloat(body.gpax);
    if (isNaN(gpaxNum) || gpaxNum < 0.0 || gpaxNum > 4.0) {
      return NextResponse.json(
        { success: false, message: 'เกรดเฉลี่ยสะสม (GPAX) ต้องอยู่ระหว่าง 0.00 ถึง 4.00' },
        { status: 400 }
      );
    }

    // Check dept choices
    if (body.level === 'ระดับ ปวช.' && body.dept_choice_1 && body.dept_choice_2) {
      if (body.dept_choice_1 === body.dept_choice_2) {
        return NextResponse.json(
          { success: false, message: 'สาขาวิชาลำดับที่ 1 และลำดับที่ 2 ต้องไม่ซ้ำกัน' },
          { status: 400 }
        );
      }
    }

    // 2. Create in DB
    const newApp = mockDb.createApplication({
      level: body.level,
      national_id: cleanId,
      full_name: body.full_name.trim(),
      birth_date: body.birth_date,
      father_name: body.father_name?.trim(),
      father_age: body.father_age ? parseInt(body.father_age, 10) : undefined,
      father_occupation: body.father_occupation?.trim(),
      mother_name: body.mother_name?.trim(),
      mother_age: body.mother_age ? parseInt(body.mother_age, 10) : undefined,
      mother_occupation: body.mother_occupation?.trim(),
      address: body.address || {
        house_no: body.house_no || '',
        moo: body.moo || '',
        soi: body.soi || '',
        road: body.road || '',
        subdistrict: body.subdistrict || '',
        district: body.district || '',
        province: body.province || '',
        postal_code: body.postal_code || '',
      },
      phone: body.phone.replace(/\D/g, ''),
      current_school: body.current_school?.trim(),
      current_level: body.current_level?.trim(),
      current_school_address: body.current_school_address || {
        house_no: body.school_house_no || '',
        subdistrict: body.school_subdistrict || '',
        district: body.school_district || '',
        province: body.school_province || '',
      },
      gpax: gpaxNum,
      previous_major: body.previous_major?.trim(),
      dept_choice_1: body.dept_choice_1,
      dept_choice_2: body.dept_choice_2 || undefined,
      referral_source: body.referral_source || '',
      referral_detail: body.referral_detail || '',
      pdpa_accepted: Boolean(body.pdpa_accepted),
      files: body.files || [],
    });

    // 3. Dispatch Notification
    const dept = mockDb.getDepartmentById(newApp.dept_choice_1);
    await sendLineBroadcastNotification({
      title: 'มีผู้ยื่นใบสมัครออนไลน์ใหม่',
      applicantName: newApp.full_name,
      applicationNo: newApp.application_no,
      level: newApp.level,
      major: dept?.name || 'ไม่ระบุ',
      status: 'รอตรวจสอบ',
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกการสมัครสำเร็จ',
      data: newApp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการบันทึกใบสมัคร' },
      { status: 400 }
    );
  }
}
