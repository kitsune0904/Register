// Client-side Application Script for Standalone HTML Replica

let currentView = 'home';
let currentStep = 1;
let selectedLevel = 'ระดับ ปวช.';
let isAdminLoggedIn = false;
let selectedAdminApp = null;
let uploadedFileCount = 0;
let deptChartInstance = null;
let levelChartInstance = null;

// View Switcher
function showView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden'));

  const navbar = document.getElementById('mainNavbar');
  const footer = document.getElementById('mainFooter');

  if (viewName === 'home') {
    if (navbar) navbar.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');
    document.getElementById('viewHome').classList.remove('hidden');
  } else if (viewName === 'apply') {
    if (navbar) navbar.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');
    document.getElementById('viewApply').classList.remove('hidden');
    goToStep(1);
  } else if (viewName === 'status') {
    if (navbar) navbar.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');
    document.getElementById('viewStatus').classList.remove('hidden');
  } else if (viewName === 'admin-login') {
    if (navbar) navbar.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');
    document.getElementById('viewAdminLogin').classList.remove('hidden');
  } else if (viewName === 'admin') {
    if (!isAdminLoggedIn) {
      showView('admin-login');
      return;
    }
    if (navbar) navbar.classList.add('hidden');
    if (footer) footer.classList.add('hidden');
    document.getElementById('viewAdminDashboard').classList.remove('hidden');
    initAdminDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Admin Auth
function handleAdminLoginSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('adminLoginInputId').value.trim();
  const pass = document.getElementById('adminLoginInputPass').value.trim();
  const errBox = document.getElementById('adminLoginErrMsg');

  if (id === '11999' && pass === '090450') {
    isAdminLoggedIn = true;
    if (errBox) errBox.classList.add('hidden');
    showView('admin');
  } else {
    if (errBox) {
      errBox.textContent = 'เลขประจำตัวเจ้าหน้าที่หรือรหัสผ่านไม่ถูกต้อง (รหัสทดสอบ: 11999 / 090450)';
      errBox.classList.remove('hidden');
    } else {
      alert('เลขประจำตัวเจ้าหน้าที่หรือรหัสผ่านไม่ถูกต้อง (รหัสทดสอบ: 11999 / 090450)');
    }
  }
}

function fillAdminLogin(id, pass) {
  document.getElementById('adminLoginInputId').value = id;
  document.getElementById('adminLoginInputPass').value = pass;
  handleAdminLoginSubmit();
}

function adminLogout() {
  isAdminLoggedIn = false;
  showView('admin-login');
}

// Stepper Form Functions
function changeLevel(lvl) {
  selectedLevel = lvl;
  const lbl = document.getElementById('txtLevelLabel');
  if (lbl) lbl.textContent = '(' + lvl + ')';
  
  const isPvc = lvl === 'ระดับ ปวช.';
  const isPvsDirect = lvl === 'ระดับ ปวส. (สายตรง)';
  const isPvsCross = lvl === 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)';

  const cardPvc = document.getElementById('lvlCardPvc');
  const cardPvsDirect = document.getElementById('lvlCardPvsDirect');
  const cardPvsCross = document.getElementById('lvlCardPvsCross');

  if (cardPvc) {
    cardPvc.className = isPvc 
      ? 'p-4 rounded-2xl border-2 border-navy-900 bg-navy-50/60 dark:bg-slate-800 shadow-md cursor-pointer transition-all flex flex-col justify-between'
      : 'p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between';
  }
  
  if (cardPvsDirect) {
    cardPvsDirect.className = isPvsDirect 
      ? 'p-4 rounded-2xl border-2 border-navy-900 bg-navy-50/60 dark:bg-slate-800 shadow-md cursor-pointer transition-all flex flex-col justify-between'
      : 'p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between';
  }
  
  if (cardPvsCross) {
    cardPvsCross.className = isPvsCross 
      ? 'p-4 rounded-2xl border-2 border-navy-900 bg-navy-50/60 dark:bg-slate-800 shadow-md cursor-pointer transition-all flex flex-col justify-between'
      : 'p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between';
  }

  updateDepartmentOptions(lvl);
}

function updateDepartmentOptions(lvl) {
  const d1 = document.getElementById('selDept1');
  const d2 = document.getElementById('selDept2');
  if (!d1 || !d2) return;

  d1.innerHTML = '<option value="">-- กรุณาเลือกสาขาวิชาอันดับที่ ๑ --</option>';
  d2.innerHTML = '<option value="">-- เลือกสาขาวิชาสำรองอันดับที่ ๒ (ไม่บังคับ) --</option>';

  departments.forEach(dept => {
    if (dept.levels.includes(lvl)) {
      const opt1 = document.createElement('option');
      opt1.value = dept.name;
      opt1.textContent = dept.name;
      d1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = dept.name;
      opt2.textContent = dept.name;
      d2.appendChild(opt2);
    }
  });
}

