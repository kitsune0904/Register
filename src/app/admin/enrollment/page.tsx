'use client';

import React, { useEffect, useState } from 'react';
import { Application } from '@/types';
import { formatThaiDate, toThaiNumerals } from '@/lib/thai-utils';
import {
  UserCheck,
  Search,
  Printer,
  FileText,
  Download,
  CheckCircle2,
  X,
  AlertCircle,
  Plus,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function AdminEnrollmentPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected for enrollment
  const [enrollModalApp, setEnrollModalApp] = useState<Application | null>(null);
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('บิดา');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [witnessName, setWitnessName] = useState('อาจารย์สมศักดิ์ มั่นคง');
  const [customStudentCode, setCustomStudentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPassedApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) {
        // Show passed or already enrolled
        setApplications(
          data.data.filter((a: Application) => a.status === 'passed' || a.status === 'enrolled')
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassedApplicants();
  }, []);

  const openEnrollModal = (app: Application) => {
    setEnrollModalApp(app);
    setGuardianName(app.enrollment?.guardian_name || app.father_name || app.mother_name || '');
    setGuardianRelation(app.enrollment?.guardian_relation || (app.father_name ? 'บิดา' : 'มารดา'));
    setGuardianPhone(app.enrollment?.guardian_phone || app.phone || '');
    setWitnessName(app.enrollment?.witness_name || 'อาจารย์สมศักดิ์ มั่นคง (หัวหน้างานทะเบียน)');
    setCustomStudentCode(app.enrollment?.student_code || '');
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollModalApp) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${enrollModalApp.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardian_name: guardianName,
          guardian_relation: guardianRelation,
          guardian_phone: guardianPhone,
          witness_name: witnessName,
          student_code: customStudentCode || undefined,
          changed_by: 'นายประสิทธิ์ วงศ์สุวรรณ (Admin)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการมอบตัว');
      }

      setEnrollModalApp(null);
      fetchPassedApplicants();
      alert('บันทึกการมอบตัวและออกรหัสนักศึกษาใหม่สำเร็จ!');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = applications.filter((app) => {
    const s = search.toLowerCase();
    return (
      !search ||
      app.full_name.toLowerCase().includes(s) ||
      app.application_no.toLowerCase().includes(s) ||
      (app.enrollment?.student_code && app.enrollment.student_code.includes(s))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-crimson-600" />
            <span>ระบบบันทึกการมอบตัว & ออกรหัสนักศึกษาใหม่</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกสัญญาการมอบตัว ข้อมูลผู้ปกครอง พยาน และออกรหัสนักศึกษาตามเกณฑ์ สอศ.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, เลขที่, รหัสนักศึกษา..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-navy-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="p-4">เลขที่ใบสมัคร</th>
                <th className="p-4">ชื่อ-นามสกุล นักศึกษา</th>
                <th className="p-4">ระดับ / แผนกวิชา</th>
                <th className="p-4">สถานะการมอบตัว</th>
                <th className="p-4">รหัสนักศึกษาใหม่</th>
                <th className="p-4">ผู้ปกครอง / เบอร์ติดต่อ</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    ไม่พบผู้สมัครที่ผ่านเกณฑ์หรือมอบตัว
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-navy-900 dark:text-gold-400">
                      {app.application_no}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {app.full_name}
                      </p>
                      <p className="text-[11px] text-slate-400">{app.current_school}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {app.level.replace('ระดับ ', '')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {app.dept_1?.name?.replace('แผนกวิชา', '')}
                      </p>
                    </td>
                    <td className="p-4">
                      {app.status === 'enrolled' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-800 dark:bg-navy-950 dark:text-gold-300">
                          ✓ มอบตัวเรียบร้อย
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ผ่านคัดเลือก (รอมอบตัว)
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-sm text-crimson-600 dark:text-crimson-400">
                      {app.enrollment?.student_code || '-'}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {app.enrollment?.guardian_name || app.father_name || '-'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {app.enrollment?.guardian_phone || app.phone}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Enroll / Edit Button */}
                        <button
                          onClick={() => openEnrollModal(app)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            app.status === 'enrolled'
                              ? 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200'
                              : 'bg-navy-900 hover:bg-navy-800 text-white shadow-sm'
                          }`}
                        >
                          {app.status === 'enrolled' ? 'แก้ไขมอบตัว' : 'บันทึกมอบตัว'}
                        </button>

                        {/* Print Enrollment PDF */}
                        <a
                          href={`/api/pdf/enrollment/${app.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="พิมพ์ใบมอบตัว (PDF)"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-navy-700 dark:text-gold-400"
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENROLLMENT MODAL */}
      {enrollModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-navy-900 dark:text-gold-400 font-bold">
                  {enrollModalApp.application_no}
                </span>
                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  บันทึกการมอบตัวนักเรียน / นักศึกษาใหม่
                </h3>
              </div>
              <button
                onClick={() => setEnrollModalApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ผู้มอบตัว: <strong>{enrollModalApp.full_name}</strong> ({enrollModalApp.level}) สาขา{' '}
              {enrollModalApp.dept_1?.name}
            </p>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  รหัสประจำตัวนักเรียน/นักศึกษา (ปล่อยว่างเพื่อให้ระบบออกให้อัตโนมัติ)
                </label>
                <input
                  type="text"
                  value={customStudentCode}
                  onChange={(e) => setCustomStudentCode(e.target.value)}
                  placeholder="เช่น 70201010001 (ว่างไว้จะสร้างให้อัตโนมัติ)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-wider focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อ-สกุล ผู้ปกครอง <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="เช่น นายสมเกียรติ สุขเกษม"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ความสัมพันธ์ <span className="text-crimson-600">*</span>
                  </label>
                  <select
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  >
                    <option value="บิดา">บิดา</option>
                    <option value="มารดา">มารดา</option>
                    <option value="ผู้ปกครองตามกฎหมาย">ผู้ปกครองตามกฎหมาย</option>
                    <option value="ญาติ">ญาติผู้ใหญ่</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    เบอร์โทรศัพท์ผู้ปกครอง <span className="text-crimson-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="10 หลัก"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    พยาน / เจ้าหน้าที่รับมอบตัว
                  </label>
                  <input
                    type="text"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnrollModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-md hover:from-navy-800"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกการมอบตัว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
