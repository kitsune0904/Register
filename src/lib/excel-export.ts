import ExcelJS from 'exceljs';
import { Application } from '@/types';
import { formatThaiDate } from './thai-utils';

export interface ExportColumnOption {
  key: string;
  label: string;
  defaultSelected: boolean;
}

export const REGISTRY_COLUMNS: ExportColumnOption[] = [
  { key: 'index', label: 'ลำดับ', defaultSelected: true },
  { key: 'application_no', label: 'เลขที่ใบสมัคร', defaultSelected: true },
  { key: 'level', label: 'ระดับการศึกษา', defaultSelected: true },
  { key: 'dept_choice_1', label: 'สาขาวิชาที่สมัคร (อันดับ 1)', defaultSelected: true },
  { key: 'dept_choice_2', label: 'สาขาวิชาที่สมัคร (อันดับ 2)', defaultSelected: true },
  { key: 'national_id', label: 'เลขประจำตัวประชาชน 13 หลัก', defaultSelected: true },
  { key: 'full_name', label: 'ชื่อ-นามสกุล', defaultSelected: true },
  { key: 'birth_date', label: 'วัน/เดือน/ปีเกิด', defaultSelected: true },
  { key: 'phone', label: 'เบอร์โทรศัพท์', defaultSelected: true },
  { key: 'address_full', label: 'ที่อยู่ปัจจุบัน', defaultSelected: true },
  { key: 'province', label: 'จังหวัด', defaultSelected: true },
  { key: 'current_school', label: 'สถานศึกษาเดิม', defaultSelected: true },
  { key: 'current_level', label: 'ระดับชั้นเดิม', defaultSelected: true },
  { key: 'gpax', label: 'เกรดเฉลี่ย (GPAX)', defaultSelected: true },
  { key: 'father_name', label: 'ชื่อ-สกุล บิดา', defaultSelected: false },
  { key: 'mother_name', label: 'ชื่อ-สกุล มารดา', defaultSelected: false },
  { key: 'referral_source', label: 'ช่องทางที่รู้จักวิทยาลัย', defaultSelected: true },
  { key: 'status', label: 'สถานะการสมัคร', defaultSelected: true },
  { key: 'student_code', label: 'รหัสประจำตัวนักศึกษา (มอบตัว)', defaultSelected: true },
  { key: 'created_at', label: 'วันที่ยื่นสมัคร', defaultSelected: true },
];

export async function generateApplicantsExcel(
  applications: Application[],
  selectedColumnKeys?: string[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('ข้อมูลผู้สมัครโควตา 2570', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  const columnsToExport = selectedColumnKeys && selectedColumnKeys.length > 0
    ? REGISTRY_COLUMNS.filter((c) => selectedColumnKeys.includes(c.key))
    : REGISTRY_COLUMNS.filter((c) => c.defaultSelected);

  // Set columns
  worksheet.columns = columnsToExport.map((col) => ({
    header: col.label,
    key: col.key,
    width: col.key === 'full_name' || col.key === 'current_school' || col.key === 'address_full' ? 28 : 16,
  }));

  // Style Header Row (Navy Blue #0B2A6F, White Text, Bold, Center)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B2A6F' },
    };
    cell.font = {
      name: 'Sarabun',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF071A47' } },
      left: { style: 'thin', color: { argb: 'FF071A47' } },
      bottom: { style: 'medium', color: { argb: 'FFF5B400' } }, // Gold bottom border
      right: { style: 'thin', color: { argb: 'FF071A47' } },
    };
  });

  // Status text mapping
  const statusLabels: Record<string, string> = {
    pending: 'รอตรวจสอบ',
    rejected: 'เอกสารไม่ครบ',
    passed: 'ผ่านการคัดเลือก',
    enrolled: 'มอบตัวแล้ว',
  };

  // Populate data
  applications.forEach((app, idx) => {
    const fullAddress = `${app.address?.house_no || ''} ม.${app.address?.moo || '-'} ต.${app.address?.subdistrict || ''} อ.${app.address?.district || ''} จ.${app.address?.province || ''} ${app.address?.postal_code || ''}`.trim();

    const rowData: Record<string, any> = {
      index: idx + 1,
      application_no: app.application_no,
      level: app.level,
      dept_choice_1: app.dept_1?.name || '',
      dept_choice_2: app.dept_2?.name || '-',
      national_id: app.national_id, // stored as text
      full_name: app.full_name,
      birth_date: formatThaiDate(app.birth_date, 'short'),
      phone: app.phone,
      address_full: fullAddress,
      province: app.address?.province || '-',
      current_school: app.current_school,
      current_level: app.current_level,
      gpax: app.gpax.toFixed(2),
      father_name: app.father_name || '-',
      mother_name: app.mother_name || '-',
      referral_source: app.referral_source || '-',
      status: statusLabels[app.status] || app.status,
      student_code: app.enrollment?.student_code || '-',
      created_at: formatThaiDate(app.created_at, 'short'),
    };

    const row = worksheet.addRow(rowData);
    row.height = 24;

    // Zebra striping
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Sarabun', size: 10 };
      cell.alignment = { vertical: 'middle' };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Center specific columns
      const colKey = columnsToExport[colNumber - 1]?.key;
      if (['index', 'application_no', 'birth_date', 'phone', 'gpax', 'status', 'student_code', 'created_at'].includes(colKey)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (colKey === 'national_id') {
        cell.numFmt = '@'; // Force text format for ID
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
