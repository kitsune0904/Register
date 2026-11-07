'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddressSelector from './AddressSelector';
import ThaiDatePicker from './ThaiDatePicker';
import { Department, ApplicationLevel, ApplicationFile } from '@/types';
import { validateThaiNationalId } from '@/lib/thai-utils';
import {
  User,
  Users,
  MapPin,
  GraduationCap,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  FileText,
  Trash2,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationStepperProps {
  initialDepartments?: Department[];
  isWalkIn?: boolean;
}

const STORAGE_KEY = 'thaluang_quota_form_draft';

const STEPS = [
  { id: 1, title: 'ระดับ & ข้อมูลผู้สมัคร', icon: User },
  { id: 2, title: 'ข้อมูลบิดา-มารดา', icon: Users },
  { id: 3, title: 'ที่อยู่ & การติดต่อ', icon: MapPin },
  { id: 4, title: 'สถานศึกษา & สาขาวิชา', icon: GraduationCap },
  { id: 5, title: 'แนบเอกสารหลักฐาน', icon: UploadCloud },
  { id: 6, title: 'ตรวจสอบ & ยืนยัน', icon: FileCheck },
];

export default function ApplicationStepper({
  initialDepartments = [],
  isWalkIn = false,
}: ApplicationStepperProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Level
    level: 'ระดับ ปวช.' as ApplicationLevel,
    // Step 1: Personal
    full_name: '',
    national_id: '',
    birth_date: '2010-05-15',
    // Step 2: Parents
    father_name: '',
    father_age: '',
    father_occupation: '',
    mother_name: '',
    mother_age: '',
    mother_occupation: '',
    // Step 3: Address
    house_no: '',
    moo: '',
    soi: '',
    road: '',
    province: 'สระบุรี',
    district: 'บ้านหมอ',
    subdistrict: 'บ้านหมอ',
    postal_code: '18130',
    phone: '',
    // Step 4: School & Depts
    current_level: 'มัธยมศึกษาปีที่ 3',
    current_school: '',
    school_house_no: '',
    school_subdistrict: '',
    school_district: '',
    school_province: 'สระบุรี',
    gpax: '',
    previous_major: '',
    dept_choice_1: '',
    dept_choice_2: '',
    referral_source: 'อาจารย์แนะแนวที่โรงเรียนเดิม',
    referral_detail: '',
    // Step 5: Files
    files: [] as ApplicationFile[],
    // Step 6: PDPA
    pdpa_accepted: true,
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments if not passed
  useEffect(() => {
    if (departments.length === 0) {
      fetch('/api/departments')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setDepartments(data.data);
            if (!formData.dept_choice_1 && data.data.length > 0) {
              setFormData((prev) => ({ ...prev, dept_choice_1: data.data[0].id }));
            }
          }
        })
        .catch(console.error);
    }
  }, [departments.length, formData.dept_choice_1]);

  // Check saved draft in LocalStorage
  useEffect(() => {
    if (!isWalkIn) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHasDraft(true);
      }
    }
  }, [isWalkIn]);

  // Auto-save draft on changes (excluding large files buffer)
  useEffect(() => {
    if (!isWalkIn && formData.full_name) {
      const timer = setTimeout(() => {
        const draft = { ...formData, files: [] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, isWalkIn]);

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed, files: prev.files }));
        setHasDraft(false);
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
  };

  // Filter departments available for chosen level
  const availableDepts = departments.filter((d) => {
    if (!d.levels || d.levels.length === 0) return true;
    return d.levels.includes(formData.level);
  });

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.full_name.trim()) errs.full_name = 'กรุณากรอกชื่อ-นามสกุล';
      const cleanId = formData.national_id.replace(/\D/g, '');
      if (!cleanId) {
        errs.national_id = 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก';
      } else if (!validateThaiNationalId(cleanId)) {
        errs.national_id = 'เลขบัตรประชาชน 13 หลักไม่ถูกต้อง (Checksum ไม่ผ่าน)';
      }
      if (!formData.birth_date) errs.birth_date = 'กรุณาระบุวันเดือนปีเกิด';
    }

    if (step === 2) {
      // Parents optional but recommended
      if (formData.father_age && isNaN(Number(formData.father_age))) {
        errs.father_age = 'กรุณากรอกตัวเลข';
      }
      if (formData.mother_age && isNaN(Number(formData.mother_age))) {
        errs.mother_age = 'กรุณากรอกตัวเลข';
      }
    }

    if (step === 3) {
      if (!formData.house_no.trim()) errs.house_no = 'กรุณากรอกบ้านเลขที่';
      if (!formData.province) errs.province = 'กรุณาเลือกจังหวัด';
      if (!formData.district) errs.district = 'กรุณาเลือกอำเภอ';
      if (!formData.subdistrict) errs.subdistrict = 'กรุณาเลือกตำบล';
      if (!formData.postal_code) errs.postal_code = 'กรุณากรอกรหัสไปรษณีย์';
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        errs.phone = 'กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก';
      }
    }

    if (step === 4) {
      if (!formData.current_school.trim()) errs.current_school = 'กรุณากรอกชื่อโรงเรียนเดิม';
      const gpax = parseFloat(formData.gpax);
      if (isNaN(gpax) || gpax < 0 || gpax > 4) {
        errs.gpax = 'กรุณากรอกเกรดเฉลี่ยสะสม 0.00 - 4.00';
      }
      if (!formData.dept_choice_1) errs.dept_choice_1 = 'กรุณาเลือกสาขาวิชาที่ต้องการสมัคร';

      if (formData.level === 'ระดับ ปวช.') {
        if (!formData.dept_choice_2) {
          errs.dept_choice_2 = 'กรุณาเลือกสาขาวิชาลำดับที่ 2';
        } else if (formData.dept_choice_1 === formData.dept_choice_2) {
          errs.dept_choice_2 = 'สาขาวิชาลำดับที่ 1 และลำดับที่ 2 ต้องไม่ซ้ำกัน';
        }
      }
    }

    if (step === 5) {
      const hasPhoto = formData.files.some((f) => f.file_type === 'photo');
      const hasTranscript = formData.files.some((f) => f.file_type === 'transcript');
      const hasIdCard = formData.files.some((f) => f.file_type === 'id_card');

      if (!hasPhoto) errs.file_photo = 'กรุณาอัปโหลดรูปถ่ายหน้าตรงขนาด 1 นิ้ว';
      if (!hasTranscript) errs.file_transcript = 'กรุณาอัปโหลดสำเนาแสดงผลการเรียน 5 ภาคเรียน';
      if (!hasIdCard) errs.file_id_card = 'กรุณาอัปโหลดสำเนาบัตรประชาชน หรือสำเนาทะเบียนบ้าน';
    }

    if (step === 6) {
      if (!formData.pdpa_accepted) {
        errs.pdpa = 'กรุณาทำเครื่องหมายยินยอมข้อตกลง PDPA';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Handle File Upload Simulation & Validation
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'transcript' | 'id_card' | 'certificate'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert(`ไฟล์ "${file.name}" มีขนาดเกิน 5 MB กรุณาเลือกไฟล์ใหม่`);
      return;
    }

    // Check mime type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert(`ไฟล์ "${file.name}" ไม่ใช่ไฟล์ JPG, PNG หรือ PDF`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newFile: ApplicationFile = {
        id: `f-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        application_id: '',
        file_type: type,
        file_name: file.name,
        file_path: dataUrl, // preview data URL
        mime_type: file.type,
        file_size: file.size,
        review_status: 'pending',
      };

      setFormData((prev) => {
        // If certificate, allow multiple, else replace
        if (type === 'certificate') {
          return { ...prev, files: [...prev.files, newFile] };
        } else {
          return {
            ...prev,
            files: [...prev.files.filter((f) => f.file_type !== type), newFile],
          };
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  // Final Form Submission
  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gpax: parseFloat(formData.gpax),
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to success page with Application No & ID
      router.push(`/apply/success?app_no=${result.data.application_no}&id=${result.data.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Draft Recovery Notification */}
      {hasDraft && (
        <div className="p-4 rounded-2xl bg-gold-50 dark:bg-gold-950/30 border border-gold-300 dark:border-gold-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-gold-600 dark:text-gold-400 flex-shrink-0" />
            <span className="text-sm text-gold-900 dark:text-gold-200">
              พบข้อมูลร่างใบสมัครที่คุณเคยกรอกไว้ ต้องการกู้คืนข้อมูลหรือไม่?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDraft}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gold-500 hover:bg-gold-600 text-slate-900 transition-colors shadow-sm"
            >
              กู้คืนข้อมูล
            </button>
            <button
              onClick={clearDraft}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ละทิ้ง
            </button>
          </div>
        </div>
      )}

      {/* Stepper Header & Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="hidden md:flex items-center justify-between relative mb-6">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-navy-900 to-crimson-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => s.id < currentStep && setCurrentStep(s.id)}
                  disabled={s.id > currentStep}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-navy-900 text-white ring-4 ring-navy-600/20 shadow-lg scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </button>
                <span
                  className={`mt-2 text-xs font-semibold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-navy-900 dark:text-white'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper Indicator */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-navy-900 text-white font-bold text-sm flex items-center justify-center">
              {currentStep}
            </span>
            <div>
              <p className="text-xs text-slate-400 font-medium">ขั้นตอนที่ {currentStep} จาก 6</p>
              <h3 className="font-heading font-bold text-slate-800 dark:text-white text-sm">
                {STEPS[currentStep - 1].title}
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold text-crimson-600 dark:text-crimson-400">
            {Math.round((currentStep / 6) * 100)}%
          </span>
        </div>
      </div>

      {/* Form Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 flex items-center gap-3 text-crimson-700 dark:text-crimson-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* ================= STEP 1: LEVEL & PERSONAL ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-crimson-600" />
                <span>เลือกระดับชั้นที่ต้องการสมัคร</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                กรุณาเลือกระดับชั้นและกรอกข้อมูลส่วนตัวของผู้สมัครให้ถูกต้องตรงตามบัตรประชาชน
              </p>
            </div>

            {/* Level Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'ระดับ ปวช.',
                  label: 'ระดับ ปวช.',
                  sub: 'รับผู้จบ ม.3 หรือเทียบเท่า',
                },
                {
                  id: 'ระดับ ปวส. (สายตรง)',
                  label: 'ระดับ ปวส. (สายตรง)',
                  sub: 'รับผู้จบ ปวช. สาขาตรง',
                },
                {
                  id: 'ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)',
                  label: 'ระดับ ปวส. (ม.6/ต่างสาขา)',
                  sub: 'รับผู้จบ ม.6 หรือ ปวช. ต่างสาขา',
                },
              ].map((lvl) => (
                <label
                  key={lvl.id}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    formData.level === lvl.id
                      ? 'border-navy-900 dark:border-navy-500 bg-navy-50/60 dark:bg-navy-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {lvl.label}
                    </span>
                    <input
                      type="radio"
                      name="level"
                      value={lvl.id}
                      checked={formData.level === lvl.id}
                      onChange={(e) => {
                        const newLvl = e.target.value as ApplicationLevel;
                        setFormData((prev) => ({
                          ...prev,
                          level: newLvl,
                          dept_choice_1: '',
                          dept_choice_2: '',
                        }));
                      }}
                      className="w-4 h-4 text-navy-900"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{lvl.sub}</span>
                </label>
              ))}
            </div>

            {/* ข้อ ๑: ข้อมูลส่วนตัว */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">
                ข้อ ๑. ข้อมูลส่วนตัวผู้สมัคร
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อ-นามสกุล (มีคำนำหน้า เช่น นาย/นางสาว) <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="เช่น นายธนวัฒน์ พัฒนชัย"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                  {errors.full_name && <p className="text-xs text-crimson-600">{errors.full_name}</p>}
                </div>

                {/* 13-digit National ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    เลขประจำตัวประชาชน 13 หลัก <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={formData.national_id}
                    onChange={(e) =>
                      setFormData({ ...formData, national_id: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="เลขบัตร 13 หลัก ไม่ต้องใส่ขีด"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                  {errors.national_id && <p className="text-xs text-crimson-600">{errors.national_id}</p>}
                </div>

                {/* Birth Date (Thai calendar) */}
                <div className="sm:col-span-2">
                  <ThaiDatePicker
                    value={formData.birth_date}
                    onChange={(dateStr) => setFormData({ ...formData, birth_date: dateStr })}
                    label="วัน/เดือน/ปีเกิด (พ.ศ.)"
                  />
                  {errors.birth_date && <p className="text-xs text-crimson-600 mt-1">{errors.birth_date}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PARENTS ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-crimson-600" />
                <span>ข้อมูลบิดา - มารดา</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                กรอกข้อมูลผู้ให้กำเนิดเพื่อใช้เป็นประวัติระเบียนนักศึกษา
              </p>
            </div>

            {/* ข้อ ๒: ข้อมูลบิดา */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-navy-600" />
                <span>ข้อ ๒. ชื่อ-สกุลบิดา</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อ-สกุล บิดา
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    placeholder="เช่น นายสมเกียรติ พัฒนชัย"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อายุ (ปี)
                  </label>
                  <input
                    type="number"
                    value={formData.father_age}
                    onChange={(e) => setFormData({ ...formData, father_age: e.target.value })}
                    placeholder="เช่น 48"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อาชีพ บิดา
                  </label>
                  <input
                    type="text"
                    value={formData.father_occupation}
                    onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                    placeholder="เช่น พนักงานโรงงาน / ธุรกิจส่วนตัว / รับราชการ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ข้อ ๓: ข้อมูลมารดา */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-crimson-600" />
                <span>ข้อ ๓. ชื่อ-สกุลมารดา</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อ-สกุล มารดา
                  </label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    placeholder="เช่น นางวิภาดา พัฒนชัย"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อายุ (ปี)
                  </label>
                  <input
                    type="number"
                    value={formData.mother_age}
                    onChange={(e) => setFormData({ ...formData, mother_age: e.target.value })}
                    placeholder="เช่น 45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อาชีพ มารดา
                  </label>
                  <input
                    type="text"
                    value={formData.mother_occupation}
                    onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                    placeholder="เช่น ค้าขาย / แม่บ้าน / พนักงานบริษัท"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ADDRESS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-crimson-600" />
                <span>ข้อ ๔. ที่อยู่ปัจจุบันที่สามารถติดต่อได้</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                กรุณาระบุที่อยู่ที่สามารถรับเอกสารหรือติดต่อได้ พร้อมเบอร์โทรศัพท์ที่ใช้งานจริง
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* House No */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  บ้านเลขที่ <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.house_no}
                  onChange={(e) => setFormData({ ...formData, house_no: e.target.value })}
                  placeholder="เช่น 120/4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                />
                {errors.house_no && <p className="text-xs text-crimson-600">{errors.house_no}</p>}
              </div>

              {/* Moo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  หมู่ที่
                </label>
                <input
                  type="text"
                  value={formData.moo}
                  onChange={(e) => setFormData({ ...formData, moo: e.target.value })}
                  placeholder="เช่น 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                />
              </div>

              {/* Soi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ซอย
                </label>
                <input
                  type="text"
                  value={formData.soi}
                  onChange={(e) => setFormData({ ...formData, soi: e.target.value })}
                  placeholder="เช่น ซอย 4 หรือ -"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                />
              </div>

              {/* Road */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ถนน
                </label>
                <input
                  type="text"
                  value={formData.road}
                  onChange={(e) => setFormData({ ...formData, road: e.target.value })}
                  placeholder="เช่น พหลโยธิน หรือ -"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Cascading Address Selector (Province -> Amphoe -> Tambon -> Zip) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <AddressSelector
                province={formData.province}
                district={formData.district}
                subdistrict={formData.subdistrict}
                postalCode={formData.postal_code}
                onChange={(fields) =>
                  setFormData({
                    ...formData,
                    province: fields.province,
                    district: fields.district,
                    subdistrict: fields.subdistrict,
                    postal_code: fields.postalCode,
                  })
                }
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 max-w-sm">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                หมายเลขโทรศัพท์ที่ติดต่อได้ (10 หลัก) <span className="text-crimson-600">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="เช่น 0812345678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none"
              />
              {errors.phone && <p className="text-xs text-crimson-600">{errors.phone}</p>}
            </div>
          </div>
        )}

        {/* ================= STEP 4: SCHOOL & MAJORS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-crimson-600" />
                <span>สถานศึกษาปัจจุบัน & สาขาวิชาที่ต้องการสมัคร</span>
              </h2>
            </div>

            {/* ข้อ ๕: สถานศึกษา */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">
                ข้อ ๕. ข้อมูลสถานศึกษาเดิม
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    กำลังศึกษาอยู่ในระดับชั้น <span className="text-crimson-600">*</span>
                  </label>
                  <select
                    value={formData.current_level}
                    onChange={(e) => setFormData({ ...formData, current_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  >
                    <option value="มัธยมศึกษาปีที่ 3">มัธยมศึกษาปีที่ 3</option>
                    <option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6</option>
                    <option value="ประกาศนียบัตรวิชาชีพปีที่ 3">ประกาศนียบัตรวิชาชีพปีที่ 3 (ปวช.3)</option>
                    <option value="เทียบเท่า">อื่นๆ / เทียบเท่า</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อโรงเรียน / สถานศึกษาเดิม <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.current_school}
                    onChange={(e) => setFormData({ ...formData, current_school: e.target.value })}
                    placeholder="เช่น โรงเรียนบ้านหมอ 'พัฒนานุกูล' หรือ โรงเรียนสระบุรีวิทยาคม"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                  {errors.current_school && <p className="text-xs text-crimson-600">{errors.current_school}</p>}
                </div>

                {/* School Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ตั้งอยู่ตำบล
                  </label>
                  <input
                    type="text"
                    value={formData.school_subdistrict}
                    onChange={(e) => setFormData({ ...formData, school_subdistrict: e.target.value })}
                    placeholder="เช่น บ้านหมอ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อำเภอ
                  </label>
                  <input
                    type="text"
                    value={formData.school_district}
                    onChange={(e) => setFormData({ ...formData, school_district: e.target.value })}
                    placeholder="เช่น บ้านหมอ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    value={formData.school_province}
                    onChange={(e) => setFormData({ ...formData, school_province: e.target.value })}
                    placeholder="เช่น สระบุรี"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                {/* GPAX & Prev Major */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ผลการเรียนเฉลี่ยสะสม (GPAX) <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpax}
                    onChange={(e) => setFormData({ ...formData, gpax: e.target.value })}
                    placeholder="0.00 - 4.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  />
                  {errors.gpax && <p className="text-xs text-crimson-600">{errors.gpax}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    สาขาวิชาเดิม / แผนการเรียนเดิม (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={formData.previous_major}
                    onChange={(e) => setFormData({ ...formData, previous_major: e.target.value })}
                    placeholder="เช่น วิทย์-คณิต / ช่างยนต์ / พาณิชยการ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ข้อ ๖: สาขาวิชาที่ต้องการสมัคร */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson-600" />
                <span>ข้อ ๖. ต้องการสมัครเข้าเรียน</span>
                <span className="text-xs font-normal text-slate-500">({formData.level})</span>
              </h3>

              {formData.level.includes('ปวส') ? (
                // ปวส. เลือก 1 สาขา
                <div className="space-y-1.5 max-w-xl">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    เลือกสาขาวิชาที่ต้องการศึกษาต่อ (ระดับ ปวส. เลือก ๑ สาขาวิชา){' '}
                    <span className="text-crimson-600">*</span>
                  </label>
                  <select
                    value={formData.dept_choice_1}
                    onChange={(e) => setFormData({ ...formData, dept_choice_1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-600 focus:outline-none"
                  >
                    <option value="">-- เลือกสาขาวิชา --</option>
                    {availableDepts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.dept_choice_1 && (
                    <p className="text-xs text-crimson-600">{errors.dept_choice_1}</p>
                  )}
                </div>
              ) : (
                // ปวช. เลือก 2 สาขา (ลำดับ 1 และ ลำดับ 2 ห้ามซ้ำกัน)
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      สาขาวิชาลำดับที่ ๑ <span className="text-crimson-600">*</span>
                    </label>
                    <select
                      value={formData.dept_choice_1}
                      onChange={(e) => setFormData({ ...formData, dept_choice_1: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-600 focus:outline-none"
                    >
                      <option value="">-- เลือกสาขาวิชาลำดับที่ 1 --</option>
                      {availableDepts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.dept_choice_1 && (
                      <p className="text-xs text-crimson-600">{errors.dept_choice_1}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      สาขาวิชาลำดับที่ ๒ <span className="text-crimson-600">* (ห้ามซ้ำกับลำดับที่ 1)</span>
                    </label>
                    <select
                      value={formData.dept_choice_2}
                      onChange={(e) => setFormData({ ...formData, dept_choice_2: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-600 focus:outline-none"
                    >
                      <option value="">-- เลือกสาขาวิชาลำดับที่ 2 --</option>
                      {availableDepts.map((d) => (
                        <option key={d.id} value={d.id} disabled={d.id === formData.dept_choice_1}>
                          {d.name} {d.id === formData.dept_choice_1 ? '(เลือกในลำดับ 1 แล้ว)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.dept_choice_2 && (
                      <p className="text-xs text-crimson-600">{errors.dept_choice_2}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Referral Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ช่องทางที่รู้จักวิทยาลัย
                  </label>
                  <select
                    value={formData.referral_source}
                    onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="อาจารย์แนะแนวที่โรงเรียนเดิม">อาจารย์แนะแนวที่โรงเรียนเดิม</option>
                    <option value="เพจ Facebook วิทยาลัย">เพจ Facebook วิทยาลัย</option>
                    <option value="รุ่นพี่/เพื่อนชักชวน">รุ่นพี่/เพื่อนชักชวน</option>
                    <option value="ป้ายไวนิล/แผ่นพับประชาสัมพันธ์">ป้ายไวนิล/แผ่นพับประชาสัมพันธ์</option>
                    <option value="กิจกรรม Open House">กิจกรรม Open House</option>
                    <option value="ผู้ปกครองแนะนำ">ผู้ปกครองแนะนำ</option>
                    <option value="เว็บไซต์วิทยาลัย">เว็บไซต์วิทยาลัย</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่ออาจารย์แนะแนว หรือรายละเอียดเพิ่มเติม
                  </label>
                  <input
                    type="text"
                    value={formData.referral_detail}
                    onChange={(e) => setFormData({ ...formData, referral_detail: e.target.value })}
                    placeholder="เช่น อ.สมคิด มั่นจิต หรือ ครูแนะแนว"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: DOCUMENT UPLOAD ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-6 h-6 text-crimson-600" />
                <span>หลักฐานประกอบการสมัคร (อัปโหลดเอกสาร)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                รองรับไฟล์ภาพ JPG, PNG หรือไฟล์ PDF ขนาดไม่เกิน 5 MB ต่อไฟล์
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Doc 1: Photo 1 inch */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                      ๑. รูปถ่ายหน้าตรง ๑ นิ้ว
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson-100 text-crimson-700">
                      บังคับ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    ชุดนักเรียน/นักศึกษา หน้าตรง ไม่สวมหมวกหรือแว่นตาดำ
                  </p>

                  {/* Preview if exists */}
                  {formData.files.find((f) => f.file_type === 'photo') ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 flex items-center gap-3">
                      <img
                        src={formData.files.find((f) => f.file_type === 'photo')?.file_path}
                        alt="Preview"
                        className="w-16 h-20 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold truncate text-slate-800 dark:text-white">
                          {formData.files.find((f) => f.file_type === 'photo')?.file_name}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">✓ แนบไฟล์แล้ว</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFile(formData.files.find((f) => f.file_type === 'photo')!.id)
                        }
                        className="p-1.5 rounded-lg text-crimson-600 hover:bg-crimson-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-navy-600 bg-white dark:bg-slate-800 cursor-pointer transition-all">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-navy-900 dark:text-slate-200">
                        เลือกรูปถ่าย 1 นิ้ว
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">JPG, PNG &le; 5MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.file_photo && <p className="text-xs text-crimson-600">{errors.file_photo}</p>}
              </div>

              {/* Doc 2: Transcript (5 terms) */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                      ๒. ปพ.๑ (๕ ภาคเรียน)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson-100 text-crimson-700">
                      บังคับ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน จำนวน 1 ฉบับ
                  </p>

                  {formData.files.find((f) => f.file_type === 'transcript') ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-7 h-7 text-navy-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold truncate text-slate-800 dark:text-white">
                            {formData.files.find((f) => f.file_type === 'transcript')?.file_name}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium">✓ แนบไฟล์แล้ว</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFile(formData.files.find((f) => f.file_type === 'transcript')!.id)
                        }
                        className="p-1.5 rounded-lg text-crimson-600 hover:bg-crimson-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-navy-600 bg-white dark:bg-slate-800 cursor-pointer transition-all">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-navy-900 dark:text-slate-200">
                        เลือกไฟล์ ปพ.๑
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG &le; 5MB</span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => handleFileUpload(e, 'transcript')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.file_transcript && (
                  <p className="text-xs text-crimson-600">{errors.file_transcript}</p>
                )}
              </div>

              {/* Doc 3: ID Card / House Registration */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                      ๓. สำเนาบัตร ปชช. / ทะเบียนบ้าน
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson-100 text-crimson-700">
                      บังคับ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    สำเนาบัตรประชาชน หรือ สำเนาทะเบียนบ้าน จำนวน 1 ฉบับ
                  </p>

                  {formData.files.find((f) => f.file_type === 'id_card') ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-7 h-7 text-navy-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold truncate text-slate-800 dark:text-white">
                            {formData.files.find((f) => f.file_type === 'id_card')?.file_name}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium">✓ แนบไฟล์แล้ว</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFile(formData.files.find((f) => f.file_type === 'id_card')!.id)
                        }
                        className="p-1.5 rounded-lg text-crimson-600 hover:bg-crimson-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-navy-600 bg-white dark:bg-slate-800 cursor-pointer transition-all">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-navy-900 dark:text-slate-200">
                        เลือกไฟล์สำเนาบัตร/ทะเบียนบ้าน
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG &le; 5MB</span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => handleFileUpload(e, 'id_card')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.file_id_card && <p className="text-xs text-crimson-600">{errors.file_id_card}</p>}
              </div>
            </div>

            {/* Doc 4: Certificate / Awards (Optional, Multiple) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                    ๔. สำเนาเกียรติบัตร / ใบรับรองความสามารถพิเศษ (ถ้ามี)
                  </h4>
                  <p className="text-xs text-slate-500">
                    อัปโหลดผลงาน เกียรติประวัติ หรือกิจกรรมเพื่อประกอบการพิจารณาโควตาพิเศษ (แนบได้หลายไฟล์)
                  </p>
                </div>
                <label className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 cursor-pointer transition-colors shadow-sm">
                  + เพิ่มไฟล์เกียรติบัตร
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => handleFileUpload(e, 'certificate')}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.files.filter((f) => f.file_type === 'certificate').length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {formData.files
                    .filter((f) => f.file_type === 'certificate')
                    .map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Sparkles className="w-4 h-4 text-gold-500 flex-shrink-0" />
                          <span className="text-xs font-medium truncate text-slate-700 dark:text-slate-200">
                            {cert.file_name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(cert.id)}
                          className="p-1 rounded text-crimson-600 hover:bg-crimson-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 6: REVIEW & PDPA ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-emerald-600" />
                <span>ตรวจสอบข้อมูลใบสมัคร & ยืนยันการส่ง</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                โปรดตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนกดยืนยันการสมัคร
              </p>
            </div>

            {/* Review Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-navy-900 dark:text-navy-300 block">
                  ระดับชั้นและสาขาวิชาที่สมัคร
                </span>
                <p>
                  <strong>ระดับ:</strong> {formData.level}
                </p>
                <p>
                  <strong>สาขาวิชาลำดับ 1:</strong>{' '}
                  {departments.find((d) => d.id === formData.dept_choice_1)?.name || '-'}
                </p>
                {formData.level === 'ระดับ ปวช.' && (
                  <p>
                    <strong>สาขาวิชาลำดับ 2:</strong>{' '}
                    {departments.find((d) => d.id === formData.dept_choice_2)?.name || '-'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-navy-900 dark:text-navy-300 block">
                  ข้อมูลผู้สมัคร
                </span>
                <p>
                  <strong>ชื่อ-นามสกุล:</strong> {formData.full_name}
                </p>
                <p>
                  <strong>เลขบัตรประชาชน:</strong> {formData.national_id}
                </p>
                <p>
                  <strong>วันเกิด:</strong> {formData.birth_date}
                </p>
                <p>
                  <strong>เบอร์โทรศัพท์:</strong> {formData.phone}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-navy-900 dark:text-navy-300 block">
                  ที่อยู่ติดต่อ
                </span>
                <p>
                  {formData.house_no} ม.{formData.moo || '-'} ซ.{formData.soi || '-'} ถ.
                  {formData.road || '-'} ต.{formData.subdistrict} อ.{formData.district} จ.
                  {formData.province} {formData.postal_code}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-navy-900 dark:text-navy-300 block">
                  สถานศึกษาเดิม & เกรดเฉลี่ย
                </span>
                <p>
                  <strong>โรงเรียน:</strong> {formData.current_school} ({formData.current_level})
                </p>
                <p>
                  <strong>GPAX:</strong> <span className="font-bold text-crimson-600">{formData.gpax}</span>
                </p>
                <p>
                  <strong>เอกสารแนบ:</strong> {formData.files.length} รายการ
                </p>
              </div>
            </div>

            {/* PDPA Consent Box */}
            <div className="p-5 rounded-2xl bg-navy-50/70 dark:bg-navy-950/40 border border-navy-200 dark:border-navy-800 space-y-3">
              <div className="flex items-center gap-2 text-navy-900 dark:text-navy-200 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-navy-700 dark:text-navy-400" />
                <span>การคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ข้าพเจ้ายินยอมให้วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลและเอกสารหลักฐานที่แนบมานี้
                เพื่อประโยชน์ในการคัดเลือกเข้าศึกษา การจัดทำระเบียนประวัตินักเรียนนักศึกษา
                และการติดต่อสื่อสารตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
              </p>
              <label className="flex items-center gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pdpa_accepted}
                  onChange={(e) => setFormData({ ...formData, pdpa_accepted: e.target.checked })}
                  className="w-5 h-5 rounded text-navy-900 focus:ring-navy-600 border-slate-300"
                />
                <span className="text-xs font-bold text-navy-950 dark:text-white">
                  ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดข้างต้นเป็นความจริงทุกประการ และยอมรับเงื่อนไข PDPA
                </span>
              </label>
              {errors.pdpa && <p className="text-xs text-crimson-600">{errors.pdpa}</p>}
            </div>
          </div>
        )}

        {/* Action Buttons (Back / Next / Submit) */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white shadow-md shadow-navy-900/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>ถัดไป</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white shadow-lg shadow-crimson-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-gold-300" />
                  <span>ยืนยันการส่งใบสมัครโควตา</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