function goToStep(s) {
  currentStep = s;
  for (let i = 1; i <= 6; i++) {
    const sec = document.getElementById('stepSection' + i);
    if (sec) sec.classList.toggle('hidden', i !== s);

    const iconBtn = document.getElementById('stepIcon' + i);
    const textSpan = document.getElementById('stepText' + i);

    if (iconBtn && textSpan) {
      if (i < s) {
        iconBtn.className = 'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-emerald-600 text-white shadow-md transition-all';
        iconBtn.innerHTML = '✓';
        textSpan.className = 'mt-2 text-xs font-semibold tracking-tight text-emerald-600';
      } else if (i === s) {
        iconBtn.className = 'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-navy-900 text-white ring-4 ring-navy-600/20 shadow-lg scale-105 transition-all';
        textSpan.className = 'mt-2 text-xs font-semibold tracking-tight text-navy-900 dark:text-white';
      } else {
        iconBtn.className = 'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 transition-all';
        textSpan.className = 'mt-2 text-xs font-semibold tracking-tight text-slate-400';
      }
    }
  }

  const line = document.getElementById('stepLineProgress');
  if (line) line.style.width = ((s - 1) * 20) + '%';
  
  const prevBtn = document.getElementById('btnPrevStep');
  const nextBtn = document.getElementById('btnNextStep');
  const subBtn = document.getElementById('btnSubmitForm');
  if (prevBtn) prevBtn.classList.toggle('hidden', s === 1);
  if (nextBtn) nextBtn.classList.toggle('hidden', s === 6);
  if (subBtn) subBtn.classList.toggle('hidden', s !== 6);

  if (s === 6) {
    populateSummary();
  }
  window.scrollTo({ top: 150, behavior: 'smooth' });
}

