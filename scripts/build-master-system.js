const fs = require('fs');
const path = require('path');

console.log('Loading extracted pages...');
const extracted = JSON.parse(fs.readFileSync('extracted_pages.json', 'utf8'));
const {
  home,
  apply,
  status,
  adminLogin,
  adminDashboard,
  header,
  footer,
  logoDataUri,
  css
} = extracted;

const addressData = JSON.parse(fs.readFileSync('src/data/thai-address.json', 'utf8'));
const clientJs = fs.readFileSync('scripts/client-app.js', 'utf8');

const departments = [
  { id: '101', code: 101, name: 'แผนกวิชาไฟฟ้ากำลัง', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '102', code: 102, name: 'แผนกวิชาเทคโนโลยีอิเล็กทรอนิกส์', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '103', code: 103, name: 'แผนกวิชาช่างกลโรงงานและสาขาวิชาเทคนิคการผลิต', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '104', code: 104, name: 'แผนกวิชาช่างซ่อมบำรุงเครื่องจักรกลและแผนกวิชาเทคนิคอุตสาหกรรม', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '105', code: 105, name: 'แผนกวิชาช่างเชื่อมโลหะ', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '106', code: 106, name: 'แผนกวิชาเทคโนโลยีสารสนเทศ (รวมถึงระดับ ปวส. สาขางานเทคโนโลยีสารสนเทศ)', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '107', code: 107, name: 'แผนกวิชาเทคนิคพื้นฐาน', levels: ['ระดับ ปวช.'] },
  { id: '108', code: 108, name: 'แผนกวิชาการบัญชี', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '109', code: 109, name: 'แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '110', code: 110, name: 'แผนกวิชาการตลาด', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '111', code: 111, name: 'แผนกวิชายานยนต์และแผนกวิชายานยนต์ไฟฟ้า', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '112', code: 112, name: 'แผนกวิชาเทคโนโลยีคอมพิวเตอร์', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] },
  { id: '113', code: 113, name: 'แผนกวิชาเมคคาทรอนิกส์และหุ่นยนต์', levels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)'] }
];

const seedApplicants = [
  {
    id: "APP-001",
    application_no: "70-0001",
    national_id: "1100400123451",
    full_name: "นายสมชาย ใจดี",
    birth_date: "2010-05-14",
    birth_day: "14", birth_month: "05", birth_year: "2553",
    level: "ระดับ ปวช.",
    dept_1: "แผนกวิชาไฟฟ้ากำลัง",
    dept_2: "แผนกวิชาเทคโนโลยีอิเล็กทรอนิกส์",
    status: "passed",
    status_label: "ผ่านการคัดเลือก",
    gpax: 3.42,
    phone: "0812345678",
    school_name: "โรงเรียนบ้านหมอ 'พัฒนานุกูล'",
    school_province: "สระบุรี",
    father_name: "นายประเสริฐ ใจดี", father_age: 50, father_occupation: "เกษตรกร",
    mother_name: "นางสมศรี ใจดี", mother_age: 48, mother_occupation: "ค้าขาย",
    address: { house_no: "123", moo: "4", soi: "-", road: "-", subdistrict: "บ้านหมอ", district: "บ้านหมอ", province: "สระบุรี", zip: "18130" },
    applied_date: "2026-11-01",
    remarks: "ผ่านเกณฑ์การคัดเลือกโควตา พร้อมรายงานตัวและพิมพ์ใบมอบตัว",
    student_id: ""
  },
  {
    id: "APP-002",
    application_no: "70-0002",
    national_id: "1100400123452",
    full_name: "นางสาวกานดา ศรีสุข",
    birth_date: "2008-08-20",
    birth_day: "20", birth_month: "08", birth_year: "2551",
    level: "ระดับ ปวส. (สายตรง)",
    dept_1: "แผนกวิชาไฟฟ้ากำลัง",
    dept_2: "",
    status: "enrolled",
    status_label: "มอบตัวแล้ว",
    gpax: 3.55,
    phone: "0898765432",
    school_name: "วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์",
    school_province: "สระบุรี",
    father_name: "นายอดิศร ศรีสุข", father_age: 47, father_occupation: "พนักงานบริษัท",
    mother_name: "นางวรรณา ศรีสุข", mother_age: 45, mother_occupation: "พนักงานบริษัท",
    address: { house_no: "45/2", moo: "8", soi: "-", road: "-", subdistrict: "บ้านครัว", district: "บ้านหมอ", province: "สระบุรี", zip: "18270" },
    applied_date: "2026-11-02",
    remarks: "มอบตัวเรียบร้อย ออกรหัสนักศึกษาแล้ว",
    student_id: "70301010001"
  },
  {
    id: "APP-003",
    application_no: "70-0003",
    national_id: "1100400123453",
    full_name: "นายธีรภัทร วงศ์ษา",
    birth_date: "2010-11-03",
    birth_day: "03", birth_month: "11", birth_year: "2553",
    level: "ระดับ ปวช.",
    dept_1: "แผนกวิชาเทคโนโลยีสารสนเทศ (รวมถึงระดับ ปวส. สาขางานเทคโนโลยีสารสนเทศ)",
    dept_2: "แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
    status: "pending",
    status_label: "รอตรวจสอบ",
    gpax: 3.60,
    phone: "0823456789",
    school_name: "โรงเรียนสระบุรีวิทยาคม",
    school_province: "สระบุรี",
    father_name: "นายมนัส วงศ์ษา", father_age: 52, father_occupation: "รับจ้าง",
    mother_name: "นางวิภา วงศ์ษา", mother_age: 49, mother_occupation: "แม่บ้าน",
    address: { house_no: "78", moo: "2", soi: "-", road: "-", subdistrict: "ปากเพรียว", district: "เมืองสระบุรี", province: "สระบุรี", zip: "18000" },
    applied_date: "2026-11-03",
    remarks: "รอเจ้าหน้าที่ตรวจสอบความถูกต้องของเอกสารแนบ",
    student_id: ""
  },
  {
    id: "APP-004",
    application_no: "70-0004",
    national_id: "1100400123454",
    full_name: "นายวีรชัย มั่นคง",
    birth_date: "2010-02-17",
    birth_day: "17", birth_month: "02", birth_year: "2553",
    level: "ระดับ ปวช.",
    dept_1: "แผนกวิชาช่างเชื่อมโลหะ",
    dept_2: "แผนกวิชาช่างกลโรงงานและสาขาวิชาเทคนิคการผลิต",
    status: "incomplete",
    status_label: "เอกสารไม่ครบ / ให้ส่งแก้ไข",
    gpax: 2.75,
    phone: "0834567890",
    school_name: "โรงเรียนเสาไห้ วิมลวิทยานุกูล",
    school_province: "สระบุรี",
    father_name: "นายสุวิทย์ มั่นคง", father_age: 46, father_occupation: "ช่างซ่อม",
    mother_name: "นางพรทิพย์ มั่นคง", mother_age: 43, mother_occupation: "รับจ้าง",
    address: { house_no: "12", moo: "5", soi: "-", road: "-", subdistrict: "เสาไห้", district: "เสาไห้", province: "สระบุรี", zip: "18160" },
    applied_date: "2026-11-04",
    remarks: "สำเนาแสดงผลการเรียน 5 ภาคเรียนไม่ชัดเจน กรุณาถ่ายภาพหรือสแกนใหม่ให้เห็นเกรดสะสมชัดเจน",
    student_id: ""
  }
];

// Clean Header
let cleanHeader = header
  .replace(/href="\/"/g, 'href="#" onclick="showView(\'home\'); return false;"')
  .replace(/href="\/apply"/g, 'href="#" onclick="showView(\'apply\'); return false;"')
  .replace(/href="\/status"/g, 'href="#" onclick="showView(\'status\'); return false;"')
  .replace(/href="\/admin\/login"/g, 'href="#" onclick="showView(\'admin-login\'); return false;"')
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"');

// Clean Footer
let cleanFooter = footer
  .replace(/href="\/"/g, 'href="#" onclick="showView(\'home\'); return false;"')
  .replace(/href="\/apply"/g, 'href="#" onclick="showView(\'apply\'); return false;"')
  .replace(/href="\/status"/g, 'href="#" onclick="showView(\'status\'); return false;"')
  .replace(/href="\/admin\/login"/g, 'href="#" onclick="showView(\'admin-login\'); return false;"')
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"');

// Clean Home Main
let cleanHomeMain = home
  .replace(/href="\/apply"/g, 'href="#" onclick="showView(\'apply\'); return false;"')
  .replace(/href="\/status"/g, 'href="#" onclick="showView(\'status\'); return false;"')
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"');

// Clean Admin Login Main
let cleanAdminLoginMain = adminLogin
  .replace(/href="\/"/g, 'href="#" onclick="showView(\'home\'); return false;"')
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"')
  .replace('<form class="space-y-4">', '<form class="space-y-4" onsubmit="handleAdminLoginSubmit(event)"><div id="adminLoginErrMsg" class="p-3 rounded-xl bg-crimson-500/20 border border-crimson-400/30 text-crimson-200 text-xs hidden"></div>')
  .replace('value="11999"', 'id="adminLoginInputId" value="11999"')
  .replace('value="090450"', 'id="adminLoginInputPass" value="090450"')
  .replace('<button type="button" class="px-3 py-1 rounded-lg bg-gold-500/20', '<button type="button" onclick="fillAdminLogin(\'11999\', \'090450\')" class="px-3 py-1 rounded-lg bg-gold-500/20');

// Clean Status Main
let cleanStatusMain = status
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"')
  .replace('<form class="space-y-5">', '<form class="space-y-5" onsubmit="handleStatusSearchSubmit(event)">')
  .replace('class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none" value=""', 'id="statusInputCid" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none" placeholder="เช่น 1100400123451"')
  .replace('<select class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">วันที่</option>', '<select id="statusSelDay" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">วันที่</option>')
  .replace('<select class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">เดือน</option>', '<select id="statusSelMonth" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">เดือน</option>')
  .replace('<select class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">พ.ศ.</option>', '<select id="statusSelYear" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"><option value="" selected="">พ.ศ.</option>')
  .replace('<button type="button" class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">ผ่านคัดเลือก (ปวช.)</button>', '<button type="button" onclick="presetStatusSearch(\'1100400123451\', \'14\', \'05\', \'2553\')" class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">ผ่านคัดเลือก (ปวช.)</button>')
  .replace('<button type="button" class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">มอบตัวแล้ว (ปวส.)</button>', '<button type="button" onclick="presetStatusSearch(\'1100400123452\', \'20\', \'08\', \'2551\')" class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">มอบตัวแล้ว (ปวส.)</button>')
  .replace('<button type="button" class="px-2.5 py-1 rounded-lg bg-crimson-50 text-crimson-700 hover:bg-crimson-100 border border-crimson-200">เอกสารไม่ครบ (ต้องแก้ไข)</button>', '<button type="button" onclick="presetStatusSearch(\'1100400123454\', \'17\', \'02\', \'2553\')" class="px-2.5 py-1 rounded-lg bg-crimson-50 text-crimson-700 hover:bg-crimson-100 border border-crimson-200">เอกสารไม่ครบ (ต้องแก้ไข)</button>')
  .replace('</div></div></div></main>', '<div id="statusResultBox" class="mt-8 space-y-6"></div></div></div></div></main>');

// Clean Admin Dashboard Sidebar & Header
let cleanAdminDashboard = adminDashboard
  .replace(/src="\/logo\.png"/g, 'src="' + logoDataUri + '"')
  .replace(/href="\/admin"/g, 'href="#" onclick="switchAdminTab(\'dashboard\'); return false;"')
  .replace(/href="\/admin\/applications"/g, 'href="#" onclick="switchAdminTab(\'applications\'); return false;"')
  .replace(/href="\/admin\/walk-in"/g, 'href="#" onclick="openWalkInModal(); return false;"')
  .replace(/href="\/admin\/enrollment"/g, 'href="#" onclick="filterAdminTableByStatus(\'enrolled\'); return false;"')
  .replace(/href="\/admin\/export"/g, 'href="#" onclick="exportAdminDataExcel(); return false;"')
  .replace(/href="\/admin\/settings"/g, 'href="#" onclick="alert(\'ระบบตั้งค่า: สำนักงาน สอศ. เปิดรับสมัคร ๑ พ.ย. - ๒๘ ก.พ. ๒๕๗๐\'); return false;"')
  .replace(/href="\/" target="_blank"/g, 'href="#" onclick="showView(\'home\'); return false;"')
  .replace('<div class="flex items-center gap-3"><button class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">', '<div class="flex items-center gap-3"><span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-400/30">Super Admin (11999)</span><button type="button" onclick="adminLogout()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-crimson-50 hover:text-crimson-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">ออกจากระบบ</button><button type="button" onclick="toggleThemeMode()" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">');

const adminLoadingHtml = `<div class="flex-1 flex items-center justify-center min-h-[400px]"><div class="text-center space-y-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-8 h-8 text-navy-900 dark:text-navy-400 animate-spin mx-auto" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg><p class="text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลสถิติแบบเรียลไทม์...</p></div></div>`;

const adminRealContent = `
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Top Filter & Controls -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">สถานะเรียลไทม์ (Live Sync)</span>
        </div>
        <h2 class="font-heading font-black text-xl text-navy-900 dark:text-white mt-1">แดชบอร์ดสรุปสถิติผู้สมัครโควตา ปีการศึกษา ๒๕๗๐</h2>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <select id="adminLevelFilter" onchange="filterAdminByLevel(this.value)" class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none">
          <option value="all">ทุกระดับการศึกษา</option>
          <option value="ระดับ ปวช.">ระดับ ปวช.</option>
          <option value="ระดับ ปวส. (สายตรง)">ระดับ ปวส. (สายตรง)</option>
          <option value="ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)">ระดับ ปวส. (ต่างสาขา)</option>
        </select>
        <button type="button" onclick="exportAdminDataExcel()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>ส่งออก Excel</span>
        </button>
      </div>
    </div>

    <!-- 1. 5 KPI CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="p-5 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 text-white shadow-lg shadow-black/5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold opacity-90">ผู้สมัครทั้งหมด</span>
          <div class="p-2 rounded-xl bg-white/20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
        </div>
        <div><span id="kpiTotal" class="font-heading font-black text-3xl sm:text-4xl tracking-tight">4</span><span class="text-[11px] block opacity-80 mt-1">รอบโควตา ๒๕๗๐</span></div>
      </div>

      <div class="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-black/5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold opacity-90">รอตรวจสอบเอกสาร</span>
          <div class="p-2 rounded-xl bg-white/20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
        </div>
        <div><span id="kpiPending" class="font-heading font-black text-3xl sm:text-4xl tracking-tight">1</span><span class="text-[11px] block opacity-80 mt-1">อยู่ระหว่างตรวจคุณสมบัติ</span></div>
      </div>

      <div class="p-5 rounded-3xl bg-gradient-to-br from-crimson-600 to-crimson-700 text-white shadow-lg shadow-black/5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold opacity-90">เอกสารไม่ครบ / ซ่อม</span>
          <div class="p-2 rounded-xl bg-white/20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
        </div>
        <div><span id="kpiIncomplete" class="font-heading font-black text-3xl sm:text-4xl tracking-tight">1</span><span class="text-[11px] block opacity-80 mt-1">ส่งแจ้งให้ผู้สมัครแก้ไข</span></div>
      </div>

      <div class="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-black/5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold opacity-90">ผ่านการคัดเลือก</span>
          <div class="p-2 rounded-xl bg-white/20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
        </div>
        <div><span id="kpiPassed" class="font-heading font-black text-3xl sm:text-4xl tracking-tight">1</span><span class="text-[11px] block opacity-80 mt-1">พร้อมพิมพ์ใบรายงานตัว</span></div>
      </div>

      <div class="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-black/5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold opacity-90">มอบตัวเรียบร้อย</span>
          <div class="p-2 rounded-xl bg-white/20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
        </div>
        <div><span id="kpiEnrolled" class="font-heading font-black text-3xl sm:text-4xl tracking-tight">1</span><span class="text-[11px] block opacity-80 mt-1">ออกรหัสนักศึกษาแล้ว</span></div>
      </div>
    </div>

    <!-- 2. CHARTS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>จำนวนผู้สมัครแยกตามแผนกวิชา (๑๓ แผนก)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">เรียงตามจำนวนความสนใจของผู้สมัครรอบโควตา</p>
          </div>
          <span class="text-xs font-bold text-navy-700 dark:text-gold-400 bg-navy-50 dark:bg-slate-800 px-3 py-1 rounded-xl">13 Departments</span>
        </div>
        <div class="h-[380px] w-full pt-2">
          <canvas id="deptBarChart"></canvas>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <h3 class="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
            <span>สัดส่วนแยกตามระดับการศึกษา</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">ปวช. / ปวส. สายตรง / ปวส. ต่างสาขา</p>
        </div>
        <div class="h-[250px] w-full flex items-center justify-center">
          <canvas id="levelDonutChart"></canvas>
        </div>
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#0B2A6F]"></span><span>ระดับ ปวช.</span></div>
            <span id="txtLevelPvc" class="font-bold">3 คน</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#F5B400]"></span><span>ระดับ ปวส. (สายตรง)</span></div>
            <span id="txtLevelPvsDirect" class="font-bold">1 คน</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#D91E18]"></span><span>ระดับ ปวส. (ต่างสาขา)</span></div>
            <span id="txtLevelPvsCross" class="font-bold">0 คน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. APPLICATIONS TABLE -->
    <div id="adminAppsSection" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-heading font-black text-lg text-navy-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>รายชื่อผู้สมัครรับการคัดเลือก</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">จัดการสถานะ อนุมัติ ส่งซ่อมเอกสาร และออกรหัสนักศึกษา</p>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <input type="text" id="adminSearchInput" oninput="renderAdminTable()" placeholder="ค้นหาชื่อ, เลขบัตร, เลขที่สมัคร..." class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-full sm:w-64 focus:ring-2 focus:ring-navy-600 focus:outline-none">
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
        <button type="button" onclick="setAdminTableTab('all')" id="tabBtn-all" class="px-3 py-1.5 rounded-xl font-bold bg-navy-900 text-white shadow-sm">ทั้งหมด (4)</button>
        <button type="button" onclick="setAdminTableTab('pending')" id="tabBtn-pending" class="px-3 py-1.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">รอตรวจสอบ (1)</button>
        <button type="button" onclick="setAdminTableTab('incomplete')" id="tabBtn-incomplete" class="px-3 py-1.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">เอกสารไม่ครบ (1)</button>
        <button type="button" onclick="setAdminTableTab('passed')" id="tabBtn-passed" class="px-3 py-1.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">ผ่านการคัดเลือก (1)</button>
        <button type="button" onclick="setAdminTableTab('enrolled')" id="tabBtn-enrolled" class="px-3 py-1.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">มอบตัวแล้ว (1)</button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
              <th class="py-3 px-3">เลขที่สมัคร</th>
              <th class="py-3 px-3">ชื่อ-สกุล</th>
              <th class="py-3 px-3">ระดับชั้น</th>
              <th class="py-3 px-3">แผนกวิชาที่สมัคร</th>
              <th class="py-3 px-3 text-center">GPAX</th>
              <th class="py-3 px-3 text-center">สถานะ</th>
              <th class="py-3 px-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody id="adminTableBody" class="divide-y divide-slate-100 dark:divide-slate-800">
            <!-- Dynamic Rows -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

cleanAdminDashboard = cleanAdminDashboard.replace(adminLoadingHtml, adminRealContent);

// Construct Apply Stepper Form
const applyStepperFormHtml = `
  <div class="flex-1 py-10 px-4 sm:px-6">
    <div class="container mx-auto">
      <div class="max-w-4xl mx-auto text-center space-y-3 mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-700 dark:text-crimson-300 text-xs font-semibold">
          <span>แบบฟอร์มรับสมัครรอบโควตา ปีการศึกษา ๒๕๗๐</span>
        </div>
        <h1 class="font-heading font-black text-2xl sm:text-4xl text-navy-900 dark:text-white">
          ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ • กรอกข้อมูลให้ครบถ้วนตามแบบฟอร์มจริง
        </p>
      </div>

      <div class="w-full max-w-4xl mx-auto space-y-8">
        <!-- 6 Step Icons Progress -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <div class="hidden md:flex items-center justify-between relative mb-6">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
            <div id="stepLineProgress" class="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-navy-900 to-crimson-600 -translate-y-1/2 z-0 transition-all duration-500" style="width: 0%;"></div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(1)" id="stepIcon1" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-navy-900 text-white ring-4 ring-navy-600/20 shadow-lg scale-105 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </button>
              <span id="stepText1" class="mt-2 text-xs font-semibold tracking-tight text-navy-900 dark:text-white">ระดับ & ข้อมูลผู้สมัคร</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(2)" id="stepIcon2" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </button>
              <span id="stepText2" class="mt-2 text-xs font-semibold tracking-tight text-slate-400">ข้อมูลบิดา-มารดา</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(3)" id="stepIcon3" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
              <span id="stepText3" class="mt-2 text-xs font-semibold tracking-tight text-slate-400">ที่อยู่ & การติดต่อ</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(4)" id="stepIcon4" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
              </button>
              <span id="stepText4" class="mt-2 text-xs font-semibold tracking-tight text-slate-400">สถานศึกษา & สาขาวิชา</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(5)" id="stepIcon5" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              </button>
              <span id="stepText5" class="mt-2 text-xs font-semibold tracking-tight text-slate-400">แนบเอกสารหลักฐาน</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <button type="button" onclick="goToStep(6)" id="stepIcon6" class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>
              <span id="stepText6" class="mt-2 text-xs font-semibold tracking-tight text-slate-400">ตรวจทาน & ยืนยัน</span>
            </div>
          </div>
        </div>

        <!-- Form Card Container -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
          <form id="mainStepperForm" onsubmit="event.preventDefault(); nextStep();">
            
            <!-- STEP 1: LEVEL & PERSONAL INFO -->
            <div id="stepSection1" class="space-y-6">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  <span>เลือกระดับชั้นที่ต้องการสมัคร</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">กรุณาเลือกระดับชั้นและกรอกข้อมูลส่วนตัวของผู้สมัครให้ถูกต้องตรงตามบัตรประชาชน</p>
              </div>

              <!-- 3 Level Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label id="lvlCardPvc" class="p-4 rounded-2xl border-2 border-navy-900 bg-navy-50/60 dark:bg-slate-800 shadow-md cursor-pointer transition-all flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-heading font-bold text-sm text-slate-900 dark:text-white">ระดับ ปวช.</span>
                    <input type="radio" name="rdoLevel" value="ระดับ ปวช." checked class="w-4 h-4 text-navy-900" onchange="changeLevel(this.value)">
                  </div>
                  <span class="text-xs text-slate-500">รับผู้จบ ม.3 หรือเทียบเท่า</span>
                </label>

                <label id="lvlCardPvsDirect" class="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-heading font-bold text-sm text-slate-900 dark:text-white">ระดับ ปวส. (สายตรง)</span>
                    <input type="radio" name="rdoLevel" value="ระดับ ปวส. (สายตรง)" class="w-4 h-4 text-navy-900" onchange="changeLevel(this.value)">
                  </div>
                  <span class="text-xs text-slate-500">รับผู้จบ ปวช. สาขาตรง</span>
                </label>

                <label id="lvlCardPvsCross" class="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-heading font-bold text-sm text-slate-900 dark:text-white">ระดับ ปวส. (ม.6/ต่างสาขา)</span>
                    <input type="radio" name="rdoLevel" value="ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)" class="w-4 h-4 text-navy-900" onchange="changeLevel(this.value)">
                  </div>
                  <span class="text-xs text-slate-500">รับผู้จบ ม.6 หรือ ปวช. คนละสาขา</span>
                </label>
              </div>

              <!-- Personal Info -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 class="font-heading font-bold text-base text-slate-800 dark:text-white">ข้อ ๑. ข้อมูลส่วนตัวผู้สมัคร</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อ นามสกุล (มีคำนำหน้า เช่น นาย/นางสาว) <span class="text-crimson-600">*</span></label>
                    <input type="text" id="inpFullName" required placeholder="เช่น นายธนวัฒน์ พัฒนชัย" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none">
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">เลขประจำตัวประชาชน 13 หลัก <span class="text-crimson-600">*</span></label>
                    <input type="text" id="inpNationalId" maxlength="13" required placeholder="เลขบัตร 13 หลัก ไม่ต้องใส่ขีด" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none" oninput="validateCitizenIdLive(this.value)">
                    <span id="cidCheckMsg" class="text-[11px] block mt-1"></span>
                  </div>

                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">วัน/เดือน/ปีเกิด (พ.ศ.) <span class="text-crimson-600">*</span></label>
                    <div class="grid grid-cols-3 gap-3">
                      <select id="selBirthDay" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600"></select>
                      <select id="selBirthMonth" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600"></select>
                      <select id="selBirthYear" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600"></select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: PARENTS -->
            <div id="stepSection2" class="space-y-6 hidden">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span>ข้อมูลบิดา - มารดา</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">กรอกข้อมูลผู้ให้กำเนิดเพื่อใช้เป็นประวัติระเบียนนักศึกษา</p>
              </div>

              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-4">
                <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-navy-600"></span>
                  <span>ข้อ ๒. ชื่อ-สกุลบิดา</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อ-สกุล บิดา</label>
                    <input type="text" id="inpFatherName" placeholder="เช่น นายสมเกียรติ พัฒนชัย" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">อายุ (ปี)</label>
                    <input type="number" id="inpFatherAge" placeholder="เช่น 48" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="sm:col-span-3 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">อาชีพ บิดา</label>
                    <input type="text" id="inpFatherOcc" placeholder="เช่น พนักงานโรงงาน / ธุรกิจส่วนตัว / รับราชการ" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-4">
                <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-crimson-600"></span>
                  <span>ข้อ ๓. ชื่อ-สกุลมารดา</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อ-สกุล มารดา</label>
                    <input type="text" id="inpMotherName" placeholder="เช่น นางวิภาดา พัฒนชัย" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">อายุ (ปี)</label>
                    <input type="number" id="inpMotherAge" placeholder="เช่น 45" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="sm:col-span-3 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">อาชีพ มารดา</label>
                    <input type="text" id="inpMotherOcc" placeholder="เช่น ค้าขาย / แม่บ้าน / พนักงานบริษัท" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: ADDRESS -->
            <div id="stepSection3" class="space-y-6 hidden">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>ข้อ ๔. ที่อยู่ปัจจุบันที่สามารถติดต่อได้</span>
                </h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">บ้านเลขที่ <span class="text-crimson-600">*</span></label>
                  <input type="text" id="inpHouseNo" required placeholder="เช่น 120/4" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">หมู่ที่</label>
                  <input type="text" id="inpMoo" placeholder="เช่น 2" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ซอย</label>
                  <input type="text" id="inpSoi" placeholder="เช่น ซอย 4 หรือ -" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ถนน</label>
                  <input type="text" id="inpRoad" placeholder="เช่น ท่าลาน-บ้านหมอ" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด <span class="text-crimson-600">*</span></label>
                  <select id="selProvince" required class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" onchange="onProvinceChanged(this.value)"></select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต <span class="text-crimson-600">*</span></label>
                  <select id="selDistrict" required class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" onchange="onDistrictChanged(this.value)"></select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง <span class="text-crimson-600">*</span></label>
                  <select id="selSubdistrict" required class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" onchange="onSubdistrictChanged(this.value)"></select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">รหัสไปรษณีย์</label>
                  <input type="text" id="inpZip" readonly class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm font-mono">
                </div>
              </div>

              <div class="space-y-1.5 max-w-sm">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">หมายเลขโทรศัพท์ที่ติดต่อได้ (10 หลัก) <span class="text-crimson-600">*</span></label>
                <input type="tel" id="inpPhone" maxlength="10" required placeholder="เช่น 0812345678" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider">
              </div>
            </div>

            <!-- STEP 4: SCHOOL & MAJORS -->
            <div id="stepSection4" class="space-y-6 hidden">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  <span>สถานศึกษาปัจจุบัน & สาขาวิชาที่ต้องการสมัคร</span>
                </h2>
              </div>

              <div class="space-y-4">
                <h3 class="font-heading font-bold text-base text-slate-800 dark:text-white">ข้อ ๕. ข้อมูลสถานศึกษาเดิม</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">กำลังศึกษาอยู่ในระดับชั้น <span class="text-crimson-600">*</span></label>
                    <select id="selCurrentLevel" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                      <option value="มัธยมศึกษาปีที่ 3">มัธยมศึกษาปีที่ 3</option>
                      <option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6</option>
                      <option value="ประกาศนียบัตรวิชาชีพปีที่ 3">ประกาศนียบัตรวิชาชีพปีที่ 3 (ปวช.3)</option>
                      <option value="เทียบเท่า">อื่นๆ / เทียบเท่า</option>
                    </select>
                  </div>
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อโรงเรียน / สถานศึกษาเดิม <span class="text-crimson-600">*</span></label>
                    <input type="text" id="inpSchoolName" required placeholder="เช่น โรงเรียนบ้านหมอ 'พัฒนานุกูล'" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">จังหวัดของโรงเรียน <span class="text-crimson-600">*</span></label>
                    <input type="text" id="inpSchoolProvince" value="สระบุรี" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">เกรดเฉลี่ยสะสม 5 ภาคเรียน (GPAX) <span class="text-crimson-600">*</span></label>
                    <input type="number" id="inpGpax" step="0.01" min="2.00" max="4.00" required placeholder="เช่น 3.45" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono">
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 class="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <span>ข้อ ๖. เลือกสาขาวิชาที่ต้องการสมัคร</span>
                  <span id="txtLevelLabel" class="text-xs text-crimson-600 font-semibold">(ระดับ ปวช.)</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">สาขาวิชาอันดับที่ ๑ (ความประสงค์หลัก) <span class="text-crimson-600">*</span></label>
                    <select id="selDept1" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"></select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">สาขาวิชาอันดับที่ ๒ (สำรอง - ถ้ามี)</label>
                    <select id="selDept2" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"></select>
                  </div>
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">ช่องทางที่ทราบข่าวการรับสมัคร</label>
                    <select id="selReferral" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                      <option value="อาจารย์แนะแนวที่โรงเรียนเดิม">อาจารย์แนะแนวที่โรงเรียนเดิม</option>
                      <option value="Facebook / โซเชียลมีเดียวิทยาลัย">Facebook / โซเชียลมีเดียวิทยาลัย</option>
                      <option value="รุ่นพี่ / ศิษย์เก่าแนะนำ">รุ่นพี่ / ศิษย์เก่าแนะนำ</option>
                      <option value="เว็บไซต์วิทยาลัย (www.tl.ac.th)">เว็บไซต์วิทยาลัย (www.tl.ac.th)</option>
                      <option value="ป้ายประชาสัมพันธ์ / แผ่นพับ">ป้ายประชาสัมพันธ์ / แผ่นพับ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5: DOCUMENTS -->
            <div id="stepSection5" class="space-y-6 hidden">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <span>ข้อ ๗. แนบเอกสารหลักฐานประกอบการสมัคร</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">อัปโหลดไฟล์ภาพถ่ายหรือ PDF ขนาดไฟล์ไม่เกิน 10MB ต่อไฟล์</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-navy-600 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-800 transition-all">
                  <div class="w-10 h-10 rounded-xl bg-navy-100 dark:bg-slate-700 text-navy-900 dark:text-white flex items-center justify-center font-bold">1</div>
                  <span class="text-xs font-bold text-slate-800 dark:text-white">สำเนาบัตรประชาชนผู้สมัคร <span class="text-crimson-600">*</span></span>
                  <span class="text-[11px] text-slate-400">PDF หรือ JPG/PNG ชัดเจน</span>
                  <input type="file" accept="image/*,application/pdf" class="hidden" onchange="handleFileUpload(this, 'บัตรประชาชน')">
                  <span id="docStatus1" class="text-[11px] font-semibold text-emerald-600 hidden">✓ แนบไฟล์แล้ว</span>
                </label>

                <label class="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-navy-600 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-800 transition-all">
                  <div class="w-10 h-10 rounded-xl bg-navy-100 dark:bg-slate-700 text-navy-900 dark:text-white flex items-center justify-center font-bold">2</div>
                  <span class="text-xs font-bold text-slate-800 dark:text-white">สำเนา ปพ.๑ (๕ ภาคเรียน) <span class="text-crimson-600">*</span></span>
                  <span class="text-[11px] text-slate-400">แสดงผลการเรียนและเกรดเฉลี่ย</span>
                  <input type="file" accept="image/*,application/pdf" class="hidden" onchange="handleFileUpload(this, 'ปพ.1')">
                  <span id="docStatus2" class="text-[11px] font-semibold text-emerald-600 hidden">✓ แนบไฟล์แล้ว</span>
                </label>

                <label class="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-navy-600 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-800 transition-all">
                  <div class="w-10 h-10 rounded-xl bg-navy-100 dark:bg-slate-700 text-navy-900 dark:text-white flex items-center justify-center font-bold">3</div>
                  <span class="text-xs font-bold text-slate-800 dark:text-white">สำเนาทะเบียนบ้าน</span>
                  <span class="text-[11px] text-slate-400">หน้าที่มีชื่อผู้สมัคร</span>
                  <input type="file" accept="image/*,application/pdf" class="hidden" onchange="handleFileUpload(this, 'ทะเบียนบ้าน')">
                  <span id="docStatus3" class="text-[11px] font-semibold text-emerald-600 hidden">✓ แนบไฟล์แล้ว</span>
                </label>

                <label class="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-navy-600 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-800 transition-all">
                  <div class="w-10 h-10 rounded-xl bg-navy-100 dark:bg-slate-700 text-navy-900 dark:text-white flex items-center justify-center font-bold">4</div>
                  <span class="text-xs font-bold text-slate-800 dark:text-white">รูปถ่ายหน้าตรงขนาด ๑ นิ้ว</span>
                  <span class="text-[11px] text-slate-400">ชุดนักเรียนหรือสุภาพ</span>
                  <input type="file" accept="image/*" class="hidden" onchange="handleFileUpload(this, 'รูปถ่าย')">
                  <span id="docStatus4" class="text-[11px] font-semibold text-emerald-600 hidden">✓ แนบไฟล์แล้ว</span>
                </label>
              </div>
            </div>

            <!-- STEP 6: REVIEW & SUBMIT -->
            <div id="stepSection6" class="space-y-6 hidden">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>ข้อ ๘. ตรวจทานข้อมูล & ยืนยันการสมัคร</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">โปรดตรวจสอบข้อมูลให้ถูกต้องครบถ้วนก่อนกดยืนยันส่งใบสมัคร</p>
              </div>

              <!-- Summary Cards -->
              <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 block">ชื่อ-สกุล ผู้สมัคร:</span>
                    <span id="sumFullName" class="font-bold text-sm text-navy-900 dark:text-white">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">เลขประจำตัวประชาชน 13 หลัก:</span>
                    <span id="sumNationalId" class="font-mono font-bold text-sm text-navy-900 dark:text-white">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">ระดับการศึกษาที่สมัคร:</span>
                    <span id="sumLevel" class="font-bold text-navy-900 dark:text-white">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">สาขาวิชาอันดับที่ ๑:</span>
                    <span id="sumDept1" class="font-bold text-crimson-600 dark:text-crimson-400">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">สถานศึกษาเดิม:</span>
                    <span id="sumSchool" class="font-medium text-slate-800 dark:text-slate-200">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">เกรดเฉลี่ยสะสม (GPAX):</span>
                    <span id="sumGpax" class="font-bold text-navy-900 dark:text-white">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">เบอร์โทรศัพท์:</span>
                    <span id="sumPhone" class="font-mono text-slate-800 dark:text-slate-200">-</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">ที่อยู่ติดต่อ:</span>
                    <span id="sumAddress" class="text-slate-800 dark:text-slate-200">-</span>
                  </div>
                </div>
              </div>

              <!-- PDPA Checkbox -->
              <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                <input type="checkbox" id="chkPdpa" required checked class="mt-1 w-4 h-4 text-navy-900 rounded">
                <label for="chkPdpa" class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                  ข้าพเจ้าขอรับรองว่าข้อมูลและเอกสารประกอบการสมัครทั้งหมดเป็นความจริงทุกประการ หากตรวจสอบพบว่าข้อมูลเป็นเท็จหรือไม่ตรงตามประกาศรับสมัคร ให้ถือว่าการสมัครครั้งนี้เป็นโมฆะทันที
                </label>
              </div>
            </div>

            <!-- Stepper Navigation Buttons -->
            <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button type="button" id="btnPrevStep" onclick="prevStep()" class="hidden px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                ← ย้อนกลับ
              </button>
              <div></div>
              <button type="button" id="btnNextStep" onclick="nextStep()" class="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md shadow-navy-900/20 transition-all flex items-center gap-2">
                <span>ถัดไป</span>
                <span>→</span>
              </button>
              <button type="button" id="btnSubmitForm" onclick="handleApplySubmit()" class="hidden px-8 py-3 rounded-xl bg-gradient-to-r from-crimson-600 via-crimson-700 to-crimson-800 text-white text-sm font-bold shadow-xl shadow-crimson-700/30 hover:from-crimson-500 hover:to-crimson-700 transition-all">
                ยืนยันและส่งใบสมัคร (Submit)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

// Master HTML Assembly
const masterHtml = `<!DOCTYPE html>
<html lang="th" class="h-full">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>ระบบรับสมัครเรียนออนไลน์ (โควตา ๒๕๗๐) | วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์</title>
  <link rel="icon" href="${logoDataUri}"/>

  <!-- Google Fonts: Prompt & Sarabun -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Chart.js, SheetJS, Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>

  <!-- Compiled Next.js Tailwind CSS -->
  <style>
${css}
    :root {
      --font-prompt: 'Prompt', sans-serif;
      --font-sarabun: 'Sarabun', sans-serif;
    }
    body {
      font-family: 'Sarabun', sans-serif !important;
    }
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: 'Prompt', sans-serif !important;
    }
    .dotted-leader { border-bottom: 1.5px dotted #94a3b8; }
    @media print {
      body * { visibility: hidden; }
      #printModalArea, #printModalArea * { visibility: visible; }
      #printModalArea { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; color: black; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-crimson-600 selection:text-white">

  <!-- ================= NAVBAR ================= -->
  <div id="mainNavbar">
    ${cleanHeader}
  </div>

  <!-- ================= VIEWS CONTAINER ================= -->
  <div id="mainContentWrapper" class="flex-1 flex flex-col">

    <!-- VIEW 1: HOME (EXACT 100% AS localhost:3000) -->
    <div id="viewHome" class="view-panel">
      ${cleanHomeMain}
    </div>

    <!-- VIEW 2: APPLY (EXACT 100% AS localhost:3000/apply) -->
    <div id="viewApply" class="view-panel hidden">
      ${applyStepperFormHtml}
    </div>

    <!-- VIEW 3: STATUS (EXACT 100% AS localhost:3000/status) -->
    <div id="viewStatus" class="view-panel hidden">
      ${cleanStatusMain}
    </div>

    <!-- VIEW 4: ADMIN LOGIN (EXACT 100% AS localhost:3000/admin/login) -->
    <div id="viewAdminLogin" class="view-panel hidden">
      ${cleanAdminLoginMain}
    </div>

    <!-- VIEW 5: ADMIN DASHBOARD (EXACT 100% AS localhost:3000/admin) -->
    <div id="viewAdminDashboard" class="view-panel hidden">
      ${cleanAdminDashboard}
    </div>

  </div>

  <!-- ================= FOOTER ================= -->
  <div id="mainFooter">
    ${cleanFooter}
  </div>

  <!-- ================= POPUP MODALS ================= -->
  <!-- 1. Success Application Modal -->
  <div id="modalApplySuccess" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5 animate-fade-in">
      <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-md">✓</div>
      <div class="space-y-1">
        <h3 class="font-heading font-black text-2xl text-navy-900 dark:text-white">ส่งใบสมัครเรียบร้อยแล้ว!</h3>
        <p class="text-xs text-slate-500">ระบบได้บันทึกข้อมูลการสมัครรอบโควตา ปีการศึกษา ๒๕๗๐ เรียบร้อยแล้ว</p>
      </div>
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-left space-y-2 text-xs">
        <div class="flex justify-between items-center"><span class="text-slate-400">เลขที่ใบสมัคร:</span><span id="succAppNo" class="font-mono font-bold text-base text-crimson-600">-</span></div>
        <div class="flex justify-between items-center"><span class="text-slate-400">ชื่อผู้สมัคร:</span><span id="succName" class="font-bold text-slate-800 dark:text-white">-</span></div>
        <div class="flex justify-between items-center"><span class="text-slate-400">ระดับชั้น:</span><span id="succLevel" class="font-bold text-slate-800 dark:text-white">-</span></div>
        <div class="flex justify-between items-center"><span class="text-slate-400">แผนกวิชา:</span><span id="succDept" class="font-bold text-navy-900 dark:text-gold-400">-</span></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-2.5">
        <button type="button" onclick="printApplicationSlip()" class="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          <span>พิมพ์ใบสมัคร (PDF)</span>
        </button>
        <button type="button" onclick="closeSuccessModalAndGoStatus()" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs transition-all">
          ตรวจสอบสถานะ
        </button>
      </div>
    </div>
  </div>

  <!-- 2. Admin Applicant Detail Modal -->
  <div id="modalAdminDetail" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs text-slate-400 block font-mono">เลขที่ใบสมัคร: <span id="dtlAppNo"></span></span>
          <h3 id="dtlFullName" class="font-heading font-black text-xl text-navy-900 dark:text-white"></h3>
        </div>
        <button type="button" onclick="closeAdminDetailModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold">✕</button>
      </div>

      <div id="dtlBody" class="space-y-4 text-xs"></div>

      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold">เปลี่ยนสถานะ:</label>
          <select id="dtlChangeStatusSelect" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
            <option value="pending">รอตรวจสอบ</option>
            <option value="passed">ผ่านการคัดเลือก</option>
            <option value="incomplete">เอกสารไม่ครบ / ซ่อม</option>
            <option value="enrolled">มอบตัวแล้ว</option>
          </select>
          <button type="button" onclick="saveStatusChangeFromModal()" class="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 transition-colors">บันทึก</button>
        </div>
        <button type="button" onclick="closeAdminDetailModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100">ปิด</button>
      </div>
    </div>
  </div>

  <!-- Print Slip Area -->
  <div id="printModalArea" class="hidden"></div>

  <!-- ================= MASTER JAVASCRIPT ================= -->
  <script>
    const logoDataUri = "${logoDataUri}";
    const departments = ${JSON.stringify(departments)};
    const thaiAddressData = ${JSON.stringify(addressData)};
    let applicants = ${JSON.stringify(seedApplicants)};

    try {
      const stored = localStorage.getItem('thaluang_applicants_v2');
      if (stored) applicants = JSON.parse(stored);
    } catch (e) {}

    ${clientJs}
  </script>
</body>
</html>`;

// 1. Write master index.html to workspace root
fs.writeFileSync('index.html', masterHtml, 'utf8');
console.log('Written C:/work 2/index.html');

// 2. Copy to Desktop
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\USER', 'Desktop', 'index.html');
fs.writeFileSync(desktopPath, masterHtml, 'utf8');
console.log('Written ' + desktopPath);

// 3. Create subfolder routes (/apply, /status, /admin/login, /admin)
function createRouteFile(subPath, targetHash) {
  const dir = path.join(__dirname, '..', subPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const routeHtml = masterHtml.replace(
    "const hash = window.location.hash;",
    "const hash = '" + targetHash + "';"
  );
  fs.writeFileSync(path.join(dir, 'index.html'), routeHtml, 'utf8');
  console.log('Written route: ' + subPath + '/index.html');
}

createRouteFile('apply', '#apply');
createRouteFile('status', '#status');
createRouteFile('admin/login', '#admin-login');
createRouteFile('admin', '#admin');

console.log('ALL FILES GENERATED 100% PERFECTLY!');
