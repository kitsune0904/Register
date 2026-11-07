'use client';

import React, { useEffect, useState } from 'react';
import { Application, ApplicationStatus, Department } from '@/types';
import { formatThaiDate, maskNationalId } from '@/lib/thai-utils';
import {
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Printer,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mask ID state (PDPA)
  const [showFullId, setShowFullId] = useState(false);

  // Active view modal
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [statusModalApp, setStatusModalApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('passed');
  const [rejectReason, setRejectReason] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Bulk status modal
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('passed');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, deptRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/departments'),
      ]);
      const appData = await appRes.json();
      const deptData = await deptRes.json();

      if (appData.success) setApplications(appData.data);
      if (deptData.success) setDepartments(deptData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      app.full_name.toLowerCase().includes(s) ||
      app.application_no.toLowerCase().includes(s) ||
      app.national_id.includes(s) ||
      app.current_school.toLowerCase().includes(s) ||
      app.phone.includes(s);

    const matchLevel = !levelFilter || app.level === levelFilter;
    const matchStatus = !statusFilter || app.status === statusFilter;
    const matchDept =
      !deptFilter || app.dept_choice_1 === deptFilter || app.dept_choice_2 === deptFilter;

    return matchSearch && matchLevel && matchStatus && matchDept;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedApps.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status Change submit
  const handleUpdateStatus = async () => {
    if (!statusModalApp) return;
    setSubmittingStatus(true);
    try {
      const res = await fetch(`/api/applications/${statusModalApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reject_reason: newStatus === 'rejected' ? rejectReason : undefined,
          changed_by: 'นายประสิทธิ์ วงศ์สุวรรณ (Admin)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusModalApp(null);
        setRejectReason('');
        fetchData();
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Bulk status update
  const handleBulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;
    setSubmittingStatus(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: bulkStatus,
            changed_by: 'นายประสิทธิ์ วงศ์สุวรรณ (Admin)',
          }),
        });
      }
      setBulkStatusModal(false);
      setSelectedIds([]);
      fetchData();
      alert(`อัปเดตสถานะ ${selectedIds.length} รายการเรียบร้อยแล้ว`);
    } catch (e) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Print Batch PDF for selected
  const handlePrintBatch = async () => {
    if (selectedIds.length === 0) {
      alert('กรุณาเลือกใบสมัครที่ต้องการพิมพ์อย่างน้อย 1 รายการ');
      return;
    }

    try {
      const res = await fetch('/api/pdf/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error('Failed to generate batch PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_applications_${selectedIds.length}_items.pdf`;
      a.click();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการสร้าง PDF รวม');
    }
  };

  const statusBadge = (status: ApplicationStatus) => {
    const config = {
      pending: { label: 'รอตรวจสอบ', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
      rejected: { label: 'เอกสารไม่ครบ', bg: 'bg-crimson-100 text-crimson-800 dark:bg-crimson-950/60 dark:text-crimson-300' },
      passed: { label: 'ผ่านคัดเลือก', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
      enrolled: { label: 'มอบตัวแล้ว', bg: 'bg-navy-100 text-navy-800 dark:bg-navy-950/60 dark:text-navy-300' },
    };
    const c = config[status] || { label: status, bg: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-crimson-600" />
            <span>จัดการใบสมัครผู้เข้ารับการคัดเลือก (โควตา)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            พบผู้สมัครทั้งหมด {filteredApps.length} รายการ (จากทั้งหมด {applications.length} คน)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Masked ID for PDPA */}
          <button
            onClick={() => setShowFullId(!showFullId)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
          >
            {showFullId ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span>{showFullId ? 'ซ่อนเลขบัตร (PDPA)' : 'แสดงเลขบัตรเต็ม'}</span>
          </button>

          {/* Batch Print PDF */}
          <button
            onClick={handlePrintBatch}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-sm disabled:opacity-40"
          >
            <Printer className="w-4 h-4 text-gold-300" />
            <span>พิมพ์ PDF รวม ({selectedIds.length})</span>
          </button>

          {/* Batch Change Status */}
          <button
            onClick={() => setBulkStatusModal(true)}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm disabled:opacity-40"
          >
            <FileCheck className="w-4 h-4" />
            <span>เปลี่ยนสถานะกลุ่ม ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาชื่อ, เลขบัตร, รร., เบอร์..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-navy-600 focus:outline-none"
          />
        </div>

        {/* Level */}
        <div>
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
          >
            <option value="">-- เลือกระดับการศึกษา --</option>
            <option value="ระดับ ปวช.">ระดับ ปวช.</option>
            <option value="ระดับ ปวส. (สายตรง)">ระดับ ปวส. (สายตรง)</option>
            <option value="ระดับ ปวส. (ม.6/ปวช. ต่างสาขา)">ระดับ ปวส. (ต่างสาขา)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
          >
            <option value="">-- ทุกสถานะ --</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="rejected">เอกสารไม่ครบ</option>
            <option value="passed">ผ่านการคัดเลือก</option>
            <option value="enrolled">มอบตัวแล้ว</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
          >
            <option value="">-- ทุกแผนกวิชา (๑๓ แผนก) --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedApps.length > 0 &&
                      paginatedApps.every((a) => selectedIds.includes(a.id))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-navy-900"
                  />
                </th>
                <th className="p-4 w-24">เลขที่ใบสมัคร</th>
                <th className="p-4">ชื่อ-นามสกุล / เลขประจำตัว ปชช.</th>
                <th className="p-4">ระดับ / สาขาวิชาที่สมัคร</th>
                <th className="p-4">สถานศึกษาเดิม</th>
                <th className="p-4 text-center">GPAX</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลใบสมัครตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedIds.includes(app.id) ? 'bg-navy-50/40 dark:bg-navy-950/20' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                        className="w-4 h-4 rounded text-navy-900"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-navy-900 dark:text-gold-400 whitespace-nowrap">
                      {app.application_no}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {app.full_name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {showFullId ? app.national_id : maskNationalId(app.national_id)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {app.level.replace('ระดับ ', '')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                        {app.dept_1?.name?.replace('แผนกวิชา', '') || '-'}
                      </p>
                      {app.dept_2 && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          (ลำดับ 2: {app.dept_2?.name?.replace('แผนกวิชา', '')})
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]">
                        {app.current_school}
                      </p>
                      <p className="text-[11px] text-slate-400">จ.{app.address?.province}</p>
                    </td>
                    <td className="p-4 text-center font-bold text-navy-900 dark:text-white">
                      {app.gpax?.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">{statusBadge(app.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setViewApp(app)}
                          title="ดูรายละเอียดและเอกสาร"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print Individual Paper PDF */}
                        <a
                          href={`/api/pdf/application/${app.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="พิมพ์ใบสมัคร PDF"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-navy-700 dark:text-navy-300"
                        >
                          <Printer className="w-4 h-4" />
                        </a>

                        {/* Change Status */}
                        <button
                          onClick={() => {
                            setStatusModalApp(app);
                            setNewStatus(app.status);
                            setRejectReason(app.reject_reason || '');
                          }}
                          title="เปลี่ยนสถานะ"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-900 hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดงหน้า {currentPage} จาก {totalPages} (ทั้งหมด {filteredApps.length} รายการ)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW APPLICANT DETAILS & DOCUMENTS */}
      {viewApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono font-bold text-xs text-navy-900 dark:text-gold-400">
                  {viewApp.application_no}
                </span>
                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  {viewApp.full_name}
                </h3>
              </div>
              <button
                onClick={() => setViewApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <p>
                <strong>ระดับ:</strong> {viewApp.level}
              </p>
              <p>
                <strong>เลขบัตร ปชช.:</strong> {viewApp.national_id}
              </p>
              <p>
                <strong>วันเกิด:</strong> {formatThaiDate(viewApp.birth_date, 'full')}
              </p>
              <p>
                <strong>เบอร์โทรศัพท์:</strong> {viewApp.phone}
              </p>
              <p>
                <strong>สาขาอันดับ 1:</strong> {viewApp.dept_1?.name}
              </p>
              <p>
                <strong>สาขาอันดับ 2:</strong> {viewApp.dept_2?.name || '-'}
              </p>
              <p>
                <strong>รร. เดิม:</strong> {viewApp.current_school}
              </p>
              <p>
                <strong>GPAX:</strong> <span className="font-bold text-crimson-600">{viewApp.gpax}</span>
              </p>
            </div>

            {/* Attached Documents */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                เอกสารหลักฐานที่แนบ ({viewApp.files?.length || 0} ไฟล์)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {viewApp.files?.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-navy-700 dark:text-gold-400 flex-shrink-0" />
                      <span className="truncate font-medium">{f.file_name}</span>
                    </div>
                    {f.file_path && f.file_path.startsWith('data:') ? (
                      <a
                        href={f.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-navy-700 dark:text-gold-400 font-bold hover:underline"
                      >
                        ดูไฟล์
                      </a>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ แนบแล้ว</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`/api/pdf/application/${viewApp.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบสมัคร (PDF)</span>
              </a>

              <button
                onClick={() => setViewApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE STATUS */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <h3 className="font-heading font-black text-lg text-navy-900 dark:text-white">
              ปรับเปลี่ยนสถานะใบสมัคร
            </h3>
            <p className="text-xs text-slate-500">
              ผู้สมัคร: {statusModalApp.full_name} ({statusModalApp.application_no})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                เลือกสถานะใหม่
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="pending">รอตรวจสอบ</option>
                <option value="rejected">เอกสารไม่ครบ / ให้ส่งแก้ไข</option>
                <option value="passed">ผ่านการคัดเลือก (โควตา)</option>
                <option value="enrolled">มอบตัวแล้ว</option>
              </select>
            </div>

            {newStatus === 'rejected' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs font-semibold text-crimson-600">
                  ระบุเหตุผล / เอกสารที่ต้องแก้ไข
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="เช่น สำเนา ปพ.1 ไม่ชัดเจน ขอให้อัปโหลดไฟล์ใหม่..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-crimson-600 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={submittingStatus}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
              >
                {submittingStatus ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK STATUS CHANGE */}
      {bulkStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <h3 className="font-heading font-black text-lg text-navy-900 dark:text-white">
              เปลี่ยนสถานะกลุ่ม ({selectedIds.length} รายการ)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบจะปรับเปลี่ยนสถานะใบสมัครที่ท่านได้เลือกไว้พร้อมกันทั้งหมด
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                เลือกสถานะใหม่
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="passed">ผ่านการคัดเลือก (โควตา)</option>
                <option value="pending">รอตรวจสอบ</option>
                <option value="rejected">เอกสารไม่ครบ</option>
                <option value="enrolled">มอบตัวแล้ว</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBulkStatusModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleBulkUpdateStatus}
                disabled={submittingStatus}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-crimson-600 text-white hover:bg-crimson-700"
              >
                {submittingStatus ? 'กำลังประมวลผล...' : 'ยืนยันเปลี่ยนสถานะทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
