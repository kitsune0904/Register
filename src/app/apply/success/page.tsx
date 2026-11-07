'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Download,
  FileText,
  ArrowRight,
  Printer,
  Share2,
  Calendar,
  AlertCircle,
  Home,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const appNo = searchParams.get('app_no') || '70-0001';
  const appId = searchParams.get('id') || '';

  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    // Fire confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0B2A6F', '#D91E18', '#F5B400'],
      });
    } catch (e) {}

    // Generate QR code
    QRCode.toDataURL(appNo)
      .then(setQrSrc)
      .catch(console.error);
  }, [appNo]);

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6 text-center animate-fade-in">
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-gold-500 to-crimson-600" />

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-navy-900 dark:text-white mb-2">
            บันทึกการสมัครสำเร็จเรียบร้อย!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8">
            ระบบได้รับข้อมูลและเอกสารหลักฐานของท่านเข้าสู่ฐานข้อมูลรับสมัครโควตาเรียบร้อยแล้ว
          </p>

          {/* Application No Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs text-slate-500 block">เลขที่ใบสมัครประจำตัวท่าน:</span>
              <span className="font-mono font-black text-3xl sm:text-4xl text-navy-900 dark:text-gold-400 tracking-wider">
                {appNo}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                (กรุณาบันทึกหรือถ่ายภาพเลขที่นี้ไว้สำหรับตรวจสอบสถานะ)
              </p>
            </div>

            {qrSrc && (
              <div className="flex flex-col items-center flex-shrink-0">
                <img
                  src={qrSrc}
                  alt="QR Code"
                  className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1"
                />
                <span className="text-[10px] text-slate-400 mt-1 font-mono">สแกนตรวจสอบ</span>
              </div>
            )}
          </div>

          {/* Instant PDF Download Action */}
          <div className="space-y-3">
            <a
              href={`/api/pdf/application/${appId || appNo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white shadow-xl shadow-crimson-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-5 h-5 text-gold-300" />
              <span>ดาวน์โหลดใบสมัคร PDF ทันที</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                href="/status"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <span>ไปที่หน้าตรวจสอบสถานะ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span>กลับสู่หน้าแรก</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Notice Info */}
        <div className="p-4 rounded-2xl bg-navy-50/80 dark:bg-navy-950/40 border border-navy-200 dark:border-navy-800 text-left text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <p className="font-bold text-navy-900 dark:text-navy-300">📌 ข้อแนะนำหลังการสมัคร:</p>
          <p>
            ๑. ดาวน์โหลดหรือพิมพ์ใบสมัคร PDF เก็บไว้เป็นหลักฐานประกอบการรายงานตัว
          </p>
          <p>
            ๒. เจ้าหน้าที่งานทะเบียนจะตรวจสอบความถูกต้องของเอกสาร ปพ.๑ ภายใน ๑–๒ วันทำการ
          </p>
          <p>
            ๓. ท่านสามารถติดตามผลการคัดเลือกผ่านเมนู <strong>"ตรวจสอบสถานะ"</strong> โดยใช้เลขบัตรประชาชน ๑๓ หลัก และวันเดือนปีเกิด
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
