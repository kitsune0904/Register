'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert,
  GraduationCap,
  Bell,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [staff, setStaff] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render plain children
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      const session = localStorage.getItem('thaluang_staff_session');
      if (session) {
        try {
          setStaff(JSON.parse(session));
        } catch (e) {
          // fallback
        }
      } else {
        // default fallback staff for immediate access
        const defaultStaff = {
          id: 'e0000000-0000-0000-0000-000000000001',
          national_id: '11999',
          full_name: 'นายประสิทธิ์ วงศ์สุวรรณ (ผู้ดูแลระบบงานรับสมัคร)',
          role: 'super_admin',
        };
        setStaff(defaultStaff);
        localStorage.setItem('thaluang_staff_session', JSON.stringify(defaultStaff));
      }
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('thaluang_staff_session');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'แดชบอร์ดสรุปสถิติ', icon: LayoutDashboard },
    { href: '/admin/applications', label: 'จัดการใบสมัคร', icon: Users },
    { href: '/admin/walk-in', label: 'รับสมัคร Walk-in', icon: UserPlus },
    { href: '/admin/enrollment', label: 'ระบบมอบตัวนักศึกษา', icon: UserCheck },
    { href: '/admin/export', label: 'ส่งออกข้อมูล (ศธ.02)', icon: FileSpreadsheet },
    { href: '/admin/settings', label: 'ตั้งค่าระบบ & แจ้งเตือน', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-navy-950 text-slate-200 border-r border-slate-800 flex-shrink-0">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-11 h-11 object-contain bg-white/10 p-1 rounded-2xl"
          />
          <div>
            <h2 className="font-heading font-black text-sm text-white tracking-tight leading-tight">
              วิทยาลัยเทคนิคท่าหลวงฯ
            </h2>
            <span className="text-[11px] text-gold-400 font-semibold block mt-0.5">
              ระบบรับสมัครโควตา ๒๕๗๐
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-navy-800 to-navy-900 text-white shadow-md shadow-navy-900/50 border-l-4 border-gold-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* View Public Portal link */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gold-400" />
              <span>เปิดดูหน้าผู้สมัคร (Public)</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 block">แผงควบคุมระบบงานทะเบียน</span>
              <h1 className="font-heading font-black text-base sm:text-lg text-navy-900 dark:text-white">
                ระบบจัดการรับสมัครนักเรียน นักศึกษาใหม่ รอบโควตา
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-gold-400" />}
            </button>

            {/* Staff User Profile Pill */}
            {staff && (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-navy-900 to-crimson-600 text-white font-bold flex items-center justify-center shadow-md flex-shrink-0">
                  {staff.full_name?.charAt(3) || 'จ'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[180px]">
                    {staff.full_name}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {staff.role} (ID: {staff.national_id})
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-2 rounded-xl text-slate-400 hover:text-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex">
            <div className="w-72 bg-navy-950 text-white h-full p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-heading font-bold text-sm">เทคนิคท่าหลวงฯ</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <nav className="mt-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${
                        pathname === item.href
                          ? 'bg-navy-800 text-white border-l-4 border-gold-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-crimson-600 text-white font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
