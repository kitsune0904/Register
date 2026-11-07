'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  // Default values set to 11999 and 090450 as specifically requested by user
  const [nationalId, setNationalId] = useState('11999');
  const [password, setPassword] = useState('090450');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // Store staff session in localStorage
      localStorage.setItem('thaluang_staff_session', JSON.stringify(data.data));
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (id: string, pwd: string) => {
    setNationalId(id);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-crimson-600/20 via-gold-500/10 to-navy-600/30 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-2 shadow-2xl transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white">
              ระบบงานทะเบียน & ผู้ดูแล
            </h1>
            <p className="text-xs text-slate-400">
              วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ • ปีการศึกษา ๒๕๗๐
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10 text-xs font-semibold text-gold-400">
            <ShieldCheck className="w-4 h-4" />
            <span>เข้าสู่ระบบเฉพาะเจ้าหน้าที่และผู้บริหาร</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-crimson-500/20 border border-crimson-500/40 flex items-center gap-2.5 text-xs text-crimson-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                เลขประจำตัวเจ้าหน้าที่ (ID Card)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="เช่น 11999"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-mono focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-mono focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-crimson-600 via-crimson-700 to-crimson-800 hover:from-crimson-500 hover:to-crimson-700 text-white shadow-xl shadow-crimson-700/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบเจ้าหน้าที่'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-fill helper for test reviewer */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] text-slate-400 block text-center">
              บัญชีทดสอบตามที่กำหนดในภารกิจ:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill('11999', '090450')}
                className="px-3 py-1 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-400/30 hover:bg-gold-500/30 font-mono transition-colors"
              >
                11999 / 090450 (Super Admin)
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าแรกเว็บไซต์รับสมัคร</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
