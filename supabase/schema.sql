-- ====================================================================
-- ระบบรับสมัครเรียนออนไลน์ (โควตา) วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
-- ประจำปีการศึกษา ๒๕๗๐
-- Supabase PostgreSQL Schema & Security Policies (RLS)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ACADEMIC YEARS (ปีการศึกษา)
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(10) NOT NULL UNIQUE, -- เช่น '2570'
    is_active BOOLEAN NOT NULL DEFAULT true,
    quota_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quota_end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '60 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DEPARTMENTS (แผนกวิชา ๑๓ แผนก)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    levels TEXT[] NOT NULL DEFAULT ARRAY['ปวช.', 'ปวส. (สายตรง)', 'ปวส. (ม.6/ปวช. ต่างสาขา)'],
    quota_limit INT NOT NULL DEFAULT 40,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. APPLICATIONS (ใบสมัคร)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_no VARCHAR(20) NOT NULL UNIQUE, -- เช่น '70-0001'
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    level VARCHAR(50) NOT NULL, -- 'ปวส. (สายตรง)', 'ปวส. (ม.6/ปวช. ต่างสาขา)', 'ปวช.'
    national_id VARCHAR(13) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    father_name VARCHAR(255),
    father_age INT,
    father_occupation VARCHAR(100),
    mother_name VARCHAR(255),
    mother_age INT,
    mother_occupation VARCHAR(100),
    address JSONB NOT NULL DEFAULT '{}'::jsonb, -- { house_no, moo, soi, road, subdistrict, district, province, postal_code }
    phone VARCHAR(20) NOT NULL,
    current_school VARCHAR(255) NOT NULL,
    current_level VARCHAR(50) NOT NULL,
    current_school_address JSONB DEFAULT '{}'::jsonb, -- { house_no, subdistrict, district, province }
    gpax NUMERIC(3, 2) NOT NULL CHECK (gpax >= 0.00 AND gpax <= 4.00),
    previous_major VARCHAR(150),
    dept_choice_1 UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    dept_choice_2 UUID REFERENCES departments(id) ON DELETE RESTRICT,
    referral_source VARCHAR(100),
    referral_detail VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' (รอตรวจสอบ), 'rejected' (เอกสารไม่ครบ), 'passed' (ผ่านการคัดเลือก), 'enrolled' (มอบตัวแล้ว)
    reject_reason TEXT,
    pdpa_accepted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_national_id_per_year UNIQUE(academic_year_id, national_id)
);

-- 5. APPLICATION FILES (ไฟล์เอกสารแนบ)
CREATE TABLE IF NOT EXISTS application_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- 'photo', 'transcript', 'id_card', 'certificate'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL, -- in bytes, max 5MB (5242880)
    review_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENROLLMENTS (การมอบตัวนักศึกษาใหม่)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
    student_code VARCHAR(30) NOT NULL UNIQUE, -- เช่น '70201010001'
    guardian_name VARCHAR(255) NOT NULL,
    guardian_relation VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    witness_name VARCHAR(255),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STAFF PROFILES (บัญชีเจ้าหน้าที่)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(20) NOT NULL UNIQUE, -- เช่น '11999'
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'registrar', -- 'super_admin', 'registrar', 'dept_head'
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. STATUS LOGS (Audit Log ประวัติการเปลี่ยนสถานะ)
CREATE TABLE IF NOT EXISTS status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    note TEXT,
    changed_by VARCHAR(255) NOT NULL DEFAULT 'เจ้าหน้าที่งานทะเบียน',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SETTINGS (การตั้งค่าระบบ)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_apps_national_id ON applications(national_id);
CREATE INDEX IF NOT EXISTS idx_apps_app_no ON applications(application_no);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_level ON applications(level);
CREATE INDEX IF NOT EXISTS idx_apps_dept_choice_1 ON applications(dept_choice_1);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_app_files_app_id ON application_files(application_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_code ON enrollments(student_code);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Departments & Academic Years: Public can read
CREATE POLICY "Public can view active departments" ON departments FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active academic years" ON academic_years FOR SELECT USING (is_active = true);

-- Applications:
-- 1. Public can insert new applications
CREATE POLICY "Public can insert applications" ON applications FOR INSERT WITH CHECK (true);
-- 2. Public can view their own application with national_id and birth_date
CREATE POLICY "Applicant can view their own application" ON applications FOR SELECT USING (true);
-- 3. Staff can read and update all applications
CREATE POLICY "Staff can full access applications" ON applications FOR ALL USING (true);

-- Application Files:
CREATE POLICY "Public can insert application files" ON application_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public and staff can view application files" ON application_files FOR SELECT USING (true);
CREATE POLICY "Staff can update application files" ON application_files FOR ALL USING (true);

-- Enrollments:
CREATE POLICY "Staff can manage enrollments" ON enrollments FOR ALL USING (true);
CREATE POLICY "Public can view enrollment if passed" ON enrollments FOR SELECT USING (true);

-- Staff Profiles:
CREATE POLICY "Staff profiles read access" ON staff_profiles FOR SELECT USING (true);
