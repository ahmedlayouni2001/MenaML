import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MONTHS = ['January','February','March','April','May','June','July','August',
                'September','October','November','December'];
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CalendarPicker({ value, onChange, label, placeholder = 'Select date', className = '' }: Props) {
  const [open, setOpen]       = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(value ? parseInt(value.slice(0, 4)) : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.slice(5, 7)) - 1 : today.getMonth());

  const selected = value ? new Date(value + 'T00:00:00') : null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking the calendar popup itself (rendered in portal)
      const popup = document.getElementById('calendar-popup');
      if (popup && popup.contains(target)) return;
      if (btnRef.current && btnRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      setViewYear(parseInt(value.slice(0, 4)));
      setViewMonth(parseInt(value.slice(5, 7)) - 1);
    }
  }, [value]);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const calH = 310; // approximate calendar height
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;

      if (spaceBelow >= calH || spaceBelow >= spaceAbove) {
        // open downward
        setPopupStyle({ position: 'fixed', top: r.bottom + 6, left: r.left, zIndex: 9999 });
      } else {
        // open upward
        setPopupStyle({ position: 'fixed', bottom: window.innerHeight - r.top + 6, left: r.left, zIndex: 9999 });
      }
    }
    setOpen(o => !o);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const pickDay = (day: number) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
    setOpen(false);
  };

  const pickToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    pickDay(today.getDate());
  };

  const isSelected = (d: number) =>
    !!selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
  const isToday = (d: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst    = new Date(viewYear, viewMonth, 1).getDay();
  const firstOffset = rawFirst === 0 ? 6 : rawFirst - 1;
  const cells: (number | null)[] = Array(firstOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const displayValue = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const popup = (
    <div id="calendar-popup" style={popupStyle}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
      {/* Month / Year nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-50 text-gray-600 hover:text-teal-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
          </svg>
        </button>
        <p className="text-sm font-semibold text-gray-800">{MONTHS[viewMonth]} {viewYear}</p>
        <button type="button" onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-50 text-gray-600 hover:text-teal-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day ? (
              <button type="button" onClick={() => pickDay(day)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isSelected(day)
                    ? 'bg-teal-600 text-white shadow-sm'
                    : isToday(day)
                    ? 'border-2 border-teal-400 text-teal-700'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}>
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={pickToday}
          className="w-full text-xs text-center text-teal-600 font-semibold hover:underline py-0.5">
          Today
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <button ref={btnRef} type="button" onClick={handleOpen}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white flex items-center gap-2 hover:border-teal-400 transition-colors">
        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span className={displayValue ? 'text-gray-800' : 'text-gray-400 text-sm'}>
          {displayValue || placeholder}
        </span>
      </button>
      {open && createPortal(popup, document.body)}
    </div>
  );
}
