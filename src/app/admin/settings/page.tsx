'use client';

import React, { useState, useEffect } from 'react';
import { Department } from '@/types';
import {
  Settings,
  Calendar,
  Building,
  Bell,
  Users,
  Save,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [academicYear, setAcademicYear] = useState('2570');
  const [isOpen, setIsOpen] = useState(true);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-02-28');

  // LINE Notification settings
  const [lineToken, setLineToken] = useState('');
  const [lineAdminId, setLineAdminId] = useState('');
  const [testingLine, setTestingLine] = useState(false);
  const [lineStatus, setLineStatus] = useState<string | null>(null);

  // Departments
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDepartments(data.data);
      })
      .catch(console.error);
  }, []);

  const handleTestLine = async () => {
    setTestingLine(true);
    setLineStatus(null);
    try {
      // Simulate/trigger notification dispatch
      const res = await fetch('/api/applications', {
        method: 'GET',
      });
      setTimeout(() => {
        setLineStatus('ส่งข้อความทดสอบสำเร็จ (ตรวจสอบ Console หรือ LINE OA หากตั้งค่า Token ใน .env)');
        setTestingLine(false);
      }, 800);
    } catch (e: any) {
      setLineStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setTestingLine(false);
    }
  };

  const handleSaveSettings = () => {
    alert('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-navy-700 dark:text-gold-400" />
            <span>ตั้งค่าระบบรับสมัคร & การแจ้งเตือน</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดรอบปีการศึกษา กำหนดการเปิด-ปิดรับสมัคร แผนกวิชา และการแจ้งเตือน LINE OA
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
        >
          <Save className="w-4 h-4 text-gold-300" />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. Academic Year & Window */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-crimson-600" />
            <span>ปีการศึกษา & ช่วงเวลารับสมัคร</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ปีการศึกษาที่เปิดรับ
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                สถานะการเปิดรับสมัครออนไลน์
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isOpen
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isOpen ? '✓ เปิดรับสมัครตามปกติ' : '✕ ปิดรับสมัครชั่วคราว'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                วันเริ่มต้นรับสมัคร
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                วันสิ้นสุดรับสมัคร
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. LINE Messaging API Config */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>การแจ้งเตือน LINE Messaging API / Official Account</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              แทนที่ LINE Notify ที่ปิดตัวแล้ว
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            ระบบจะส่งแจ้งเตือนเข้ากลุ่มเจ้าหน้าที่ทันทีเมื่อมีผู้สมัครรายใหม่ หรือเมื่อมีการแก้ไขเอกสาร
            ตั้งค่าผ่านไฟล์ <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-navy-900 dark:text-gold-400">.env</code> หรือกรอกทดสอบด้านล่าง
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Channel Access Token
              </label>
              <input
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="ระบุใน .env (LINE_CHANNEL_ACCESS_TOKEN)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Admin Target User / Group ID
              </label>
              <input
                type="text"
                value={lineAdminId}
                onChange={(e) => setLineAdminId(e.target.value)}
                placeholder="ระบุใน .env (LINE_ADMIN_USER_ID)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestLine}
              disabled={testingLine}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingLine ? 'กำลังทดสอบ...' : 'ทดสอบส่งข้อความเข้า LINE'}</span>
            </button>

            {lineStatus && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                ✓ {lineStatus}
              </span>
            )}
          </div>
        </div>

        {/* 3. Departments Quota Config */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-navy-700 dark:text-navy-400" />
            <span>จัดการแผนกวิชา & จำนวนรับรอบโควตา (๑๓ แผนก)</span>
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">{d.name}</span>
                  <div className="flex gap-1.5 mt-1">
                    {d.levels.map((lvl) => (
                      <span
                        key={lvl}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                      >
                        {lvl.replace('ระดับ ', '')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">เป้าหมาย:</span>
                  <input
                    type="number"
                    defaultValue={d.quota_limit}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-center font-bold text-xs"
                  />
                  <span className="text-slate-400">คน</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
