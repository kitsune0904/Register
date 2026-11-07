import React from 'react';
import ApplicationStepper from '@/components/public/ApplicationStepper';
import { mockDb } from '@/lib/mock-db';
import { UserPlus, Sparkles } from 'lucide-react';

export default function AdminWalkInPage() {
  const departments = mockDb.getDepartments();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-2xl text-navy-900 dark:text-white flex items-center gap-2.5">
            <UserPlus className="w-7 h-7 text-crimson-600" />
            <span>รับสมัครนักเรียน Walk-in โดยเจ้าหน้าที่</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            เจ้าหน้าที่กรอกข้อมูลแทนผู้สมัครที่เดินทางมายื่นเอกสารด้วยตนเองที่ห้องงานทะเบียน
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <ApplicationStepper initialDepartments={departments} isWalkIn={true} />
      </div>
    </div>
  );
}
