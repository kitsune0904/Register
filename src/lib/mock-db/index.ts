import { Application, ApplicationFile, ApplicationLevel, ApplicationStatus, Department, Enrollment, StaffProfile, StatusLog } from '@/types';
import { INITIAL_DEPARTMENTS } from './departments';
import { INITIAL_APPLICATIONS } from './applications';

// Global singleton in-memory database store for persistent session data in Node/Next
declare global {
  var __quota_db_departments: Department[] | undefined;
  var __quota_db_applications: Application[] | undefined;
  var __quota_db_status_logs: StatusLog[] | undefined;
}

if (!global.__quota_db_departments) {
  global.__quota_db_departments = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
}

if (!global.__quota_db_applications) {
  global.__quota_db_applications = JSON.parse(JSON.stringify(INITIAL_APPLICATIONS));
}

if (!global.__quota_db_status_logs) {
  global.__quota_db_status_logs = [
    {
      id: 'log-1',
      application_id: 'c0000000-0000-0000-0000-000000000001',
      from_status: 'pending',
      to_status: 'passed',
      note: 'ผ่านเกณฑ์คุณสมบัติโควตา 5 ภาคเรียน GPAX 3.65',
      changed_by: 'นายประสิทธิ์ วงศ์สุวรรณ',
      created_at: '2026-11-02T10:00:00.000Z',
    },
    {
      id: 'log-2',
      application_id: 'c0000000-0000-0000-0000-000000000002',
      from_status: 'passed',
      to_status: 'enrolled',
      note: 'บันทึกการมอบตัวนักศึกษาใหม่ รหัส 70301010001',
      changed_by: 'นางสาวจารุวรรณ ทับทิม',
      created_at: '2026-11-05T14:00:00.000Z',
    },
    {
      id: 'log-3',
      application_id: 'c0000000-0000-0000-0000-000000000004',
      from_status: 'pending',
      to_status: 'rejected',
      note: 'สำเนา ปพ.1 ไม่ชัดเจน ขอให้อัปโหลดไฟล์หน้าผลการเรียน 5 ภาคเรียนฉบับที่มีตราประทับโรงเรียนใหม่',
      changed_by: 'นายประสิทธิ์ วงศ์สุวรรณ',
      created_at: '2026-11-02T15:30:00.000Z',
    },
  ];
}

const departments = global.__quota_db_departments!;
const applications = global.__quota_db_applications!;
const statusLogs = global.__quota_db_status_logs!;

// Hydrate department links
function hydrateApplication(app: Application): Application {
  const dept1 = departments.find((d) => d.id === app.dept_choice_1);
  const dept2 = app.dept_choice_2 ? departments.find((d) => d.id === app.dept_choice_2) : undefined;
  return {
    ...app,
    dept_1: dept1,
    dept_2: dept2,
  };
}

