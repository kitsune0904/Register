import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { Application, Enrollment } from '@/types';
import { formatThaiDate, toThaiNumerals } from './thai-utils';

function getFontBytes() {
  const fontRegularPath = path.join(process.cwd(), 'public/fonts/THSarabunNew.ttf');
  const fontBoldPath = path.join(process.cwd(), 'public/fonts/THSarabunNew-Bold.ttf');
  return {
    regular: fs.readFileSync(fontRegularPath),
    bold: fs.readFileSync(fontBoldPath),
  };
}

/**
 * Draw dotted leader underline line
 */
function drawDottedLine(
  page: any,
  x1: number,
  y: number,
  x2: number,
  color = rgb(0.3, 0.3, 0.3)
) {
  if (x2 <= x1) return;
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.75,
    color,
    dashArray: [1, 2],
  });
}

/**
 * Generate Individual Application PDF strictly matching paper template
 */
export async function generateApplicationPdf(app: Application): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const { regular, bold } = getFontBytes();
  const font = await doc.embedFont(regular);
  const fontBold = await doc.embedFont(bold);

  const page = doc.addPage([595.28, 841.89]); // A4 (points)
  const { width, height } = page.getSize();

  const marginLeft = 55;
  const marginRight = width - 55;
  const contentWidth = marginRight - marginLeft;

  // 1. EMBED LOGO (Top-Left)
  const logoPath = path.join(process.cwd(), 'public/logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImg = await doc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: marginLeft,
        y: height - 105,
        width: 65,
        height: 65,
      });
    } catch (e) {
      console.error('Error embedding logo:', e);
    }
  }

  // 2. APPLICATION NO & QR CODE (Under Logo)
  const appNoThai = `เลขที่ใบสมัคร ${toThaiNumerals(app.application_no)}`;
  page.drawText(appNoThai, {
    x: marginLeft,
    y: height - 120,
    size: 13,
    font: fontBold,
    color: rgb(0.05, 0.16, 0.44), // #0B2A6F
  });

  try {
    const qrBuffer = await QRCode.toBuffer(
      JSON.stringify({
        app_no: app.application_no,
        name: app.full_name,
        level: app.level,
        year: '2570',
      })
    );
    const qrImg = await doc.embedPng(qrBuffer);
    page.drawImage(qrImg, {
      x: marginLeft + 10,
      y: height - 170,
      width: 44,
      height: 44,
    });
    page.drawText('สแกนตรวจสอบ', {
      x: marginLeft + 7,
      y: height - 179,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  } catch (e) {
    console.error('Error embedding QR Code:', e);
  }

  // 3. PHOTO BOX (Top-Right)
  const photoW = 75; // ~1 inch in point (72-80pt)
  const photoH = 95;
  const photoX = marginRight - photoW;
  const photoY = height - 120;

  // Check if applicant uploaded photo
  let hasEmbeddedPhoto = false;
  const photoFile = app.files?.find((f) => f.file_type === 'photo');
  if (photoFile && photoFile.file_path && !photoFile.file_path.startsWith('#')) {
    try {
      let photoFilePath = path.join(process.cwd(), 'public', photoFile.file_path);
      if (fs.existsSync(photoFilePath)) {
        const photoBytes = fs.readFileSync(photoFilePath);
        let photoImg;
        if (photoFile.mime_type?.includes('png') || photoFilePath.endsWith('.png')) {
          photoImg = await doc.embedPng(photoBytes);
        } else {
          photoImg = await doc.embedJpg(photoBytes);
        }
        page.drawImage(photoImg, {
          x: photoX,
          y: photoY,
          width: photoW,
          height: photoH,
        });
        hasEmbeddedPhoto = true;
      }
    } catch (e) {
      // fallback to placeholder
    }
  }

  if (!hasEmbeddedPhoto) {
    page.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
      borderColor: rgb(0.4, 0.4, 0.4),
      borderWidth: 1,
      color: rgb(0.97, 0.97, 0.97),
    });
    page.drawText('รูปถ่าย', {
      x: photoX + 23,
      y: photoY + 54,
      size: 13,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText('ขนาด ๑ นิ้ว', {
      x: photoX + 16,
      y: photoY + 36,
      size: 13,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // 4. HEADER TITLE (Centered)
  const title1 = 'ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)';
  const title2 = 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา ๒๕๗๐';

  const t1W = fontBold.widthOfTextAtSize(title1, 16);
  const t2W = fontBold.widthOfTextAtSize(title2, 16);

  page.drawText(title1, {
    x: (width - t1W) / 2,
    y: height - 60,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  page.drawText(title2, {
    x: (width - t2W) / 2,
    y: height - 82,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 5. LEVEL CHECKBOXES
  const levelY = height - 145;
  const levels = [
    { text: 'ระดับ ปวส. ( สายตรง )', key: 'ระดับ ปวส. (สายตรง)', y: levelY },
    { text: 'ระดับ ปวส. ( ม.๖/ปวช. ต่างสาขา )', key: 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)', y: levelY - 22 },
    { text: 'ระดับ ปวช.', key: 'ระดับ ปวช.', y: levelY - 44 },
  ];

  const checkStartX = 210;
  for (const lvl of levels) {
    const isSelected = app.level.includes(lvl.key.substring(0, 8)) || app.level === lvl.key;

    // Draw box
    page.drawRectangle({
      x: checkStartX,
      y: lvl.y + 1,
      width: 10,
      height: 10,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: isSelected ? rgb(0.1, 0.1, 0.1) : rgb(1, 1, 1),
    });

    if (isSelected) {
      // Checkmark tick or inner dot
      page.drawRectangle({
        x: checkStartX + 2,
        y: lvl.y + 3,
        width: 6,
        height: 6,
        color: rgb(1, 1, 1),
      });
      page.drawRectangle({
        x: checkStartX + 3,
        y: lvl.y + 4,
        width: 4,
        height: 4,
        color: rgb(0, 0, 0),
      });
    }

    page.drawText(lvl.text, {
      x: checkStartX + 18,
      y: lvl.y,
      size: 15,
      font,
      color: rgb(0, 0, 0),
    });
  }

  // 6. NUMBERED FORM ITEMS ๑ - ๖ (Exact Paper Layout with Dotted Leaders)
  let curY = height - 225;
  const lineSpacing = 24;

  const birthParts = formatThaiDate(app.birth_date, 'parts') as any;

  // --- ข้อ ๑ ---
  // ๑. ชื่อ-นามสกุล [name] เกิดวันที่ [day] เดือน [month] พ.ศ. [year]
  page.drawText('๑.  ชื่อ-นามสกุล', { x: marginLeft + 10, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const valNameX = marginLeft + 88;
  const valNameW = 220;
  page.drawText(app.full_name || '', { x: valNameX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, valNameX, curY - 2, valNameX + valNameW);

  const birthLabelX = valNameX + valNameW + 8;
  page.drawText('เกิดวันที่', { x: birthLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const bDayX = birthLabelX + 42;
  page.drawText(birthParts.dayThai || '', { x: bDayX + 4, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, bDayX, curY - 2, bDayX + 28);

  const bMonthLabelX = bDayX + 32;
  page.drawText('เดือน', { x: bMonthLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const bMonthX = bMonthLabelX + 28;
  page.drawText(birthParts.month || '', { x: bMonthX + 4, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, bMonthX, curY - 2, bMonthX + 55);

  const bYearLabelX = bMonthX + 58;
  page.drawText('พ.ศ.', { x: bYearLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const bYearX = bYearLabelX + 24;
  page.drawText(birthParts.yearThai || '', { x: bYearX + 4, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, bYearX, curY - 2, marginRight);

  // --- ข้อ ๒ ---
  // ๒. ชื่อ-สกุลบิดา [name] อายุ [age] ปี อาชีพ [occ]
  curY -= lineSpacing;
  page.drawText('๒.  ชื่อ-สกุลบิดา', { x: marginLeft + 10, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const fNameX = marginLeft + 88;
  const fNameW = 220;
  page.drawText(app.father_name || '-', { x: fNameX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, fNameX, curY - 2, fNameX + fNameW);

  const fAgeLabelX = fNameX + fNameW + 8;
  page.drawText('อายุ', { x: fAgeLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const fAgeX = fAgeLabelX + 24;
  page.drawText(toThaiNumerals(app.father_age) || '-', { x: fAgeX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, fAgeX, curY - 2, fAgeX + 32);

  const fYearLabelX = fAgeX + 35;
  page.drawText('ปี', { x: fYearLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });

  const fOccLabelX = fYearLabelX + 20;
  page.drawText('อาชีพ', { x: fOccLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const fOccX = fOccLabelX + 32;
  page.drawText(app.father_occupation || '-', { x: fOccX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, fOccX, curY - 2, marginRight);

  // --- ข้อ ๓ ---
  // ๓. ชื่อ-สกุลมารดา [name] อายุ [age] ปี อาชีพ [occ]
  curY -= lineSpacing;
  page.drawText('๓.  ชื่อ-สกุลมารดา', { x: marginLeft + 10, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const mNameX = marginLeft + 96;
  const mNameW = 212;
  page.drawText(app.mother_name || '-', { x: mNameX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, mNameX, curY - 2, mNameX + mNameW);

  const mAgeLabelX = mNameX + mNameW + 8;
  page.drawText('อายุ', { x: mAgeLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const mAgeX = mAgeLabelX + 24;
  page.drawText(toThaiNumerals(app.mother_age) || '-', { x: mAgeX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, mAgeX, curY - 2, mAgeX + 32);

  const mYearLabelX = mAgeX + 35;
  page.drawText('ปี', { x: mYearLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });

  const mOccLabelX = mYearLabelX + 20;
  page.drawText('อาชีพ', { x: mOccLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const mOccX = mOccLabelX + 32;
  page.drawText(app.mother_occupation || '-', { x: mOccX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, mOccX, curY - 2, marginRight);

  // --- ข้อ ๔ ---
  // ๔. ที่อยู่ปัจจุบันที่สามารถติดต่อได้ บ้านเลขที่ ... หมู่ ... ซอย ... ถนน ...
  curY -= lineSpacing;
  page.drawText('๔.  ที่อยู่ปัจจุบันที่สามารถติดต่อได้  บ้านเลขที่', {
    x: marginLeft + 10,
    y: curY,
    size: 15,
    font,
    color: rgb(0, 0, 0),
  });
  const addrNoX = marginLeft + 215;
  const addrNoW = 55;
  page.drawText(toThaiNumerals(app.address?.house_no) || '-', {
    x: addrNoX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, addrNoX, curY - 2, addrNoX + addrNoW);

  const mooLabelX = addrNoX + addrNoW + 6;
  page.drawText('หมู่', { x: mooLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const mooX = mooLabelX + 22;
  const mooW = 35;
  page.drawText(toThaiNumerals(app.address?.moo) || '-', {
    x: mooX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, mooX, curY - 2, mooX + mooW);

  const soiLabelX = mooX + mooW + 6;
  page.drawText('ซอย', { x: soiLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const soiX = soiLabelX + 25;
  const soiW = 60;
  page.drawText(app.address?.soi || '-', { x: soiX + 3, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, soiX, curY - 2, soiX + soiW);

  const rdLabelX = soiX + soiW + 6;
  page.drawText('ถนน', { x: rdLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const rdX = rdLabelX + 25;
  page.drawText(app.address?.road || '-', { x: rdX + 3, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, rdX, curY - 2, marginRight);

  // ข้อ ๔ บรรทัดที่ ๒: ตำบล ... อำเภอ ... จังหวัด ...
  curY -= lineSpacing;
  page.drawText('ตำบล', { x: marginLeft + 35, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const subdistX = marginLeft + 68;
  const subdistW = 100;
  page.drawText(app.address?.subdistrict || '-', {
    x: subdistX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, subdistX, curY - 2, subdistX + subdistW);

  const distLabelX = subdistX + subdistW + 10;
  page.drawText('อำเภอ', { x: distLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const distX = distLabelX + 35;
  const distW = 105;
  page.drawText(app.address?.district || '-', {
    x: distX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, distX, curY - 2, distX + distW);

  const provLabelX = distX + distW + 10;
  page.drawText('จังหวัด', { x: provLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const provX = provLabelX + 38;
  page.drawText(app.address?.province || '-', {
    x: provX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, provX, curY - 2, marginRight);

  // ข้อ ๔ บรรทัดที่ ๓: รหัสไปรษณีย์ ... หมายเลขโทรศัพท์ ...
  curY -= lineSpacing;
  page.drawText('รหัสไปรษณีย์', { x: marginLeft + 35, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const zipX = marginLeft + 102;
  const zipW = 80;
  page.drawText(toThaiNumerals(app.address?.postal_code) || '-', {
    x: zipX + 6,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, zipX, curY - 2, zipX + zipW);

  const telLabelX = zipX + zipW + 14;
  page.drawText('หมายเลขโทรศัพท์', { x: telLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const telX = telLabelX + 88;
  page.drawText(toThaiNumerals(app.phone) || '-', {
    x: telX + 6,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, telX, curY - 2, marginRight);

  // --- ข้อ ๕ ---
  // ๕. กำลังศึกษาอยู่ในระดับชั้น ... โรงเรียน ...
  curY -= lineSpacing;
  page.drawText('๕.  กำลังศึกษาอยู่ในระดับชั้น', {
    x: marginLeft + 10,
    y: curY,
    size: 15,
    font,
    color: rgb(0, 0, 0),
  });
  const cLevelX = marginLeft + 142;
  const cLevelW = 100;
  page.drawText(app.current_level || '-', {
    x: cLevelX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, cLevelX, curY - 2, cLevelX + cLevelW);

  const schoolLabelX = cLevelX + cLevelW + 8;
  page.drawText('โรงเรียน', { x: schoolLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const schoolX = schoolLabelX + 45;
  page.drawText(app.current_school || '-', {
    x: schoolX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, schoolX, curY - 2, marginRight);

  // ข้อ ๕ บรรทัดที่ ๒: ตั้งอยู่เลขที่ ... ตำบล ... อำเภอ ... จังหวัด ...
  curY -= lineSpacing;
  page.drawText('ตั้งอยู่เลขที่', { x: marginLeft + 35, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const sNoX = marginLeft + 90;
  const sNoW = 45;
  page.drawText(toThaiNumerals(app.current_school_address?.house_no) || '-', {
    x: sNoX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, sNoX, curY - 2, sNoX + sNoW);

  const sSubLabelX = sNoX + sNoW + 8;
  page.drawText('ตำบล', { x: sSubLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const sSubX = sSubLabelX + 30;
  const sSubW = 85;
  page.drawText(app.current_school_address?.subdistrict || '-', {
    x: sSubX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, sSubX, curY - 2, sSubX + sSubW);

  const sDistLabelX = sSubX + sSubW + 8;
  page.drawText('อำเภอ', { x: sDistLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const sDistX = sDistLabelX + 34;
  const sDistW = 85;
  page.drawText(app.current_school_address?.district || '-', {
    x: sDistX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, sDistX, curY - 2, sDistX + sDistW);

  const sProvLabelX = sDistX + sDistW + 8;
  page.drawText('จังหวัด', { x: sProvLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const sProvX = sProvLabelX + 38;
  page.drawText(app.current_school_address?.province || '-', {
    x: sProvX + 3,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, sProvX, curY - 2, marginRight);

  // ข้อ ๕ บรรทัดที่ ๓: ผลการเรียนเฉลี่ยสะสม ... สาขาวิชา ...
  curY -= lineSpacing;
  page.drawText('ผลการเรียนเฉลี่ยสะสม', { x: marginLeft + 35, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const gpaxX = marginLeft + 142;
  const gpaxW = 70;
  page.drawText(toThaiNumerals(app.gpax?.toFixed(2)) || '-', {
    x: gpaxX + 6,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, gpaxX, curY - 2, gpaxX + gpaxW);

  const prevMajorLabelX = gpaxX + gpaxW + 12;
  page.drawText('สาขาวิชา', { x: prevMajorLabelX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const prevMajorX = prevMajorLabelX + 48;
  page.drawText(app.previous_major || '-', {
    x: prevMajorX + 4,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  drawDottedLine(page, prevMajorX, curY - 2, marginRight);

  // --- ข้อ ๖ ---
  // ๖. ต้องการสมัครเข้าเรียน ระดับ ปวส. สาขาวิชา ...
  // ระดับ ปวช. สาขาวิชาลำดับที่ ๑. ...
  // สาขาวิชาลำดับที่ ๒. ...
  curY -= lineSpacing + 2;
  const isPvs = app.level.includes('ปวส');
  const dept1Name = app.dept_1?.name?.replace('แผนกวิชา', '') || '';
  const dept2Name = app.dept_2?.name?.replace('แผนกวิชา', '') || '';

  page.drawText('๖.  ต้องการสมัครเข้าเรียน  ระดับ ปวส.  สาขาวิชา', {
    x: marginLeft + 10,
    y: curY,
    size: 15,
    font,
    color: rgb(0, 0, 0),
  });
  const pvsMajorX = marginLeft + 235;
  if (isPvs) {
    page.drawText(dept1Name, { x: pvsMajorX + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  }
  drawDottedLine(page, pvsMajorX, curY - 2, marginRight);

  curY -= lineSpacing;
  page.drawText('ระดับ ปวช.  สาขาวิชาลำดับที่ ๑.', {
    x: marginLeft + 105,
    y: curY,
    size: 15,
    font,
    color: rgb(0, 0, 0),
  });
  const pvc1X = marginLeft + 245;
  if (!isPvs) {
    page.drawText(dept1Name, { x: pvc1X + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  }
  drawDottedLine(page, pvc1X, curY - 2, marginRight);

  curY -= lineSpacing;
  page.drawText('สาขาวิชาลำดับที่ ๒.', {
    x: marginLeft + 148,
    y: curY,
    size: 15,
    font,
    color: rgb(0, 0, 0),
  });
  const pvc2X = marginLeft + 245;
  if (!isPvs && dept2Name) {
    page.drawText(dept2Name, { x: pvc2X + 5, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  }
  drawDottedLine(page, pvc2X, curY - 2, marginRight);

  // 7. หลักฐานประกอบการสมัคร
  curY -= lineSpacing + 8;
  page.drawText('หลักฐานประกอบการสมัคร', {
    x: marginLeft + 20,
    y: curY,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  const docs = [
    {
      num: '๑.',
      text: 'เอกสารแสดงผลการเรียนเฉลี่ยสะสม ๕ ภาคเรียน  จำนวน ๑ ฉบับ',
      type: 'transcript',
    },
    {
      num: '๒.',
      text: 'สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน  จำนวน ๑ ฉบับ',
      type: 'id_card',
    },
    {
      num: '๓.',
      text: 'สำเนาเกียรติบัตร/ใบรับรองความสามารถพิเศษ/ใบประกาศ (ถ้ามี)',
      type: 'certificate',
    },
  ];

  for (const docItem of docs) {
    curY -= lineSpacing;
    const hasDoc = app.files?.some((f) => f.file_type === docItem.type);

    // checkbox
    page.drawRectangle({
      x: marginLeft + 145,
      y: curY + 2,
      width: 9,
      height: 9,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.8,
      color: hasDoc ? rgb(0, 0, 0) : rgb(1, 1, 1),
    });

    if (hasDoc) {
      page.drawRectangle({
        x: marginLeft + 147,
        y: curY + 4,
        width: 5,
        height: 5,
        color: rgb(1, 1, 1),
      });
      page.drawRectangle({
        x: marginLeft + 148,
        y: curY + 5,
        width: 3,
        height: 3,
        color: rgb(0, 0, 0),
      });
    }

    page.drawText(`${docItem.num} ${docItem.text}`, {
      x: marginLeft + 160,
      y: curY,
      size: 14.5,
      font,
      color: rgb(0, 0, 0),
    });
  }

  // 8. BOTTOM SIGNATURE SECTION
  curY -= lineSpacing + 22;
  const sigX = marginRight - 240;

  page.drawText('ลงชื่อ', { x: sigX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  const sigLineX = sigX + 32;
  const sigLineW = 145;
  drawDottedLine(page, sigLineX, curY - 2, sigLineX + sigLineW);
  page.drawText('ผู้สมัคร', { x: sigLineX + sigLineW + 8, y: curY, size: 15, font, color: rgb(0, 0, 0) });

  curY -= 20;
  const parenText = `( ${app.full_name} )`;
  const pW = font.widthOfTextAtSize(parenText, 14.5);
  page.drawText(parenText, {
    x: sigLineX + (sigLineW - pW) / 2,
    y: curY,
    size: 14.5,
    font,
    color: rgb(0, 0, 0),
  });

  curY -= 20;
  const appDateParts = formatThaiDate(app.created_at, 'parts') as any;
  page.drawText('วันที่', { x: sigX, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  page.drawText(appDateParts.dayThai || '', { x: sigX + 28, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, sigX + 25, curY - 2, sigX + 55);

  page.drawText('เดือน', { x: sigX + 60, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  page.drawText(appDateParts.month || '', { x: sigX + 90, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, sigX + 88, curY - 2, sigX + 155);

  page.drawText('พ.ศ.', { x: sigX + 160, y: curY, size: 15, font, color: rgb(0, 0, 0) });
  page.drawText(appDateParts.yearThai || '', { x: sigX + 188, y: curY, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  drawDottedLine(page, sigX + 185, curY - 2, sigX + 235);

  return doc.save();
}

/**
 * Generate Batch Merged PDF of multiple applications
 */
export async function generateBatchApplicationsPdf(applications: Application[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const app of applications) {
    const singlePdfBytes = await generateApplicationPdf(app);
    const singleDoc = await PDFDocument.load(singlePdfBytes);
    const [page] = await mergedDoc.copyPages(singleDoc, [0]);
    mergedDoc.addPage(page);
  }

  return mergedDoc.save();
}

/**
 * Generate Enrollment PDF (ใบมอบตัวนักศึกษาใหม่)
 */
export async function generateEnrollmentPdf(app: Application): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const { regular, bold } = getFontBytes();
  const font = await doc.embedFont(regular);
  const fontBold = await doc.embedFont(bold);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const marginLeft = 55;
  const marginRight = width - 55;

  // Logo
  const logoPath = path.join(process.cwd(), 'public/logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImg = await doc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: marginLeft,
        y: height - 105,
        width: 65,
        height: 65,
      });
    } catch (e) {}
  }

  // Header
  const title1 = 'ใบมอบตัวนักเรียน / นักศึกษาใหม่ รอบโควตาพิเศษ';
  const title2 = 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา ๒๕๗๐';

  page.drawText(title1, {
    x: (width - fontBold.widthOfTextAtSize(title1, 17)) / 2,
    y: height - 65,
    size: 17,
    font: fontBold,
    color: rgb(0.05, 0.16, 0.44),
  });

  page.drawText(title2, {
    x: (width - fontBold.widthOfTextAtSize(title2, 15)) / 2,
    y: height - 88,
    size: 15,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // Student Code Box
  const enrollment = app.enrollment;
  const stdCode = enrollment?.student_code || 'รหัสรอการอนุมัติ';
  page.drawRectangle({
    x: marginRight - 180,
    y: height - 145,
    width: 180,
    height: 40,
    borderColor: rgb(0.05, 0.16, 0.44),
    borderWidth: 1.5,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawText('รหัสประจำตัวนักศึกษา', {
    x: marginRight - 170,
    y: height - 122,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(toThaiNumerals(stdCode), {
    x: marginRight - 170,
    y: height - 140,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.16, 0.44),
  });

  let y = height - 180;
  const lineSpacing = 28;

  // Student Details
  page.drawText(`ข้าพเจ้า (นักเรียน/นักศึกษา)  ${app.full_name}`, { x: marginLeft, y, size: 15, font: fontBold, color: rgb(0, 0, 0) });
  page.drawText(`เลขบัตรประชาชน ${toThaiNumerals(app.national_id)}`, { x: marginLeft + 280, y, size: 15, font, color: rgb(0, 0, 0) });

  y -= lineSpacing;
  page.drawText(`เข้าศึกษาต่อใน ${app.level}  สาขาวิชา ${app.dept_1?.name || ''}`, { x: marginLeft, y, size: 15, font, color: rgb(0, 0, 0) });

  y -= lineSpacing;
  page.drawText(`โดยมีผู้ปกครองชื่อ  ${enrollment?.guardian_name || app.father_name || '-'}`, { x: marginLeft, y, size: 15, font, color: rgb(0, 0, 0) });
  page.drawText(`ความเกี่ยวข้องเป็น  ${enrollment?.guardian_relation || 'บิดา'}`, { x: marginLeft + 280, y, size: 15, font, color: rgb(0, 0, 0) });

  y -= lineSpacing;
  page.drawText(`หมายเลขโทรศัพท์ผู้ปกครอง  ${toThaiNumerals(enrollment?.guardian_phone || app.phone)}`, { x: marginLeft, y, size: 15, font, color: rgb(0, 0, 0) });

  y -= lineSpacing + 10;
  page.drawText('คำมั่นสัญญาและข้อตกลงในการมอบตัว:', { x: marginLeft, y, size: 15, font: fontBold, color: rgb(0, 0, 0) });

  const agreements = [
    '๑. ข้าพเจ้าและผู้ปกครองยินยอมปฏิบัติตามระเบียบ วินัย และข้อบังคับของวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ทุกประการ',
    '๒. ข้าพเจ้าจะตั้งใจศึกษาเล่าเรียน เข้าร่วมกิจกรรมของวิทยาลัย และไม่ประพฤติตนเสื่อมเสียชื่อเสียงของสถานศึกษา',
    '๓. หากข้าพเจ้าฝ่าฝืนระเบียบวินัย ยินยอมให้ทางวิทยาลัยฯ ดำเนินการตามระเบียบงานปกครองต่อไป',
  ];

  for (const agr of agreements) {
    y -= lineSpacing - 4;
    page.drawText(agr, { x: marginLeft + 15, y, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
  }

  // Signatures
  y -= lineSpacing + 40;
  const leftSigX = marginLeft + 30;
  const rightSigX = marginRight - 220;

  // Student signature
  page.drawText('ลงชื่อ .......................................... ผู้มอบตัว (นักศึกษา)', { x: leftSigX, y, size: 14.5, font, color: rgb(0, 0, 0) });
  page.drawText(`( ${app.full_name} )`, { x: leftSigX + 35, y: y - 20, size: 14, font, color: rgb(0, 0, 0) });

  // Guardian signature
  page.drawText('ลงชื่อ .......................................... ผู้ปกครอง', { x: rightSigX, y, size: 14.5, font, color: rgb(0, 0, 0) });
  page.drawText(`( ${enrollment?.guardian_name || app.father_name || '..........................................'} )`, { x: rightSigX + 30, y: y - 20, size: 14, font, color: rgb(0, 0, 0) });

  y -= 60;
  // Witness signature
  page.drawText('ลงชื่อ .......................................... พยาน/นายทะเบียน', { x: rightSigX, y, size: 14.5, font, color: rgb(0, 0, 0) });
  page.drawText(`( ${enrollment?.witness_name || 'อาจารย์สมศักดิ์ มั่นคง'} )`, { x: rightSigX + 25, y: y - 20, size: 14, font, color: rgb(0, 0, 0) });

  // Date
  y -= 45;
  const enrollDate = enrollment?.enrollment_date || new Date().toISOString();
  const dParts = formatThaiDate(enrollDate, 'parts') as any;
  page.drawText(`บันทึกมอบตัว ณ วันที่ ${dParts.dayThai} เดือน ${dParts.month} พ.ศ. ${dParts.yearThai}`, {
    x: (width - font.widthOfTextAtSize(`บันทึกมอบตัว ณ วันที่ ${dParts.dayThai} เดือน ${dParts.month} พ.ศ. ${dParts.yearThai}`, 14)) / 2,
    y,
    size: 14,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  return doc.save();
}
