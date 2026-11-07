'use client';

import React, { useEffect, useState } from 'react';
import addressDataset from '@/data/thai-address.json';
import { ThaiAddressItem } from '@/types';

interface AddressSelectorProps {
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  onChange: (fields: {
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
  }) => void;
  disabled?: boolean;
}

export default function AddressSelector({
  province,
  district,
  subdistrict,
  postalCode,
  onChange,
  disabled = false,
}: AddressSelectorProps) {
  const [data] = useState<ThaiAddressItem[]>(addressDataset as ThaiAddressItem[]);
  const [districts, setDistricts] = useState<{ name: string; tambons: { name: string; zip: string }[] }[]>([]);
  const [tambons, setTambons] = useState<{ name: string; zip: string }[]>([]);

  // When province changes, update amphoe list
  useEffect(() => {
    if (province) {
      const foundProv = data.find((p) => p.province === province);
      if (foundProv) {
        setDistricts(foundProv.amphoes || []);
        // Check if current district is valid in this province
        const foundDist = foundProv.amphoes.find((d) => d.name === district);
        if (foundDist) {
          setTambons(foundDist.tambons || []);
        } else {
          setTambons([]);
        }
      } else {
        setDistricts([]);
        setTambons([]);
      }
    } else {
      setDistricts([]);
      setTambons([]);
    }
  }, [province, data, district]);

  const handleProvinceChange = (newProv: string) => {
    const foundProv = data.find((p) => p.province === newProv);
    const newAmphoes = foundProv?.amphoes || [];
    setDistricts(newAmphoes);

    // Default to first amphoe and tambon if available
    const firstAmphoe = newAmphoes[0];
    const firstTambon = firstAmphoe?.tambons[0];

    onChange({
      province: newProv,
      district: firstAmphoe?.name || '',
      subdistrict: firstTambon?.name || '',
      postalCode: firstTambon?.zip || '',
    });
  };

  const handleDistrictChange = (newDist: string) => {
    const foundDist = districts.find((d) => d.name === newDist);
    const newTambons = foundDist?.tambons || [];
    setTambons(newTambons);

    const firstTambon = newTambons[0];
    onChange({
      province,
      district: newDist,
      subdistrict: firstTambon?.name || '',
      postalCode: firstTambon?.zip || '',
    });
  };

  const handleSubdistrictChange = (newSubdist: string) => {
    const foundTambon = tambons.find((t) => t.name === newSubdist);
    onChange({
      province,
      district,
      subdistrict: newSubdist,
      postalCode: foundTambon?.zip || postalCode,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Province */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          จังหวัด <span className="text-crimson-600">*</span>
        </label>
        <select
          value={province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none transition-all"
        >
          <option value="">-- เลือกจังหวัด --</option>
          {data.map((p) => (
            <option key={p.province} value={p.province}>
              {p.province}
            </option>
          ))}
        </select>
      </div>

      {/* District (Amphoe) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          อำเภอ / เขต <span className="text-crimson-600">*</span>
        </label>
        <select
          value={district}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={disabled || !province}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none transition-all disabled:opacity-50"
        >
          <option value="">-- เลือกอำเภอ/เขต --</option>
          {districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subdistrict (Tambon) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          ตำบล / แขวง <span className="text-crimson-600">*</span>
        </label>
        <select
          value={subdistrict}
          onChange={(e) => handleSubdistrictChange(e.target.value)}
          disabled={disabled || !district}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none transition-all disabled:opacity-50"
        >
          <option value="">-- เลือกตำบล/แขวง --</option>
          {tambons.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Postal Code (Auto filled) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          รหัสไปรษณีย์ <span className="text-crimson-600">*</span>
        </label>
        <input
          type="text"
          value={postalCode}
          onChange={(e) =>
            onChange({ province, district, subdistrict, postalCode: e.target.value })
          }
          placeholder="รหัสไปรษณีย์ 5 หลัก"
          maxLength={5}
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-navy-600 focus:outline-none transition-all"
        />
      </div>
    </div>
  );
}