export const mockDb = {
  // --- DEPARTMENTS ---
  getDepartments: (activeOnly = true) => {
    return activeOnly ? departments.filter((d) => d.is_active) : [...departments];
  },

  getDepartmentById: (id: string) => {
    return departments.find((d) => d.id === id);
  },

  updateDepartment: (id: string, updates: Partial<Department>) => {
    const idx = departments.findIndex((d) => d.id === id);
    if (idx !== -1) {
      departments[idx] = { ...departments[idx], ...updates };
      return departments[idx];
    }
    return null;
  },

  // --- APPLICATIONS ---
  getApplications: () => {
    return applications.map(hydrateApplication);
  },

  getApplicationById: (id: string) => {
    const app = applications.find((a) => a.id === id || a.application_no === id);
    return app ? hydrateApplication(app) : null;
  },

  getApplicationByCitizenId: (nationalId: string, birthDate?: string) => {
    const app = applications.find((a) => {
      const matchId = a.national_id.replace(/\D/g, '') === nationalId.replace(/\D/g, '');
      if (!matchId) return false;
      if (birthDate) {
        return a.birth_date.split('T')[0] === birthDate.split('T')[0];
      }
      return true;
    });
    return app ? hydrateApplication(app) : null;
  },

  createApplication: (data: Omit<Application, 'id' | 'application_no' | 'created_at' | 'status'> & { files?: ApplicationFile[] }) => {
    // Check duplicate
    const existing = applications.find(
      (a) => a.national_id.replace(/\D/g, '') === data.national_id.replace(/\D/g, '')
    );
    if (existing) {
      throw new Error('เลขประจำตัวประชาชนนี้ได้ทำการสมัครในปีการศึกษานี้ไปแล้ว');
    }

    // Generate Application No: 70-XXXX
    const nextSeq = applications.length + 1;
    const application_no = `70-${String(nextSeq).padStart(4, '0')}`;
    const id = `c0000000-0000-0000-0000-${String(nextSeq).padStart(12, '0')}`;

    const newApp: Application = {
      ...data,
      id,
      application_no,
      status: 'pending',
      created_at: new Date().toISOString(),
      files: data.files || [],
    };

    applications.unshift(newApp);

    // Audit log
    statusLogs.push({
      id: `log-${Date.now()}`,
      application_id: id,
      from_status: undefined,
      to_status: 'pending',
      note: 'ส่งใบสมัครเข้าระบบออนไลน์',
      changed_by: 'ระบบรับสมัคร',
      created_at: new Date().toISOString(),
    });

    return hydrateApplication(newApp);
  },

  updateApplicationStatus: (
    id: string,
    newStatus: ApplicationStatus,
    reason?: string,
    changedBy = 'เจ้าหน้าที่งานทะเบียน'
  ) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return null;

    const fromStatus = app.status;
    app.status = newStatus;
    if (reason !== undefined) {
      app.reject_reason = reason;
    }
    app.updated_at = new Date().toISOString();

    // Log status change
    statusLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      application_id: id,
      from_status: fromStatus,
      to_status: newStatus,
      note: reason || `เปลี่ยนสถานะเป็น ${newStatus}`,
      changed_by: changedBy,
      created_at: new Date().toISOString(),
    });

    return hydrateApplication(app);
  },

  bulkUpdateStatus: (
    ids: string[],
    newStatus: ApplicationStatus,
    reason?: string,
    changedBy = 'เจ้าหน้าที่งานทะเบียน'
  ) => {
    const updated: Application[] = [];
    for (const id of ids) {
      const res = mockDb.updateApplicationStatus(id, newStatus, reason, changedBy);
      if (res) updated.push(res);
    }
    return updated;
  },

  // Update files (e.g. re-upload when rejected)
  updateApplicantFiles: (id: string, newFiles: ApplicationFile[]) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return null;

    app.files = newFiles;
    // When re-uploading documents, set status back to pending
    app.status = 'pending';
    app.reject_reason = undefined;
    app.updated_at = new Date().toISOString();

    statusLogs.push({
      id: `log-${Date.now()}`,
      application_id: id,
      from_status: 'rejected',
      to_status: 'pending',
      note: 'ผู้สมัครอัปโหลดเอกสารแก้ไขเพิ่มเติม',
      changed_by: 'ผู้สมัคร',
      created_at: new Date().toISOString(),
    });

    return hydrateApplication(app);
  },

  // --- ENROLLMENTS ---
  enrollApplicant: (
    applicationId: string,
    enrollmentData: {
      guardian_name: string;
      guardian_relation: string;
      guardian_phone: string;
      witness_name?: string;
      student_code?: string;
      enrollment_date?: string;
      notes?: string;
    },
    changedBy = 'เจ้าหน้าที่งานทะเบียน'
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('ไม่พบใบสมัคร');

    // Generate student code if not provided
    // format: 70 (year) + 2 (Vocational / ปวช) or 3 (High Voc / ปวส) + dept_code + 4-digit seq
    let studentCode = enrollmentData.student_code;
    if (!studentCode) {
      const levelDigit = app.level === 'ระดับ ปวช.' ? '2' : '3';
      const dept = departments.find((d) => d.id === app.dept_choice_1);
      const deptCodeStr = dept ? String(dept.code).padStart(3, '0') : '001';
      const seq = applications.filter((a) => a.status === 'enrolled').length + 1;
      studentCode = `70${levelDigit}${deptCodeStr}${String(seq).padStart(4, '0')}`;
    }

    const enrollment: Enrollment = {
      id: `e-${Date.now()}`,
      application_id: applicationId,
      student_code: studentCode,
      guardian_name: enrollmentData.guardian_name,
      guardian_relation: enrollmentData.guardian_relation,
      guardian_phone: enrollmentData.guardian_phone,
      witness_name: enrollmentData.witness_name || 'อาจารย์สมศักดิ์ มั่นคง',
      enrollment_date: enrollmentData.enrollment_date || new Date().toISOString().split('T')[0],
      notes: enrollmentData.notes,
      created_at: new Date().toISOString(),
    };

    app.enrollment = enrollment;
    app.status = 'enrolled';
    app.updated_at = new Date().toISOString();

    statusLogs.push({
      id: `log-${Date.now()}`,
      application_id: applicationId,
      from_status: 'passed',
      to_status: 'enrolled',
      note: `บันทึกการมอบตัวนักเรียน/นักศึกษา รหัสประจำตัว ${studentCode}`,
      changed_by: changedBy,
      created_at: new Date().toISOString(),
    });

    return hydrateApplication(app);
  },

  // --- STATUS LOGS ---
  getStatusLogsByApplicationId: (applicationId: string) => {
    return statusLogs.filter((l) => l.application_id === applicationId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // --- STAFF AUTHENTICATION ---
  // ID: 11999, Password: 090450 as required by User
  authenticateStaff: (nationalId: string, password: string): StaffProfile | null => {
    const cleanId = nationalId.trim();
    const cleanPwd = password.trim();

    if (cleanId === '11999' && cleanPwd === '090450') {
      return {
        id: 'e0000000-0000-0000-0000-000000000001',
        national_id: '11999',
        full_name: 'นายประสิทธิ์ วงศ์สุวรรณ (ผู้ดูแลระบบงานรับสมัคร)',
        role: 'super_admin',
      };
    }

    if (cleanId === '12001' && cleanPwd === '090450') {
      return {
        id: 'e0000000-0000-0000-0000-000000000002',
        national_id: '12001',
        full_name: 'นางสาวจารุวรรณ ทับทิม (เจ้าหน้าที่งานทะเบียน)',
        role: 'registrar',
      };
    }

    if (cleanId === '12002' && cleanPwd === '090450') {
      return {
        id: 'e0000000-0000-0000-0000-000000000003',
        national_id: '12002',
        full_name: 'อาจารย์วิเชียร สมใจ (หัวหน้าแผนกช่างไฟฟ้ากำลัง)',
        role: 'dept_head',
        department_id: 'd0000000-0000-0000-0000-000000000001',
      };
    }

    return null;
  },

  // --- STATS OVERVIEW ---
  getDashboardStats: () => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const passed = applications.filter((a) => a.status === 'passed').length;
    const enrolled = applications.filter((a) => a.status === 'enrolled').length;

    // Applications by department
    const deptStats = departments.map((d) => {
      const count = applications.filter(
        (a) => a.dept_choice_1 === d.id || a.dept_choice_2 === d.id
      ).length;
      return {
        name: d.name.replace('แผนกวิชา', ''),
        fullName: d.name,
        code: d.code,
        count,
        quota_limit: d.quota_limit,
      };
    }).sort((a, b) => b.count - a.count);

    // Applications by level
    const levelStats = [
      { name: 'ปวช.', value: applications.filter((a) => a.level === 'ระดับ ปวช.').length, color: '#0B2A6F' },
      { name: 'ปวส. (สายตรง)', value: applications.filter((a) => a.level === 'ระดับ ปวส. (สายตรง)').length, color: '#D91E18' },
      { name: 'ปวส. (ต่างสาขา)', value: applications.filter((a) => a.level === 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)').length, color: '#F5B400' },
    ];

    // Daily trends (last 7 days)
    const dailyMap: { [date: string]: number } = {};
    for (const app of applications) {
      const dateStr = app.created_at.split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
    }
    const dailyStats = Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date: date.substring(5), // MM-DD
        fullDate: date,
        count: dailyMap[date],
      }));

    // Top Schools
    const schoolMap: { [school: string]: number } = {};
    for (const app of applications) {
      schoolMap[app.current_school] = (schoolMap[app.current_school] || 0) + 1;
    }
    const topSchools = Object.entries(schoolMap)
      .map(([school, count]) => ({ school, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By Province
    const provMap: { [prov: string]: number } = {};
    for (const app of applications) {
      const prov = app.address?.province || 'อื่นๆ';
      provMap[prov] = (provMap[prov] || 0) + 1;
    }
    const byProvince = Object.entries(provMap)
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);

    // By Referral Source
    const referralMap: { [src: string]: number } = {};
    for (const app of applications) {
      const src = app.referral_source || 'ไม่ระบุ';
      referralMap[src] = (referralMap[src] || 0) + 1;
    }
    const byReferral = Object.entries(referralMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      pending,
      rejected,
      passed,
      enrolled,
      deptStats,
      levelStats,
      dailyStats,
      topSchools,
      byProvince,
      byReferral,
    };
  },
};
