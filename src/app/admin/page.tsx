'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Building,
  School,
  Share2,
  Filter,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterYear, setFilterYear] = useState('2570');
  const [filterLevel, setFilterLevel] = useState('all');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Realtime polling interval every 15s
    const timer = setInterval(fetchStats, 15000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-navy-900 dark:text-navy-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลสถิติแบบเรียลไทม์...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'ผู้สมัครทั้งหมด',
      value: stats?.total || 0,
      sub: 'รอบโควตา ๒๕๗๐',
      icon: Users,
      color: 'from-navy-900 to-navy-800 text-white',
      badgeColor: 'bg-white/20 text-white',
    },
    {
      title: 'รอตรวจสอบเอกสาร',
      value: stats?.pending || 0,
      sub: 'อยู่ระหว่างตรวจคุณสมบัติ',
      icon: Clock,
      color: 'from-amber-500 to-amber-600 text-white',
      badgeColor: 'bg-white/20 text-white',
    },
    {
      title: 'เอกสารไม่ครบ / ซ่อม',
      value: stats?.rejected || 0,
      sub: 'ส่งแจ้งให้ผู้สมัครแก้ไข',
      icon: AlertTriangle,
      color: 'from-crimson-600 to-crimson-700 text-white',
      badgeColor: 'bg-white/20 text-white',
    },
    {
      title: 'ผ่านการคัดเลือก',
      value: stats?.passed || 0,
      sub: 'พร้อมพิมพ์ใบรายงานตัว',
      icon: CheckCircle2,
      color: 'from-emerald-600 to-emerald-700 text-white',
      badgeColor: 'bg-white/20 text-white',
    },
    {
      title: 'มอบตัวเรียบร้อย',
      value: stats?.enrolled || 0,
      sub: 'ออกรหัสนักศึกษาแล้ว',
      icon: UserCheck,
      color: 'from-indigo-600 to-indigo-700 text-white',
      badgeColor: 'bg-white/20 text-white',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              สถานะเรียลไทม์ (Live Sync)
            </span>
          </div>
          <h2 className="font-heading font-black text-xl text-navy-900 dark:text-white mt-1">
            แดชบอร์ดสรุปสถิติผู้สมัครโควตา ปีการศึกษา ๒๕๗๐
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
            >
              <option value="all">ทุกระดับการศึกษา</option>
              <option value="ปวช.">ระดับ ปวช.</option>
              <option value="ปวส. (สายตรง)">ระดับ ปวส. (สายตรง)</option>
              <option value="ปวส. (ม.6/ต่างสาขา)">ระดับ ปวส. (ต่างสาขา)</option>
            </select>
          </div>

          <button
            onClick={fetchStats}
            title="รีเฟรชข้อมูล"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/5 flex flex-col justify-between transition-transform transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold opacity-90">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] block opacity-80 mt-1">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart: 13 Departments */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-crimson-600" />
                <span>จำนวนผู้สมัครแยกตามแผนกวิชา (๑๓ แผนก)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เรียงตามจำนวนความสนใจของผู้สมัครรอบโควตา
              </p>
            </div>
            <span className="text-xs font-bold text-navy-700 dark:text-gold-400 bg-navy-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
              13 Departments
            </span>
          </div>

          <div className="h-[420px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.deptStats || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={140}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} คน`, 'จำนวนผู้สมัคร']}
                  labelFormatter={(label) => `แผนกวิชา${label}`}
                />
                <Bar dataKey="count" fill="#0B2A6F" radius={[0, 8, 8, 0]}>
                  {(stats?.deptStats || []).map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#D91E18' : index === 1 ? '#0B2A6F' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Levels */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-gold-500" />
              <span>สัดส่วนแยกตามระดับการศึกษา</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ปวช. / ปวส. สายตรง / ปวส. ต่างสาขา
            </p>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.levelStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.levelStats || []).map((entry: any, index: number) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} คน`, 'จำนวน']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {(stats?.levelStats || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DAILY TREND & TOP SCHOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>แนวโน้มยอดสมัครรายวัน (Daily Registration Trends)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                จำนวนผู้ยื่นใบสมัครออนไลน์ในแต่ละวัน
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyStats || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B2A6F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0B2A6F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} คน`, 'ยอดผู้สมัคร']}
                  labelFormatter={(lbl) => `วันที่ ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0B2A6F"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Original Schools */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
              <School className="w-5 h-5 text-navy-700 dark:text-navy-400" />
              <span>Top ๑๐ โรงเรียนเดิม</span>
            </h3>
            <span className="text-[11px] text-slate-400">สถานศึกษาเดิม</span>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {(stats?.topSchools || []).map((sc: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                  <span className="w-5 h-5 rounded-lg bg-navy-100 dark:bg-slate-700 text-navy-900 dark:text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {sc.school}
                  </span>
                </div>
                <span className="font-bold text-navy-900 dark:text-gold-400 flex-shrink-0">
                  {sc.count} คน
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PROVINCES & REFERRAL SOURCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Province */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-crimson-600" />
            <span>จำนวนผู้สมัครแยกตามจังหวัดภูมิลำเนา</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(stats?.byProvince || []).map((pv: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  จ.{pv.province}
                </span>
                <span className="text-xs font-bold text-navy-900 dark:text-gold-400">
                  {pv.count} คน
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Referral Sources */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold-500" />
            <span>ช่องทางที่รู้จักวิทยาลัย / ผู้แนะนำ</span>
          </h3>
          <div className="space-y-2">
            {(stats?.byReferral || []).map((rf: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">{rf.source}</span>
                <span className="font-bold text-navy-900 dark:text-gold-400">{rf.count} คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
