'use client';

import React, { useEffect, useState } from 'react';
import { REGISTRY_COLUMNS, ExportColumnOption } from '@/lib/excel-export';
import { Department } from '@/types';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckSquare,
  Square,
  FileCheck,
  Building,
  Sparkles,
} from 'lucide-react';

export default function AdminExportPage() {
  const [columns, setColumns] = useState<ExportColumnOption[]>(REGISTRY_COLUMNS);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    REGISTRY_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key)
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDepartments(data.data);
      })
      .catch(console.error);
  }, []);

  const handleToggleColumn = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedKeys(columns.map((c) => c.key));
  };

  const handleResetColumns = () => {
    setSelectedKeys(columns.filter((c) => c.defaultSelected).map((c) => c.key));
  };

  const handleExport = async () => {
    if (selectedKeys.length === 0) {
      alert('กรุณาเลือกคอลัมน์อย่างน้อย 1 คอลัมน์');
      return;
    }

    setExporting(true);
    try {
      const res = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: selectedKeys,
          filters: {
            level: levelFilter || undefined,
            status: statusFilter || undefined,
            dept: deptFilter || undefined,
          },
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registry_export_quota_2570_${Date.now()}.xlsx`;
      a.click();
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            <span>ส่งออกข้อมูลผู้สมัคร (มาตรฐานงานทะเบียน ศธ.02)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สร้างไฟล์ Excel (.xlsx) และ CSV สำหรับนำเข้าสู่ระบบฐานข้อมูลสถานศึกษาและระบบงานทะเบียน
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'กำลังสร้างไฟล์ Excel...' : 'ส่งออกไฟล์ Excel (.xlsx)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-700 dark:text-navy-400" />
            <span>ตัวกรองข้อมูลก่อนส่งออก</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ระดับการศึกษา
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
              >
                <option value="">ทั้งหมด (ทุกระดับ)</option>
                <option value="ระดับ ปวช.">ระดับ ปวช.</option>
                <option value="ระดับ ปวส. (สายตรง)">ระดับ ปวส. (สายตรง)</option>
                <option value="ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)">ระดับ ปวส. (ต่างสาขา)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                สถานะการสมัคร
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
              >
                <option value="">ทั้งหมด (ทุกสถานะ)</option>
                <option value="pending">รอตรวจสอบ</option>
                <option value="rejected">เอกสารไม่ครบ</option>
                <option value="passed">ผ่านการคัดเลือก</option>
                <option value="enrolled">มอบตัวแล้ว</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                แผนกวิชา
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
              >
                <option value="">ทั้งหมด (๑๓ แผนกวิชา)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
            <p className="font-bold">✓ รูปแบบข้อมูลมาตรฐาน ศธ.02</p>
            <p className="text-[11px] leading-relaxed">
              ฟอร์แมตเลขประจำตัวประชาชน 13 หลักแบบข้อความ ป้องกันตัวเลขกลายเป็นวิทยาศาสตร์ (1.1004E+12)
            </p>
          </div>
        </div>

        {/* Right: Column Selection */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white">
                เลือกคอลัมน์ที่ต้องการนำออก ({selectedKeys.length} / {columns.length} คอลัมน์)
              </h3>
              <p className="text-xs text-slate-400">
                สามารถติ๊กเลือกเฉพาะฟิลด์ที่ต้องการจัดทำรายงานหรือนำเข้า ศธ.02
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllColumns}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={handleResetColumns}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              >
                ค่าเริ่มต้น
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {columns.map((col) => {
              const isChecked = selectedKeys.includes(col.key);
              return (
                <label
                  key={col.key}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-medium ${
                    isChecked
                      ? 'border-navy-900 dark:border-navy-500 bg-navy-50/50 dark:bg-navy-950/20 text-navy-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{col.label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleColumn(col.key)}
                    className="w-4 h-4 rounded text-navy-900 ml-2"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
