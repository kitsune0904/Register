const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function testPdf() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync(path.join(__dirname, '../public/fonts/THSarabunNew.ttf'));
  const fontBoldBytes = fs.readFileSync(path.join(__dirname, '../public/fonts/THSarabunNew-Bold.ttf'));

  const sarabun = await doc.embedFont(fontBytes);
  const sarabunBold = await doc.embedFont(fontBoldBytes);

  const page = doc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  // Draw logo
  const logoPath = path.join(__dirname, '../public/logo.png');
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await doc.embedPng(logoBytes);
    page.drawImage(logoImage, {
      x: 45,
      y: height - 105,
      width: 65,
      height: 65,
    });
  }

  // Draw QR Code
  const qrDataUrl = await QRCode.toBuffer('70-0001');
  const qrImage = await doc.embedPng(qrDataUrl);
  page.drawImage(qrImage, {
    x: 48,
    y: height - 155,
    width: 48,
    height: 48,
  });

  // Header Title
  const title1 = 'ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)';
  const title2 = 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา ๒๕๗๐';

  const t1Width = sarabunBold.widthOfTextAtSize(title1, 16);
  const t2Width = sarabunBold.widthOfTextAtSize(title2, 16);

  page.drawText(title1, {
    x: (width - t1Width) / 2,
    y: height - 60,
    size: 16,
    font: sarabunBold,
    color: rgb(0, 0, 0),
  });

  page.drawText(title2, {
    x: (width - t2Width) / 2,
    y: height - 82,
    size: 16,
    font: sarabunBold,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await doc.save();
  const outPath = path.join(__dirname, 'test-output.pdf');
  fs.writeFileSync(outPath, pdfBytes);
  console.log('Successfully created test PDF at:', outPath);
}

testPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
