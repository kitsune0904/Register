'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface ThaiDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minYearBe?: number;
  maxYearBe?: number;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const THAI_MONTHS = [
  { value: '01', name: 'มกราคม' },
  { value: '02', name: 'กุมภาพันธ์' },
  { value: '03', name: 'มีนาคม' },
  { value: '04', name: 'เมษายน' },
  { value: '05', name: 'พฤษภาคม' },
  { value: '06', name: 'มิถุนายน' },
  { value: '07', name: 'กรกฎาคม' },
  { value: '08', name: 'สิงหาคม' },
  { value: '09', name: 'กันยายน' },
  { value: '10', name: 'ตุลาคม' },
  { value: '11', name: 'พฤศจิกายน' },
  { value: '12', name: 'ธันวาคม' },
];

export default function ThaiDatePicker({
  value,
  onChange,
  minYearBe = 2545,
  maxYearBe = 2558,
  label = 'วัน/เดือน/ปีเกิด (พ.ศ.)',
  required = true,
  disabled = false,
}: ThaiDatePickerProps) {
  // Parse initial value (YYYY-MM-DD)
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [yearBe, setYearBe] = useState('');

  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setYearBe(String(parseInt(y, 10) + 543));
        setMonth(m.padStart(2, '0'));
        setDay(d.padStart(2, '0'));
      }
    }
  }, [value]);

  const updateDate = (newDay: string, newMonth: string, newYearBe: string) => {
    if (newDay && newMonth && newYearBe) {
      const ceYear = parseInt(newYearBe, 10) - 543;
      const formatted = `${ceYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
      onChange(formatted);
    }
  };

  const handleDayChange = (d: string) => {
    setDay(d);
    updateDate(d, month, yearBe);
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    updateDate(day, m, yearBe);
  };

  const handleYearChange = (y: string) => {
    setYearBe(y);
    updateDate(day, month, y);
  };

  // Generate Year range
  const years: number[] = [];
  for (let y = maxYearBe; y >= minYearBe; y--) {
    years.push(y);
  }

  // Days in month
  const daysInMonth = 31; // simplify for dropdown
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400" />
          <span>{label}</span>
          {required && <span className="text-crimson-600">*</span>}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <select
          value={day}
          onChange={(e) => handleDayChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
        >
          <option value="">วันที่</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {parseInt(d, 10)}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
        >
          <option value="">เดือน</option>
          {THAI_MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Year BE */}
        <select
          value={yearBe}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none"
        >
          <option value="">พ.ศ.</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              พ.ศ. {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
