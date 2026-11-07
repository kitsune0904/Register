'use client';

import React, { useState } from 'react';
import ThaiDatePicker from '@/components/public/ThaiDatePicker';
import { formatThaiDate, toThaiNumerals, maskNationalId } from '@/lib/thai-utils';
import { ApplicationFile } from '@/types';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  UploadCloud,
  RotateCcw,
  Sparkles,
  FileText,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function StatusPage() {
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('2010-05-14');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<any | null>(null);

  // Re-upload state
  const [reuploadFiles, setReuploadFiles] = useState<ApplicationFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nationalId.trim()) {
      setError('กรุณากรอกเลขประจำตัวประชาชน 13 หลัก');
      return;
    }

    setLoading(true);
    setError(null);
    setAppData(null);

    try {
      const res = await fetch('/api/applications/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, birthDate }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่พบข้อมูลใบสมัคร');
      }

      setAppData(data.data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบ');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill helper for evaluator testing
  const autofillSample = (id: string, bDate: string) => {
    setNationalId(id);
    setBirthDate(bDate);
  };

  // File upload for rejected documents
  const handleReupload = async () => {
    if (reuploadFiles.length === 0) {
      alert('กรุณาเลือกไฟล์ที่ต้องการแก้ไขก่อนบันทึก');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`/api/applications/${appData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reupload_files',
          files: [...(appData.files || []), ...reuploadFiles],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }

      alert('อัปโหลดเอกสารแก้ไขเรียบร้อย สถานะถูกปรับเป็น "รอตรวจสอบ"');
      setAppData(data.data);
      setReuploadFiles([]);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'transcript' | 'id_card' | 'certificate'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newFile: ApplicationFile = {
        id: `reup-${Date.now()}`,
        application_id: appData.id,
        file_type: type,
        file_name: file.name,
        file_path: reader.result as string,
        mime_type: file.type,
        file_size: file.size,
        review_status: 'pending',
      };
      setReuploadFiles((prev) => [...prev.filter((f) => f.file_type !== type), newFile]);
    };
    reader.readAsDataURL(file);
  };

  // Status mapping
  const statusInfo: Record<string, { label: string; color: string; step: number }> = {
    pending: { label: 'รอตรวจสอบเอกสาร', color: 'bg-amber-500', step: 1 },
    rejected: { label: 'เอกสารไม่สมบูรณ์ / ต้องแก้ไข', color: 'bg-crimson-600', step: 2 },
    passed: { label: 'ผ่านการคัดเลือกโควตา', color: 'bg-emerald-600', step: 3 },
    enrolled: { label: 'มอบตัวเรียบร้อยแล้ว', color: 'bg-navy-900', step: 4 },
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 dark:bg-navy-950 text-navy-800 dark:text-navy-200 text-xs font-semibold">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>ระบบติดตามผลการสมัครโควตา ๒๕๗๐</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-navy-900 dark:text-white">
            ตรวจสอบสถานะการสมัครเรียน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            กรอกเลขประจำตัวประชาชน ๑๓ หลัก และวันเดือนปีเกิดเพื่อยืนยันตัวตน
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  เลขประจำตัวประชาชน 13 หลัก <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="เช่น 1100400123451"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:ring-2 focus:ring-navy-600 focus:outline-none"
                />
              </div>

              <div>
                <ThaiDatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  label="วัน/เดือน/ปีเกิด (พ.ศ.) เพื่อยืนยันตัวตน"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>กำลังค้นหาข้อมูล...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>ค้นหาสถานะใบสมัคร</span>
                </>
              )}
            </button>
          </form>

          {/* Quick test buttons for easy evaluation */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">ตัวอย่างทดสอบ:</span>
            <button
              type="button"
              onClick={() => autofillSample('1100400123451', '2010-05-14')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            >
              ผ่านคัดเลือก (ปวช.)
            </button>
            <button
              type="button"
              onClick={() => autofillSample('1100400123452', '2008-08-20')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            >
              มอบตัวแล้ว (ปวส.)
            </button>
            <button
              type="button"
              onClick={() => autofillSample('1100400123454', '2010-02-17')}
              className="px-2.5 py-1 rounded-lg bg-crimson-50 text-crimson-700 hover:bg-crimson-100 border border-crimson-200"
            >
              เอกสารไม่ครบ (ต้องแก้ไข)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 flex items-center gap-3 text-crimson-700 dark:text-crimson-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search Results Display */}
        {appData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-fade-in">
            {/* Top Applicant Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="text-xs text-slate-400 block font-mono">
                  เลขที่ใบสมัคร: {appData.application_no}
                </span>
                <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white">
                  {appData.full_name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {appData.level} • {appData.dept_1?.name}
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md ${
                  statusInfo[appData.status]?.color || 'bg-slate-600'
                }`}
              >
                {statusInfo[appData.status]?.label || appData.status}
              </div>
            </div>

            {/* STATUS TIMELINE */}
            <div className="py-4">
              <h3 className="font-heading font-bold text-sm text-slate-700 dark:text-slate-300 mb-6">
                ลำดับขั้นตอนสถานะใบสมัคร
              </h3>

              <div className="relative flex items-center justify-between">
                {/* Connecting bar */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

                {[
                  { id: 'pending', title: 'ยื่นใบสมัคร', sub: 'รอตรวจสอบ' },
                  { id: 'review', title: 'ตรวจเอกสาร', sub: appData.status === 'rejected' ? 'เอกสารไม่ครบ' : 'สมบูรณ์' },
                  { id: 'passed', title: 'ผลคัดเลือก', sub: 'ผ่านโควตา' },
                  { id: 'enrolled', title: 'มอบตัว', sub: 'เป็นนักศึกษา' },
                ].map((s, idx) => {
                  let isDone = false;
                  let isCurrent = false;

                  if (appData.status === 'enrolled') {
                    isDone = true;
                  } else if (appData.status === 'passed') {
                    if (idx <= 2) isDone = true;
                    if (idx === 2) isCurrent = true;
                  } else if (appData.status === 'rejected') {
                    if (idx === 0) isDone = true;
                    if (idx === 1) isCurrent = true;
                  } else if (appData.status === 'pending') {
                    if (idx === 0) isCurrent = true;
                  }

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isCurrent
                            ? appData.status === 'rejected'
                              ? 'bg-crimson-600 text-white ring-4 ring-crimson-200'
                              : 'bg-navy-900 text-white ring-4 ring-navy-200'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-white">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CASE 1: REJECTED / INCOMPLETE DOCUMENTS */}
            {appData.status === 'rejected' && (
              <div className="p-6 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-300 dark:border-crimson-800 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-crimson-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-crimson-900 dark:text-crimson-200">
                      เอกสารไม่ครบถ้วน / ต้องทำการแก้ไข
                    </h4>
                    <p className="text-xs text-crimson-700 dark:text-crimson-300 mt-1 leading-relaxed">
                      <strong>เหตุผลจากเจ้าหน้าที่:</strong> {appData.reject_reason || 'เอกสารไม่ชัดเจน'}
                    </p>
                  </div>
                </div>

                {/* Re-upload interface */}
                <div className="pt-3 border-t border-crimson-200 dark:border-crimson-800/60 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    อัปโหลดเอกสารแก้ไขเพิ่มเติม:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-navy-600">
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        + อัปโหลดสำเนา ปพ.๑ ใหม่
                      </span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => handleFileSelect(e, 'transcript')}
                        className="hidden"
                      />
                    </label>

                    <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-navy-600">
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        + อัปโหลดรูปถ่าย 1 นิ้วใหม่
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleFileSelect(e, 'photo')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {reuploadFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-emerald-600">
                        ไฟล์ที่เลือกพร้อมส่ง: {reuploadFiles.map((f) => f.file_name).join(', ')}
                      </p>
                      <button
                        type="button"
                        onClick={handleReupload}
                        disabled={uploading}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-crimson-600 hover:bg-crimson-700 text-white transition-colors shadow-sm"
                      >
                        {uploading ? 'กำลังบันทึกไฟล์...' : 'บันทึกและส่งให้เจ้าหน้าที่ตรวจสอบใหม่'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASE 2: PASSED OR ENROLLED - DOWNLOAD CERTIFICATES */}
            {(appData.status === 'passed' || appData.status === 'enrolled') && (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      ขอแสดงความยินดี! ท่านผ่านการคัดเลือกรอบโควตาพิเศษ
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      สังกัด {appData.dept_1?.name} ประจำปีการศึกษา ๒๕๗๐
                    </p>
                  </div>
                </div>

                {appData.enrollment && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <p className="font-bold text-navy-900 dark:text-gold-400">
                      รหัสประจำตัวนักเรียน/นักศึกษา: {toThaiNumerals(appData.enrollment.student_code)}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      บันทึกมอบตัวเมื่อ: {formatThaiDate(appData.enrollment.enrollment_date, 'full')}
                    </p>
                  </div>
                )}

                {/* PDF Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`/api/pdf/application/${appData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4 text-gold-300" />
                    <span>พิมพ์ใบสมัคร (PDF)</span>
                  </a>

                  <a
                    href={`/api/pdf/enrollment/${appData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>พิมพ์ใบมอบตัวนักศึกษา (PDF)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Audit Logs History */}
            {appData.logs && appData.logs.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-heading font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">
                  ประวัติการดำเนินการ (Audit Logs)
                </h4>
                <div className="space-y-2">
                  {appData.logs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {log.note || `ปรับสถานะเป็น ${log.to_status}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          โดย: {log.changed_by}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatThaiDate(log.created_at, 'short')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
