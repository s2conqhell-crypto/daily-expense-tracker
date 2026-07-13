'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { ValidationMessage } from './ValidationMessage';

interface FormDatePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function FormDatePicker({ id, label, value, onChange, error, required, min, max }: FormDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => value ? new Date(value + 'T00:00:00') : null, [value]);
  const today = new Date();
  const minDate = min ? new Date(min + 'T00:00:00') : null;
  const maxDate = max ? new Date(max + 'T00:00:00') : null;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [open, selectedDate]);

  const prev = () => { setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; }); };
  const next = () => { setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; }); };

  const selectDay = (day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(d);
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const displayValue = selectedDate
    ? `${DAYS[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : '';

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  return (
    <div className="space-y-1" ref={ref}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-1.5 px-0.5">
          {label}
          {required && <span className="text-[#FF5A6E] ml-0.5">*</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-[56px] w-full items-center gap-3 rounded-[16px] border px-4 text-[15px] text-left transition-all duration-200 bg-[#1E2235]/80',
          'hover:border-white/[0.15]',
          error ? 'border-[#FF5A6E]/60' : open ? 'border-[#7c5cff]/60' : 'border-white/[0.08]',
        )}
      >
        <Calendar className="h-5 w-5 text-white/40 shrink-0" />
        <span className={displayValue ? 'text-white' : 'text-white/25'}>{displayValue || 'Select date'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="mt-2 rounded-[16px] border border-white/[0.08] bg-[#1E2235] p-4 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prev} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all text-white/60">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-[15px] font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" onClick={next} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all text-white/60">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="h-8 flex items-center justify-center text-[11px] font-medium text-white/30">{d.slice(0, 2)}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDisabled(day);
                const date = new Date(viewYear, viewMonth, day);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={cn(
                      'h-10 w-full rounded-xl text-[14px] font-medium transition-all active:scale-90',
                      isSelected ? 'bg-[#7c5cff] text-white shadow-lg shadow-[#7c5cff]/30' : '',
                      !isSelected && isToday ? 'border border-[#7c5cff]/40 text-[#7c5cff]' : '',
                      !isSelected && !isToday ? 'text-white/70 hover:bg-white/5' : '',
                      disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer',
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => selectDay(today.getDate())}
              className="mt-2 w-full h-9 rounded-xl bg-white/5 text-[13px] font-medium text-white/60 hover:bg-white/10 active:scale-95 transition-all"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <ValidationMessage message={error} show />}
    </div>
  );
}
