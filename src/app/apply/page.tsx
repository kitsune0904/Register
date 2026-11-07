import React from 'react';
import ApplicationStepper from '@/components/public/ApplicationStepper';
import { mockDb } from '@/lib/mock-db';

export const metadata = {
  title: 'ยื่นใบสมัครออนไลน์ (โควตา ๒๕๗๐) | วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
};

export default function ApplyPage() {
  const departments = mockDb.getDepartments();

  return (
    <div className="flex-1 py-10 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* Page Title */}
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-700 dark:text-crimson-300 text-xs font-semibold">
            <span>แบบฟอร์มรับสมัครรอบโควตา ปีการศึกษา ๒๕๗๐</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-navy-900 dark:text-white">
            ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ • กรอกข้อมูลให้ครบถ้วนตามแบบฟอร์มจริง
          </p>
        </div>

        {/* Stepper Form */}
        <ApplicationStepper initialDepartments={departments} />
      </div>
    </div>
  );
}
