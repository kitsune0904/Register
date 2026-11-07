import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: College Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain bg-white/10 p-1 rounded-xl"
              />
              <div>
                <h3 className="font-heading font-bold text-white text-lg">
                  วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                </h3>
                <p className="text-xs text-slate-400">
                  สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              มุ่งมั่นจัดการศึกษาด้านวิชาชีพ พัฒนาทักษะฝีมือช่างและเทคโนโลยีสู่มาตรฐานสากล
              เพื่อรองรับอุตสาหกรรมเป้าหมายและเทคโนโลยีชั้นนำแห่งอนาคต
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>คุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">ลิงก์ด่วน</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  หน้าแรกประกาศรับสมัคร
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-gold-400 transition-colors">
                  ยื่นใบสมัครออนไลน์ (โควตา)
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-gold-400 transition-colors">
                  ตรวจสอบสถานะใบสมัคร
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-gold-400 transition-colors">
                  ระบบบริหารจัดการงานทะเบียน (เจ้าหน้าที่)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">ติดต่อวิทยาลัย</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-crimson-400 mt-1 flex-shrink-0" />
                <span>เลขที่ 290 หมู่ 8 (บ้านท่าลาน) ตำบลบ้านครัว อำเภอบ้านหมอ จังหวัดสระบุรี 18270</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>036-281-295</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="http://www.tl.ac.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors underline-offset-2 hover:underline"
                >
                  วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            © ๒๕๗๐ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์. สงวนลิขสิทธิ์ทุกประการ.
          </p>
          <p className="flex items-center gap-1">
            <span>ระบบรับสมัครนักเรียน นักศึกษาโควตาออนไลน์ V.2570.1</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