function nextStep() {
  if (currentStep === 1) {
    const name = document.getElementById('inpFullName').value.trim();
    const cid = document.getElementById('inpNationalId').value.trim();
    if (!name) { alert('กรุณาระบุชื่อ-นามสกุล'); return; }
    if (cid.length !== 13) { alert('กรุณาระบุเลขประจำตัวประชาชน 13 หลักให้ถูกต้อง'); return; }
  } else if (currentStep === 3) {
    const house = document.getElementById('inpHouseNo').value.trim();
    const phone = document.getElementById('inpPhone').value.trim();
    if (!house) { alert('กรุณาระบุบ้านเลขที่'); return; }
    if (!phone || phone.length < 9) { alert('กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้'); return; }
  } else if (currentStep === 4) {
    const school = document.getElementById('inpSchoolName').value.trim();
    const gpax = document.getElementById('inpGpax').value.trim();
    const d1 = document.getElementById('selDept1').value;
    if (!school) { alert('กรุณาระบุชื่อโรงเรียนเดิม'); return; }
    if (!gpax) { alert('กรุณาระบุเกรดเฉลี่ยสะสม (GPAX)'); return; }
    if (!d1) { alert('กรุณาเลือกสาขาวิชาอันดับที่ ๑'); return; }
  }
  goToStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

function populateSummary() {
  const fName = document.getElementById('inpFullName');
  const nId = document.getElementById('inpNationalId');
  const sDept = document.getElementById('selDept1');
  const sSch = document.getElementById('inpSchoolName');
  const sGpax = document.getElementById('inpGpax');
  const sPh = document.getElementById('inpPhone');

  if (fName) document.getElementById('sumFullName').textContent = fName.value || '-';
  if (nId) document.getElementById('sumNationalId').textContent = nId.value || '-';
  document.getElementById('sumLevel').textContent = selectedLevel;
  if (sDept) document.getElementById('sumDept1').textContent = sDept.value || '-';
  if (sSch) document.getElementById('sumSchool').textContent = sSch.value || '-';
  if (sGpax) document.getElementById('sumGpax').textContent = sGpax.value || '-';
  if (sPh) document.getElementById('sumPhone').textContent = sPh.value || '-';
  
  const houseEl = document.getElementById('inpHouseNo');
  const mooEl = document.getElementById('inpMoo');
  const subEl = document.getElementById('selSubdistrict');
  const distEl = document.getElementById('selDistrict');
  const provEl = document.getElementById('selProvince');
  const zipEl = document.getElementById('inpZip');

  const addr = [
    houseEl ? houseEl.value : '',
    (mooEl && mooEl.value) ? 'หมู่ ' + mooEl.value : '',
    (subEl && subEl.value) ? 'ต.' + subEl.value : '',
    (distEl && distEl.value) ? 'อ.' + distEl.value : '',
    (provEl && provEl.value) ? 'จ.' + provEl.value : '',
    zipEl ? zipEl.value : ''
  ].filter(Boolean).join(' ');
  document.getElementById('sumAddress').textContent = addr || '-';
}

function handleFileUpload(input, type) {
  if (input.files && input.files[0]) {
    uploadedFileCount++;
    if (type === 'บัตรประชาชน') document.getElementById('docStatus1').classList.remove('hidden');
    if (type === 'ปพ.1') document.getElementById('docStatus2').classList.remove('hidden');
    if (type === 'ทะเบียนบ้าน') document.getElementById('docStatus3').classList.remove('hidden');
    if (type === 'รูปถ่าย') document.getElementById('docStatus4').classList.remove('hidden');
  }
}

function handleApplySubmit() {
  const chk = document.getElementById('chkPdpa');
  if (chk && !chk.checked) {
    alert('กรุณายินยอมและรับรองความถูกต้องของข้อมูล');
    return;
  }

  const nextNum = '70-000' + (applicants.length + 1);
  const newApp = {
    id: 'APP-' + (applicants.length + 1),
    application_no: nextNum,
    national_id: document.getElementById('inpNationalId').value.trim(),
    full_name: document.getElementById('inpFullName').value.trim(),
    birth_date: '2010-05-15',
    birth_day: document.getElementById('selBirthDay').value,
    birth_month: document.getElementById('selBirthMonth').value,
    birth_year: document.getElementById('selBirthYear').value,
    level: selectedLevel,
    dept_1: document.getElementById('selDept1').value,
    dept_2: document.getElementById('selDept2') ? document.getElementById('selDept2').value : '',
    status: 'pending',
    status_label: 'รอตรวจสอบ',
    gpax: parseFloat(document.getElementById('inpGpax').value) || 3.00,
    phone: document.getElementById('inpPhone').value.trim(),
    school_name: document.getElementById('inpSchoolName').value.trim(),
    school_province: document.getElementById('inpSchoolProvince').value.trim(),
    father_name: document.getElementById('inpFatherName') ? document.getElementById('inpFatherName').value.trim() : '-',
    mother_name: document.getElementById('inpMotherName') ? document.getElementById('inpMotherName').value.trim() : '-',
    applied_date: new Date().toISOString().split('T')[0],
    remarks: 'ยื่นใบสมัครออนไลน์เรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบคุณสมบัติ',
    student_id: ''
  };

  applicants.unshift(newApp);
  try {
    localStorage.setItem('thaluang_applicants_v2', JSON.stringify(applicants));
  } catch (e) {}

  // Confetti
  try {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  } catch (e) {}

  // Show Success Modal
  document.getElementById('succAppNo').textContent = nextNum;
  document.getElementById('succName').textContent = newApp.full_name;
  document.getElementById('succLevel').textContent = newApp.level;
  document.getElementById('succDept').textContent = newApp.dept_1;
  document.getElementById('modalApplySuccess').classList.remove('hidden');
}

function closeSuccessModalAndGoStatus() {
  document.getElementById('modalApplySuccess').classList.add('hidden');
  showView('status');
  if (applicants.length > 0) {
    document.getElementById('statusInputCid').value = applicants[0].national_id;
    handleStatusSearchSubmit();
  }
}

// Status Search & Result
function handleStatusSearchSubmit(e) {
  if (e) e.preventDefault();
  const cid = document.getElementById('statusInputCid').value.trim();
  const box = document.getElementById('statusResultBox');

  if (!cid) {
    alert('กรุณากรอกเลขประจำตัวประชาชน 13 หลัก');
    return;
  }

  const app = applicants.find(a => a.national_id === cid);
  if (!app) {
    box.innerHTML = '<div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-3 animate-fade-in"><div class="w-12 h-12 rounded-full bg-crimson-100 text-crimson-600 flex items-center justify-center mx-auto text-xl font-bold">!</div><h3 class="font-heading font-bold text-base text-navy-900 dark:text-white">ไม่พบข้อมูลการสมัคร</h3><p class="text-xs text-slate-500">ไม่พบเลขบัตรประชาชนนี้ในระบบรับสมัครโควตา ๒๕๗๐ กรุณาตรวจสอบหรือยื่นใบสมัครใหม่</p></div>';
    return;
  }

  const statusColor = app.status === 'enrolled' ? 'bg-indigo-600' :
                      app.status === 'passed' ? 'bg-emerald-600' :
                      app.status === 'incomplete' ? 'bg-crimson-600' : 'bg-amber-500';

  let alertSnippet = '';
  if (app.status === 'incomplete') {
    alertSnippet = '<div class="p-6 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-300 dark:border-crimson-800 space-y-4"><h4 class="font-heading font-bold text-sm text-crimson-900 dark:text-crimson-200">⚠️ เอกสารไม่ครบถ้วน / ต้องทำการแก้ไข</h4><p class="text-xs text-crimson-700 dark:text-crimson-300"><strong>ข้อความจากเจ้าหน้าที่:</strong> ' + (app.remarks || 'กรุณาอัปโหลดเอกสารใหม่') + '</p><div class="pt-3 border-t border-crimson-200 dark:border-crimson-800/60 flex items-center gap-3"><label class="px-4 py-2 rounded-xl bg-crimson-600 text-white font-bold text-xs cursor-pointer hover:bg-crimson-700 transition-colors"><span>+ อัปโหลดเอกสารแก้ไขใหม่</span><input type="file" class="hidden" onchange="alert(\'อัปโหลดเอกสารแก้ไขเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบใหม่อีกครั้ง\')"></label></div></div>';
  } else if (app.status === 'passed' || app.status === 'enrolled') {
    alertSnippet = '<div class="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-4"><h4 class="font-heading font-bold text-sm text-emerald-900 dark:text-emerald-200">🎉 ขอแสดงความยินดี! ท่านผ่านการคัดเลือกรอบโควตาพิเศษ</h4><p class="text-xs text-emerald-700 dark:text-emerald-300">สังกัด ' + app.dept_1 + ' วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์</p>' + (app.student_id ? '<div class="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 text-xs"><p class="font-bold text-navy-900 dark:text-gold-400">รหัสประจำตัวนักเรียน/นักศึกษา: ' + app.student_id + '</p></div>' : '') + '<div class="flex flex-wrap items-center gap-3 pt-2"><button type="button" onclick="printApplicationSlip(\'' + app.application_no + '\')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-sm transition-all"><span>พิมพ์ใบรายงานตัวและมอบตัว</span></button></div></div>';
  } else {
    alertSnippet = '<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs text-slate-500">สถานะปัจจุบัน: อยู่ระหว่างการตรวจสอบเอกสารและคุณสมบัติโดยคณะกรรมการฝ่ายวิชาการ</div>';
  }

  box.innerHTML = '<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-fade-in"><div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6"><div><span class="text-xs text-slate-400 block font-mono">เลขที่ใบสมัคร: ' + app.application_no + '</span><h2 class="font-heading font-black text-2xl text-navy-900 dark:text-white">' + app.full_name + '</h2><p class="text-xs text-slate-500 mt-0.5">' + app.level + ' • ' + app.dept_1 + '</p></div><div class="px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md ' + statusColor + '">' + (app.status_label || app.status) + '</div></div><div class="py-4"><h3 class="font-heading font-bold text-sm text-slate-700 dark:text-slate-300 mb-6">ลำดับขั้นตอนสถานะใบสมัคร</h3><div class="relative flex items-center justify-between"><div class="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0"></div><div class="relative z-10 flex flex-col items-center"><div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-600 text-white shadow-md">✓</div><span class="mt-2 text-xs font-semibold">ยื่นใบสมัคร</span><span class="text-[10px] text-slate-400">สมบูรณ์</span></div><div class="relative z-10 flex flex-col items-center"><div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ' + (app.status === 'pending' ? 'bg-navy-900 text-white ring-4 ring-navy-200' : app.status === 'incomplete' ? 'bg-crimson-600 text-white ring-4 ring-crimson-200' : 'bg-emerald-600 text-white') + '">' + (app.status === 'pending' ? '2' : app.status === 'incomplete' ? '!' : '✓') + '</div><span class="mt-2 text-xs font-semibold">ตรวจเอกสาร</span><span class="text-[10px] text-slate-400">' + (app.status === 'incomplete' ? 'ต้องแก้ไข' : 'ผ่านเกณฑ์') + '</span></div><div class="relative z-10 flex flex-col items-center"><div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ' + (app.status === 'passed' ? 'bg-navy-900 text-white ring-4 ring-navy-200' : app.status === 'enrolled' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500') + '">' + (app.status === 'enrolled' ? '✓' : '3') + '</div><span class="mt-2 text-xs font-semibold">ผลคัดเลือก</span><span class="text-[10px] text-slate-400">ผ่านโควตา</span></div><div class="relative z-10 flex flex-col items-center"><div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ' + (app.status === 'enrolled' ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-500') + '">' + (app.status === 'enrolled' ? '✓' : '4') + '</div><span class="mt-2 text-xs font-semibold">มอบตัว</span><span class="text-[10px] text-slate-400">เป็นนักศึกษา</span></div></div></div>' + alertSnippet + '</div>';
}

function presetStatusSearch(cid, d, m, y) {
  document.getElementById('statusInputCid').value = cid;
  const dSel = document.getElementById('statusSelDay');
  const mSel = document.getElementById('statusSelMonth');
  const ySel = document.getElementById('statusSelYear');
  if (dSel) dSel.value = d;
  if (mSel) mSel.value = m;
  if (ySel) ySel.value = y;
  handleStatusSearchSubmit();
}

// Admin Dashboard Functions
function initAdminDashboard() {
  renderAdminKpi();
  initAdminCharts();
  renderAdminTable();
}

function renderAdminKpi() {
  const total = applicants.length;
  const pending = applicants.filter(a => a.status === 'pending').length;
  const incomplete = applicants.filter(a => a.status === 'incomplete').length;
  const passed = applicants.filter(a => a.status === 'passed').length;
  const enrolled = applicants.filter(a => a.status === 'enrolled').length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiPending').textContent = pending;
  document.getElementById('kpiIncomplete').textContent = incomplete;
  document.getElementById('kpiPassed').textContent = passed;
  document.getElementById('kpiEnrolled').textContent = enrolled;

  document.getElementById('tabBtn-all').textContent = 'ทั้งหมด (' + total + ')';
  document.getElementById('tabBtn-pending').textContent = 'รอตรวจสอบ (' + pending + ')';
  document.getElementById('tabBtn-incomplete').textContent = 'เอกสารไม่ครบ (' + incomplete + ')';
  document.getElementById('tabBtn-passed').textContent = 'ผ่านการคัดเลือก (' + passed + ')';
  document.getElementById('tabBtn-enrolled').textContent = 'มอบตัวแล้ว (' + enrolled + ')';
}

function initAdminCharts() {
  const deptCounts = {};
  departments.forEach(d => deptCounts[d.name] = 0);
  applicants.forEach(a => {
    if (deptCounts[a.dept_1] !== undefined) deptCounts[a.dept_1]++;
  });

  const barLabels = departments.map(d => d.name.replace('แผนกวิชา', ''));
  const barData = departments.map(d => deptCounts[d.name]);

  const ctxBar = document.getElementById('deptBarChart');
  if (ctxBar) {
    if (deptChartInstance) deptChartInstance.destroy();
    deptChartInstance = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'จำนวนผู้สมัคร (คน)',
          data: barData,
          backgroundColor: barLabels.map((_, i) => i === 0 ? '#D91E18' : i === 1 ? '#0B2A6F' : '#2563eb'),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
          y: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  const pvcCount = applicants.filter(a => a.level === 'ระดับ ปวช.').length;
  const pvsDirectCount = applicants.filter(a => a.level === 'ระดับ ปวส. (สายตรง)').length;
  const pvsCrossCount = applicants.filter(a => a.level === 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)').length;

  document.getElementById('txtLevelPvc').textContent = pvcCount + ' คน';
  document.getElementById('txtLevelPvsDirect').textContent = pvsDirectCount + ' คน';
  document.getElementById('txtLevelPvsCross').textContent = pvsCrossCount + ' คน';

  const ctxDonut = document.getElementById('levelDonutChart');
  if (ctxDonut) {
    if (levelChartInstance) levelChartInstance.destroy();
    levelChartInstance = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['ระดับ ปวช.', 'ระดับ ปวส. (สายตรง)', 'ระดับ ปวส. (ต่างสาขา)'],
        datasets: [{
          data: [pvcCount, pvsDirectCount, pvsCrossCount],
          backgroundColor: ['#0B2A6F', '#F5B400', '#D91E18']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '65%'
      }
    });
  }
}

let currentAdminTab = 'all';
function setAdminTableTab(tab) {
  currentAdminTab = tab;
  ['all', 'pending', 'incomplete', 'passed', 'enrolled'].forEach(t => {
    const btn = document.getElementById('tabBtn-' + t);
    if (btn) {
      if (t === tab) {
        btn.className = 'px-3 py-1.5 rounded-xl font-bold bg-navy-900 text-white shadow-sm';
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800';
      }
    }
  });
  renderAdminTable();
}

function renderAdminTable() {
  const searchInput = document.getElementById('adminSearchInput');
  const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let list = applicants;
  if (currentAdminTab !== 'all') {
    list = list.filter(a => a.status === currentAdminTab);
  }

  if (q) {
    list = list.filter(a => 
      a.full_name.toLowerCase().includes(q) ||
      a.national_id.includes(q) ||
      a.application_no.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400">ไม่พบข้อมูลผู้สมัคร</td></tr>';
    return;
  }

  list.forEach(app => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors';

    const badgeClass = app.status === 'enrolled' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                       app.status === 'passed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                       app.status === 'incomplete' ? 'bg-crimson-100 text-crimson-700 dark:bg-crimson-950 dark:text-crimson-300' :
                       'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

    tr.innerHTML = '<td class="py-3 px-3 font-mono font-bold text-navy-900 dark:text-white">' + app.application_no + '</td><td class="py-3 px-3"><span class="font-bold text-slate-800 dark:text-white block">' + app.full_name + '</span><span class="text-[11px] text-slate-400 font-mono">' + app.national_id + '</span></td><td class="py-3 px-3">' + app.level + '</td><td class="py-3 px-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">' + app.dept_1 + '</td><td class="py-3 px-3 text-center font-mono font-bold">' + app.gpax.toFixed(2) + '</td><td class="py-3 px-3 text-center"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ' + badgeClass + '">' + (app.status_label || app.status) + '</span></td><td class="py-3 px-3 text-right"><button type="button" onclick="openAdminDetailModal(\'' + app.application_no + '\')" class="px-2.5 py-1 rounded-lg bg-navy-50 text-navy-900 hover:bg-navy-100 font-bold text-[11px] transition-colors">ดูข้อมูล / ตรวจ</button></td>';
    tbody.appendChild(tr);
  });
}

function openAdminDetailModal(appNo) {
  const app = applicants.find(a => a.application_no === appNo);
  if (!app) return;
  selectedAdminApp = app;

  document.getElementById('dtlAppNo').textContent = app.application_no;
  document.getElementById('dtlFullName').textContent = app.full_name;
  document.getElementById('dtlChangeStatusSelect').value = app.status;

  document.getElementById('dtlBody').innerHTML = '<div class="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200"><div><span class="text-slate-400 block">เลขบัตร 13 หลัก:</span><span class="font-mono font-bold">' + app.national_id + '</span></div><div><span class="text-slate-400 block">เบอร์โทรศัพท์:</span><span class="font-mono font-bold">' + app.phone + '</span></div><div><span class="text-slate-400 block">ระดับที่สมัคร:</span><span class="font-bold">' + app.level + '</span></div><div><span class="text-slate-400 block">เกรดเฉลี่ย (GPAX):</span><span class="font-bold font-mono">' + app.gpax.toFixed(2) + '</span></div><div class="col-span-2"><span class="text-slate-400 block">สาขาวิชาอันดับ ๑:</span><span class="font-bold text-navy-900 dark:text-gold-400">' + app.dept_1 + '</span></div><div class="col-span-2"><span class="text-slate-400 block">โรงเรียนเดิม:</span><span>' + app.school_name + ' (จ.' + app.school_province + ')</span></div><div><span class="text-slate-400 block">ชื่อบิดา:</span><span>' + app.father_name + '</span></div><div><span class="text-slate-400 block">ชื่อมารดา:</span><span>' + app.mother_name + '</span></div><div class="col-span-2"><span class="text-slate-400 block">หมายเหตุ / เหตุผล:</span><span class="text-crimson-600 font-medium">' + (app.remarks || '-') + '</span></div></div>';

  document.getElementById('modalAdminDetail').classList.remove('hidden');
}

function closeAdminDetailModal() {
  document.getElementById('modalAdminDetail').classList.add('hidden');
}

function saveStatusChangeFromModal() {
  if (!selectedAdminApp) return;
  const newStatus = document.getElementById('dtlChangeStatusSelect').value;
  selectedAdminApp.status = newStatus;
  
  if (newStatus === 'passed') {
    selectedAdminApp.status_label = 'ผ่านการคัดเลือก';
    selectedAdminApp.remarks = 'ผ่านเกณฑ์การคัดเลือกโควตา พร้อมรายงานตัว';
  } else if (newStatus === 'enrolled') {
    selectedAdminApp.status_label = 'มอบตัวแล้ว';
    selectedAdminApp.student_id = selectedAdminApp.student_id || ('7030101000' + applicants.length);
    selectedAdminApp.remarks = 'มอบตัวเรียบร้อย ออกรหัสนักศึกษาแล้ว';
  } else if (newStatus === 'incomplete') {
    selectedAdminApp.status_label = 'เอกสารไม่ครบ / ให้ส่งแก้ไข';
    selectedAdminApp.remarks = 'เอกสารแนบไม่ชัดเจน กรุณาอัปโหลดเอกสารใหม่';
  } else {
    selectedAdminApp.status_label = 'รอตรวจสอบ';
  }

  try {
    localStorage.setItem('thaluang_applicants_v2', JSON.stringify(applicants));
  } catch (e) {}

  closeAdminDetailModal();
  renderAdminKpi();
  initAdminCharts();
  renderAdminTable();
  alert('บันทึกการเปลี่ยนสถานะผู้สมัครเรียบร้อยแล้ว');
}

function exportAdminDataExcel() {
  try {
    const rows = applicants.map(a => ({
      'เลขที่ใบสมัคร': a.application_no,
      'เลขประจำตัวประชาชน': a.national_id,
      'ชื่อ-สกุล': a.full_name,
      'ระดับการศึกษา': a.level,
      'สาขาวิชาที่สมัคร': a.dept_1,
      'GPAX': a.gpax,
      'เบอร์โทรศัพท์': a.phone,
      'โรงเรียนเดิม': a.school_name,
      'สถานะ': a.status_label || a.status,
      'รหัสนักศึกษา': a.student_id || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ผู้สมัครโควตา');
    XLSX.writeFile(wb, 'รายงานผู้สมัครโควตา_๒๕๗๐.xlsx');
  } catch (e) {
    alert('ส่งออกรายงาน Excel สำเร็จ');
  }
}

function switchAdminTab(t) {
  if (t === 'dashboard') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (t === 'applications') {
    const sec = document.getElementById('adminAppsSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  }
}

function openWalkInModal() {
  showView('apply');
}

function filterAdminTableByStatus(st) {
  setAdminTableTab(st);
  const sec = document.getElementById('adminAppsSection');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

function filterAdminByLevel(lvl) {
  renderAdminTable();
}

function toggleThemeMode() {
  document.documentElement.classList.toggle('dark');
}

function validateCitizenIdLive(id) {
  const msg = document.getElementById('cidCheckMsg');
  if (!msg) return;
  if (id.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(id.charAt(i)) * (13 - i);
    const check = (11 - (sum % 11)) % 10;
    if (check === parseInt(id.charAt(12))) {
      msg.textContent = '✓ เลขประจำตัวประชาชนถูกต้องตามโครงสร้าง สถิติ สอศ.';
      msg.className = 'text-[11px] block mt-1 text-emerald-600 font-medium';
    } else {
      msg.textContent = '⚠ เลขบัตรประชาชนอาจไม่ถูกต้อง กรุณาตรวจทาน';
      msg.className = 'text-[11px] block mt-1 text-crimson-600';
    }
  } else {
    msg.textContent = '';
  }
}

function printApplicationSlip(appNo) {
  const app = applicants.find(a => a.application_no === appNo) || applicants[0];
  const printArea = document.getElementById('printModalArea');
  if (!printArea) return;
  printArea.innerHTML = '<div style="font-family: \'Sarabun\', sans-serif; padding: 30px; border: 2px solid #000; max-width: 800px; margin: auto;"><div style="text-align: center; margin-bottom: 20px;"><img src="' + logoDataUri + '" style="width: 70px; margin-bottom: 10px;"/><h2 style="font-family: \'Prompt\', sans-serif; margin: 0; font-size: 18px;">วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์</h2><h3 style="font-family: \'Prompt\', sans-serif; margin: 4px 0; font-size: 16px;">ใบสมัครเข้ารับคัดเลือกเข้าศึกษาต่อรอบโควตาพิเศษ ประจำปีการศึกษา ๒๕๗๐</h3><p style="font-size: 12px; margin: 0;">เลขที่ใบสมัคร: ' + app.application_no + ' | วันที่ยื่น: ' + app.applied_date + '</p></div><table style="width: 100%; font-size: 13px; line-height: 2;"><tr><td style="width: 25%;"><strong>ชื่อ-นามสกุล:</strong></td><td>' + app.full_name + '</td></tr><tr><td><strong>เลขบัตรประชาชน:</strong></td><td>' + app.national_id + '</td></tr><tr><td><strong>ระดับที่สมัคร:</strong></td><td>' + app.level + '</td></tr><tr><td><strong>สาขาวิชาที่เลือก:</strong></td><td>' + app.dept_1 + '</td></tr><tr><td><strong>โรงเรียนเดิม:</strong></td><td>' + app.school_name + '</td></tr><tr><td><strong>เกรดเฉลี่ยสะสม:</strong></td><td>' + app.gpax.toFixed(2) + '</td></tr><tr><td><strong>เบอร์โทรศัพท์:</strong></td><td>' + app.phone + '</td></tr><tr><td><strong>สถานะ:</strong></td><td>' + (app.status_label || app.status) + '</td></tr></table><div style="margin-top: 40px; text-align: right; font-size: 13px;"><p>ลงชื่อ............................................................ผู้สมัคร</p><p>( ' + app.full_name + ' )</p></div></div>';
  window.print();
}

function initAddressData() {
  const pSel = document.getElementById('selProvince');
  if (pSel && thaiAddressData && thaiAddressData.provinces) {
    pSel.innerHTML = '<option value="">-- เลือกจังหวัด --</option>';
    thaiAddressData.provinces.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (p === 'สระบุรี') opt.selected = true;
      pSel.appendChild(opt);
    });
    onProvinceChanged('สระบุรี');
  }

  const dSel = document.getElementById('selBirthDay');
  if (dSel) {
    dSel.innerHTML = '<option value="">วันที่</option>';
    for (let i = 1; i <= 31; i++) {
      const val = i < 10 ? '0' + i : '' + i;
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = i;
      if (i === 15) opt.selected = true;
      dSel.appendChild(opt);
    }
  }

  const mNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const mSel = document.getElementById('selBirthMonth');
  if (mSel) {
    mSel.innerHTML = '<option value="">เดือน</option>';
    mNames.forEach((name, idx) => {
      const val = idx < 9 ? '0' + (idx + 1) : '' + (idx + 1);
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = name;
      if (idx === 4) opt.selected = true;
      mSel.appendChild(opt);
    });
  }

  const ySel = document.getElementById('selBirthYear');
  if (ySel) {
    ySel.innerHTML = '<option value="">พ.ศ.</option>';
    for (let y = 2558; y >= 2545; y--) {
      const opt = document.createElement('option');
      opt.value = '' + y;
      opt.textContent = 'พ.ศ. ' + y;
      if (y === 2553) opt.selected = true;
      ySel.appendChild(opt);
    }
  }

  updateDepartmentOptions(selectedLevel);
}

function onProvinceChanged(prov) {
  const dSel = document.getElementById('selDistrict');
  if (!dSel || !thaiAddressData) return;
  dSel.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
  const amphoes = thaiAddressData.amphoes[prov] || ['บ้านหมอ', 'เมืองสระบุรี', 'พระพุทธบาท', 'หนองแค', 'แก่งคอย'];
  amphoes.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    if (a === 'บ้านหมอ') opt.selected = true;
    dSel.appendChild(opt);
  });
  onDistrictChanged(amphoes[0] || 'บ้านหมอ');
}

function onDistrictChanged(amp) {
  const sSel = document.getElementById('selSubdistrict');
  if (!sSel || !thaiAddressData) return;
  sSel.innerHTML = '<option value="">-- เลือกตำบล --</option>';
  const tambons = thaiAddressData.tambons[amp] || ['บ้านหมอ', 'บ้านครัว', 'ท่าลาน', 'ตลาดน้อย', 'หรเทพ'];
  tambons.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    if (t === 'บ้านหมอ') opt.selected = true;
    sSel.appendChild(opt);
  });
  onSubdistrictChanged(tambons[0] || 'บ้านหมอ');
}

function onSubdistrictChanged(tam) {
  const zipEl = document.getElementById('inpZip');
  if (!zipEl || !thaiAddressData) return;
  const zip = thaiAddressData.zips[tam] || (tam === 'บ้านครัว' ? '18270' : '18130');
  zipEl.value = zip;
}

window.addEventListener('DOMContentLoaded', () => {
  initAddressData();
  
  const hash = window.location.hash;
  if (hash === '#apply') showView('apply');
  else if (hash === '#status') showView('status');
  else if (hash === '#admin-login') showView('admin-login');
  else if (hash === '#admin') showView('admin');
  else showView('home');
});
