export type ApplicationLevel = 
  | 'ระดับ ปวช.' 
  | 'ระดับ ปวส. (สายตรง)' 
  | 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)';

export type ApplicationStatus = 'pending' | 'rejected' | 'passed' | 'enrolled';

export interface Address {
  house_no: string;
  moo?: string;
  soi?: string;
  road?: string;
  subdistrict: string;
  district: string;
  province: string;
  postal_code: string;
}

export interface SchoolAddress {
  house_no?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
}

export interface Department {
  id: string;
  code: number;
  name: string;
  levels: ApplicationLevel[];
  quota_limit: number;
  is_active: boolean;
  created_at?: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  is_active: boolean;
  quota_start_date: string;
  quota_end_date: string;
}

export interface ApplicationFile {
  id: string;
  application_id: string;
  file_type: 'photo' | 'transcript' | 'id_card' | 'certificate';
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  review_status: 'pending' | 'approved' | 'rejected';
  note?: string;
  created_at?: string;
}

export interface Enrollment {
  id: string;
  application_id: string;
  student_code: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_phone: string;
  witness_name?: string;
  enrollment_date: string;
  notes?: string;
  created_at?: string;
}

export interface Application {
  id: string;
  application_no: string;
  academic_year_id?: string;
  level: ApplicationLevel;
  national_id: string;
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  father_name?: string;
  father_age?: number;
  father_occupation?: string;
  mother_name?: string;
  mother_age?: number;
  mother_occupation?: string;
  address: Address;
  phone: string;
  current_school: string;
  current_level: string;
  current_school_address?: SchoolAddress;
  gpax: number;
  previous_major?: string;
  dept_choice_1: string; // Department UUID
  dept_choice_2?: string; // Department UUID (for ปวช.)
  referral_source?: string;
  referral_detail?: string;
  status: ApplicationStatus;
  reject_reason?: string;
  pdpa_accepted: boolean;
  created_at: string;
  updated_at?: string;

  // Joined fields
  dept_1?: Department;
  dept_2?: Department;
  files?: ApplicationFile[];
  enrollment?: Enrollment;
}

export interface StaffProfile {
  id: string;
  national_id: string;
  full_name: string;
  role: 'super_admin' | 'registrar' | 'dept_head';
  department_id?: string;
}

export interface StatusLog {
  id: string;
  application_id: string;
  from_status?: string;
  to_status: string;
  note?: string;
  changed_by: string;
  created_at: string;
}

export interface ThaiAddressItem {
  province: string;
  amphoes: {
    name: string;
    tambons: {
      name: string;
      zip: string;
    }[];
  }[];
}
