import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { start: string; end: string }) => void;
  onClose: () => void;
}

export function DateRangePicker({ startDate, endDate, onChange, onClose }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>(startDate ? 'end' : 'start');
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString();
    
    if (selecting === 'start') {
      setTempStart(dateStr);
      setTempEnd('');
      setSelecting('end');
    } else {
      if (new Date(tempStart) <= date) {
        setTempEnd(dateStr);
        onChange({ start: tempStart, end: dateStr });
        onClose();
      }
    }
  };

  const isSelected = (date: Date) => {
    if (!date) return false;
    const dateStr = date.toISOString();
    return dateStr === tempStart || dateStr === tempEnd;
  };

  const isInRange = (date: Date) => {
    if (!date || !tempStart || !tempEnd) return false;
    return date > new Date(tempStart) && date < new Date(tempEnd);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentMonth).map((date, i) => (
          <div key={i} className="aspect-square">
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                className={`w-full h-full flex items-center justify-center text-sm rounded-full
                  ${isSelected(date) ? 'bg-red-600 text-white' : ''}
                  ${isInRange(date) ? 'bg-red-100' : ''}
                  ${!isSelected(date) && !isInRange(date) ? 'hover:bg-gray-100' : ''}
                `}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {selecting === 'start' ? 'Seleccione fecha inicial' : 'Seleccione fecha final'}
        </span>
        <button
          onClick={() => {
            setSelecting('start');
            setTempStart('');
            setTempEnd('');
          }}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Reiniciar selección
        </button>
      </div>
    </div>
  );
}