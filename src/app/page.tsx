import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  FileCheck2,
  Calendar,
  Sparkles,
  ChevronRight,
  BookOpen,
  Award,
  Building2,
  PhoneCall,
  CheckCircle,
  Clock,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { mockDb } from '@/lib/mock-db';

export default function HomePage() {
  const departments = mockDb.getDepartments();

  return (
    <div className="flex-1 flex flex-col space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-20 bg-gradient-to-b from-navy-50/80 via-white to-slate-50 dark:from-navy-950/40 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-navy-900/10 via-gold-500/10 to-crimson-600/10 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Emblem & College Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-6 h-6 object-contain"
              />
              <span className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-gold-300">
                วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ • สอศ.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-navy-900 dark:text-white tracking-tight leading-tight">
              เปิดรับสมัครนักเรียน นักศึกษาใหม่
              <br />
              <span className="bg-gradient-to-r from-crimson-600 via-navy-800 to-crimson-700 dark:from-crimson-500 dark:via-gold-400 dark:to-crimson-400 bg-clip-text text-transparent">
                รอบโควตาพิเศษ ประจำปีการศึกษา ๒๕๗๐
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              เปิดรับสมัครระดับ <strong>ปวช.</strong> (จบ ม.3) และ <strong>ปวส.</strong> (จบ ปวช./ม.6)
              รวม ๑๓ แผนกวิชาชั้นนำ หลักสูตรทวิภาคีร่วมกับภาคอุตสาหกรรม และทุนสนับสนุนการศึกษา
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white shadow-xl shadow-crimson-600/30 hover:shadow-crimson-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <GraduationCap className="w-5 h-5 text-gold-300" />
                <span>สมัครเรียนออนไลน์ (โควตา)</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/status"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-navy-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <FileCheck2 className="w-5 h-5 text-navy-700 dark:text-navy-400" />
                <span>ตรวจสอบสถานะใบสมัคร</span>
              </Link>
            </div>

            {/* Quick feature highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {[
                { title: '๑๓ แผนกวิชา', desc: 'ครอบคลุมช่างและพาณิชย์', icon: Building2 },
                { title: 'โควตาเรียนดี', desc: 'GPAX ๒.๕๐ ขึ้นไป', icon: Award },
                { title: 'ทวิภาคี SCG', desc: 'ฝึกงานสถานประกอบการจริง', icon: Sparkles },
                { title: 'ยื่นออนไลน์ 100%', desc: 'ไม่ต้องเดินทางมาวิทยาลัย', icon: ShieldCheck },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                  >
                    <Icon className="w-5 h-5 text-gold-500 mb-1" />
                    <p className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                      {feat.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADMISSION SCHEDULE & TIMELINE */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-600 dark:text-crimson-400">
              Admission Schedule
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy-900 dark:text-white">
              ปฏิทินและกำหนดการรับสมัครโควตา ปีการศึกษา ๒๕๗๐
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '๑',
                title: 'รับสมัครออนไลน์',
                period: '๑ พ.ย. ๖๙ – ๒๘ ก.พ. ๗๐',
                desc: 'กรอกใบสมัครผ่านระบบ และอัปโหลดเอกสาร ปพ.1 5 ภาคเรียน',
                active: true,
              },
              {
                step: '๒',
                title: 'ตรวจสอบเอกสาร',
                period: 'ทุกวันทำการ',
                desc: 'เจ้าหน้าที่งานทะเบียนตรวจสอบความถูกต้องและแจ้งผลในระบบ',
              },
              {
                step: '๓',
                title: 'ประกาศผลคัดเลือก',
                period: '๕ มี.ค. ๒๕๗๐',
                desc: 'ตรวจสอบผลผ่านระบบ และพิมพ์ใบรายงานตัวโควตา',
              },
              {
                step: '๔',
                title: 'รายงานตัว & มอบตัว',
                period: '๑๕ – ๑๖ มี.ค. ๒๕๗๐',
                desc: 'บันทึกมอบตัวพร้อมผู้ปกครอง และรับรหัสนักศึกษาใหม่',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border transition-all ${
                  item.active
                    ? 'bg-navy-900 text-white border-navy-900 shadow-xl shadow-navy-900/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl font-heading font-black text-sm flex items-center justify-center mb-3 ${
                    item.active
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.step}
                </span>
                <h3
                  className={`font-heading font-bold text-base mb-1 ${
                    item.active ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-xs font-semibold mb-2 ${
                    item.active ? 'text-gold-300' : 'text-crimson-600 dark:text-crimson-400'
                  }`}
                >
                  {item.period}
                </p>
                <p
                  className={`text-xs leading-relaxed ${
                    item.active ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AVAILABLE DEPARTMENTS (13 แผนกวิชา) */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-navy-400">
                Departments & Majors
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy-900 dark:text-white">
                แผนกวิชาที่เปิดรับสมัครรอบโควตา (๑๓ แผนกวิชา)
              </h2>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-crimson-600 dark:text-crimson-400 hover:underline"
            >
              <span>สมัครเรียนในแผนกเหล่านี้</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-navy-600 dark:hover:border-navy-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-50 dark:bg-slate-800 text-navy-900 dark:text-gold-400">
                    รหัส {dept.code}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    โควตา {dept.quota_limit} ที่นั่ง
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white group-hover:text-navy-900 dark:group-hover:text-gold-300 transition-colors line-clamp-2 min-h-[3rem]">
                  {dept.name}
                </h3>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {dept.levels.map((lvl) => (
                    <span
                      key={lvl}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {lvl.replace('ระดับ ', '')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. APPLICATION STEPS GUIDE */}
      <section className="bg-slate-100 dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy-900 dark:text-white">
                ขั้นตอนการสมัครเรียนออนไลน์ง่าย ๆ ใน ๔ ขั้นตอน
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                สามารถทำผ่านโทรศัพท์มือถือหรือคอมพิวเตอร์ได้ตลอด ๒๔ ชั่วโมง
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  no: '1',
                  title: 'กรอกข้อมูลและเลือกสาขาวิชา',
                  desc: 'ระบุข้อมูลส่วนตัว บิดา มารดา ที่อยู่ สถานศึกษาเดิม เกรดเฉลี่ย GPAX และเลือกสาขา ปวช. หรือ ปวส.',
                },
                {
                  no: '2',
                  title: 'แนบไฟล์เอกสารหลักฐาน',
                  desc: 'อัปโหลดรูปถ่าย 1 นิ้ว, สำเนาผลการเรียน ปพ.1 (5 เทอม), สำเนาบัตรประชาชน หรือเกียรติบัตร (ไฟล์ JPG, PNG, PDF)',
                },
                {
                  no: '3',
                  title: 'รับเลขที่ใบสมัคร & ดาวน์โหลด PDF',
                  desc: 'เมื่อส่งข้อมูลสำเร็จ ระบบจะออกเลขที่ใบสมัครทันที พร้อมปุ่มดาวน์โหลดใบสมัคร PDF ตามแบบฟอร์มทางการ',
                },
                {
                  no: '4',
                  title: 'ติดตามสถานะ & พิมพ์ใบมอบตัว',
                  desc: 'ตรวจสอบสถานะผ่านเมนู "ตรวจสอบสถานะ" หากผ่านการคัดเลือกสามารถพิมพ์ใบมอบตัวเพื่อเตรียมเข้าศึกษา',
                },
              ].map((step) => (
                <div
                  key={step.no}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-4 shadow-sm"
                >
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-navy-900 to-crimson-600 text-white font-heading font-black text-base flex items-center justify-center flex-shrink-0 shadow-md">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>เริ่มยื่นใบสมัครออนไลน์ทันที</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
